/// <reference path="../pb_data/types.d.ts" />

// Временная миграция для отладки бага "publish не срабатывает в /admin"
// (2026-08-26) — даёт тестовому аккаунту test-specialist-browsercheck@naidii.ru
// роль admin + подтверждённую почту, чтобы воспроизвести баг в браузере с
// открытой консолью и увидеть настоящую ошибку PocketBase вместо
// проглоченной в AdminPanel.tsx. Убрать/откатить после того, как баг найден.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "admin")
    user.set("verified", true)
    app.save(user)
  } catch (e) {
    console.log("temp_debug_admin: тестовый пользователь не найден, пропускаю")
  }
}, (app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "specialist")
    app.save(user)
  } catch (e) {}
})
