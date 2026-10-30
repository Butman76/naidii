/// <reference path="../pb_data/types.d.ts" />

// Бесплатный уровень = одна услуга (миграция 1755000072). Специалист без
// оплаченного тарифа (plan_code пуст или срок вышел) может создать только одну
// услугу; она получает is_free_slot = true и остаётся видимой в каталоге.
// Остальные направления и услуги, а также свои собственные типы услуг —
// с оплаченным тарифом. Админ и суперпользователь не ограничиваются.
// Обработчики JSVM изолированы — функция определена внутри каждого.

onRecordCreateRequest((e) => {
  const callerRole = e.auth ? e.auth.get("role") : ""
  if (e.hasSuperuserAuth() || callerRole === "admin") return e.next()

  const isPaid = (profile) => {
    if (!profile.get("plan_code")) return false
    const until = String(profile.get("active_until") || "")
    if (!until) return true
    const t = new Date(until.replace(" ", "T")).getTime()
    return isNaN(t) || t > Date.now()
  }

  const profile = $app.findRecordById("specialist_profiles", e.record.get("specialist_profile_id"))
  if (isPaid(profile)) {
    e.record.set("is_free_slot", false)
  } else {
    const existing = $app.findRecordsByFilter("services", "specialist_profile_id = {:p}", "", 1, 0, { p: profile.id })
    if (existing.length > 0) {
      throw new BadRequestError("На бесплатном уровне можно разместить одну услугу. Остальные направления и услуги доступны на уровне «Базовый».")
    }
    e.record.set("is_free_slot", true)
  }
  e.next()
}, "services")

onRecordUpdateRequest((e) => {
  // признак бесплатной услуги меняет только сервер
  const callerRole = e.auth ? e.auth.get("role") : ""
  if (!(e.hasSuperuserAuth() || callerRole === "admin")) {
    e.record.set("is_free_slot", e.record.original().get("is_free_slot"))
  }
  e.next()
}, "services")

// Свой тип услуги (заявка на новый тип в форме) — тоже расширение спектра,
// доступно только с оплаченным тарифом.
onRecordCreateRequest((e) => {
  const callerRole = e.auth ? e.auth.get("role") : ""
  if (e.hasSuperuserAuth() || callerRole === "admin" || callerRole === "moderator" || !e.auth) return e.next()

  const profiles = $app.findRecordsByFilter("specialist_profiles", "user_id = {:u}", "", 1, 0, { u: e.auth.id })
  if (profiles.length > 0) {
    const profile = profiles[0]
    let paid = Boolean(profile.get("plan_code"))
    const until = String(profile.get("active_until") || "")
    if (paid && until) {
      const t = new Date(until.replace(" ", "T")).getTime()
      paid = isNaN(t) || t > Date.now()
    }
    if (!paid) throw new BadRequestError("Предложить свой тип услуги можно на уровне «Базовый».")
  }
  e.next()
}, "result_types")
