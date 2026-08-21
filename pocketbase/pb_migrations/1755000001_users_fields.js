/// <reference path="../pb_data/types.d.ts" />

// Extends the built-in "users" auth collection with the custom fields
// required by ТЗ §11.1. Idempotent: only adds a field if it isn't there yet,
// so this migration is safe to re-run against a collection that already has
// some of these fields (e.g. "name"/"avatar" ship by default on some
// PocketBase versions).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  const wanted = [
    new Field({
      name: "role",
      type: "select",
      required: true,
      values: ["customer", "specialist", "moderator", "admin"],
      maxSelect: 1,
    }),
    new Field({ name: "name", type: "text", required: false, max: 150 }),
    new Field({ name: "phone", type: "text", required: false, max: 32 }),
    new Field({ name: "telegram", type: "text", required: false, max: 64 }),
    new Field({
      name: "avatar",
      type: "file",
      required: false,
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      thumbs: ["100x100", "300x300"],
    }),
    new Field({ name: "is_verified", type: "bool" }),
    new Field({ name: "founder_status", type: "bool" }),
    new Field({
      name: "founder_discount_percent",
      type: "number",
      min: 0,
      max: 100,
      onlyInt: true,
    }),
    new Field({
      name: "status",
      type: "select",
      required: true,
      values: ["active", "pending", "blocked"],
      maxSelect: 1,
    }),
    new Field({ name: "last_login_at", type: "date" }),
  ]

  for (const field of wanted) {
    if (!collection.fields.getByName(field.name)) {
      collection.fields.add(field)
    }
  }

  // Default new registrations to "customer" and "active" so the select
  // fields are never left empty for existing/legacy rows.
  const role = collection.fields.getByName("role")
  if (role) role.values = ["customer", "specialist", "moderator", "admin"]

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")
  const names = [
    "role", "phone", "telegram", "is_verified", "founder_status",
    "founder_discount_percent", "status", "last_login_at",
  ]
  for (const name of names) {
    collection.fields.removeByName(name)
  }
  return app.save(collection)
})
