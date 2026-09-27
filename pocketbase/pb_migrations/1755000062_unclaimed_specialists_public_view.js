/// <reference path="../pb_data/types.d.ts" />

// Закрывает реальную дыру, не косметику: старое публичное listRule/viewRule
// коллекции unclaimed_specialists ("status = active || admin") отдавало
// АНОНИМНОМУ вызову — напрямую к API, без всякого фронтенда — всю строку
// целиком: юрлицо, ИНН, сайт и приватные source_email/source_phone каждой
// компании. Параметр `fields` в запросах нашего кода (lib/unclaimed.ts)
// ограничивает только то, что просит НАШ фронтенд — не то, что может
// запросить кто угодно, дёрнув API руками. Настоящая граница в PocketBase —
// только listRule/viewRule самой коллекции, других способов скрыть
// отдельные поля от анонима нет (см. обсуждение с пользователем 2026-09-28,
// «или ломанут и все увидят?» — да, ломать не нужно было, curl хватало).
//
// Решение: сама таблица unclaimed_specialists теперь видна только admin
// (listRule/viewRule = роль admin). Публике отдаём отдельную view-коллекцию
// unclaimed_specialists_public — она физически содержит только безопасные
// столбцы (id, name, domain, city, blurb, categories, status), приватных
// полей там просто нет, скрывать нечего. lib/unclaimed.ts публичные функции
// переключены на неё; админка и api/unclaimed/claim по-прежнему читают
// базовую таблицу через аутентифицированную admin-сессию / суперпользователя
// — их рулы не меняются, доступ не теряют.
migrate((app) => {
  const base = app.findCollectionByNameOrId("unclaimed_specialists")
  base.listRule = "@request.auth.role = \"admin\""
  base.viewRule = "@request.auth.role = \"admin\""
  app.save(base)

  const view = new Collection({
    type: "view",
    name: "unclaimed_specialists_public",
    viewQuery: "SELECT id, name, domain, city, blurb, categories, status, created, updated FROM unclaimed_specialists",
    listRule: "status = \"active\"",
    viewRule: "status = \"active\"",
  })
  app.save(view)
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("unclaimed_specialists_public"))
  } catch (err) {
    // уже удалена
  }
  const base = app.findCollectionByNameOrId("unclaimed_specialists")
  base.listRule = "status = \"active\" || @request.auth.role = \"admin\""
  base.viewRule = "status = \"active\" || @request.auth.role = \"admin\""
  app.save(base)
})
