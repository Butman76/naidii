/// <reference path="../pb_data/types.d.ts" />

// TEMPORARY: the intended rules here traverse into a related record
// (e.g. specialist_profile_id.user_id) to check profile ownership, but
// that syntax is failing PocketBase's rule validator with "failed to
// resolve field" even against already-committed tables — still being
// diagnosed live against a running instance. For now this sets safe,
// non-traversal rules so the app can actually start; ownership checks on
// write actions are admin-only in the meantime (stricter, not looser,
// than the final intent). Ownership ENFORCEMENT for specialists managing
// their own services/cases/etc. will need to move to the Next.js API
// layer until the rule syntax is confirmed and this file is updated.
migrate((app) => {
  const specialistSkills = app.findCollectionByNameOrId("specialist_skills")
  specialistSkills.updateRule = "@request.auth.role = \"admin\""
  specialistSkills.deleteRule = "@request.auth.role = \"admin\""
  app.save(specialistSkills)

  const services = app.findCollectionByNameOrId("services")
  services.listRule = "active = true"
  services.viewRule = "active = true"
  services.updateRule = "@request.auth.role = \"admin\""
  services.deleteRule = "@request.auth.role = \"admin\""
  app.save(services)

  const cases = app.findCollectionByNameOrId("cases")
  cases.listRule = "moderation_status = \"approved\""
  cases.viewRule = "moderation_status = \"approved\""
  cases.updateRule = "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  cases.deleteRule = "@request.auth.role = \"admin\""
  app.save(cases)

  const promotions = app.findCollectionByNameOrId("promotions")
  promotions.listRule = "status = \"active\""
  promotions.viewRule = "status = \"active\""
  app.save(promotions)

  const leads = app.findCollectionByNameOrId("leads")
  leads.listRule = "@request.auth.role = \"admin\""
  leads.viewRule = "@request.auth.role = \"admin\""
  leads.updateRule = "@request.auth.role = \"admin\""
  app.save(leads)

  const reviews = app.findCollectionByNameOrId("reviews")
  reviews.listRule = "status = \"approved\""
  reviews.viewRule = "status = \"approved\""
  return app.save(reviews)
}, (app) => {
  const names = ["specialist_skills", "services", "cases", "promotions", "leads", "reviews"]
  for (const name of names) {
    const collection = app.findCollectionByNameOrId(name)
    collection.listRule = null
    collection.viewRule = null
    collection.updateRule = null
    collection.deleteRule = null
    app.save(collection)
  }
})
