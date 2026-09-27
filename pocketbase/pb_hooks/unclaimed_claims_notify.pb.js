/// <reference path="../pb_data/types.d.ts" />

// Заявка "это моя компания" / "уберите" по неподтверждённой карточке
// (unclaimed_specialists) — письмо на info@naidii.ru, как ai_events_notify
// и suggestions.pb.js. Сбой письма не должен ломать сохранение заявки.
onRecordAfterCreateSuccess((e) => {
  try {
    const listing = e.app.findRecordById("unclaimed_specialists", e.record.get("listing"))
    const settings = e.app.settings()
    const esc = (s) => String(s || "—").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    const kind = e.record.get("kind") === "remove" ? "просят убрать карточку" : "заявляют права на карточку («это моя компания»)"

    e.app.newMailClient().send({
      from: { address: settings.meta.senderAddress, name: settings.meta.senderName },
      to: [{ address: "info@naidii.ru" }],
      subject: "НайдИИ: заявка по неподтверждённой карточке",
      html:
        "<p>Карточка: <b>" + esc(listing.get("name")) + "</b> (" + esc(listing.get("domain")) + ")</p>" +
        "<p>Что просят: " + kind + "</p>" +
        "<p>Контакт: " + esc(e.record.get("contact_name")) + ", " + esc(e.record.get("contact_email")) +
        (e.record.get("contact_phone") ? ", " + esc(e.record.get("contact_phone")) : "") + "</p>" +
        (e.record.get("message") ? "<p>Сообщение: " + esc(e.record.get("message")) + "</p>" : "") +
        "<p>Проверьте и обработайте в админке: вкладка «Неподтверждённые карточки».</p>",
    })
  } catch (err) {
    console.log("unclaimed_claims notify hook failed: " + err)
  }

  e.next()
}, "unclaimed_claims")
