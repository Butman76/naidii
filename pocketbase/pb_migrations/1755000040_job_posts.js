/// <reference path="../pb_data/types.d.ts" />

// Новая фича (2026-08-29, по прямому запросу пользователя): заказчик может
// не просто заказать конкретную карточку услуги, а разместить открытое
// объявление ("Разместить заказ" в кабинете) — с категорией/подкатегорией
// или вовсе без них, свободным текстом. Специалисты, которых оно
// заинтересовало, откликаются — каждый отклик создаёт свой отдельный
// lead/чат (та же переписка и та же "Заключить сделку", что и у обычного
// заказа с карточки услуги, см. 1755000038_chat_and_deals.js), просто с
// пометкой job_post_id, откуда он взялся. Одно объявление — несколько
// параллельных чатов у заказчика; неинтересные заказчик может "отказать"
// (lead.status = "closed") — они не удаляются, просто гаснут в списке.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  const jobPosts = new Collection({
    type: "base",
    name: "job_posts",
    indexes: [
      "CREATE INDEX idx_job_posts_customer ON job_posts (customer_id)",
      "CREATE INDEX idx_job_posts_status ON job_posts (status)",
    ],
    // Открытые объявления видны любому вошедшему пользователю (специалисту
    // нужно их найти, чтобы откликнуться) — гостям, как и везде на площадке,
    // нет. Закрытые/собственные видит только автор и модерация.
    listRule: "customer_id = @request.auth.id || (@request.auth.id != \"\" && status = \"open\") || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    viewRule: "customer_id = @request.auth.id || (@request.auth.id != \"\" && status = \"open\") || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    createRule: "@request.auth.id != \"\" && @request.auth.role = \"customer\" && @request.body.customer_id = @request.auth.id",
    updateRule: "customer_id = @request.auth.id || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  jobPosts.fields.add(new Field({
    name: "customer_id", type: "relation", required: true,
    collectionId: users.id, cascadeDelete: false, minSelect: 1, maxSelect: 1,
  }))
  // Денормализовано специально — иначе специалисту, листающему открытые
  // объявления, нечем было бы показать имя заказчика: users.listRule
  // (1755000022_admin_users_access.js) не даёт читать чужие профили.
  jobPosts.fields.add(new Field({ name: "customer_name", type: "text", required: true, max: 150 }))
  jobPosts.fields.add(new Field({ name: "category_slug", type: "text", max: 100 }))
  jobPosts.fields.add(new Field({ name: "subcategory", type: "text", max: 150 }))
  jobPosts.fields.add(new Field({ name: "description", type: "text", required: true, max: 3000 }))
  jobPosts.fields.add(new Field({
    name: "status", type: "select", required: true,
    values: ["open", "closed"], maxSelect: 1,
  }))
  jobPosts.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  jobPosts.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  app.save(jobPosts)

  const leads = app.findCollectionByNameOrId("leads")
  leads.fields.add(new Field({
    name: "job_post_id", type: "relation", required: false,
    collectionId: jobPosts.id, cascadeDelete: false, maxSelect: 1,
  }))
  // Раньше лид мог создать только заказчик (о самом себе). Теперь второй
  // способ появления лида — специалист откликается на открытое объявление:
  // тогда лид создаёт специалист, но только на СВОЙ профиль и только со
  // ссылкой на реально открытое объявление конкретного заказчика (проверяем
  // прямо в правиле, чтобы specialist не мог приписать отклик к чужому
  // объявлению или выдумать customer_id).
  leads.createRule = "(@request.auth.role = \"customer\" && @request.body.customer_id = @request.auth.id) || " +
    "(@request.auth.role = \"specialist\" && @request.body.specialist_profile_id.user_id = @request.auth.id && " +
    "@request.body.job_post_id != \"\" && @request.body.job_post_id.customer_id = @request.body.customer_id && " +
    "@request.body.job_post_id.status = \"open\")"
  // "Отказать" отклику — это апдейт lead.status заказчиком, раньше апдейт
  // лида мог делать только специалист/админ.
  leads.updateRule = "specialist_profile_id.user_id = @request.auth.id || customer_id = @request.auth.id || @request.auth.role = \"admin\""

  return app.save(leads)
}, (app) => {
  const leads = app.findCollectionByNameOrId("leads")
  leads.fields.removeByName("job_post_id")
  leads.createRule = "@request.auth.id != \"\" && @request.auth.role = \"customer\" && @request.body.customer_id = @request.auth.id"
  leads.updateRule = "specialist_profile_id.user_id = @request.auth.id || @request.auth.role = \"admin\""
  app.save(leads)

  const jobPosts = app.findCollectionByNameOrId("job_posts")
  return app.delete(jobPosts)
})
