/// <reference path="../pb_data/types.d.ts" />

// Раз в сутки снимает тариф у специалистов, у которых закончился оплаченный
// период (specialist_profiles.active_until ставит сервер после успешной
// оплаты, см. web/src/lib/payments.ts). С 2026-10-30 это касается и Базового:
// профиль без оплаченного тарифа скрыт от публики (миграция
// 1755000071_paid_visibility.js), поэтому после окончания срока plan_code
// становится пустым. Раньше Pro/Enterprise падали на "basic" как на бесплатный
// уровень. Профили без active_until (тариф назначен админом вручную) не
// трогаем — у ручных назначений срока нет. После снятия тарифа у профиля остаётся
// одна видимая услуга (бесплатный уровень, миграция 1755000072) — самая старая. Правила доступа и так проверяют
// срок сами, так что задержка до ночного запуска ничего не открывает.
//
// Хук изолирован (см. pocketbase/README.md, "Грабли JSVM"): всё нужное
// определено внутри обработчика. Запрос идёт не от пользователя, поэтому
// plan_guard.pb.js (он только для request-хуков) не мешает.
cronAdd("plan_expiry", "17 3 * * *", () => {
  const expired = $app.findRecordsByFilter(
    "specialist_profiles",
    "plan_code != '' && active_until != '' && active_until < @now",
    "",
    0,
    0
  )
  for (const profile of expired) {
    profile.set("plan_code", "")
    profile.set("active_until", "")
    $app.save(profile)
    // бесплатный уровень = одна услуга: оставляем видимой самую старую
    const own = $app.findRecordsByFilter("services", "specialist_profile_id = {:p}", "created", 0, 0, { p: profile.id })
    for (let i = 0; i < own.length; i++) {
      own[i].set("is_free_slot", i === 0)
      $app.saveNoValidate(own[i])
    }
  }
  if (expired.length > 0) {
    console.log("plan_expiry: cleared plan for " + expired.length + " expired profile(s)")
  }
})
