/// <reference path="../pb_data/types.d.ts" />

// Пересмотр решения из 1755000011_leads.js: гостевые заявки (createRule:
// "") были осознанным выбором по ТЗ §7.1, но пользователь явно попросил
// (2026-08-27, стратегия "заказчик заказывает услугу"): никакого
// взаимодействия без регистрации ОБЕИХ сторон, без исключений. Теперь
// заявку может создать только вошедший пользователь с ролью "customer", и
// только от своего имени (customer_id обязан совпадать с самим собой) —
// иначе заказчик мог бы прислать заявку от чужого имени.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads")
  collection.createRule = "@request.auth.id != \"\" && @request.auth.role = \"customer\" && @request.body.customer_id = @request.auth.id"
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("leads")
  collection.createRule = ""
  return app.save(collection)
})
