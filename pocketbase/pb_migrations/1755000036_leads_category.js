/// <reference path="../pb_data/types.d.ts" />

// leads не хранит связь ни с конкретной услугой (services), ни с
// направлением — только specialist_profile_id. Кабинеты (и заказчика, и
// специалиста) теперь показывают заявки цветными плашками в цвет
// направления (см. STATUS.md 2026-08-27) — нужно от чего оттолкнуться.
// Полноценная связь через service_id — оверкилл для этого; category_slug
// простым текстом, проставляется на фронте в момент создания заявки
// (OrderButton уже знает направление услуги, с которой заказывают) —
// достаточно для цветной плашки, не претендует быть строгой связью.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads")
  collection.fields.add(new Field({ name: "category_slug", type: "text", max: 100 }))
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("leads")
  collection.fields.removeByName("category_slug")
  return app.save(collection)
})
