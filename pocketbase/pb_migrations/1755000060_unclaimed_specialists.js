/// <reference path="../pb_data/types.d.ts" />

// Неподтверждённые карточки исполнителей ("claim your business", как в
// 2ГИС/Zoon) — компании, которых мы сами нашли и добавили по открытым
// данным (см. STATUS.md, из базы prospects), а не зарегистрировали сами.
// Полностью отдельно от specialist_profiles: там user_id обязателен (см.
// 1755000004) — у этих карточек владельца ещё нет и может не появиться
// никогда, подделывать учётку под них не будем. Только ООО (юрлица — не
// персональные данные) с высокой достоверностью данных; ИП/самозанятые
// сюда сознательно не идут, см. обсуждение в STATUS.md 2026-09-28.
//
// unclaimed_specialists — публичная (только активные), заполняет только
// админ (сид-миграцией и вручную).
// unclaimed_claims — обратная связь по карточке ("это моя компания" или
// "уберите"): контакты видит только админ, создаётся через
// api/unclaimed/claim (суперпользователь), как ai_event_submissions.
migrate((app) => {
  const categories = [
    "ai-agents", "rag", "orchestration", "chatbots", "voice-ai",
    "ai-video", "crm-ai", "prompt-engineering", "ai-analytics", "other",
  ]
  const adminRule = "@request.auth.role = \"admin\""

  const listings = new Collection({
    type: "base",
    name: "unclaimed_specialists",
    indexes: [
      "CREATE UNIQUE INDEX idx_unclaimed_specialists_domain ON unclaimed_specialists (domain)",
    ],
    listRule: "status = \"active\" || " + adminRule,
    viewRule: "status = \"active\" || " + adminRule,
    createRule: adminRule,
    updateRule: adminRule,
    deleteRule: adminRule,
  })
  listings.fields.add(new Field({ name: "name", type: "text", required: true, max: 150 }))
  listings.fields.add(new Field({ name: "domain", type: "text", required: true, max: 150 }))
  listings.fields.add(new Field({ name: "website", type: "url" }))
  listings.fields.add(new Field({ name: "legal_name", type: "text", max: 200 }))
  listings.fields.add(new Field({ name: "inn", type: "text", max: 20 }))
  listings.fields.add(new Field({ name: "city", type: "text", max: 150 }))
  listings.fields.add(new Field({ name: "blurb", type: "text", max: 300 }))
  listings.fields.add(new Field({ name: "categories", type: "select", maxSelect: categories.length, values: categories }))
  // Приватные — не отдаём публично (viewRule открывает всю запись только
  // статусом active, а не по полям), контакты нужны только админу, чтобы
  // проверить владельца при заявке "это моя компания".
  listings.fields.add(new Field({ name: "source_email", type: "text", max: 200 }))
  listings.fields.add(new Field({ name: "source_phone", type: "text", max: 60 }))
  listings.fields.add(new Field({
    name: "status", type: "select", required: true, maxSelect: 1,
    values: ["active", "claimed", "removed"],
  }))
  listings.fields.add(new Field({ name: "admin_note", type: "text", max: 1000 }))
  listings.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  listings.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))
  app.save(listings)

  const claims = new Collection({
    type: "base",
    name: "unclaimed_claims",
    listRule: adminRule,
    viewRule: adminRule,
    createRule: adminRule,
    updateRule: adminRule,
    deleteRule: adminRule,
  })
  claims.fields.add(new Field({
    name: "listing", type: "relation", required: true, collectionId: listings.id,
    cascadeDelete: true, minSelect: 1, maxSelect: 1,
  }))
  claims.fields.add(new Field({
    name: "kind", type: "select", required: true, maxSelect: 1,
    values: ["claim", "remove"],
  }))
  claims.fields.add(new Field({ name: "contact_name", type: "text", required: true, max: 100 }))
  claims.fields.add(new Field({ name: "contact_email", type: "email", required: true }))
  claims.fields.add(new Field({ name: "contact_phone", type: "text", max: 40 }))
  claims.fields.add(new Field({ name: "message", type: "text", max: 2000 }))
  claims.fields.add(new Field({ name: "admin_comment", type: "text", max: 1000 }))
  claims.fields.add(new Field({
    name: "status", type: "select", required: true, maxSelect: 1,
    values: ["new", "handled"],
  }))
  claims.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  claims.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))
  app.save(claims)
}, (app) => {
  for (const name of ["unclaimed_claims", "unclaimed_specialists"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name))
    } catch (err) {
      // уже удалена
    }
  }
})
