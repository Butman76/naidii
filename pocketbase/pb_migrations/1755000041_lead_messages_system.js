/// <reference path="../pb_data/types.d.ts" />

// По просьбе пользователя (2026-08-30): предложение/отклонение сделки в
// чате должно доходить до собеседника мгновенно, без обновления страницы
// (для обычных сообщений это уже есть через realtime-подписку на
// lead_messages — теперь то же самое нужно и для карточки сделки), и
// оставлять системную запись прямо в переписке ("Заказчик предложил
// заключить сделку", дата и время) — а не только менять цветную карточку
// статуса сверху чата, которая при отклонении просто исчезает без следа.
// Системная запись — это обычный lead_messages с флагом is_system: тогда
// она бесплатно получает и realtime-доставку, и место в истории чата, без
// отдельного механизма и без правки createRule (sender_id всё равно сам
// действующий участник, правило уже это разрешает).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("lead_messages")
  collection.fields.add(new Field({ name: "is_system", type: "bool" }))
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("lead_messages")
  collection.fields.removeByName("is_system")
  return app.save(collection)
})
