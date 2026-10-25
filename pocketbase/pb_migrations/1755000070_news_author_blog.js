/// <reference path="../pb_data/types.d.ts" />

// 2026-10-21: блог специалиста. Компании сами пишут статьи, они выходят в
// общем разделе «Новости и статьи» (с пометкой «От компании») и в блоке
// «Блог» на странице профиля автора — это одна и та же запись news_posts.
//
// Новое в news_posts:
//   author_profile_id — автор (профиль специалиста); пусто у редакционных
//     публикаций админа;
//   moderation_note — причина отказа, пишет админ;
//   status — к draft/published добавлены pending (на модерации) и rejected.
//
// Правила. Публично по-прежнему видны только published с наступившей датой.
// Автор видит свои статьи в любых статусах, создаёт их только в pending,
// правит и удаляет — пока pending/rejected (повторная отправка после отказа =
// обновление со статусом pending). Выпустить (published), выставить дату,
// сменить автора, slug или написать причину отказа может только admin.
// Частоту, содержимое (без контактов/внешних ссылок/картинок, длина) и
// условия (опубликованный профиль) проверяет хук pb_hooks/news_blog.pb.js —
// правила PocketBase такое считать не умеют.
//
// Откат: down ниже убирает поля и возвращает правила; статьи авторов при этом
// удаляются.
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const posts = app.findCollectionByNameOrId("news_posts")

  posts.fields.add(new Field({
    name: "author_profile_id",
    type: "relation",
    required: false,
    collectionId: profiles.id,
    cascadeDelete: true,
    maxSelect: 1,
  }))
  posts.fields.add(new Field({ name: "moderation_note", type: "text", required: false, max: 500 }))

  const status = posts.fields.getByName("status")
  status.values = ["draft", "published", "pending", "rejected"]

  posts.addIndex("idx_news_posts_author", false, "author_profile_id, created", "")

  const admin = "@request.auth.role = \"admin\""
  const author = "@request.auth.id != \"\" && author_profile_id.user_id = @request.auth.id"

  posts.listRule = "(status = \"published\" && published_at <= @now) || " + admin + " || (" + author + ")"
  posts.viewRule = posts.listRule
  posts.createRule =
    admin + " || (@request.auth.role = \"specialist\" && @request.body.author_profile_id.user_id = @request.auth.id && " +
    "@request.body.status = \"pending\" && @request.body.kind = \"article\" && " +
    "@request.body.published_at:isset = false && @request.body.moderation_note:isset = false)"
  posts.updateRule =
    admin + " || (" + author + " && (status = \"pending\" || status = \"rejected\") && " +
    "@request.body.status = \"pending\" && @request.body.author_profile_id:isset = false && " +
    "@request.body.published_at:isset = false && @request.body.moderation_note:isset = false && " +
    "@request.body.slug:isset = false && @request.body.kind:isset = false)"
  posts.deleteRule = admin + " || (" + author + " && (status = \"pending\" || status = \"rejected\"))"

  return app.save(posts)
}, (app) => {
  const posts = app.findCollectionByNameOrId("news_posts")

  // статьи авторов в статусах pending/rejected уйдут вместе с полем status
  const authored = app.findRecordsByFilter("news_posts", "author_profile_id != \"\"", "", 0, 0)
  for (const record of authored) app.delete(record)

  posts.removeIndex("idx_news_posts_author")
  posts.fields.removeByName("author_profile_id")
  posts.fields.removeByName("moderation_note")
  posts.fields.getByName("status").values = ["draft", "published"]

  const admin = "@request.auth.role = \"admin\""
  posts.listRule = "(status = \"published\" && published_at <= @now) || " + admin
  posts.viewRule = posts.listRule
  posts.createRule = admin
  posts.updateRule = admin
  posts.deleteRule = admin
  return app.save(posts)
})
