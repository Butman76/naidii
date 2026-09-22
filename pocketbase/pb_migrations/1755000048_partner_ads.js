/// <reference path="../pb_data/types.d.ts" />

// Бегущая лента рекламы сторонних контор (курсы по ИИ, агентства
// автоматизации) на главной и в каталогах — не связана с собственными
// специалистами площадки (см. promotions, тот — продвижение своих внутри
// топ-20). Пока без самообслуживания и онлайн-оплаты: баннеры добавляет
// вручную admin из /admin (см. PartnerAdsTab.tsx), рекламодатели
// договариваются напрямую. click_count считает переходы (см.
// api/ad-click/[id]/route.ts) — цифра для будущих переговоров о цене
// размещения, не платёжный механизм.
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "partner_ads",
    indexes: [
      "CREATE INDEX idx_partner_ads_active ON partner_ads (active)",
    ],
    listRule: "active = true || @request.auth.role = \"admin\"",
    viewRule: "active = true || @request.auth.role = \"admin\"",
    createRule: "@request.auth.role = \"admin\"",
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  collection.fields.add(new Field({ name: "company_name", type: "text", required: true, max: 150 }))
  collection.fields.add(new Field({
    name: "image",
    type: "file",
    required: true,
    maxSelect: 1,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({ name: "link_url", type: "url", required: true }))
  collection.fields.add(new Field({ name: "active", type: "bool" }))
  collection.fields.add(new Field({ name: "sort_order", type: "number", onlyInt: true }))
  collection.fields.add(new Field({ name: "click_count", type: "number", onlyInt: true, min: 0 }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("partner_ads")
  return app.delete(collection)
})
