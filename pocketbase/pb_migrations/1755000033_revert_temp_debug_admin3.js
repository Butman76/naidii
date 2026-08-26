/// <reference path="../pb_data/types.d.ts" />

// Откатывает 1755000032 — временный admin-доступ был нужен только чтобы
// вживую проверить кнопки "войти как"/"delete" в /admin и починить гонку
// с RequireAuth при подмене сессии.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "specialist")
    user.set("status", "active")
    app.save(user)
  } catch (e) {
    console.log("revert_temp_debug_admin3: тестовый пользователь не найден, пропускаю")
  }
}, (app) => {})
