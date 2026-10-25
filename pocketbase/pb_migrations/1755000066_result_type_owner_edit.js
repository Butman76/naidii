/// <reference path="../pb_data/types.d.ts" />

// 2026-10-17: исполнитель сам правит и удаляет своё предложение собственного
// типа результата, пока тип не одобрен.
//
// Раньше (1755000021) автор мог только отозвать тип в статусе "pending", а
// после отклонения тип навсегда оставался в кабинете как «Тип отклонён»
// без возможности что-либо сделать (у Vision Techno Labs висела
// отклонённая услуга «Тест»). Теперь:
//   - updateRule: автор может менять свой тип, пока он "pending" или
//     "rejected", и только возвращать его в "pending" (повторная отправка на
//     модерацию). Поля created_by, slug и moderation_note — только admin/
//     moderator, поэтому в теле запроса автора их быть не может.
//   - deleteRule: автор удаляет свой тип в "pending" и "rejected".
//     Одобренный тип удалить может только admin — на нём могут висеть
//     предложения других исполнителей.
//   - moderation_note — причина отказа, которую пишет модератор; её видит
//     автор в кабинете (listRule/viewRule для автора уже есть).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("result_types")

  collection.fields.add(new Field({ name: "moderation_note", type: "text", required: false, max: 500 }))

  collection.updateRule =
    "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\" || (" +
    "created_by = @request.auth.id && (status = \"pending\" || status = \"rejected\") && " +
    "@request.body.status = \"pending\" && " +
    "@request.body.created_by:isset = false && @request.body.slug:isset = false && @request.body.moderation_note:isset = false)"
  collection.deleteRule =
    "@request.auth.role = \"admin\" || (created_by = @request.auth.id && (status = \"pending\" || status = \"rejected\"))"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("result_types")
  collection.fields.removeByName("moderation_note")
  collection.updateRule = "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  collection.deleteRule = "@request.auth.role = \"admin\" || (created_by = @request.auth.id && status = \"pending\")"
  return app.save(collection)
})
