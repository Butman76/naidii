/// <reference path="../pb_data/types.d.ts" />

// Новая заявка на событие из /events/add: письмо на info@naidii.ru, чтобы
// админ увидел её в ящике, а не только в админке (вкладка «AI-события»).
// Как и suggestions.pb.js: сбой письма не должен ломать сохранение заявки.
onRecordAfterCreateSuccess((e) => {
  try {
    const event = e.app.findRecordById("ai_events", e.record.get("event"))
    const settings = e.app.settings()
    const esc = (s) => String(s || "—").replace(/&/g, "&amp;").replace(/</g, "&lt;")

    e.app.newMailClient().send({
      from: { address: settings.meta.senderAddress, name: settings.meta.senderName },
      to: [{ address: "info@naidii.ru" }],
      subject: "НайдИИ: новая заявка на AI-событие",
      html:
        "<p>Событие: <b>" + esc(event.get("title")) + "</b></p>" +
        "<p>Дата: " + esc(String(event.get("start_date")).slice(0, 10)) + "</p>" +
        "<p>Сайт: " + esc(event.get("official_url")) + "</p>" +
        "<p>Контакт: " + esc(e.record.get("contact_name")) + ", " + esc(e.record.get("organizer_email")) + "</p>" +
        "<p>Проверьте и опубликуйте в админке: вкладка «AI-события».</p>",
    })
  } catch (err) {
    console.log("ai_events notify hook failed: " + err)
  }

  e.next()
}, "ai_event_submissions")
