/// <reference path="../pb_data/types.d.ts" />

// Раздел «Новости и статьи» (/news). Отдельный модуль: две новые коллекции,
// существующие не читаются и не меняются.
//
// news_posts — публикации. Публично читаются только опубликованные и уже
// «наступившие» (published_at <= сейчас — так можно запланировать выход на
// будущее время, а страница сама подхватит его без правок). Создаёт,
// правит и удаляет только админ (из вкладки «Новости» в /admin).
// body — текст в Markdown (заголовки #, ##, ###, **жирный**, *курсив*,
// списки, цитаты, картинки ![подпись](url)); рисуется на сайте через
// react-markdown без сырого HTML, поэтому XSS через текст новости невозможен.
// news_images — картинки, которые админ вставляет внутрь текста (загрузка из
// редактора). Файлы PocketBase отдаёт по прямой ссылке без проверки правил
// (поле не protected), так что публичным сам список картинок быть не обязан.
//
// Откат: удалить обе коллекции (down ниже) и папку web/src/app/news.
migrate((app) => {
  const adminRule = "@request.auth.role = \"admin\""
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]

  const posts = new Collection({
    type: "base",
    name: "news_posts",
    indexes: [
      "CREATE UNIQUE INDEX idx_news_posts_slug ON news_posts (slug)",
      "CREATE INDEX idx_news_posts_status_pub ON news_posts (status, published_at)",
    ],
    listRule: "(status = \"published\" && published_at <= @now) || " + adminRule,
    viewRule: "(status = \"published\" && published_at <= @now) || " + adminRule,
    createRule: adminRule,
    updateRule: adminRule,
    deleteRule: adminRule,
  })
  posts.fields.add(new Field({ name: "title", type: "text", required: true, max: 200 }))
  posts.fields.add(new Field({ name: "slug", type: "text", required: true, max: 120 }))
  posts.fields.add(new Field({ name: "kind", type: "select", required: true, maxSelect: 1, values: ["news", "article"] }))
  posts.fields.add(new Field({ name: "excerpt", type: "text", max: 400 }))
  posts.fields.add(new Field({ name: "body", type: "text", max: 200000 }))
  posts.fields.add(new Field({
    name: "thumbnail", type: "file", maxSelect: 1, maxSize: 8 * 1024 * 1024,
    mimeTypes: imageTypes, thumbs: ["600x0", "1200x0"],
  }))
  posts.fields.add(new Field({ name: "status", type: "select", required: true, maxSelect: 1, values: ["draft", "published"] }))
  posts.fields.add(new Field({ name: "published_at", type: "date" }))
  posts.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  posts.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))
  app.save(posts)

  const images = new Collection({
    type: "base",
    name: "news_images",
    listRule: adminRule,
    viewRule: adminRule,
    createRule: adminRule,
    updateRule: adminRule,
    deleteRule: adminRule,
  })
  images.fields.add(new Field({
    name: "image", type: "file", required: true, maxSelect: 1, maxSize: 8 * 1024 * 1024,
    mimeTypes: imageTypes, thumbs: ["1200x0"],
  }))
  images.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  app.save(images)
}, (app) => {
  for (const name of ["news_images", "news_posts"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name))
    } catch (_) {}
  }
})
