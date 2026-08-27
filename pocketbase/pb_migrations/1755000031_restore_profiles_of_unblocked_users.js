/// <reference path="../pb_data/types.d.ts" />

// Разовая операционная миграция: до этой точки разблокировка пользователя
// не возвращала его specialist_profiles.profile_status в "published"
// (см. коммит "cascade block to profile" — было сделано намеренно, но
// живая проверка показала, что это выглядит как баг "разблокировал, а
// карточки всё равно нет", и вернуть её вручную было неоткуда: раздел
// "Профили" в /admin показывает только pending). AdminPanel.tsx теперь
// делает это симметрично на будущее; эта миграция чинит уже испорченное
// состояние — любой профиль в статусе "blocked", чей пользователь уже
// снова "active", явно застрял из-за старой асимметрии, а не осознанного
// решения модератора (прямого способа заблокировать уже опубликованный
// профиль в интерфейсе не было вообще).
migrate((app) => {
  const activeUsers = app.findRecordsByFilter("users", 'status = "active" && role = "specialist"', "", 0, 0)
  for (const user of activeUsers) {
    try {
      const profile = app.findFirstRecordByFilter("specialist_profiles", "user_id = {:id}", { id: user.id })
      if (profile.get("profile_status") === "blocked") {
        profile.set("profile_status", "published")
        app.save(profile)
      }
    } catch (e) {
      // у пользователя просто нет анкеты — пропускаем
    }
  }
}, (app) => {})
