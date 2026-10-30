/// <reference path="../pb_data/types.d.ts" />

// 2026-10-30: четыре тестовых специалиста для админа — по одному на каждый
// уровень (бесплатный, Базовый, Pro, Enterprise), чтобы зайти под ними через
// «Войти как» во вкладке «Пользователи» в /admin и посмотреть кабинет глазами
// специалиста. Нигде, кроме админки, они не видны:
//   specialist_profiles.is_test = true исключает профиль и его услуги/лендинг
//   из публичных правил (каталог, страница специалиста, карта сайта, подборки);
//   сам владелец (под «Войти как») и admin/moderator их видят.
// Пароли случайные и нигде не сохраняются: вход только через «Войти как».
// Адреса на зарезервированном домене .invalid — письма на них не уходят, а
// уведомление о регистрации (users_signup_notify) для них пропускается.
// Тариф у тестовых назначен «вручную» (без срока), как у админских назначений.
// Профиль опубликован (иначе у блога нет доступа), но скрыт флагом.
//
// Откат (down): удаляет четыре профиля и пользователей, убирает флаг и
// возвращает правила. Удалить тестовых вручную: во вкладке «Пользователи».
const TESTERS = [
  { email: "tester-free@naidii-test.invalid", name: "Тест: бесплатный", slug: "test-free", plan: "", title: "Тестовый специалист, бесплатный уровень" },
  { email: "tester-basic@naidii-test.invalid", name: "Тест: Базовый", slug: "test-basic", plan: "basic", title: "Тестовый специалист, тариф Базовый" },
  { email: "tester-pro@naidii-test.invalid", name: "Тест: Pro", slug: "test-pro", plan: "pro", title: "Тестовый специалист, тариф Pro" },
  { email: "tester-enterprise@naidii-test.invalid", name: "Тест: Enterprise", slug: "test-enterprise", plan: "enterprise", title: "Тестовый специалист, тариф Enterprise" },
]

const swap = (rule, from, to, label) => {
  if (!String(rule).includes(from)) throw new Error("rule fragment not found: " + label)
  return String(rule).split(from).join(to)
}

migrate((app) => {
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.fields.add(new Field({ name: "is_test", type: "bool" }))
  profiles.listRule = swap(profiles.listRule, "(profile_status = \"published\" && ", "(profile_status = \"published\" && is_test != true && ", "profiles")
  profiles.viewRule = profiles.listRule
  app.save(profiles)

  const services = app.findCollectionByNameOrId("services")
  services.listRule = swap(services.listRule, "specialist_profile_id.profile_status = \"published\"", "specialist_profile_id.profile_status = \"published\" && specialist_profile_id.is_test != true", "services")
  services.viewRule = services.listRule
  app.save(services)

  const landing = app.findCollectionByNameOrId("landing_items")
  landing.listRule = swap(landing.listRule, "specialist_profile_id.profile_status = \"published\"", "specialist_profile_id.profile_status = \"published\" && specialist_profile_id.is_test != true", "landing")
  landing.viewRule = landing.listRule
  app.save(landing)

  const users = app.findCollectionByNameOrId("users")
  const profileCol = app.findCollectionByNameOrId("specialist_profiles")
  for (const t of TESTERS) {
    let exists = false
    try {
      app.findAuthRecordByEmail("users", t.email)
      exists = true
    } catch (err) {
      // нет такого — создаём
    }
    if (exists) continue

    const user = new Record(users)
    user.set("email", t.email)
    user.set("emailVisibility", false)
    user.setPassword($security.randomString(32))
    user.set("name", t.name)
    user.set("role", "specialist")
    user.set("status", "active")
    user.set("verified", true)
    app.save(user)

    const profile = new Record(profileCol)
    profile.set("user_id", user.id)
    profile.set("profile_type", "studio")
    profile.set("public_name", t.name)
    profile.set("slug", t.slug)
    profile.set("profile_status", "published")
    profile.set("title", t.title)
    profile.set("short_description", "Тестовый профиль для проверки кабинета. Не виден посетителям.")
    profile.set("full_description", "Тестовый профиль для проверки кабинета администратором.")
    profile.set("plan_code", t.plan)
    profile.set("is_test", true)
    app.save(profile)
  }
  console.log("test_specialists: ready")
}, (app) => {
  for (const t of TESTERS) {
    try {
      const user = app.findAuthRecordByEmail("users", t.email)
      const profs = app.findRecordsByFilter("specialist_profiles", "user_id = {:u}", "", 0, 0, { u: user.id })
      for (const p of profs) app.delete(p)
      app.delete(user)
    } catch (err) {
      // уже удалён
    }
  }

  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.listRule = swap(profiles.listRule, "(profile_status = \"published\" && is_test != true && ", "(profile_status = \"published\" && ", "d.profiles")
  profiles.viewRule = profiles.listRule
  profiles.fields.removeByName("is_test")
  app.save(profiles)

  for (const name of ["services", "landing_items"]) {
    const c = app.findCollectionByNameOrId(name)
    c.listRule = swap(c.listRule, " && specialist_profile_id.is_test != true", "", "d." + name)
    c.viewRule = c.listRule
    app.save(c)
  }
})
