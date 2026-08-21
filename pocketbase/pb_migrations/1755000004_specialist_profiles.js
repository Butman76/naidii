/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.2
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "specialist_profiles",
    fields: [
      new Field({
        name: "user_id",
        type: "relation",
        required: true,
        collectionId: users.id,
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      }),
      new Field({
        name: "profile_type",
        type: "select",
        required: true,
        values: ["individual", "ip", "self_employed", "studio"],
        maxSelect: 1,
      }),
      new Field({ name: "public_name", type: "text", required: true, max: 150 }),
      new Field({ name: "slug", type: "text", required: true, max: 150 }),
      new Field({ name: "title", type: "text", max: 200 }),
      new Field({ name: "short_description", type: "text", max: 300 }),
      new Field({ name: "full_description", type: "editor" }),
      new Field({ name: "city", type: "text", max: 150 }),
      new Field({ name: "remote_work", type: "bool" }),
      new Field({ name: "experience_years", type: "number", min: 0, max: 60, onlyInt: true }),
      new Field({ name: "hourly_rate_from", type: "number", min: 0 }),
      new Field({ name: "project_rate_from", type: "number", min: 0 }),
      new Field({
        name: "response_time",
        type: "select",
        values: ["within_hour", "within_day", "within_3days", "within_week"],
        maxSelect: 1,
      }),
      new Field({
        name: "profile_status",
        type: "select",
        required: true,
        values: ["draft", "pending", "published", "needs_revision", "hidden", "blocked"],
        maxSelect: 1,
      }),
      new Field({ name: "verified_status", type: "bool" }),
      new Field({ name: "rating", type: "number", min: 0, max: 5 }),
      new Field({ name: "reviews_count", type: "number", min: 0, onlyInt: true }),
      new Field({ name: "views_count", type: "number", min: 0, onlyInt: true }),
      new Field({ name: "leads_count", type: "number", min: 0, onlyInt: true }),
      new Field({ name: "active_until", type: "date" }),
      new Field({ name: "created", type: "autodate", onCreate: true }),
      new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }),
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_specialist_profiles_slug ON specialist_profiles (slug)",
      "CREATE INDEX idx_specialist_profiles_user ON specialist_profiles (user_id)",
      "CREATE INDEX idx_specialist_profiles_status ON specialist_profiles (profile_status)",
    ],
    // Public catalog only ever sees published profiles; the owner can see
    // their own regardless of status; admin/moderator see everything so
    // moderation queues work.
    listRule: "profile_status = \"published\" || user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")",
    viewRule: "profile_status = \"published\" || user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")",
    createRule: "@request.auth.id != \"\" && @request.auth.role = \"specialist\" && user_id = @request.auth.id",
    // Owner can edit their own content, but moderators/admins are the ones
    // who flip profile_status (approve/reject/hide) — enforced at the
    // application layer since PB rules can't restrict individual fields.
    updateRule: "user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")
  return app.delete(collection)
})
