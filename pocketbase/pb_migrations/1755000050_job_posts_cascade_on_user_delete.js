/// <reference path="../pb_data/types.d.ts" />

// Раньше job_posts.customer_id был required + cascadeDelete:false — из-за
// этого админ не мог удалить заказчика, у которого есть хоть одно
// объявление: PocketBase отвечал "Failed to delete record. Make sure that
// the record is not part of a required relation reference." (реальный
// случай 2026-09-23, тестовый заказчик «Марат»). Объявление без владельца
// не имеет смысла, поэтому при удалении заказчика оно удаляется вместе с
// ним. Связанные отклики (leads.job_post_id, не required) при этом просто
// теряют ссылку — сами лиды/чаты не удаляются.
//
// Сделки, заказы, отзывы и сообщения (deals/orders/reviews/lead_messages)
// СПЕЦИАЛЬНО остаются защищёнными: это история денег и переписки, которую
// видит вторая сторона, автоматически стирать её вместе с аккаунтом нельзя.
migrate((app) => {
  const jobPosts = app.findCollectionByNameOrId("job_posts")
  jobPosts.fields.getByName("customer_id").cascadeDelete = true
  return app.save(jobPosts)
}, (app) => {
  const jobPosts = app.findCollectionByNameOrId("job_posts")
  jobPosts.fields.getByName("customer_id").cascadeDelete = false
  return app.save(jobPosts)
})
