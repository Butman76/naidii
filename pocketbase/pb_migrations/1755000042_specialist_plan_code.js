/// <reference path="../pb_data/types.d.ts" />

// Тариф специалиста (web/src/data/plans.ts: basic/pro/enterprise) — раньше
// был только витриной на /tariffs, ни с одним реальным специалистом не
// связан ("customLanding" премиум-лендинг был всегда выключен, см.
// specialists.ts). Админ теперь проставляет тариф вручную (нет онлайн-
// оплаты — см. STATUS.md), значение читают specialists.ts (включает
// премиум-лендинг на enterprise) и кабинет специалиста (вкладка "Тариф").
// Без default: отсутствие значения читается кодом как "basic".
migrate((app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")
  collection.fields.add(new Field({
    name: "plan_code",
    type: "select",
    required: false,
    values: ["basic", "pro", "enterprise"],
    maxSelect: 1,
  }))
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")
  collection.fields.removeByName("plan_code")
  return app.save(collection)
})
