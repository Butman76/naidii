/// <reference path="../pb_data/types.d.ts" />

// specialist_profiles.updateRule разрешает владельцу редактировать свою же
// запись (нужно для остальных полей — описание, навыки и т.п.), но
// PocketBase-правила не умеют ограничивать доступ к отдельным полям.
// plan_code — это тариф (см. web/src/data/plans.ts), который назначает
// только админ вручную (оплаты online ещё нет, см. STATUS.md); без этого
// хука специалист мог бы выставить себе enterprise напрямую через API,
// в обход панели, и получить премиум-лендинг бесплатно. Тот же паттерн,
// что и app-level контроль profile_status (см. 1755000004), только здесь
// цена ошибки — реальные деньги, так что оставляем не на совесть клиента,
// а откатываем на сервере.
onRecordUpdateRequest((e) => {
  try {
    const isAdmin = e.auth && e.auth.get("role") === "admin"
    if (!isAdmin) {
      const original = e.record.original()
      const requestedPlan = e.record.get("plan_code")
      const currentPlan = original ? original.get("plan_code") : ""
      if (requestedPlan !== currentPlan) {
        e.record.set("plan_code", currentPlan)
      }
    }
  } catch (err) {
    console.log("plan_guard hook failed: " + err)
  }

  e.next()
}, "specialist_profiles")
