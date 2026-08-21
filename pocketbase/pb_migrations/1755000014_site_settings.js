/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.13 — singleton settings record. PocketBase has no native
// "single record" collection type, so this is a regular base collection
// that the app must ensure only ever holds one row (seed migration below
// creates it; the admin UI should edit in place rather than create new).
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "site_settings",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = \"admin\"",
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: null,
  })

  collection.fields.add(new Field({ name: "project_name", type: "text", required: true, max: 150 }))
  collection.fields.add(new Field({
    name: "logo",
    type: "file",
    maxSelect: 1,
    maxSize: 2097152,
    mimeTypes: ["image/svg+xml", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({ name: "contact_email", type: "email" }))
  collection.fields.add(new Field({ name: "telegram", type: "text", max: 100 }))
  collection.fields.add(new Field({ name: "top_cards_limit", type: "number", required: true, min: 1, onlyInt: true }))
  collection.fields.add(new Field({
    name: "payment_mode",
    type: "select",
    required: true,
    values: ["manual", "auto"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "payment_provider",
    type: "select",
    required: true,
    values: ["manual", "alfa", "yookassa", "cloudpayments", "tbank", "vtb"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "manual_payment_details", type: "editor" }))
  collection.fields.add(new Field({ name: "terms_url", type: "url" }))
  collection.fields.add(new Field({ name: "privacy_url", type: "url" }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  app.save(collection)

  // Seed the single settings row so the frontend always has something to
  // read (top_cards_limit = 20 per §4.4/§15).
  const record = new Record(collection, {
    project_name: "НайдИИ",
    top_cards_limit: 20,
    payment_mode: "manual",
    payment_provider: "manual",
  })
  return app.save(record)
}, (app) => {
  const collection = app.findCollectionByNameOrId("site_settings")
  return app.delete(collection)
})
