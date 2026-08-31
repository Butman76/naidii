/// <reference path="../pb_data/types.d.ts" />

// Самостоятельное оформление лендинга для специалистов на тарифе enterprise
// (см. web/src/components/PremiumSpecialistProfile.tsx) — раньше вся эта
// секция была только визуальным мокапом: обложка/лого не грузились
// (только градиент + инициалы), видео было статичной кнопкой "▶" без
// реального ролика. Владелец профиля редактирует эти поля сам в своём
// кабинете (см. PremiumLandingEditor.tsx), поэтому updateRule остаётся тот
// же, что и на остальные поля профиля (self-only помимо admin/moderator) —
// в отличие от plan_code/subdomain, тут нет риска "бесплатно выдать себе
// платную фичу", т.к. сама секция рендерится только когда plan_code уже
// enterprise (назначает admin, см. plan_guard.pb.js).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")

  collection.fields.add(new Field({
    name: "premium_cover_image",
    type: "file",
    maxSelect: 1,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({
    name: "premium_logo_image",
    type: "file",
    maxSelect: 1,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }))
  collection.fields.add(new Field({
    name: "premium_video_url",
    type: "url",
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("specialist_profiles")
  collection.fields.removeByName("premium_cover_image")
  collection.fields.removeByName("premium_logo_image")
  collection.fields.removeByName("premium_video_url")
  return app.save(collection)
})
