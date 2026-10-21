// Общая логика блога специалиста (подключается из news_blog.pb.js через
// require). Файл без суффикса .pb.js — сам как хук не загружается.
//
// Лимит частоты по тарифу профиля (оплаченному и не истёкшему):
//   enterprise — 1 статья в сутки, pro — 1 в 3 дня, всё остальное
//   (basic и профиль без оплаченного тарифа) — 1 в неделю.
// Те же числа дублируются в web/src/lib/blog.ts (для подсказки автору в
// кабинете) — менять в обоих местах.

const HOUR = 3600 * 1000
const MIN_BODY = 600
const MIN_EXCERPT = 40
const MIN_TITLE = 10

function intervalMs(profile) {
  let code = String(profile.get("plan_code") || "")
  const until = String(profile.get("active_until") || "")
  if (until) {
    const t = new Date(until.replace(" ", "T")).getTime()
    if (!isNaN(t) && t <= Date.now()) code = ""
  }
  if (code === "enterprise") return 24 * HOUR
  if (code === "pro") return 72 * HOUR
  return 7 * 24 * HOUR
}

function humanWait(ms) {
  const hours = Math.ceil(ms / HOUR)
  if (hours < 24) return hours + " ч."
  const days = Math.ceil(hours / 24)
  return days + " дн."
}

// Правила блога: без контактов, без внешних ссылок, без картинок в тексте.
function checkContent(record) {
  const title = String(record.get("title") || "").trim()
  const excerpt = String(record.get("excerpt") || "").trim()
  const body = String(record.get("body") || "")
  const all = title + "\n" + excerpt + "\n" + body

  if (title.length < MIN_TITLE) throw new BadRequestError("Заголовок слишком короткий — от " + MIN_TITLE + " знаков.")
  if (excerpt.length < MIN_EXCERPT) throw new BadRequestError("Напишите подводку — от " + MIN_EXCERPT + " знаков: о чём статья и чем она полезна читателю.")
  if (body.trim().length < MIN_BODY) throw new BadRequestError("Текст слишком короткий — от " + MIN_BODY + " знаков.")

  if (/!\[[^\]]*\]\([^)]*\)/.test(body)) throw new BadRequestError("Картинки внутри текста в блоге недоступны — загрузите обложку отдельным полем.")
  if (/https?:\/\/(?!(www\.)?naidii\.ru)\S+/i.test(all) || /\bwww\.(?!naidii\.ru)\S+/i.test(all) || /t\.me\/\S+/i.test(all)) {
    throw new BadRequestError("Ссылки на сторонние сайты и мессенджеры в блоге не публикуются — читатель переходит в профиль на НайдИИ.")
  }
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(all) || /(^|[^\w])@[a-zA-Z0-9_]{4,}/.test(all) || /\+?\d[\d\s\-()]{9,}\d/.test(all)) {
    throw new BadRequestError("В блоге нельзя оставлять телефоны, e-mail и @-ники — контакты доступны в профиле.")
  }
}

// Автор должен быть владельцем опубликованного профиля.
function loadAuthor(record, authUserId) {
  const profileId = record.get("author_profile_id")
  if (!profileId) throw new ForbiddenError("Не указан автор.")
  const profile = $app.findRecordById("specialist_profiles", profileId)
  if (profile.get("user_id") !== authUserId) throw new ForbiddenError("Это не ваш профиль.")
  if (profile.get("profile_status") !== "published") {
    throw new BadRequestError("Блог откроется после публикации вашего профиля в каталоге.")
  }
  return profile
}

// Только при создании: частота публикаций. Считаем все отправленные статьи
// автора, кроме отклонённых (отклонённую можно исправить и отправить заново
// без ожидания).
function checkRate(profile) {
  const last = $app.findRecordsByFilter(
    "news_posts",
    "author_profile_id = {:a} && status != 'rejected'",
    "-created", 1, 0, { a: profile.id }
  )
  if (last.length === 0) return
  const created = new Date(String(last[0].get("created")).replace(" ", "T")).getTime()
  const wait = created + intervalMs(profile) - Date.now()
  if (wait > 0) throw new BadRequestError("Следующую статью можно отправить через " + humanWait(wait) + " (лимит зависит от тарифа).")
}

module.exports = { checkContent, loadAuthor, checkRate }
