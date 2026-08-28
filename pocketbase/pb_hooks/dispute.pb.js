/// <reference path="../pb_data/types.d.ts" />

// "Жалоба модераторам" (2026-08-29) — когда сделка переходит в статус
// disputed, письмо с деталями уходит на claim@naidii.ru через уже
// настроенный SMTP (тот же механизм, что и pb_hooks/suggestions.pb.js).
// onRecordAfterUpdateSuccess — реагируем только на переход СТАТУСА именно
// в disputed (через e.record.original(), а не на любое обновление сделки,
// иначе письмо улетало бы повторно на каждое последующее изменение записи).
onRecordAfterUpdateSuccess((e) => {
  try {
    const wasDisputed = e.record.original().get("status") === "disputed"
    const isDisputed = e.record.get("status") === "disputed"

    if (!isDisputed || wasDisputed) {
      e.next()
      return
    }

    const settings = e.app.settings()
    const disputedById = e.record.get("disputed_by")
    const disputedBy = disputedById ? e.app.findRecordById("users", disputedById) : null

    const message = {
      from: {
        address: settings.meta.senderAddress,
        name: settings.meta.senderName,
      },
      to: [{ address: "claim@naidii.ru" }],
      subject: "НайдИИ: жалоба по сделке " + e.record.id,
      html:
        "<p>Сделка: " + e.record.id + "</p>" +
        "<p>Заявка (lead): " + e.record.get("lead_id") + "</p>" +
        "<p>Подал жалобу: " + (disputedBy ? (disputedBy.get("name") || disputedBy.get("email")) : "—") + "</p>" +
        "<p>Результат: " + e.record.get("result_text") + "</p>" +
        "<p>Стоимость: " + e.record.get("price") + " ₽</p>" +
        "<p>Проверить и рассудить спор можно в кабинете модератора, раздел «Споры».</p>",
    }

    e.app.newMailClient().send(message)
  } catch (err) {
    // Не мешаем сохранению статуса, если письмо не ушло — жалоба всё равно
    // видна модератору в разделе "Споры" по самому статусу disputed.
    console.log("dispute email hook failed: " + err)
  }

  e.next()
}, "deals")
