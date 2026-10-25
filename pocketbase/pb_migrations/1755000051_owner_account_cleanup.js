/// <reference path="../pb_data/types.d.ts" />

// Разовая чистка аккаунта владельца площадки (but_marat@mail.ru), по прямой
// просьбе 2026-09-23:
//  1. опечатка в имени "Марат Бкторин" -> "Марат Буторин" (users.name и
//     public_name его профиля);
//  2. его профиль специалиста был опубликован и светился в каталоге
//     разработчиков — переводим в "hidden" (все публичные правила доступа
//     завязаны на profile_status = "published", поэтому скрывается и сам
//     профиль, и всё, что к нему привязано). Собственный кабинет он видит и
//     дальше (правило "user_id = @request.auth.id").
// Если аккаунта нет (свежая БД, локальный тестовый инстанс) — просто
// пропускаем, это не ошибка.
migrate((app) => {
  let user
  try {
    user = app.findFirstRecordByData("users", "email", "but_marat@mail.ru")
  } catch (_) {
    return
  }

  user.set("name", "Марат Буторин")
  app.saveNoValidate(user)

  let profiles = []
  try {
    profiles = app.findRecordsByFilter("specialist_profiles", "user_id = {:uid}", "", 0, 0, { uid: user.id })
  } catch (_) {
    return
  }
  for (const profile of profiles) {
    profile.set("profile_status", "hidden")
    if (profile.get("public_name") === "Марат Бкторин") {
      profile.set("public_name", "Марат Буторин")
    }
    app.saveNoValidate(profile)
  }
}, (app) => {
  // Данные не откатываем: возвращать опечатку и публиковать профиль
  // обратно смысла нет.
})
