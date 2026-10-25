/// <reference path="../pb_data/types.d.ts" />

// Удаление выдуманных (учебных) специалистов, заведённых 2026-08-24 для
// демонстрации каталога (specialist-N@seed.naidii.ru, 11 пользователей с
// профилями и 44 услугами), и двух тестовых аккаунтов проверки в браузере
// (test-*-browsercheck@naidii.ru). Просьба владельца 2026-10-16: в каталоге
// должны остаться только реальные участники и добавленные редакцией
// компании. Реальные аккаунты (Vision Techno Labs, Анчоус, monvision,
// Кристина Перез, заказчики, админы) под фильтр не попадают.
//
// Удаляются пользователь, его профиль и всё, что на них ссылается по
// обязательной связи (заявки, сделки, заказы оплаты тарифа, продвижения…):
// перед выкатом проверено по боевой БД, что все такие записи принадлежат
// самим выдуманным/тестовым аккаунтам (заявки писал тестовый заказчик, заказы
// — пробные оплаты тарифа самих выдуманных специалистов), записей реальных
// пользователей среди них нет. Миграция идёт в одной транзакции и в конце сама
// проверяет, что остались ровно 8 реальных пользователей и их ключевые
// аккаунты — иначе откатывается целиком.
//
// Необратимо: откат (down) ничего не восстанавливает, восстановление — только
// из резервной копии pb_data (сделана перед выкатом).
migrate((app) => {
  // Обработчики JSVM изолированы — всё нужное определено внутри.
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

  const seedUsers = app.findRecordsByFilter(
    "users",
    "email ~ '@seed.naidii.ru' || email ~ 'browsercheck@naidii.ru'",
    "",
    0,
    0
  )
  for (const user of seedUsers) {
    const profiles = app.findRecordsByFilter("specialist_profiles", "user_id = {:id}", "", 0, 0, { id: user.id })
    for (const profile of profiles) deleteWithDependents(profile, 0)
    deleteWithDependents(user, 0)
  }

  // Три пробные заявки тестового заказчика к реальным профилям: связь с
  // заказчиком не обязательная, поэтому после его удаления они остались
  // «осиротевшими» (customer_id пуст) и висели бы в кабинетах специалистов.
  const orphanLeads = app.findRecordsByFilter("leads", "customer_id = ''", "", 0, 0)
  for (const lead of orphanLeads) deleteWithDependents(lead, 0)

  // Предохранитель: ключевые реальные аккаунты на месте и ничего лишнего не ушло.
  const mustStay = [
    "but_marat@mail.ru", "monvision@2526av.com", "addfuel.spb@gmail.com",
    "m.butorin@bc-sco.com", "kristina.perez.28523@gmail.com",
  ]
  for (const email of mustStay) app.findFirstRecordByData("users", "email", email)
  const left = app.countRecords("users")
  if (left !== 8) throw new Error("после чистки ожидалось 8 пользователей, осталось " + left)
}, (app) => {
  // данные не восстанавливаются
})
