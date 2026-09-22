/// <reference path="../pb_data/types.d.ts" />

// Журнал входов ("кто и когда заходил" в /admin) — отдельная коллекция от
// admin_logs (тот — аудит ДЕЙСТВИЙ admin/moderator, этот — вход в аккаунт
// вообще любой роли). createRule/updateRule/deleteRule = null (как и у
// admin_logs) — запись нельзя ни создать, ни поменять напрямую через API,
// только серверными Next.js-роутами через суперпользователя PocketBase
// (api/log-login/route.ts на обычный вход, api/impersonate/route.ts на
// "войти как"), которые обходят правила коллекций, — иначе пользователь
// мог бы наплодить себе фейковых записей о входах или подделать чужие.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "login_logs",
    indexes: [
      "CREATE INDEX idx_login_logs_user ON login_logs (user_id)",
      "CREATE INDEX idx_login_logs_created ON login_logs (created)",
    ],
    listRule: "@request.auth.role = \"admin\"",
    viewRule: "@request.auth.role = \"admin\"",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  })

  collection.fields.add(new Field({
    name: "user_id",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: true,
    minSelect: 1,
    maxSelect: 1,
  }))
  // Кто на самом деле вошёл, если это не сам владелец аккаунта — заполняется
  // только при "войти как" (см. api/impersonate/route.ts). Пусто = обычный
  // самостоятельный вход владельца.
  collection.fields.add(new Field({
    name: "actor_id",
    type: "relation",
    collectionId: users.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "is_impersonation", type: "bool" }))
  collection.fields.add(new Field({ name: "ip", type: "text", max: 64 }))
  collection.fields.add(new Field({ name: "user_agent", type: "text", max: 300 }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("login_logs")
  return app.delete(collection)
})
