/// <reference path="../pb_data/types.d.ts" />

// prospects.directions — в каких из направлений площадки работает контора
// (несколько сразу: студия может делать и AI-агентов, и оркестрацию). Раньше
// было одно поле direction — теперь оно остаётся как "направление из
// исходного списка, где нашли", а рабочим становится directions. Значения —
// слаги из web/src/data/categories.ts (девять направлений + "other").
// Существующие записи заполняются из direction, чтобы после миграции
// фильтр по направлению не опустел.
migrate((app) => {
  const values = [
    "ai-agents", "rag", "orchestration", "chatbots", "voice-ai",
    "ai-video", "crm-ai", "prompt-engineering", "ai-analytics", "other",
  ]
  const collection = app.findCollectionByNameOrId("prospects")
  collection.fields.add(new Field({ name: "directions", type: "select", values: values, maxSelect: values.length }))
  // Правил ли направления вручную. Пока false — повторный импорт CSV может
  // обновить направления (они автоматические); после правки галочками в
  // админке становится true, и импорт их больше не трогает.
  collection.fields.add(new Field({ name: "directions_manual", type: "bool" }))
  app.save(collection)

  const records = app.findAllRecords("prospects")
  for (const record of records) {
    const direction = record.getString("direction")
    if (values.indexOf(direction) !== -1) {
      record.set("directions", [direction])
      app.saveNoValidate(record)
    }
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("prospects")
  collection.fields.removeByName("directions")
  collection.fields.removeByName("directions_manual")
  return app.save(collection)
})
