/// <reference path="../pb_data/types.d.ts" />

// Удаление тестового аккаунта «Анчоус» (m.butorin@bc-sco.com) с профилем и тремя
// услугами — владелец 2026-10-16 подтвердил, что он тоже выдуманный/тестовый
// (после чистки учебных специалистов миграцией 1755000064 остался единственным
// «ненастоящим» профилем в каталоге). Ссылок на него из заявок, сделок,
// заказов и продвижений нет (проверено по боевой БД); на всякий случай
// зависимые записи удаляются рекурсивно, как в 1755000064. В конце —
// предохранитель: остаются ровно 7 пользователей и ключевые реальные аккаунты.
// Необратимо; резервная копия pb_data сделана перед выкатом.
migrate((app) => {
  function deleteWithDependents(record, depth) {
    for (let attempt = 0; attempt < 500; attempt++) {
      try {
        app.delete(record)
        return
      } catch (err) {
        const m = String(err).match(/required reference in record (\w+) \((\w+) collection\)/)
        if (!m || depth > 8) throw err
        deleteWithDependents(app.findRecordById(m[2], m[1]), depth + 1)
      }
    }
    throw new Error("too many dependent records for " + record.id)
  }

  const users = app.findRecordsByFilter("users", "email = 'm.butorin@bc-sco.com'", "", 0, 0)
  for (const user of users) {
    const profiles = app.findRecordsByFilter("specialist_profiles", "user_id = {:id}", "", 0, 0, { id: user.id })
    for (const profile of profiles) deleteWithDependents(profile, 0)
    deleteWithDependents(user, 0)
  }

  const mustStay = [
    "but_marat@mail.ru", "monvision@2526av.com", "addfuel.spb@gmail.com", "kristina.perez.28523@gmail.com",
  ]
  for (const email of mustStay) app.findFirstRecordByData("users", "email", email)
  const left = app.countRecords("users")
  if (left !== 7) throw new Error("после чистки ожидалось 7 пользователей, осталось " + left)
}, (app) => {
  // данные не восстанавливаются
})
