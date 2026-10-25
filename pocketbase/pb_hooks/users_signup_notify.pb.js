/// <reference path="../pb_data/types.d.ts" />

// Письмо на info@naidii.ru о каждой новой регистрации (2026-10-25, по просьбе
// владельца) — тем же способом, что unclaimed_claims_notify и
// ai_events_notify: почтовый клиент PocketBase и уже настроенный SMTP. Сбой
// письма не должен ломать регистрацию, поэтому всё в try/catch. Срабатывает
// после успешного создания записи users, то есть роль уже приведена к
// допустимой хуком users_guard.pb.js.

onRecordAfterCreateSuccess((e) => {
  try {
    const settings = e.app.settings()
    const esc = (s) => String(s || "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const roles = { specialist: "специалист", customer: "заказчик", moderator: "модератор", admin: "админ" }
    const role = String(e.record.get("role") || "")
    const when = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })

    e.app.newMailClient().send({
      from: { address: settings.meta.senderAddress, name: settings.meta.senderName },
      to: [{ address: "info@naidii.ru" }],
      subject: "НайдИИ: новая регистрация (" + (roles[role] || role || "без роли") + ")",
      html:
        "<p>Зарегистрировался новый пользователь.</p>" +
        "<p>Роль: <b>" + esc(roles[role] || role) + "</b></p>" +
        "<p>Имя: " + esc(e.record.get("name")) + "</p>" +
        "<p>E-mail: " + esc(e.record.get("email")) + "</p>" +
        (e.record.get("phone") ? "<p>Телефон: " + esc(e.record.get("phone")) + "</p>" : "") +
        (e.record.get("telegram") ? "<p>Telegram: " + esc(e.record.get("telegram")) + "</p>" : "") +
        "<p>Время (МСК): " + esc(when) + "</p>" +
        "<p>Пользователи: <a href=\"https://naidii.ru/admin\">naidii.ru/admin</a>, вкладка «Пользователи».</p>",
    })
  } catch (err) {
    console.log("users signup notify hook failed: " + err)
  }

  e.next()
}, "users")
