/// <reference path="../pb_data/types.d.ts" />

// 2026-10-17: сайт компании (domain) больше не отдаётся публике. ИНН, юрлицо и
// сайт-ссылка закрыты ещё в 1755000062, но domain оставался в публичной
// view-коллекции и светился в карточках и в адресе /unclaimed/{domain} —
// по сути тот же сайт. Теперь страница компании живёт по id
// (/unclaimed/{id}), а в view столбца domain нет: анониму (в т.ч. прямым
// вызовом API) домен не виден. Админ по-прежнему видит его в /admin и на
// странице компании (базовая таблица unclaimed_specialists — только admin).
migrate((app) => {
  const view = app.findCollectionByNameOrId("unclaimed_specialists_public")
  view.viewQuery = "SELECT id, name, city, blurb, categories, status, created, updated FROM unclaimed_specialists"
  return app.save(view)
}, (app) => {
  const view = app.findCollectionByNameOrId("unclaimed_specialists_public")
  view.viewQuery = "SELECT id, name, domain, city, blurb, categories, status, created, updated FROM unclaimed_specialists"
  return app.save(view)
})
