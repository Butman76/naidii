/// <reference path="../pb_data/types.d.ts" />

// Полный жизненный цикл сделки (2026-08-29, по запросу пользователя):
// proposed -> confirmed (оба подтвердили, попадает в "Заказы") ->
// delivered (исполнитель нажал "Услуга оказана") -> либо archived
// (заказчик принял, "Архив заказов"), либо needs_revision (заказчик просит
// доработку, возврат в чат, исполнитель снова жмёт "Услуга оказана" и
// цикл повторяется) -> на любом активном этапе возможен disputed (жалоба
// модераторам, письмо на claim@naidii.ru через pb_hooks/dispute.pb.js).
//
// "Срок" был свободным текстом ("2 недели") — теперь нужно считать "сколько
// осталось дней" в карточке заказа, для этого нужна настоящая дата, а не
// текст. Заменяю deadline на due_date. Данных в проде по этой коллекции
// ещё нет (фича только вчера выложена), так что просто убираю старое поле.
migrate((app) => {
  const deals = app.findCollectionByNameOrId("deals")
  const users = app.findCollectionByNameOrId("users")

  deals.fields.removeByName("deadline")
  deals.fields.add(new Field({ name: "due_date", type: "date", required: true }))
  deals.fields.add(new Field({ name: "confirmed_at", type: "date" }))
  deals.fields.add(new Field({ name: "delivered_at", type: "date" }))
  deals.fields.add(new Field({
    name: "disputed_by",
    type: "relation",
    required: false,
    collectionId: users.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))

  const status = deals.fields.getByName("status")
  status.values = ["proposed", "confirmed", "delivered", "needs_revision", "archived", "declined", "disputed"]

  // moderator теперь тоже видит и решает споры, не только admin — тот же
  // принцип, что и у остальной модерации (profiles/reviews/result_types):
  // moderator = контент и конфликты, admin = плюс управление аккаунтами.
  deals.listRule = "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  deals.viewRule = deals.listRule
  deals.updateRule = "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""

  app.save(deals)

  // lead_messages: модератор должен уметь читать переписку по спору и
  // писать в неё третьей стороной (см. описание выше) — раньше туда мог
  // писать только admin, и то нет (правило вообще не пускало модерацию на
  // create). Не ограничиваю право писать только спорными сделками —
  // PocketBase-правила не умеют смотреть в обратную сторону relation
  // (у lead_id нет обратной ссылки на deals), поэтому это остаётся
  // ответственностью того, куда ведёт сама админка (модератор попадает в
  // чужой чат только через раздел "Споры").
  const messages = app.findCollectionByNameOrId("lead_messages")
  messages.listRule = "lead_id.customer_id = @request.auth.id || lead_id.specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  messages.viewRule = messages.listRule
  messages.createRule = "@request.auth.id != \"\" && @request.body.sender_id = @request.auth.id && (@request.body.lead_id.customer_id = @request.auth.id || @request.body.lead_id.specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\")"

  return app.save(messages)
}, (app) => {
  const deals = app.findCollectionByNameOrId("deals")
  deals.fields.removeByName("due_date")
  deals.fields.removeByName("confirmed_at")
  deals.fields.removeByName("delivered_at")
  deals.fields.removeByName("disputed_by")
  deals.fields.add(new Field({ name: "deadline", type: "text", required: true, max: 200 }))
  const status = deals.fields.getByName("status")
  status.values = ["proposed", "confirmed", "declined"]
  deals.listRule = "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  deals.viewRule = deals.listRule
  deals.updateRule = "customer_id = @request.auth.id || specialist_profile_id.user_id = @request.auth.id"
  app.save(deals)

  const messages = app.findCollectionByNameOrId("lead_messages")
  messages.listRule = "lead_id.customer_id = @request.auth.id || lead_id.specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  messages.viewRule = messages.listRule
  messages.createRule = "@request.auth.id != \"\" && @request.body.sender_id = @request.auth.id && (@request.body.lead_id.customer_id = @request.auth.id || @request.body.lead_id.specialist_profile_id.user_id = @request.auth.id)"
  return app.save(messages)
})
