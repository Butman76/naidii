/// <reference path="../pb_data/types.d.ts" />

// specialist_profiles.updateRule разрешает владельцу редактировать свою же
// запись (нужно для остальных полей — описание, навыки и т.п.), но
// PocketBase-правила не умеют ограничивать доступ к отдельным полям.
// Ниже — поля, которые назначает только admin вручную через /admin
// (AdminPanel.tsx, вкладка "Тарифы"):
// - plan_code — тариф (web/src/data/plans.ts); без охраны специалист мог
//   бы сам выставить себе enterprise через API и получить премиум-лендинг
//   бесплатно (оплаты online ещё нет, см. STATUS.md).
// - subdomain — персональный поддомен (например,
//   visiontechnolabs.naidii.ru, см. web/middleware.ts); без охраны
//   специалист мог бы занять чужое/оскорбительное имя поддомена сам.
// Тот же паттерн, что и app-level контроль profile_status (см.
// 1755000004), только здесь цена ошибки — деньги и репутация домена, так
// что не оставляем это на совесть клиента, а откатываем на сервере.
const ADMIN_ONLY_FIELDS = ["plan_code", "subdomain"]

onRecordUpdateRequest((e) => {
  try {
    const isAdmin = e.auth && e.auth.get("role") === "admin"
    if (!isAdmin) {
      const original = e.record.original()
      for (const field of ADMIN_ONLY_FIELDS) {
        const requested = e.record.get(field)
        const current = original ? original.get(field) : ""
        if (requested !== current) {
          e.record.set(field, current)
        }
      }
    }
  } catch (err) {
    console.log("plan_guard hook failed: " + err)
  }

  e.next()
}, "specialist_profiles")
