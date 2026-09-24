/// <reference path="../pb_data/types.d.ts" />

// Раз в сутки удаляет события профилей (profile_events) старше 400 дней:
// аналитике нужны максимум 90 дней с запасом на сравнение с прошлым
// периодом, а копить сырые события бесконечно незачем. Хук изолирован (см.
// pocketbase/README.md, "Грабли JSVM") — всё нужное определено внутри.
cronAdd("events_retention", "41 3 * * *", () => {
  const cutoff = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ")
  const old = $app.findRecordsByFilter("profile_events", "created < {:cutoff}", "", 500, 0, { cutoff: cutoff })
  for (const record of old) {
    $app.delete(record)
  }
  if (old.length > 0) {
    console.log("events_retention: deleted " + old.length + " old profile event(s)")
  }
})
