/// <reference path="../pb_data/types.d.ts" />

// Раз в сутки возвращает на "basic" специалистов, у которых закончился
// оплаченный месяц Pro/Enterprise (specialist_profiles.active_until ставит
// сервер после успешной оплаты, см. web/src/lib/payments.ts). Профили без
// active_until (тариф назначен админом вручную) не трогаем — у ручных
// назначений срока нет.
//
// Хук изолирован (см. pocketbase/README.md, "Грабли JSVM"): всё нужное
// определено внутри обработчика. Запрос идёт не от пользователя, поэтому
// plan_guard.pb.js (он только для request-хуков) не мешает.
cronAdd("plan_expiry", "17 3 * * *", () => {
  const expired = $app.findRecordsByFilter(
    "specialist_profiles",
    "(plan_code = 'pro' || plan_code = 'enterprise') && active_until != '' && active_until < @now",
    "",
    0,
    0
  )
  for (const profile of expired) {
    profile.set("plan_code", "basic")
    profile.set("active_until", "")
    $app.save(profile)
  }
  if (expired.length > 0) {
    console.log("plan_expiry: downgraded " + expired.length + " profile(s) to basic")
  }
})
