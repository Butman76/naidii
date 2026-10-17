/// <reference path="../pb_data/types.d.ts" />

// 2026-10-17: «Тут новые заказы» (/orders) открыт всем, включая гостей, но без
// заказчиков. Две части.
//
// 1) job_posts_public — view-коллекция только с тем, что можно показать всем:
//    id, направление, подкатегория, текст и дата ОТКРЫТЫХ объявлений. Ни
//    customer_id, ни customer_name в view физически нет — анонимный вызов API
//    их не получит. Текст берётся из поля public_text — копии описания, где
//    телефоны, e-mail, @ники и ссылки заменены на «[контакты скрыты]»
//    (заказчик мог вписать контакты прямо в описание). public_text заполняет
//    хук pb_hooks/job_posts_public.pb.js при каждом сохранении объявления;
//    здесь — заполнение для уже существующих.
// 2) Правила самой job_posts: раньше открытые объявления (с именем заказчика)
//    читал ЛЮБОЙ вошедший, в том числе другой заказчик. Теперь — автор,
//    специалисты (им нужно откликаться), admin и moderator.
migrate((app) => {
  const posts = app.findCollectionByNameOrId("job_posts")

  posts.fields.add(new Field({ name: "public_text", type: "text", required: false, max: 3200 }))
  app.save(posts)

  const mask = (text) => {
    let t = String(text || "")
    t = t.replace(/https?:\/\/\S+/gi, "[контакты скрыты]")
    t = t.replace(/\bwww\.\S+/gi, "[контакты скрыты]")
    t = t.replace(/t\.me\/\S+/gi, "[контакты скрыты]")
    t = t.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[контакты скрыты]")
    t = t.replace(/@[a-zA-Z0-9_]{4,}/g, "[контакты скрыты]")
    t = t.replace(/\+?\d[\d\s\-()]{7,}\d/g, "[контакты скрыты]")
    return t
  }
  const existing = app.findRecordsByFilter("job_posts", "id != \"\"", "", 0, 0)
  for (const record of existing) {
    record.set("public_text", mask(record.get("description")))
    app.saveNoValidate(record)
  }

  posts.listRule =
    "customer_id = @request.auth.id || (@request.auth.role = \"specialist\" && status = \"open\") || " +
    "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  posts.viewRule = posts.listRule
  app.save(posts)

  const view = new Collection({
    type: "view",
    name: "job_posts_public",
    viewQuery:
      "SELECT id, category_slug, subcategory, public_text AS description, created FROM job_posts WHERE status = 'open'",
    listRule: "",
    viewRule: "",
  })
  app.save(view)
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("job_posts_public"))
  } catch (err) {
    // уже удалена
  }
  const posts = app.findCollectionByNameOrId("job_posts")
  posts.fields.removeByName("public_text")
  posts.listRule =
    "customer_id = @request.auth.id || (@request.auth.id != \"\" && status = \"open\") || @request.auth.role = \"admin\" || @request.auth.role = \"moderator\""
  posts.viewRule = posts.listRule
  return app.save(posts)
})
