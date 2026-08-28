/// <reference path="../pb_data/types.d.ts" />

// "Не нашли то, что вам надо?" — раздел в кабинете заказчика (по запросу
// пользователя, 2026-08-28): идея/пожелание по доработке или новой
// автоматизации, которой нет на площадке. Само письмо на info@naidii.ru
// отправляет хук pb_hooks/suggestions.pb.js при создании записи — здесь
// только схема и права доступа.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "suggestions",
    indexes: [
      "CREATE INDEX idx_suggestions_user ON suggestions (user_id)",
    ],
    listRule: "user_id = @request.auth.id || @request.auth.role = \"admin\"",
    viewRule: "user_id = @request.auth.id || @request.auth.role = \"admin\"",
    createRule: "@request.auth.id != \"\" && @request.auth.role = \"customer\" && @request.body.user_id = @request.auth.id",
    updateRule: null,
    deleteRule: "@request.auth.role = \"admin\"",
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
  collection.fields.add(new Field({ name: "text", type: "text", required: true, max: 3000 }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("suggestions")
  return app.delete(collection)
})
