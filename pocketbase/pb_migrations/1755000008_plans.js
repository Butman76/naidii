/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.8 / §9 — tariffs, editable in admin without code changes (§15).
// СТАЛО НЕАКТУАЛЬНО (2026-08-29): реальная ценовая модель ушла на
// вход/подписка + % с эскроу-сделки (см. web/src/data/plans.ts) — эта
// коллекция ни разу не читалась фронтендом (данные всегда шли из
// статического plans.ts), поэтому схему здесь не меняли. Не подключать
// как есть, если решим брать /tariffs с бэкенда — поля устарели.
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "plans",
    indexes: [
      "CREATE UNIQUE INDEX idx_plans_code ON plans (code)",
    ],
    listRule: "active = true || @request.auth.role = \"admin\"",
    viewRule: "active = true || @request.auth.role = \"admin\"",
    createRule: "@request.auth.role = \"admin\"",
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  collection.fields.add(new Field({ name: "title", type: "text", required: true, max: 150 }))
  collection.fields.add(new Field({ name: "code", type: "text", required: true, max: 50 }))
  collection.fields.add(new Field({ name: "description", type: "editor" }))
  collection.fields.add(new Field({ name: "price", type: "number", required: true, min: 0 }))
  collection.fields.add(new Field({ name: "duration_days", type: "number", required: true, min: 1, onlyInt: true }))
  collection.fields.add(new Field({ name: "services_limit", type: "number", min: 0, onlyInt: true }))
  collection.fields.add(new Field({ name: "cases_limit", type: "number", min: 0, onlyInt: true }))
  collection.fields.add(new Field({ name: "analytics_enabled", type: "bool" }))
  collection.fields.add(new Field({ name: "promotion_access", type: "bool" }))
  collection.fields.add(new Field({ name: "trial_days", type: "number", min: 0, onlyInt: true }))
  collection.fields.add(new Field({ name: "discount_percent", type: "number", min: 0, max: 100, onlyInt: true }))
  collection.fields.add(new Field({ name: "sort_order", type: "number", onlyInt: true }))
  collection.fields.add(new Field({ name: "active", type: "bool" }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("plans")
  return app.delete(collection)
})
