/// <reference path="../pb_data/types.d.ts" />

// prospects.directions: десятая группа "education" (обучение AI и автоматизации:
// школы, практикумы, корпоративные провайдеры). Это не категория каталога
// исполнителей, а рекламодатели и источник выпускников, поэтому слаг есть
// только в базе контрагентов.
const BASE = [
  "ai-agents", "rag", "orchestration", "chatbots", "voice-ai",
  "ai-video", "crm-ai", "prompt-engineering", "ai-analytics", "other",
]

migrate((app) => {
  const collection = app.findCollectionByNameOrId("prospects")
  const field = collection.fields.getByName("directions")
  const values = BASE.slice(0, 9).concat(["education", "other"])
  field.values = values
  field.maxSelect = values.length
  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("prospects")
  const field = collection.fields.getByName("directions")
  field.values = BASE
  field.maxSelect = BASE.length
  app.save(collection)
})
