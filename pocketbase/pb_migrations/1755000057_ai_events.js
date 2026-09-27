/// <reference path="../pb_data/types.d.ts" />

// Раздел «AI-события и форумы» (/events). Полностью отдельный модуль: две
// новые коллекции с префиксом ai_event*, существующие коллекции не
// читаются и не меняются.
//
// ai_events — публичная афиша. Публично читаются только опубликованные
// записи; здесь нет контактов организатора и служебных заметок (правило
// listRule открывает ВСЕ поля записи анонимному посетителю).
// ai_event_submissions — контакты организатора и комментарий модератора,
// доступна только админу. Создаётся вместе с событием из формы
// /events/add (api/events/submit, суперпользователь).
//
// Откат модуля: удалить обе коллекции (down ниже) и папку web/src/app/events.
// Старые данные это не затрагивает.
migrate((app) => {
  const categories = [
    "ai-agents", "rag", "orchestration", "chatbots", "voice-ai",
    "ai-video", "crm-ai", "prompt-engineering", "ai-analytics",
  ]
  const adminRule = "@request.auth.role = \"admin\""

  const events = new Collection({
    type: "base",
    name: "ai_events",
    indexes: [
      "CREATE UNIQUE INDEX idx_ai_events_slug ON ai_events (slug)",
      "CREATE INDEX idx_ai_events_status_start ON ai_events (status, start_date)",
    ],
    listRule: "status = \"published\" || " + adminRule,
    viewRule: "status = \"published\" || " + adminRule,
    createRule: adminRule,
    updateRule: adminRule,
    deleteRule: adminRule,
  })
  events.fields.add(new Field({ name: "title", type: "text", required: true, max: 200 }))
  events.fields.add(new Field({ name: "slug", type: "text", required: true, max: 120 }))
  events.fields.add(new Field({ name: "short_description", type: "text", required: true, max: 220 }))
  events.fields.add(new Field({ name: "description", type: "text", max: 8000 }))
  events.fields.add(new Field({
    name: "event_type", type: "select", required: true, maxSelect: 1,
    values: ["forum", "conference", "expo", "conference_expo", "meetup", "webinar", "hackathon", "masterclass", "workshop", "intensive", "roundtable", "demo_day", "award", "contest", "training"],
  }))
  events.fields.add(new Field({ name: "format", type: "select", required: true, maxSelect: 1, values: ["offline", "online", "hybrid"] }))
  events.fields.add(new Field({ name: "start_date", type: "date", required: true }))
  events.fields.add(new Field({ name: "end_date", type: "date" }))
  events.fields.add(new Field({ name: "time_note", type: "text", max: 80 }))
  events.fields.add(new Field({ name: "city", type: "text", max: 80 }))
  events.fields.add(new Field({ name: "venue", type: "text", max: 200 }))
  events.fields.add(new Field({ name: "address", type: "text", max: 300 }))
  events.fields.add(new Field({ name: "online_platform", type: "text", max: 100 }))
  events.fields.add(new Field({ name: "official_url", type: "url" }))
  events.fields.add(new Field({ name: "registration_url", type: "url" }))
  events.fields.add(new Field({ name: "program_url", type: "url" }))
  events.fields.add(new Field({ name: "price_type", type: "select", maxSelect: 1, values: ["free", "paid", "on_request"] }))
  events.fields.add(new Field({ name: "price_from", type: "number", onlyInt: true, min: 0 }))
  events.fields.add(new Field({ name: "promo_code", type: "text", max: 60 }))
  events.fields.add(new Field({ name: "organizer", type: "text", max: 150 }))
  events.fields.add(new Field({ name: "categories", type: "select", maxSelect: categories.length, values: categories }))
  events.fields.add(new Field({ name: "speakers_wanted", type: "bool" }))
  events.fields.add(new Field({ name: "exhibitors_wanted", type: "bool" }))
  events.fields.add(new Field({
    name: "status", type: "select", required: true, maxSelect: 1,
    values: ["draft", "pending", "published", "rejected", "archived"],
  }))
  // basic — обычная карточка; featured — «Рекомендуем»; partner — партнёрское;
  // pinned — закреплено вверху. Пока назначается вручную, без оплаты.
  events.fields.add(new Field({ name: "placement", type: "select", maxSelect: 1, values: ["basic", "featured", "partner", "pinned"] }))
  // Откуда взяты данные и когда проверены (для админа и для подписи на странице).
  events.fields.add(new Field({ name: "source_note", type: "text", max: 500 }))
  events.fields.add(new Field({ name: "reg_clicks", type: "number", onlyInt: true, min: 0 }))
  events.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  events.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))
  app.save(events)

  const submissions = new Collection({
    type: "base",
    name: "ai_event_submissions",
    listRule: adminRule,
    viewRule: adminRule,
    createRule: adminRule,
    updateRule: adminRule,
    deleteRule: adminRule,
  })
  submissions.fields.add(new Field({
    name: "event", type: "relation", required: true, collectionId: events.id,
    cascadeDelete: true, minSelect: 1, maxSelect: 1,
  }))
  submissions.fields.add(new Field({ name: "organizer_email", type: "email", required: true }))
  submissions.fields.add(new Field({ name: "contact_name", type: "text", required: true, max: 100 }))
  submissions.fields.add(new Field({ name: "contact_phone", type: "text", max: 40 }))
  submissions.fields.add(new Field({ name: "organizer_note", type: "text", max: 2000 }))
  submissions.fields.add(new Field({ name: "admin_comment", type: "text", max: 1000 }))
  submissions.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  submissions.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))
  app.save(submissions)
}, (app) => {
  for (const name of ["ai_event_submissions", "ai_events"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name))
    } catch (err) {
      // уже удалена
    }
  }
})
