/// <reference path="../pb_data/types.d.ts" />

// specialist_profiles.createRule/updateRule разрешают владельцу писать в
// свою запись (нужно для описания, навыков и т.п.), но PocketBase-правила
// не умеют ограничивать доступ к отдельным полям. Поля ниже владелец
// менять НЕ вправе:
// - plan_code — тариф (web/src/data/plans.ts). Без охраны специалист сам
//   выставил бы себе enterprise через API и получил платный лендинг
//   бесплатно (оплаты online ещё нет, тариф назначает admin вручную через
//   /admin вкладка "Тарифы").
// - subdomain — персональный поддомен (web/src/middleware.ts): без охраны
//   можно занять чужое/оскорбительное имя. Тоже только admin.
// - profile_status — публикация профиля (pending -> published) решает
//   модерация (admin/moderator, вкладка "Профили"): без охраны специалист
//   сам публиковал бы себя, минуя проверку.
// Регистрация (register/page.tsx) создаёт профиль со статусом "pending" и
// без плана/поддомена — под эти значения охрана и приводит любое создание.
//
// ВАЖНО (найдено при проверке 2026-09-20): обработчики PocketBase JSVM
// изолированы — переменные из внешней области видимости внутри них НЕ
// видны. Прежняя версия держала список полей константой ВЫШЕ обработчика
// и молча падала с "ADMIN_ONLY_FIELDS is not defined" (ошибка глоталась
// try/catch), то есть охрана не работала вообще и любой специалист мог
// выставить себе enterprise. Теперь всё определено внутри обработчиков, а
// ошибки НЕ проглатываются — при сбое запрос отклоняется, а не проходит.
// Суперпользователь PocketBase (/_/) приравнен к admin.

onRecordCreateRequest((e) => {
  const role = e.auth ? e.auth.get("role") : ""
  const isAdmin = e.hasSuperuserAuth() || role === "admin"
  const isStaff = isAdmin || role === "moderator"
  if (!isAdmin) {
    e.record.set("plan_code", "")
    e.record.set("subdomain", "")
  }
  if (!isStaff) {
    e.record.set("profile_status", "pending")
  }
  e.next()
}, "specialist_profiles")

onRecordUpdateRequest((e) => {
  const role = e.auth ? e.auth.get("role") : ""
  const isAdmin = e.hasSuperuserAuth() || role === "admin"
  const isStaff = isAdmin || role === "moderator"
  const original = e.record.original()
  if (!isAdmin) {
    e.record.set("plan_code", original.get("plan_code"))
    e.record.set("subdomain", original.get("subdomain"))
  }
  if (!isStaff) {
    e.record.set("profile_status", original.get("profile_status"))
  }
  e.next()
}, "specialist_profiles")
