/// <reference path="../pb_data/types.d.ts" />

// 2026-10-30: модель «регистрация бесплатная, виден и получает заказы только
// специалист с оплаченным тарифом». Раньше профиль без оплаты спокойно
// светился в каталоге, а тариф Базовый ничего не открывал. Теперь оплаченным
// считается профиль, у которого plan_code не пуст и срок (active_until) либо
// не задан (тариф назначен админом вручную), либо ещё не вышел.
//
// Что закрывается правилами PocketBase (на уровне API, а не только в
// интерфейсе):
//   - specialist_profiles и services — публике видны только оплаченные;
//   - landing_items — лендинг неоплаченного не показывается;
//   - leads и lead_messages — специалист без оплаты не читает заявки и
//     переписку и не отвечает; заказчик свои заявки видит по-прежнему;
//   - job_posts — доска объявлений с именами заказчиков только оплаченным
//     специалистам.
// Своя запись владельца (профиль, услуги) остаётся доступной всегда — кабинет
// работает без оплаты. Для намёка «у вас N заявок» без содержимого создаётся
// view leads_count_own (только число, видит владелец профиля).
//
// Уже опубликованным профилям без тарифа даём льготный срок: тариф basic на
// 60 дней, чтобы каталог не опустел в день включения правила (решение
// владельца). news_posts.author_name — имя компании в плашке статьи:
// профиль неоплатившего скрыт, а его статьи остаются, подписи берём отсюда.
//
// Откат: down возвращает прежние правила, убирает view и поле author_name
// (льготные тарифы не отменяются).
const PAID = (p) => p + "plan_code != \"\" && (" + p + "active_until = \"\" || " + p + "active_until > @now)"

const swap = (rule, from, to, label) => {
  if (!String(rule).includes(from)) throw new Error("rule fragment not found: " + label)
  return String(rule).split(from).join(to)
}

migrate((app) => {
  const paid = (p) => "(" + PAID(p) + ")"

  // 1. Льготный срок опубликованным профилям без тарифа
  const unpaid = app.findRecordsByFilter(
    "specialist_profiles",
    "profile_status = \"published\" && plan_code = \"\"",
    "", 0, 0
  )
  const until = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().replace("T", " ")
  for (const profile of unpaid) {
    profile.set("plan_code", "basic")
    profile.set("active_until", until)
    app.saveNoValidate(profile)
  }
  console.log("paid_visibility: grace period for " + unpaid.length + " profile(s) until " + until)

  // 2. Видимость профилей и услуг
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.listRule =
    "(profile_status = \"published\" && " + paid("") + ") || user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")"
  profiles.viewRule = profiles.listRule
  app.save(profiles)

  const relPaid = paid("specialist_profile_id.")
  const services = app.findCollectionByNameOrId("services")
  services.listRule = swap(services.listRule, "specialist_profile_id.profile_status = \"published\"", "specialist_profile_id.profile_status = \"published\" && " + relPaid, "services.list")
  services.viewRule = services.listRule
  app.save(services)

  const landing = app.findCollectionByNameOrId("landing_items")
  landing.listRule = swap(landing.listRule, "specialist_profile_id.profile_status = \"published\"", "specialist_profile_id.profile_status = \"published\" && " + relPaid, "landing.list")
  landing.viewRule = landing.listRule
  app.save(landing)

  // 3. Заявки и переписка — только оплаченному специалисту
  const ownerPaid = "(specialist_profile_id.user_id = @request.auth.id && " + relPaid + ")"
  const leads = app.findCollectionByNameOrId("leads")
  leads.listRule = swap(leads.listRule, "specialist_profile_id.user_id = @request.auth.id", ownerPaid, "leads.list")
  leads.viewRule = leads.listRule
  leads.updateRule = swap(leads.updateRule, "specialist_profile_id.user_id = @request.auth.id", ownerPaid, "leads.update")
  const bodyPaid = "(@request.body.specialist_profile_id.user_id = @request.auth.id && " + paid("@request.body.specialist_profile_id.") + ")"
  leads.createRule = swap(leads.createRule, "@request.body.specialist_profile_id.user_id = @request.auth.id", bodyPaid, "leads.create")
  app.save(leads)

  const msgs = app.findCollectionByNameOrId("lead_messages")
  const msgOwner = "(lead_id.specialist_profile_id.user_id = @request.auth.id && " + paid("lead_id.specialist_profile_id.") + ")"
  msgs.listRule = swap(msgs.listRule, "lead_id.specialist_profile_id.user_id = @request.auth.id", msgOwner, "msgs.list")
  msgs.viewRule = msgs.listRule
  const msgBody = "(@request.body.lead_id.specialist_profile_id.user_id = @request.auth.id && " + paid("@request.body.lead_id.specialist_profile_id.") + ")"
  msgs.createRule = swap(msgs.createRule, "@request.body.lead_id.specialist_profile_id.user_id = @request.auth.id", msgBody, "msgs.create")
  app.save(msgs)

  // 4. Доска объявлений — оплаченным специалистам
  const posts = app.findCollectionByNameOrId("job_posts")
  const sp = "@collection.specialist_profiles:sp."
  const specPaid =
    sp + "user_id ?= @request.auth.id && " + sp + "plan_code ?!= \"\" && (" + sp + "active_until ?= \"\" || " + sp + "active_until ?> @now)"
  posts.listRule = swap(posts.listRule, "(@request.auth.role = \"specialist\" && status = \"open\")", "(@request.auth.role = \"specialist\" && status = \"open\" && " + specPaid + ")", "job_posts.list")
  posts.viewRule = posts.listRule
  app.save(posts)

  // 5. Число заявок без содержимого (подсказка в кабинете неоплатившему)
  const counts = new Collection({
    type: "view",
    name: "leads_count_own",
    viewQuery:
      "SELECT specialist_profile_id AS id, COUNT(id) AS total FROM leads WHERE status IN ('new','transferred','in_progress','responded') GROUP BY specialist_profile_id",
    listRule: sp + "id ?= id && " + sp + "user_id ?= @request.auth.id",
    viewRule: sp + "id ?= id && " + sp + "user_id ?= @request.auth.id",
  })
  app.save(counts)

  // 6. Подпись автора статьи не зависит от видимости профиля
  const news = app.findCollectionByNameOrId("news_posts")
  news.fields.add(new Field({ name: "author_name", type: "text", required: false, max: 200 }))
  app.save(news)
  const authored = app.findRecordsByFilter("news_posts", "author_profile_id != \"\"", "", 0, 0)
  for (const record of authored) {
    try {
      const profile = app.findRecordById("specialist_profiles", record.get("author_profile_id"))
      record.set("author_name", profile.get("public_name"))
      app.saveNoValidate(record)
    } catch (err) {
      // профиль не найден — подпись останется пустой
    }
  }
}, (app) => {
  const unpaidFrag = (rule, from, to) => String(rule).split(from).join(to)
  const paid = (p) => "(" + PAID(p) + ")"
  const relPaid = paid("specialist_profile_id.")
  const ownerPaid = "(specialist_profile_id.user_id = @request.auth.id && " + relPaid + ")"

  try { app.delete(app.findCollectionByNameOrId("leads_count_own")) } catch (err) {}

  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.listRule = "profile_status = \"published\" || user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")"
  profiles.viewRule = profiles.listRule
  app.save(profiles)

  for (const name of ["services", "landing_items"]) {
    const c = app.findCollectionByNameOrId(name)
    c.listRule = unpaidFrag(c.listRule, "specialist_profile_id.profile_status = \"published\" && " + relPaid, "specialist_profile_id.profile_status = \"published\"")
    c.viewRule = c.listRule
    app.save(c)
  }

  const leads = app.findCollectionByNameOrId("leads")
  leads.listRule = unpaidFrag(leads.listRule, ownerPaid, "specialist_profile_id.user_id = @request.auth.id")
  leads.viewRule = leads.listRule
  leads.updateRule = unpaidFrag(leads.updateRule, ownerPaid, "specialist_profile_id.user_id = @request.auth.id")
  leads.createRule = unpaidFrag(leads.createRule, "(@request.body.specialist_profile_id.user_id = @request.auth.id && " + paid("@request.body.specialist_profile_id.") + ")", "@request.body.specialist_profile_id.user_id = @request.auth.id")
  app.save(leads)

  const msgs = app.findCollectionByNameOrId("lead_messages")
  msgs.listRule = unpaidFrag(msgs.listRule, "(lead_id.specialist_profile_id.user_id = @request.auth.id && " + paid("lead_id.specialist_profile_id.") + ")", "lead_id.specialist_profile_id.user_id = @request.auth.id")
  msgs.viewRule = msgs.listRule
  msgs.createRule = unpaidFrag(msgs.createRule, "(@request.body.lead_id.specialist_profile_id.user_id = @request.auth.id && " + paid("@request.body.lead_id.specialist_profile_id.") + ")", "@request.body.lead_id.specialist_profile_id.user_id = @request.auth.id")
  app.save(msgs)

  const posts = app.findCollectionByNameOrId("job_posts")
  const sp = "@collection.specialist_profiles:sp."
  const specPaid =
    sp + "user_id ?= @request.auth.id && " + sp + "plan_code ?!= \"\" && (" + sp + "active_until ?= \"\" || " + sp + "active_until ?> @now)"
  posts.listRule = unpaidFrag(posts.listRule, "(@request.auth.role = \"specialist\" && status = \"open\" && " + specPaid + ")", "(@request.auth.role = \"specialist\" && status = \"open\")")
  posts.viewRule = posts.listRule
  app.save(posts)

  const news = app.findCollectionByNameOrId("news_posts")
  news.fields.removeByName("author_name")
  app.save(news)
})
