/// <reference path="../pb_data/types.d.ts" />

// PocketBase can't validate a rule that joins into a related record
// (e.g. specialist_profile_id.user_id) against a collection whose own
// table doesn't exist yet — and the whole body of a single migrate()
// call runs in one transaction, so an intermediate app.save() within the
// same file that created the collection isn't enough either. This file
// runs afterwards, once every collection below is already committed, and
// fills in the rules that were deliberately left unset (defaulting to
// PocketBase's "superuser only" null) in their creation migrations.
migrate((app) => {
  const specialistSkills = app.findCollectionByNameOrId("specialist_skills")
  specialistSkills.updateRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  specialistSkills.deleteRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  app.save(specialistSkills)

  const services = app.findCollectionByNameOrId("services")
  services.listRule = "active = true && specialist_profile_id.profile_status = \"published\" || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  services.viewRule = "active = true && specialist_profile_id.profile_status = \"published\" || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  services.updateRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  services.deleteRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  app.save(services)

  const cases = app.findCollectionByNameOrId("cases")
  cases.listRule = "moderation_status = \"approved\" || specialist_profile_id.user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")"
  cases.viewRule = "moderation_status = \"approved\" || specialist_profile_id.user_id = @request.auth.id || (@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")"
  cases.updateRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  cases.deleteRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  app.save(cases)

  const promotions = app.findCollectionByNameOrId("promotions")
  promotions.listRule = "status = \"active\" || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  promotions.viewRule = "status = \"active\" || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  app.save(promotions)

  const leads = app.findCollectionByNameOrId("leads")
  leads.listRule = "specialist_profile_id.user_id = @request.auth.id || customer_id = @request.auth.id || @request.auth.role = \"admin\""
  leads.viewRule = "specialist_profile_id.user_id = @request.auth.id || customer_id = @request.auth.id || @request.auth.role = \"admin\""
  leads.updateRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  app.save(leads)

  const reviews = app.findCollectionByNameOrId("reviews")
  reviews.listRule = "status = \"approved\" || customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  reviews.viewRule = "status = \"approved\" || customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  return app.save(reviews)
}, (app) => {
  // Rolling back just restores the restrictive superuser-only defaults;
  // the collections themselves are removed by their own migrations.
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
