/// <reference path="../pb_data/types.d.ts" />

// Разовая операционная миграция: у пользователя пока нет способа получить
// роль admin/moderator через обычный UI (регистрация даёт только
// specialist/customer, см. 1755000022) — назначаем её напрямую в базе,
// без захода в закрытую снаружи панель PocketBase (/_/ отдаёт 404).
// Обёрнуто в try/catch: если аккаунт с таким email ещё не
// зарегистрирован на конкретном окружении, миграция не должна ронять
// остальную цепочку миграций при старте сервиса.
migrate((app) => {
  try {
    const user = app.findFirstRecordByFilter("users", "email = {:email}", { email: "but_marat@mail.ru" })
    user.set("role", "admin")
    app.save(user)
  } catch (e) {
    console.log("promote_but_marat_admin: пользователь but_marat@mail.ru не найден, пропускаю")
  }
}, (app) => {
  // Откат роли не выполняется — исходная роль (specialist/customer) не
  // сохранялась перед изменением.
})
