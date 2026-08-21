/// <reference path="../pb_data/types.d.ts" />

// Not explicitly listed in ТЗ §11, but required by §6.2 (category catalog)
// and §13.1 (each /category/{slug} page needs its own title/description/H1/
// FAQ content, editable without touching code per §15).
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "categories",
    indexes: [
      "CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)",
    ],
    listRule: "active = true",
    viewRule: "active = true",
    createRule: "@request.auth.id != \"\" && @request.auth.role = \"admin\"",
    updateRule: "@request.auth.id != \"\" && @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.id != \"\" && @request.auth.role = \"admin\"",
  })

  // Fields are added one by one via collection.fields.add() rather than
  // passed as a "fields" array in the Collection constructor - the latter
  // silently fails to persist them in this PocketBase version (it passes
  // rule validation against the in-memory object but the columns never
  // actually get written to the collection's schema in the database).
  collection.fields.add(new Field({ name: "name", type: "text", required: true, max: 150 }))
  collection.fields.add(new Field({ name: "slug", type: "text", required: true, max: 150 }))
  collection.fields.add(new Field({ name: "seo_title", type: "text", max: 200 }))
  collection.fields.add(new Field({ name: "seo_description", type: "text", max: 500 }))
  collection.fields.add(new Field({ name: "h1", type: "text", max: 200 }))
  collection.fields.add(new Field({ name: "description", type: "editor" }))
  collection.fields.add(new Field({ name: "faq", type: "json", maxSize: 200000 }))
  collection.fields.add(new Field({
    name: "icon",
    type: "file",
    maxSelect: 1,
    maxSize: 2097152,
    mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"],
  }))
  collection.fields.add(new Field({ name: "sort_order", type: "number", onlyInt: true }))
  collection.fields.add(new Field({ name: "active", type: "bool" }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("categories")
  return app.delete(collection)
})
