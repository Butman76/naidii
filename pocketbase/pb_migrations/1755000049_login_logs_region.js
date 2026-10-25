/// <reference path="../pb_data/types.d.ts" />

// Добавляет login_logs.region — грубая геолокация по IP ("Город, Область,
// Страна"), вычисляется на сервере в api/log-login/route.ts в момент
// записи входа (см. web/src/lib/geo-ip.ts) и просто хранится строкой —
// пересчитывать задним числом для старых записей не пытаемся (region у
// них так и останется пустым, это нормально, не критичные данные).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("login_logs")
  collection.fields.add(new Field({ name: "region", type: "text", max: 200 }))
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("login_logs")
  collection.fields.removeByName("region")
  return app.save(collection)
})
