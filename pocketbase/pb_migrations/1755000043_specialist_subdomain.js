/// <reference path="../pb_data/types.d.ts" />

// Персональный поддомен специалиста (например, visiontechnolabs.naidii.ru
// вместо naidii.ru/specialist/{slug}) — назначает только admin вручную,
// см. AdminPanel.tsx вкладка "Тарифы". Уникальный индекс — два специалиста
// не могут занять один и тот же поддомен. Значение читает
// web/src/middleware.ts, чтобы решить, чей профиль отдать по имени хоста.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")
  collection.fields.add(new Field({
    name: "subdomain",
    type: "text",
    required: false,
    max: 63,
  }))
  collection.indexes.push(
    "CREATE UNIQUE INDEX idx_specialist_profiles_subdomain ON specialist_profiles (subdomain) WHERE subdomain != ''"
  )
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")
  collection.indexes = collection.indexes.filter(
    (idx) => !idx.includes("idx_specialist_profiles_subdomain")
  )
  collection.fields.removeByName("subdomain")
  return app.save(collection)
})
