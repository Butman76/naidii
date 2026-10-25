/// <reference path="../pb_data/types.d.ts" />

// Модерация элементов лендинга (коллекция landing_items, см.
// pb_migrations/1755000046_landing_items.js). PocketBase-правила не умеют
// ограничивать значения отдельных полей, поэтому "владелец не может сам
// себя одобрить" держится здесь — на сервере, а не на совести формы.
//
// ВАЖНО: обработчики PocketBase JSVM выполняются в изолированных
// контекстах — переменные из внешней области видимости внутри них НЕ
// доступны, поэтому каждый обработчик самодостаточен (никаких общих
// констант сверху файла).
//
// Владелец (не admin/moderator) при создании и при правке:
//   - статус всегда возвращается в "pending", причина отказа и след
//     проверки (reviewed_by/at) обнуляются — что бы ни пришло в теле
//     запроса;
//   - specialist_profile_id / kind / replaces_item_id не меняются (нельзя
//     "переселить" элемент в чужой профиль или подменить связь замены).
// Суперпользователь PocketBase (/_/) приравнен к admin/moderator.
// Ошибка в этих защитах НЕ проглатывается (в отличие от plan_guard.pb.js):
// лучше отклонить запрос, чем пропустить самоодобрение.

onRecordCreateRequest((e) => {
  const role = e.auth ? e.auth.get("role") : ""
  const isStaff = e.hasSuperuserAuth() || role === "admin" || role === "moderator"
  if (!isStaff) {
    e.record.set("moderation_status", "pending")
    e.record.set("reject_reason", "")
    e.record.set("reviewed_by", "")
    e.record.set("reviewed_at", "")
  }
  e.next()
}, "landing_items")

onRecordUpdateRequest((e) => {
  const role = e.auth ? e.auth.get("role") : ""
  const isStaff = e.hasSuperuserAuth() || role === "admin" || role === "moderator"
  if (!isStaff) {
    const original = e.record.original()
    e.record.set("specialist_profile_id", original.get("specialist_profile_id"))
    e.record.set("kind", original.get("kind"))
    e.record.set("replaces_item_id", original.get("replaces_item_id"))
    e.record.set("moderation_status", "pending")
    e.record.set("reject_reason", "")
    e.record.set("reviewed_by", "")
    e.record.set("reviewed_at", "")
  }
  e.next()
}, "landing_items")

// После одобрения новой версии прежняя одобренная уходит в "superseded":
// для cover/logo/video — любая другая одобренная того же вида у этого
// профиля (на сайте всегда один экземпляр), для остальных видов — та, что
// указана в replaces_item_id. Строки не удаляются — остаётся история.
onRecordAfterUpdateSuccess((e) => {
  try {
    const status = e.record.get("moderation_status")
    const wasStatus = e.record.original().get("moderation_status")
    if (status === "approved" && wasStatus !== "approved") {
      const kind = e.record.get("kind")
      const profileId = e.record.get("specialist_profile_id")
      const replacesId = e.record.get("replaces_item_id")
      let previous = []
      if (kind === "cover" || kind === "logo" || kind === "video") {
        previous = e.app.findRecordsByFilter(
          "landing_items",
          "specialist_profile_id = {:profile} && kind = {:kind} && moderation_status = 'approved' && id != {:self}",
          "",
          0,
          0,
          { profile: profileId, kind: kind, self: e.record.id }
        )
      } else if (replacesId) {
        const replaced = e.app.findRecordById("landing_items", replacesId)
        if (replaced.get("moderation_status") === "approved") previous = [replaced]
      }
      for (const old of previous) {
        old.set("moderation_status", "superseded")
        e.app.save(old)
      }
    }
  } catch (err) {
    console.log("landing_moderation supersede failed: " + err)
  }
  e.next()
}, "landing_items")
