/// <reference path="../pb_data/types.d.ts" />

// Разовая операционная миграция: письмо с подтверждением почты не дошло
// (SMTP на сервере, судя по всему, не настроен/не работает) — а без
// подтверждённой почты вход заблокирован (см. коммит "Add email
// verification gate for registration/login"), включая доступ к /admin
// после промоушена в 1755000023. Помечаем почту подтверждённой напрямую
// в базе, чтобы не ждать письма. Настройка реальной отправки почты —
// отдельная задача, тут не решается.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "but_marat@mail.ru" })
    user.set("verified", true)
    app.save(user)
  } catch (e) {
    console.log("verify_but_marat_email: пользователь but_marat@mail.ru не найден, пропускаю")
  }
}, (app) => {
  // Откат не выполняется — исходное состояние verified не сохранялось.
})
