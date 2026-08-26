/// <reference path="../pb_data/types.d.ts" />

// Временная миграция для проверки delete/impersonate в /admin
// (2026-08-26) — та же схема, что и в 1755000025/1755000027.
// Откатывается следующей миграцией сразу после проверки.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "admin")
    user.set("verified", true)
    app.save(user)
  } catch (e) {
    console.log("temp_debug_admin3: тестовый пользователь не найден, пропускаю")
  }
}, (app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "specialist")
    app.save(user)
  } catch (e) {}
})
