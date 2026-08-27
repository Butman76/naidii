/// <reference path="../pb_data/types.d.ts" />

// Кнопка "confirm email" в /admin молча не работала: у auth-коллекций
// (users) обычный updateRule не даёт прав менять защищённые системные поля
// (verified, email, password) — для этого у PocketBase отдельное правило
// manageRule ("полное управление" записью). 1755000022_admin_users_access.js
// выставил только list/view/updateRule, manageRule не трогал — отсюда
// тихий no-op без единой ошибки в консоли.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")
  collection.manageRule = "@request.auth.role = \"admin\""
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")
  collection.manageRule = null
  return app.save(collection)
})
