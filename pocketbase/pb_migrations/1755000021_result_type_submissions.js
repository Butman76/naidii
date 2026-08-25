/// <reference path="../pb_data/types.d.ts" />

// Фаза 1 (2026-08-25): специалист может не только выбрать существующий тип
// результата, но и предложить свой (Название + Категория + Описание — цену
// он в любом случае указывает сам в самом предложении, ResultType цену не
// хранит). До сих пор result_types создавал только admin/moderator
// (см. 1755000017) — теперь специалист тоже может, но только со
// status = "pending", и только свой (created_by = он сам). Модерация — тем
// же способом, что и у specialist_profiles/reviews: пока не approved, тип
// не публичен.
//
// Обратная совместимость: у всех уже существующих 42 типов status раньше
// не было вообще — без бэкофилла они бы перестали проходить публичный
// listRule/viewRule (status = "approved") и пропали из каталога. Явно
// проставляем approved всем существующим записям.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("result_types")
  const users = app.findCollectionByNameOrId("users")

  collection.fields.add(new Field({ name: "description", type: "editor" }))
  collection.fields.add(new Field({
    name: "status",
    type: "select",
    required: true,
    values: ["pending", "approved", "rejected"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "created_by",
    type: "relation",
    required: false,
    collectionId: users.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))

  // Публичная витрина видит только approved; сам автор — и свою заявку на
  // модерации; admin/moderator — вообще всё (нужно для очереди модерации).
  collection.listRule = "status = \"approved\" || created_by = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  collection.viewRule = "status = \"approved\" || created_by = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  collection.createRule = "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\" || (@request.auth.role = \"specialist\" && @request.body.status = \"pending\" && @request.body.created_by = @request.auth.id)"
  // updateRule нарочно не трогаем: approve/reject — только admin/moderator
  // (специалист не может сам себе одобрить тип, поменяв status).
  // Своя заявка, пока не рассмотрена, — можно отозвать.
  collection.deleteRule = "@request.auth.role = \"admin\" || (created_by = @request.auth.id && status = \"pending\")"

  app.save(collection)

  const existing = app.findRecordsByFilter("result_types", "status = \"\"", "", 0, 0)
  for (const record of existing) {
    record.set("status", "approved")
    app.save(record)
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("result_types")
  collection.fields.removeByName("description")
  collection.fields.removeByName("status")
  collection.fields.removeByName("created_by")
  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  collection.deleteRule = "@request.auth.role = \"admin\""
  return app.save(collection)
})
