/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.4 — junction table between specialist_profiles and skills.
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const skills = app.findCollectionByNameOrId("skills")

  const collection = new Collection({
    type: "base",
    name: "specialist_skills",
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
        name: "skill_id",
        type: "relation",
        required: true,
        collectionId: skills.id,
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      }),
      new Field({
        name: "level",
        type: "select",
        values: ["basic", "middle", "expert"],
        maxSelect: 1,
      }),
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_specialist_skills_pair ON specialist_skills (specialist_profile_id, skill_id)",
    ],
  })

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = "@request.body.specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  // updateRule/deleteRule traverse into the related specialist_profiles
  // record (specialist_profile_id.user_id); PocketBase can't validate that
  // join against a table that doesn't exist yet within the same migration
  // transaction, so those two are set later in
  // 1755000015_relation_traversal_rules.js once this table is committed.

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("specialist_skills")
  return app.delete(collection)
})
