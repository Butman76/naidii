/// <reference path="../pb_data/types.d.ts" />

// Счётчик просмотров новостей/статей — виден только админам.
//
// news_views — по одной строке на «уникального читателя» публикации: либо
// вошедший пользователь (user_id), либо посетитель с хэшем IP (ip_hash).
// Читатель считается один раз, если совпал хотя бы один признак: тот же
// аккаунт ИЛИ тот же IP (правило владельца: «разные пользователи и разные
// IP, один и тот же — один раз»). Строки пишет только серверный маршрут
// web/src/app/api/news-view/route.ts под суперпользователем; правил доступа
// у коллекции нет (null = только суперпользователь), IP хранится хэшем.
// news_view_counts — view-коллекция «публикация → число просмотров», читать
// её может только admin (так публичный news_posts счётчик не раскрывает).
//
// Откат: удалить обе коллекции (down ниже) и маршрут api/news-view.
migrate((app) => {
  const posts = app.findCollectionByNameOrId("news_posts")

  const views = new Collection({
    type: "base",
    name: "news_views",
    indexes: [
      "CREATE INDEX idx_news_views_post_ip ON news_views (post, ip_hash)",
      "CREATE INDEX idx_news_views_post_user ON news_views (post, user_id)",
    ],
  })
  views.fields.add(new Field({
    name: "post",
    type: "relation",
    required: true,
    collectionId: posts.id,
    cascadeDelete: true,
    maxSelect: 1,
  }))
  views.fields.add(new Field({ name: "user_id", type: "text", max: 40 }))
  views.fields.add(new Field({ name: "ip_hash", type: "text", max: 80 }))
  views.fields.add(new Field({ name: "created", type: "autodate", onCreate: true, onUpdate: false }))
  app.save(views)

  const counts = new Collection({
    type: "view",
    name: "news_view_counts",
    viewQuery: "SELECT post AS id, COUNT(id) AS views FROM news_views GROUP BY post",
    listRule: "@request.auth.role = \"admin\"",
    viewRule: "@request.auth.role = \"admin\"",
  })
  app.save(counts)
}, (app) => {
  for (const name of ["news_view_counts", "news_views"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name))
    } catch (err) {
      // уже удалена
    }
  }
})
