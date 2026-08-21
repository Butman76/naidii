/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.7 / §8.4 — guests must be able to submit a request without an
// account (§7.1), so createRule is public.
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const users = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "leads",
    fields: [
      new Field({
        name: "specialist_profile_id",
        type: "relation",
        required: true,
        collectionId: profiles.id,
        cascadeDelete: false,
        minSelect: 1,
        maxSelect: 1,
      }),
      new Field({
        name: "customer_id",
        type: "relation",
        collectionId: users.id,
        maxSelect: 1,
      }),
      new Field({ name: "customer_name", type: "text", required: true, max: 150 }),
      new Field({ name: "customer_phone", type: "text", max: 32 }),
      new Field({ name: "customer_email", type: "email" }),
      new Field({ name: "customer_telegram", type: "text", max: 64 }),
      new Field({ name: "request_text", type: "text", required: true, max: 3000 }),
      new Field({ name: "budget", type: "text", max: 100 }),
      new Field({ name: "deadline", type: "text", max: 100 }),
      new Field({ name: "industry", type: "text", max: 150 }),
      new Field({ name: "source", type: "text", max: 100 }),
      new Field({
        name: "status",
        type: "select",
        required: true,
        values: ["new", "transferred", "in_progress", "responded", "deal", "closed", "spam"],
        maxSelect: 1,
      }),
      new Field({ name: "first_response_at", type: "date" }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
      new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }),
    ],
    indexes: [
      "CREATE INDEX idx_leads_profile ON leads (specialist_profile_id)",
      "CREATE INDEX idx_leads_status ON leads (status)",
    ],
    listRule: "specialist_profile_id.user_id = @request.auth.id || customer_id = @request.auth.id || @request.auth.role = \"admin\"",
    viewRule: "specialist_profile_id.user_id = @request.auth.id || customer_id = @request.auth.id || @request.auth.role = \"admin\"",
    createRule: "",
    updateRule: "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("leads")
  return app.delete(collection)
})
