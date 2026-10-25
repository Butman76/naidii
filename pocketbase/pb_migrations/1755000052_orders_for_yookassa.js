/// <reference path="../pb_data/types.d.ts" />

// Подготовка orders к реальной оплате через ЮKassa (см.
// web/src/lib/payments.ts и api/payments/*):
//  - plan_code: за какой тариф платят (на фронте тарифы живут в
//    web/src/data/plans.ts, а не в коллекции plans, поэтому plan_id
//    остаётся пустым);
//  - createRule = null: раньше правило "@request.body.user_id =
//    @request.auth.id" позволяло любому вошедшему создать заказ со ЛЮБЫМИ
//    полями, включая status = "paid" и total_amount = 0. Теперь заказы
//    создаёт только сервер (суперпользователь) — покупатель может лишь
//    читать свои (listRule/viewRule не менялись);
//  - индекс по external_payment_id — по нему вебхук находит заказ.
migrate((app) => {
  const orders = app.findCollectionByNameOrId("orders")
  orders.fields.add(new Field({ name: "plan_code", type: "text", max: 50 }))
  orders.createRule = null
  orders.indexes = (orders.indexes || []).concat([
    "CREATE INDEX idx_orders_external_payment ON orders (external_payment_id)",
  ])
  return app.save(orders)
}, (app) => {
  const orders = app.findCollectionByNameOrId("orders")
  orders.fields.removeByName("plan_code")
  orders.createRule = "@request.body.user_id = @request.auth.id"
  orders.indexes = (orders.indexes || []).filter((i) => i.indexOf("idx_orders_external_payment") === -1)
  return app.save(orders)
})
