/// <reference path="../pb_data/types.d.ts" />

// Закрытая база потенциальных исполнителей (вкладка "База исполнителей" в
// /admin): конторы, найденные в интернете, которых мы приглашаем на
// площадку. Ни с чем не связана — не users и не specialist_profiles, пока
// просто картотека: контакты, реквизиты, примечание и статус "работаем /
// не работаем". Позже её можно пополнять автоматически (checked_at — когда
// данные в последний раз сверялись с сайтом).
//
// Все правила — только admin (не moderator): внутри контакты и реквизиты
// сторонних компаний и ИП, это не для модерации. В репозиторий сами данные
// не попадают: их загружает admin через импорт CSV прямо в панели.
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "prospects",
    indexes: [
      "CREATE UNIQUE INDEX idx_prospects_domain ON prospects (domain)",
      "CREATE INDEX idx_prospects_direction ON prospects (direction)",
      "CREATE INDEX idx_prospects_status ON prospects (status)",
    ],
    listRule: "@request.auth.role = \"admin\"",
    viewRule: "@request.auth.role = \"admin\"",
    createRule: "@request.auth.role = \"admin\"",
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  // Домен без www и схемы, в нижнем регистре — по нему импорт понимает,
  // что контора уже есть в базе, и обновляет её, а не плодит дубль.
  collection.fields.add(new Field({ name: "domain", type: "text", required: true, max: 200 }))
  collection.fields.add(new Field({ name: "name", type: "text", required: true, max: 200 }))
  // Слаг направления сайта (ai-agents, rag, ...), а не название — так проще
  // фильтровать, названия берутся из web/src/data/categories.ts.
  collection.fields.add(new Field({ name: "direction", type: "text", max: 60 }))
  collection.fields.add(new Field({ name: "website", type: "text", max: 300 }))
  collection.fields.add(new Field({ name: "company_type", type: "text", max: 100 }))
  collection.fields.add(new Field({ name: "city", type: "text", max: 200 }))
  collection.fields.add(new Field({ name: "legal_name", type: "text", max: 300 }))
  collection.fields.add(new Field({ name: "inn", type: "text", max: 20 }))
  collection.fields.add(new Field({ name: "ogrn", type: "text", max: 20 }))
  collection.fields.add(new Field({ name: "address", type: "text", max: 500 }))
  collection.fields.add(new Field({ name: "director", type: "text", max: 300 }))
  // Несколько значений через "; " — отдельные таблицы под это не нужны.
  collection.fields.add(new Field({ name: "phones", type: "text", max: 500 }))
  collection.fields.add(new Field({ name: "emails", type: "text", max: 500 }))
  collection.fields.add(new Field({ name: "telegram", type: "text", max: 300 }))
  collection.fields.add(new Field({ name: "services", type: "text", max: 1000 }))
  collection.fields.add(new Field({ name: "price_note", type: "text", max: 300 }))
  collection.fields.add(new Field({ name: "case_url", type: "text", max: 500 }))
  // высокая / средняя / низкая — оценка, насколько данным можно верить.
  collection.fields.add(new Field({ name: "confidence", type: "text", max: 30 }))
  // Автоматические пометки при сборе данных (откуда что взято, где данные
  // расходятся) — перезаписываются при обновлении данных.
  collection.fields.add(new Field({ name: "data_notes", type: "text", max: 5000 }))
  collection.fields.add(new Field({
    name: "status",
    type: "select",
    required: true,
    values: ["new", "contacted", "replied", "working", "not_working"],
    maxSelect: 1,
  }))
  // Ручное примечание админа — импорт его не трогает.
  collection.fields.add(new Field({ name: "notes", type: "text", max: 5000 }))
  collection.fields.add(new Field({ name: "last_contacted_at", type: "date" }))
  collection.fields.add(new Field({ name: "checked_at", type: "date" }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("prospects")
  return app.delete(collection)
})
