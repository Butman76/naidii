/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.6 / §5.4
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  const collection = new Collection({
    type: "base",
    name: "cases",
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
      new Field({ name: "industry", type: "text", max: 150 }),
      new Field({ name: "client_name_or_nda", type: "text", max: 200 }),
      new Field({ name: "task", type: "editor" }),
      new Field({ name: "solution", type: "editor" }),
      // Comma/JSON-style free text of tech names (kept simple rather than a
      // relation to skills, since §11.6 lists it as a plain field).
      new Field({ name: "technologies", type: "text", max: 500 }),
      new Field({ name: "result", type: "editor" }),
      new Field({ name: "duration", type: "text", max: 100 }),
      new Field({
        name: "images",
        type: "file",
        maxSelect: 10,
        maxSize: 8388608,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      }),
      new Field({ name: "external_link", type: "url" }),
      new Field({
        name: "moderation_status",
        type: "select",
        required: true,
        values: ["pending", "approved", "rejected"],
        maxSelect: 1,
      }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
      new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }),
    ],
    indexes: [
      "CREATE INDEX idx_cases_profile ON cases (specialist_profile_id)",
    ],
  })

  collection.createRule = "@request.body.specialist_profile_id.user_id = @request.auth.id"
  // listRule/viewRule/updateRule/deleteRule traverse into the related
  // specialist_profiles record; set later in
  // 1755000015_relation_traversal_rules.js once this table is committed.

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("cases")
  return app.delete(collection)
})
