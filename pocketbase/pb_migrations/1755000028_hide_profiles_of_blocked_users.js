/// <reference path="../pb_data/types.d.ts" />

// Разовая операционная миграция: до этой точки блокировка пользователя
// (вкладка "Пользователи" в /admin) не трогала его specialist_profiles —
// /specialists и /services фильтруют только по profile_status и ничего
// не знают о users.status, так что заблокированный пользователь пропадал
// из входа, но его карточка спокойно оставалась в публичном каталоге
// (найдено вручную: "Анчоус"/"Кукрыниксы" — users.status=blocked,
// profile_status всё ещё published). AdminPanel.tsx теперь делает это
// каскадом на будущее (см. коммит "cascade block to profile"); эта
// миграция приводит уже существующие блокировки в соответствие.
migrate((app) => {
  const blockedUsers = app.findRecordsByFilter("users", 'status = "blocked" && role = "specialist"', "", 0, 0)
  for (const user of blockedUsers) {
    try {
      const profile = app.findFirstRecordByFilter("specialist_profiles", "user_id = {:id}", { id: user.id })
      if (profile.get("profile_status") !== "blocked") {
        profile.set("profile_status", "blocked")
        app.save(profile)
      }
    } catch (e) {
      // у этого заблокированного пользователя просто нет анкеты — пропускаем
    }
  }
}, (app) => {})
