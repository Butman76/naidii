/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.5 / §5.3 — up to N services per profile, N gated by the owner's
// plan (plans.services_limit), enforced at the application layer.
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  const collection = new Collection({
    type: "base",
    name: "services",
    fields: [
      new Field({
        name: "specialist_profile_id",
        type: "relation",
        required: true,
        collectionId: profiles.id,
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      }),
      new Field({ name: "title", type: "text", required: true, max: 200 }),
      new Field({ name: "description", type: "editor" }),
      new Field({ name: "price_from", type: "number", min: 0 }),
      new Field({ name: "duration_from", type: "text", max: 100 }),
      new Field({ name: "category", type: "text", max: 150 }),
      new Field({ name: "active", type: "bool" }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
      new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }),
    ],
    indexes: [
      "CREATE INDEX idx_services_profile ON services (specialist_profile_id)",
    ],
  })

  collection.createRule = "@request.body.specialist_profile_id.user_id = @request.auth.id"
  // listRule/viewRule/updateRule/deleteRule traverse into the related
  // specialist_profiles record; set later in
  // 1755000015_relation_traversal_rules.js once this table is committed.

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("services")
  return app.delete(collection)
})
