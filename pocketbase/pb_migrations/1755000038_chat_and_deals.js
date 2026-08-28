/// <reference path="../pb_data/types.d.ts" />

// Фаза B стратегии "заказчик заказывает услугу" (STATUS.md 2026-08-27) —
// настоящая переписка вместо разовой заявки, плюс новая сущность "сделка"
// (2026-08-29, по прямому запросу пользователя): когда оба участника чата
// нажимают "Заключить сделку", договорённость (результат/цена/срок)
// фиксируется отдельной записью.
migrate((app) => {
  const leads = app.findCollectionByNameOrId("leads")
  const users = app.findCollectionByNameOrId("users")
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  // --- lead_messages: переписка внутри одной заявки ---
  const messages = new Collection({
    type: "base",
    name: "lead_messages",
    indexes: [
      "CREATE INDEX idx_lead_messages_lead ON lead_messages (lead_id)",
    ],
    listRule: "lead_id.customer_id = @request.auth.id || lead_id.specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    viewRule: "lead_id.customer_id = @request.auth.id || lead_id.specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    // Двойной прыжок через relation в @request.body (lead_id -> customer_id /
    // lead_id -> specialist_profile_id -> user_id) — тот же приём, что уже
    // работает в services.createRule (1755000006), только на один уровень
    // глубже.
    createRule: "@request.auth.id != \"\" && @request.body.sender_id = @request.auth.id && (@request.body.lead_id.customer_id = @request.auth.id || @request.body.lead_id.specialist_profile_id.user_id = @request.auth.id)",
    updateRule: null,
    deleteRule: "@request.auth.role = \"admin\"",
  })

  messages.fields.add(new Field({
    name: "lead_id",
    type: "relation",
    required: true,
    collectionId: leads.id,
    cascadeDelete: true,
    minSelect: 1,
    maxSelect: 1,
  }))
  messages.fields.add(new Field({
    name: "sender_id",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: false,
    minSelect: 1,
    maxSelect: 1,
  }))
  messages.fields.add(new Field({ name: "body", type: "text", required: true, max: 3000 }))
  messages.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))

  app.save(messages)

  // --- deals: договорённость, в которую превращается чат, когда обе
  // стороны подтвердили условия ---
  const deals = new Collection({
    type: "base",
    name: "deals",
    indexes: [
      "CREATE UNIQUE INDEX idx_deals_lead ON deals (lead_id)",
    ],
    listRule: "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    viewRule: "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\"",
    createRule: "@request.auth.id != \"\" && @request.body.proposed_by = @request.auth.id && (@request.body.customer_id = @request.auth.id || @request.body.specialist_profile_id.user_id = @request.auth.id)",
    // customer_confirmed/specialist_confirmed — какое именно поле участник
    // вправе менять (только своё), правилами PocketBase на уровне поля не
    // ограничить; это остаётся ответственностью фронтенда (тот же приём,
    // что уже применялся для specialist_profiles.profile_status).
    updateRule: "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  deals.fields.add(new Field({
    name: "lead_id",
    type: "relation",
    required: true,
    collectionId: leads.id,
    cascadeDelete: true,
    minSelect: 1,
    maxSelect: 1,
  }))
  deals.fields.add(new Field({
    name: "customer_id",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: false,
    minSelect: 1,
    maxSelect: 1,
  }))
  deals.fields.add(new Field({
    name: "specialist_profile_id",
    type: "relation",
    required: true,
    collectionId: profiles.id,
    cascadeDelete: false,
    minSelect: 1,
    maxSelect: 1,
  }))
  deals.fields.add(new Field({
    name: "proposed_by",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: false,
    minSelect: 1,
    maxSelect: 1,
  }))
  deals.fields.add(new Field({ name: "result_text", type: "text", required: true, max: 3000 }))
  deals.fields.add(new Field({ name: "price", type: "number", required: true, min: 0 }))
  deals.fields.add(new Field({ name: "deadline", type: "text", required: true, max: 200 }))
  deals.fields.add(new Field({ name: "customer_confirmed", type: "bool" }))
  deals.fields.add(new Field({ name: "specialist_confirmed", type: "bool" }))
  deals.fields.add(new Field({
    name: "status",
    type: "select",
    required: true,
    values: ["proposed", "confirmed", "declined"],
    maxSelect: 1,
  }))
  deals.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  deals.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(deals)
}, (app) => {
  const messages = app.findCollectionByNameOrId("lead_messages")
  app.delete(messages)
  const deals = app.findCollectionByNameOrId("deals")
  return app.delete(deals)
})
