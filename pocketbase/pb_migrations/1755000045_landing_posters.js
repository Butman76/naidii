/// <reference path="../pb_data/types.d.ts" />

// Рекламные постеры для лендинга специалиста на тарифе enterprise (раздел
// "Скриншоты и работы" в PremiumSpecialistProfile.tsx — раньше там были
// просто строки-подписи на цветных градиентах, теперь настоящие
// загруженные картинки с подписью). Отдельная коллекция, а не файл-массив
// на specialist_profiles, потому что каждой картинке нужна своя подпись —
// то же соображение, что и у cases/services (см. их миграции).
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  const collection = new Collection({
    type: "base",
    name: "landing_posters",
    indexes: [
      "CREATE INDEX idx_landing_posters_profile ON landing_posters (specialist_profile_id)",
    ],
    listRule: "specialist_profile_id.profile_status = \"published\" || specialist_profile_id.user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")",
    viewRule: "specialist_profile_id.profile_status = \"published\" || specialist_profile_id.user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")",
    createRule: "@request.body.specialist_profile_id.user_id = @request.auth.id",
    updateRule: "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    deleteRule: "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
  })

  collection.fields.add(new Field({
    name: "specialist_profile_id",
    type: "relation",
    required: true,
    collectionId: profiles.id,
    cascadeDelete: true,
    minSelect: 1,
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "image",
    type: "file",
    required: true,
    maxSelect: 1,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({ name: "caption", type: "text", max: 150 }))
  collection.fields.add(new Field({ name: "sort_order", type: "number", onlyInt: true }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("landing_posters")
  return app.delete(collection)
})
