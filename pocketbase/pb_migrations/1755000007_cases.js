/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.6 / §5.4
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  const collection = new Collection({
    type: "base",
    name: "cases",
    indexes: [
      "CREATE INDEX idx_cases_profile ON cases (specialist_profile_id)",
    ],
    listRule: "moderation_status = \"approved\" || specialist_profile_id.user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")",
    viewRule: "moderation_status = \"approved\" || specialist_profile_id.user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")",
    createRule: "@request.body.specialist_profile_id.user_id = @request.auth.id",
    updateRule: "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    deleteRule: "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
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
  collection.fields.add(new Field({ name: "title", type: "text", required: true, max: 200 }))
  collection.fields.add(new Field({ name: "industry", type: "text", max: 150 }))
  collection.fields.add(new Field({ name: "client_name_or_nda", type: "text", max: 200 }))
  collection.fields.add(new Field({ name: "task", type: "editor" }))
  collection.fields.add(new Field({ name: "solution", type: "editor" }))
  // Comma/JSON-style free text of tech names (kept simple rather than a
  // relation to skills, since §11.6 lists it as a plain field).
  collection.fields.add(new Field({ name: "technologies", type: "text", max: 500 }))
  collection.fields.add(new Field({ name: "result", type: "editor" }))
  collection.fields.add(new Field({ name: "duration", type: "text", max: 100 }))
  collection.fields.add(new Field({
    name: "images",
    type: "file",
    maxSelect: 10,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({ name: "external_link", type: "url" }))
  collection.fields.add(new Field({
    name: "moderation_status",
    type: "select",
    required: true,
    values: ["pending", "approved", "rejected"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("cases")
  return app.delete(collection)
})
