/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.3
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "skills",
    indexes: [
      "CREATE UNIQUE INDEX idx_skills_slug ON skills (slug)",
    ],
    listRule: "status = \"active\"",
    viewRule: "status = \"active\"",
    createRule: "@request.auth.id != \"\" && @request.auth.role = \"admin\"",
    updateRule: "@request.auth.id != \"\" && @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.id != \"\" && @request.auth.role = \"admin\"",
  })

  collection.fields.add(new Field({ name: "name", type: "text", required: true, max: 150 }))
  collection.fields.add(new Field({ name: "slug", type: "text", required: true, max: 150 }))
  // Free-text tag per ТЗ (e.g. "n8n", "CRM", "Python") — not a relation
  // to categories, since §11.3 lists it as a plain field.
  collection.fields.add(new Field({ name: "category", type: "text", max: 150 }))
  collection.fields.add(new Field({
    name: "icon",
    type: "file",
    maxSelect: 1,
    maxSize: 1048576,
    mimeTypes: ["image/svg+xml", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({
    name: "status",
    type: "select",
    required: true,
    values: ["active", "inactive"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("skills")
  return app.delete(collection)
})
