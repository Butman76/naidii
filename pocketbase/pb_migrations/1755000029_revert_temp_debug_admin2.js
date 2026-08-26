/// <reference path="../pb_data/types.d.ts" />

// Откатывает 1755000027 (см. 1755000026 для той же схемы по прошлому
// разу) — временный admin-доступ тестовому аккаунту был нужен только
// чтобы посмотреть реальные profile_status/users.status и найти баг
// "block пользователя не скрывает его карточку из каталога" (исправлено
// в AdminPanel.tsx + 1755000028).
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "specialist")
    app.save(user)
  } catch (e) {
    console.log("revert_temp_debug_admin2: тестовый пользователь не найден, пропускаю")
  }
}, (app) => {})
