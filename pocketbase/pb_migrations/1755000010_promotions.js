/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.10 / §8.3 — drives the Топ-20 grid. Public list/view is required
// so the homepage can render it; writes are admin-only (the visual Топ-20
// admin screen is the only place positions/rotation get edited per §8.3).
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const orders = app.findCollectionByNameOrId("orders")

  const collection = new Collection({
    type: "base",
    name: "promotions",
    indexes: [
      "CREATE INDEX idx_promotions_profile ON promotions (specialist_profile_id)",
      "CREATE INDEX idx_promotions_status ON promotions (status)",
      "CREATE UNIQUE INDEX idx_promotions_position ON promotions (top_position) WHERE top_position IS NOT NULL AND status = 'active'",
    ],
    listRule: "status = \"active\" || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    viewRule: "status = \"active\" || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    createRule: "@request.auth.role = \"admin\"",
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
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
    name: "promotion_type",
    type: "select",
    required: true,
    values: ["top7", "top14", "top30", "category_pin", "highlight", "priority"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "order_id",
    type: "relation",
    collectionId: orders.id,
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "status",
    type: "select",
    required: true,
    values: ["active", "expired", "cancelled"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "start_at", type: "date", required: true }))
  collection.fields.add(new Field({ name: "end_at", type: "date", required: true }))
  collection.fields.add(new Field({ name: "top_position", type: "number", min: 1, max: 20, onlyInt: true }))
  collection.fields.add(new Field({ name: "priority", type: "number", onlyInt: true }))
  collection.fields.add(new Field({ name: "rotation_enabled", type: "bool" }))
  collection.fields.add(new Field({ name: "impressions", type: "number", min: 0, onlyInt: true }))
  collection.fields.add(new Field({ name: "clicks", type: "number", min: 0, onlyInt: true }))
  collection.fields.add(new Field({ name: "leads", type: "number", min: 0, onlyInt: true }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("promotions")
  return app.delete(collection)
})
