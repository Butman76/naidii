/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.8 / §9 — tariffs, editable in admin without code changes (§15).
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "plans",
    fields: [
      new Field({ name: "title", type: "text", required: true, max: 150 }),
      new Field({ name: "code", type: "text", required: true, max: 50 }),
      new Field({ name: "description", type: "editor" }),
      new Field({ name: "price", type: "number", required: true, min: 0 }),
      new Field({ name: "duration_days", type: "number", required: true, min: 1, onlyInt: true }),
      new Field({ name: "services_limit", type: "number", min: 0, onlyInt: true }),
      new Field({ name: "cases_limit", type: "number", min: 0, onlyInt: true }),
      new Field({ name: "analytics_enabled", type: "bool" }),
      new Field({ name: "promotion_access", type: "bool" }),
      new Field({ name: "trial_days", type: "number", min: 0, onlyInt: true }),
      new Field({ name: "discount_percent", type: "number", min: 0, max: 100, onlyInt: true }),
      new Field({ name: "sort_order", type: "number", onlyInt: true }),
      new Field({ name: "active", type: "bool" }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
      new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }),
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_plans_code ON plans (code)",
    ],
    listRule: "active = true || @request.auth.role = \"admin\"",
    viewRule: "active = true || @request.auth.role = \"admin\"",
    createRule: "@request.auth.role = \"admin\"",
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("plans")
  return app.delete(collection)
})
