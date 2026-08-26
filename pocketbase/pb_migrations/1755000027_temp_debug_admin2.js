/// <reference path="../pb_data/types.d.ts" />

// Временная миграция для отладки бага "block в /admin не скрывает
// профиль из /specialists" (2026-08-26) — см. 1755000025 для той же схемы
// по прошлому багу. Откатывается следующей миграцией.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "admin")
    user.set("verified", true)
    app.save(user)
  } catch (e) {
    console.log("temp_debug_admin2: тестовый пользователь не найден, пропускаю")
  }
}, (app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "specialist")
    app.save(user)
  } catch (e) {}
})
