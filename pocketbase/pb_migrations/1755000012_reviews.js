/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.11
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const users = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "reviews",
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
      new Field({
        name: "customer_id",
        type: "relation",
        required: true,
        collectionId: users.id,
        cascadeDelete: false,
        minSelect: 1,
        maxSelect: 1,
      }),
      new Field({ name: "rating", type: "number", required: true, min: 1, max: 5, onlyInt: true }),
      new Field({ name: "text", type: "text", max: 2000 }),
      new Field({
        name: "status",
        type: "select",
        required: true,
        values: ["pending", "approved", "rejected"],
        maxSelect: 1,
      }),
      new Field({ name: "verified", type: "bool" }),
      new Field({ name: "published_at", type: "date" }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
      new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }),
    ],
    indexes: [
      "CREATE INDEX idx_reviews_profile ON reviews (specialist_profile_id)",
    ],
  })

  // saved once first so the table exists before rules that traverse into
  // specialist_profile_id.* are validated.
  app.save(collection)

  collection.listRule = "status = \"approved\" || customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  collection.viewRule = "status = \"approved\" || customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  collection.createRule = "@request.auth.id != \"\" && @request.body.customer_id = @request.auth.id"
  collection.updateRule = "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  collection.deleteRule = "@request.auth.role = \"admin\""

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("reviews")
  return app.delete(collection)
})
