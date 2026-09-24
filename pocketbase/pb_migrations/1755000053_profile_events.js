/// <reference path="../pb_data/types.d.ts" />

// События профиля для аналитики специалиста (просмотры страницы профиля).
// Считает web/src/app/api/track/route.ts, читает и агрегирует
// web/src/app/api/analytics/route.ts (доступно на тарифах Pro/Enterprise).
// Все правила = null: коллекцию нельзя ни читать, ни писать через API
// напрямую — только серверные роуты Next.js под суперпользователем. Иначе
// любой посетитель мог бы накрутить чужие просмотры, а конкуренты —
// вычитать чужую статистику.
//
// visitor — случайный идентификатор, который браузер сам генерирует и держит
// в localStorage (web/src/components/ViewTracker.tsx): никаких IP-адресов и
// иных персональных данных не хранится, только "тот же посетитель или
// другой". Старые события удаляет cron pb_hooks/events_retention.pb.js.
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  const collection = new Collection({
    type: "base",
    name: "profile_events",
    indexes: [
      "CREATE INDEX idx_profile_events_profile_created ON profile_events (specialist_profile_id, created)",
      "CREATE INDEX idx_profile_events_created ON profile_events (created)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
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
  collection.fields.add(new Field({ name: "kind", type: "text", required: true, max: 30 }))
  collection.fields.add(new Field({ name: "visitor", type: "text", max: 64 }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("profile_events")
  return app.delete(collection)
})
