/// <reference path="../pb_data/types.d.ts" />

// Первое использование pb_hooks в этом проекте (до сих пор были только
// pb_migrations) — при деплое эта папка должна лежать рядом с pb_migrations
// (см. README.md), PocketBase сам подхватывает *.pb.js при старте.
//
// "Не нашли то, что вам надо?" (кабинет заказчика) — при создании записи
// в suggestions письмо с текстом идеи уходит на info@naidii.ru через уже
// настроенный в PocketBase SMTP (Settings → Mail, тот же ящик, что и для
// писем-подтверждений почты). Если info@naidii.ru как ящик ещё не заведён
// на Timeweb — письмо physически некуда доставить, это не баг хука.
onRecordAfterCreateSuccess((e) => {
  try {
    const author = e.app.findRecordById("users", e.record.get("user_id"))
    const settings = e.app.settings()

    const message = {
      from: {
        address: settings.meta.senderAddress,
        name: settings.meta.senderName,
      },
      to: [{ address: "info@naidii.ru" }],
      subject: "НайдИИ: новая идея от пользователя",
      html:
        "<p>Пользователь: " + (author ? author.get("name") || author.get("email") : e.record.get("user_id")) + "</p>" +
        "<p>Email: " + (author ? author.get("email") : "—") + "</p>" +
        "<p>Идея:</p><p>" + e.record.get("text") + "</p>",
    }

    e.app.newMailClient().send(message)
  } catch (err) {
    // Не блокируем создание записи, если письмо не ушло (SMTP недоступен,
    // ящик info@naidii.ru не заведён и т.п.) — сама заявка в базе всё равно
    // сохранена, письмо можно будет прочитать позже через админку.
    console.log("suggestions email hook failed: " + err)
  }

  e.next()
}, "suggestions")
