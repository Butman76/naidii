/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.12 / §8.6 — append-only audit trail. No updateRule/deleteRule
// (null = nobody but a PocketBase superuser can touch it via the API),
// so log entries can't be edited or erased by an app-level admin account.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "admin_logs",
    fields: [
      new Field({
        name: "admin_id",
        type: "relation",
        required: true,
        collectionId: users.id,
        cascadeDelete: false,
        minSelect: 1,
        maxSelect: 1,
      }),
      new Field({ name: "action", type: "text", required: true, max: 150 }),
      new Field({ name: "entity_type", type: "text", required: true, max: 100 }),
      new Field({ name: "entity_id", type: "text", max: 100 }),
      new Field({ name: "old_data", type: "json", maxSize: 2000000 }),
      new Field({ name: "new_data", type: "json", maxSize: 2000000 }),
      new Field({ name: "ip", type: "text", max: 64 }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
    ],
    indexes: [
      "CREATE INDEX idx_admin_logs_admin ON admin_logs (admin_id)",
      "CREATE INDEX idx_admin_logs_entity ON admin_logs (entity_type, entity_id)",
    ],
    listRule: "@request.auth.role = \"admin\"",
    viewRule: "@request.auth.role = \"admin\"",
    createRule: "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    updateRule: null,
    deleteRule: null,
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("admin_logs")
  return app.delete(collection)
})
