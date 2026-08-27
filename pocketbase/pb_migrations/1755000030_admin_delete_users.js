/// <reference path="../pb_data/types.d.ts" />

// Админка умела только блокировать пользователей (users.deleteRule
// оставался нетронутым с дефолта PocketBase — "id = @request.auth.id",
// т.е. можно удалить только самого себя). Пользователь явно попросил
// уметь и удалять. Только admin (не moderator) — то же обоснование, что
// и у блокировки в 1755000022: модератор модерирует контент, не
// распоряжается аккаунтами. specialist_profiles.user_id уже cascadeDelete
// (см. 1755000004), так что удаление пользователя корректно подчищает и
// его карточку/услуги.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")
  collection.deleteRule = "id = @request.auth.id || @request.auth.role = \"admin\""
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")
  collection.deleteRule = "id = @request.auth.id"
  return app.save(collection)
})
