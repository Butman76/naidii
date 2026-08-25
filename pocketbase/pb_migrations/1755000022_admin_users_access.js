/// <reference path="../pb_data/types.d.ts" />

// Фаза 2 (2026-08-25): кабинет модератора/админа получает вкладку
// "Пользователи" (специалисты И заказчики — по запросу пользователя, не
// только специалисты). Встроенная коллекция users по умолчанию у PocketBase
// разрешает id/list/view/update только самому себе (ни одна миграция до
// сих пор это не трогала) — бизнес-роли admin/moderator физически не могли
// прочитать чужие записи через API, только через суперпользователя в /_/.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.listRule = "id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  collection.viewRule = "id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  // Блокировка пользователя — только admin (не moderator): moderator
  // модерирует контент (профили/типы/отзывы), не распоряжается аккаунтами.
  // Сам пользователь по-прежнему может редактировать свою запись (имя,
  // телефон и т.п.) — какие именно поля можно менять самому себе, а какие
  // только админу (role/status), PocketBase-правила на уровне поля не
  // умеют, это остаётся на совести формы (как и у specialist_profiles.
  // profile_status, см. комментарий в 1755000004).
  collection.updateRule = "id = @request.auth.id || @request.auth.role = \"admin\""

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")
  collection.listRule = "id = @request.auth.id"
  collection.viewRule = "id = @request.auth.id"
  collection.updateRule = "id = @request.auth.id"
  return app.save(collection)
})
