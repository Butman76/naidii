/// <reference path="../pb_data/types.d.ts" />

// 2026-10-30: бесплатный уровень = одна услуга. Уточнение владельца к модели
// 1755000071: специалист без оплаченного тарифа не скрыт полностью, а может
// разместить ровно ОДНУ услугу (один тип в одном направлении). Профиль и эта
// услуга видны в каталоге, заявки по ней приходят; весь остальной спектр
// (другие направления и услуги) и свои собственные типы — с тарифа Базовый.
// Заказы на доске объявлений бесплатный видит только по своему направлению и
// подразделу (совпадение category_slug и subcategory заказа с типом его
// услуги); оплаченный видит все.
//
// Как это устроено:
//   services.is_free_slot — «бесплатная» услуга специалиста без тарифа; ставит
//     только хук pb_hooks/services_free_limit.pb.js (создание второй услуги
//     без тарифа он отклоняет). После окончания оплаты ночной хук plan_expiry
//     помечает самую старую услугу.
//   Профиль «в каталоге» = оплачен ИЛИ имеет услугу с is_free_slot.
//   Правила leads, lead_messages, services, specialist_profiles и job_posts
//   (создавались в 1755000071) переписаны под это через обратную связь
//   services_via_specialist_profile_id.
//
// Откат: down возвращает правила 1755000071 и убирает поле.
const PAID = (p) => p + "plan_code != \"\" && (" + p + "active_until = \"\" || " + p + "active_until > @now)"
const FREE = (p) => p + "services_via_specialist_profile_id.is_free_slot ?= true"

const swap = (rule, from, to, label) => {
  if (!String(rule).includes(from)) throw new Error("rule fragment not found: " + label)
  return String(rule).split(from).join(to)
}

migrate((app) => {
  // 1. Поле и заполнение для уже существующих неоплаченных профилей
  const services = app.findCollectionByNameOrId("services")
  services.fields.add(new Field({ name: "is_free_slot", type: "bool" }))
  app.save(services)

  const unpaid = app.findRecordsByFilter(
    "specialist_profiles",
    "plan_code = \"\" || (active_until != \"\" && active_until < @now)",
    "", 0, 0
  )
  let flagged = 0
  for (const profile of unpaid) {
    const own = app.findRecordsByFilter("services", "specialist_profile_id = {:p}", "created", 1, 0, { p: profile.id })
    if (own.length > 0) {
      own[0].set("is_free_slot", true)
      app.saveNoValidate(own[0])
      flagged++
    }
  }
  console.log("free_one_service: flagged free slot for " + flagged + " profile(s)")

  // 2. Видимость: профиль в каталоге — оплачен или есть бесплатная услуга
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.listRule = swap(
    profiles.listRule,
    "(profile_status = \"published\" && (" + PAID("") + "))",
    "(profile_status = \"published\" && ((" + PAID("") + ") || " + FREE("") + "))",
    "profiles"
  )
  profiles.viewRule = profiles.listRule
  app.save(profiles)

  const relPaid = "(" + PAID("specialist_profile_id.") + ")"
  const svc = app.findCollectionByNameOrId("services")
  svc.listRule = swap(svc.listRule, relPaid, "(" + relPaid + " || is_free_slot = true)", "services")
  svc.viewRule = svc.listRule
  app.save(svc)

  // 3. Заявки и переписка: профиль «в каталоге» (оплачен или есть бесплатная услуга)
  const listedRel = "(" + relPaid + " || " + FREE("specialist_profile_id.") + ")"
  const leads = app.findCollectionByNameOrId("leads")
  leads.listRule = swap(leads.listRule, "(specialist_profile_id.user_id = @request.auth.id && " + relPaid + ")", "(specialist_profile_id.user_id = @request.auth.id && " + listedRel + ")", "leads.list")
  leads.viewRule = leads.listRule
  leads.updateRule = swap(leads.updateRule, "(specialist_profile_id.user_id = @request.auth.id && " + relPaid + ")", "(specialist_profile_id.user_id = @request.auth.id && " + listedRel + ")", "leads.update")
  const bodyPaid = "(" + PAID("@request.body.specialist_profile_id.") + ")"
  leads.createRule = swap(
    leads.createRule,
    "(@request.body.specialist_profile_id.user_id = @request.auth.id && " + bodyPaid + ")",
    "(@request.body.specialist_profile_id.user_id = @request.auth.id && (" + bodyPaid + " || " + FREE("@request.body.specialist_profile_id.") + "))",
    "leads.create"
  )
  app.save(leads)

  const msgs = app.findCollectionByNameOrId("lead_messages")
  const msgPaid = "(" + PAID("lead_id.specialist_profile_id.") + ")"
  msgs.listRule = swap(msgs.listRule, "(lead_id.specialist_profile_id.user_id = @request.auth.id && " + msgPaid + ")", "(lead_id.specialist_profile_id.user_id = @request.auth.id && (" + msgPaid + " || " + FREE("lead_id.specialist_profile_id.") + "))", "msgs.list")
  msgs.viewRule = msgs.listRule
  const msgBodyPaid = "(" + PAID("@request.body.lead_id.specialist_profile_id.") + ")"
  msgs.createRule = swap(msgs.createRule, "(@request.body.lead_id.specialist_profile_id.user_id = @request.auth.id && " + msgBodyPaid + ")", "(@request.body.lead_id.specialist_profile_id.user_id = @request.auth.id && (" + msgBodyPaid + " || " + FREE("@request.body.lead_id.specialist_profile_id.") + "))", "msgs.create")
  app.save(msgs)

  // 4. Доска объявлений: оплаченным — всё, бесплатному — своё направление и подраздел
  const jobs = app.findCollectionByNameOrId("job_posts")
  const sp = "@collection.specialist_profiles:sp."
  const fs = "@collection.services:fs."
  const specPaid = sp + "user_id ?= @request.auth.id && " + sp + "plan_code ?!= \"\" && (" + sp + "active_until ?= \"\" || " + sp + "active_until ?> @now)"
  const freeMatch =
    fs + "specialist_profile_id.user_id ?= @request.auth.id && " + fs + "is_free_slot ?= true && " +
    fs + "result_type_id.subcategory ?= subcategory && " + fs + "result_type_id.category_id.slug ?= category_slug"
  jobs.listRule = swap(jobs.listRule, "status = \"open\" && " + specPaid + ")", "status = \"open\" && ((" + specPaid + ") || (" + freeMatch + ")))", "job_posts")
  jobs.viewRule = jobs.listRule
  app.save(jobs)
}, (app) => {
  const relPaid = "(" + PAID("specialist_profile_id.") + ")"
  const listedRel = "(" + relPaid + " || " + FREE("specialist_profile_id.") + ")"

  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.listRule = swap(profiles.listRule, "(profile_status = \"published\" && ((" + PAID("") + ") || " + FREE("") + "))", "(profile_status = \"published\" && (" + PAID("") + "))", "d.profiles")
  profiles.viewRule = profiles.listRule
  app.save(profiles)

  const svc = app.findCollectionByNameOrId("services")
  svc.listRule = swap(svc.listRule, "(" + relPaid + " || is_free_slot = true)", relPaid, "d.services")
  svc.viewRule = svc.listRule
  svc.fields.removeByName("is_free_slot")
  app.save(svc)

  const leads = app.findCollectionByNameOrId("leads")
  leads.listRule = swap(leads.listRule, listedRel, relPaid, "d.leads.list")
  leads.viewRule = leads.listRule
  leads.updateRule = swap(leads.updateRule, listedRel, relPaid, "d.leads.update")
  const bodyPaid = "(" + PAID("@request.body.specialist_profile_id.") + ")"
  leads.createRule = swap(leads.createRule, "(" + bodyPaid + " || " + FREE("@request.body.specialist_profile_id.") + ")", bodyPaid, "d.leads.create")
  app.save(leads)

  const msgs = app.findCollectionByNameOrId("lead_messages")
  const msgPaid = "(" + PAID("lead_id.specialist_profile_id.") + ")"
  msgs.listRule = swap(msgs.listRule, "(" + msgPaid + " || " + FREE("lead_id.specialist_profile_id.") + ")", msgPaid, "d.msgs.list")
  msgs.viewRule = msgs.listRule
  const msgBodyPaid = "(" + PAID("@request.body.lead_id.specialist_profile_id.") + ")"
  msgs.createRule = swap(msgs.createRule, "(" + msgBodyPaid + " || " + FREE("@request.body.lead_id.specialist_profile_id.") + ")", msgBodyPaid, "d.msgs.create")
  app.save(msgs)

  const jobs = app.findCollectionByNameOrId("job_posts")
  const sp = "@collection.specialist_profiles:sp."
  const fs = "@collection.services:fs."
  const specPaid = sp + "user_id ?= @request.auth.id && " + sp + "plan_code ?!= \"\" && (" + sp + "active_until ?= \"\" || " + sp + "active_until ?> @now)"
  const freeMatch =
    fs + "specialist_profile_id.user_id ?= @request.auth.id && " + fs + "is_free_slot ?= true && " +
    fs + "result_type_id.subcategory ?= subcategory && " + fs + "result_type_id.category_id.slug ?= category_slug"
  jobs.listRule = swap(jobs.listRule, "status = \"open\" && ((" + specPaid + ") || (" + freeMatch + ")))", "status = \"open\" && " + specPaid + ")", "d.job_posts")
  jobs.viewRule = jobs.listRule
  app.save(jobs)
})
