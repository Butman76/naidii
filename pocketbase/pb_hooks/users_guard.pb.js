/// <reference path="../pb_data/types.d.ts" />

// Охрана служебных полей users (найдено при проверке 2026-10-09 на копии
// боевой БД): правила коллекции пускают пользователя писать в СВОЮ запись, а
// регистрация создаёт запись прямо из браузера (register/page.tsx), и
// PocketBase-правила не умеют ограничивать отдельные поля. В итоге любой
// мог зарегистрироваться сразу с role = "admin" (и founder_status) или
// выставить себе admin PATCH-запросом к собственной записи.
//
// Поля ниже меняет только admin (вкладка «Пользователи» в /admin) или
// суперпользователь PocketBase (серверные роуты Next.js, /_/):
//   role, status, founder_status, founder_discount_percent, is_verified.
// При регистрации не-админ может получить только роль customer или
// specialist (так и есть в форме), остальное принудительно в значения по
// умолчанию. Обработчики JSVM изолированы — всё нужное определено ВНУТРИ
// них (см. комментарий в plan_guard.pb.js).

onRecordCreateRequest((e) => {
  const callerRole = e.auth ? e.auth.get("role") : ""
  const isAdmin = e.hasSuperuserAuth() || callerRole === "admin"
  if (!isAdmin) {
    const wanted = e.record.get("role")
    if (wanted !== "customer" && wanted !== "specialist") e.record.set("role", "customer")
    e.record.set("status", "active")
    e.record.set("founder_status", false)
    e.record.set("founder_discount_percent", 0)
    e.record.set("is_verified", false)
  }
  e.next()
}, "users")

onRecordUpdateRequest((e) => {
  const callerRole = e.auth ? e.auth.get("role") : ""
  const isAdmin = e.hasSuperuserAuth() || callerRole === "admin"
  if (!isAdmin) {
    const original = e.record.original()
    e.record.set("role", original.get("role"))
    e.record.set("status", original.get("status"))
    e.record.set("founder_status", original.get("founder_status"))
    e.record.set("founder_discount_percent", original.get("founder_discount_percent"))
    e.record.set("is_verified", original.get("is_verified"))
  }
  e.next()
}, "users")
