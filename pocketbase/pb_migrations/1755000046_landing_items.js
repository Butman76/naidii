/// <reference path="../pb_data/types.d.ts" />

// Лендинг специалиста на тарифе enterprise (2026-09-20, по прямому запросу
// пользователя): помимо обложки и логотипа специалист размещает свои
// карточки услуг (картинка + описание + цена/срок/рекламный текст) и
// портфолио (фотографии и презентации). ВСЁ, что он загружает или меняет,
// сначала проходит модерацию — публично видно только moderation_status =
// "approved" (и только у опубликованного профиля).
//
// Один элемент лендинга = одна строка этой коллекции, тип — в поле kind:
//   cover / logo            — по одной картинке на профиль (новая загрузка
//                             заменяет предыдущую одобренную после апрува)
//   video                   — ссылка на YouTube/RuTube (video_url)
//   service_card            — картинка + title + description + price_text +
//                             duration_text
//   photo                   — фотография портфолио (image + title-подпись)
//   presentation            — файл презентации (document) + title/description
//
// Правка уже ОДОБРЕННОГО элемента не меняет его "на месте": клиент создаёт
// НОВУЮ строку с replaces_item_id -> старая. Пока модератор не решил, на
// сайте остаётся старая версия; после одобрения хук landing_moderation.pb.js
// переводит старую в "superseded" (история остаётся, публично не видна).
// Так мелкая правка опечатки не убирает карточку с лендинга на время
// проверки.
//
// Старые поля (specialist_profiles.premium_cover_image/logo/video и
// коллекция landing_posters из 1755000044/45) фронтенд после этой миграции
// не читает — их содержимое копирует в landing_items миграция
// 1755000047_landing_items_backfill.js как уже одобренное. Сами старые
// поля/коллекцию намеренно не удаляем (откат возможен, данные не теряются).
migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const users = app.findCollectionByNameOrId("users")

  const publicApproved =
    "(moderation_status = \"approved\" && specialist_profile_id.profile_status = \"published\")"
  const staff = "(@request.auth.role = \"admin\" || @request.auth.role = \"moderator\")"
  const owner = "specialist_profile_id.user_id = @request.auth.id"

  const items = new Collection({
    type: "base",
    name: "landing_items",
    indexes: [
      "CREATE INDEX idx_landing_items_profile ON landing_items (specialist_profile_id)",
      "CREATE INDEX idx_landing_items_status ON landing_items (moderation_status)",
    ],
    listRule: publicApproved + " || " + owner + " || " + staff,
    viewRule: publicApproved + " || " + owner + " || " + staff,
    // Создавать может только владелец профиля и только пока профиль на
    // тарифе enterprise; статус при создании всегда pending (дублируется
    // хуком landing_moderation.pb.js — правило не даёт "создать сразу
    // одобренным", хук — страховка на случай пропущенного поля).
    createRule:
      "@request.auth.id != \"\" && @request.body.specialist_profile_id.user_id = @request.auth.id" +
      " && @request.body.specialist_profile_id.plan_code = \"enterprise\"" +
      " && @request.body.moderation_status = \"pending\"",
    // Владелец правит только неодобренные (pending/rejected) — одобренное
    // не меняется на месте, см. replaces_item_id выше. Модерация решает
    // через staff.
    updateRule:
      "(" + owner + " && (moderation_status = \"pending\" || moderation_status = \"rejected\")) || " + staff,
    deleteRule: owner + " || @request.auth.role = \"admin\"",
  })

  items.fields.add(new Field({
    name: "specialist_profile_id",
    type: "relation",
    required: true,
    collectionId: profiles.id,
    cascadeDelete: true,
    minSelect: 1,
    maxSelect: 1,
  }))
  items.fields.add(new Field({
    name: "kind",
    type: "select",
    required: true,
    values: ["cover", "logo", "video", "service_card", "photo", "presentation"],
    maxSelect: 1,
  }))
  items.fields.add(new Field({ name: "title", type: "text", max: 150 }))
  items.fields.add(new Field({ name: "description", type: "text", max: 800 }))
  items.fields.add(new Field({ name: "price_text", type: "text", max: 100 }))
  items.fields.add(new Field({ name: "duration_text", type: "text", max: 100 }))
  items.fields.add(new Field({ name: "video_url", type: "url" }))
  items.fields.add(new Field({
    name: "image",
    type: "file",
    maxSelect: 1,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    thumbs: ["800x0"],
  }))
  items.fields.add(new Field({
    name: "document",
    type: "file",
    maxSelect: 1,
    maxSize: 26214400,
    mimeTypes: [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.presentation",
    ],
  }))
  items.fields.add(new Field({ name: "sort_order", type: "number", onlyInt: true }))
  items.fields.add(new Field({
    name: "moderation_status",
    type: "select",
    required: true,
    values: ["pending", "approved", "rejected", "superseded"],
    maxSelect: 1,
  }))
  items.fields.add(new Field({ name: "reject_reason", type: "text", max: 500 }))
  items.fields.add(new Field({
    name: "reviewed_by",
    type: "relation",
    collectionId: users.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))
  items.fields.add(new Field({ name: "reviewed_at", type: "date" }))
  items.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  items.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  app.save(items)

  // Самосвязь можно добавить только после первого сохранения — у
  // коллекции должен появиться собственный id.
  items.fields.add(new Field({
    name: "replaces_item_id",
    type: "relation",
    collectionId: items.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))
  return app.save(items)
}, (app) => {
  const collection = app.findCollectionByNameOrId("landing_items")
  return app.delete(collection)
})
