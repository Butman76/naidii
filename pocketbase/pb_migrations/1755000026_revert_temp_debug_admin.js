/// <reference path="../pb_data/types.d.ts" />

// Откатывает 1755000025 — временный admin-доступ тестовому аккаунту
// test-specialist-browsercheck@naidii.ru был нужен только чтобы
// воспроизвести баг "publish в /admin не долетает до /specialists" и
// увидеть настоящую ошибку в консоли браузера. Баг найден (страницы
// каталога были полностью статическими, см. 4c8a0c2) и не связан с
// правами — тестовому аккаунту здесь больше нечего делать.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "test-specialist-browsercheck@naidii.ru" })
    user.set("role", "specialist")
    app.save(user)
  } catch (e) {
    console.log("revert_temp_debug_admin: тестовый пользователь не найден, пропускаю")
  }
}, (app) => {})
