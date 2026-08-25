/// <reference path="../pb_data/types.d.ts" />

// Подтверждение почты при регистрации (2026-08-25, по запросу пользователя):
// задаёт текст письма-активации и адрес отправителя. Ссылка в письме ведёт
// на фронтенд-страницу /verify?token=... (web/src/app/verify/), которая
// вызывает pb.collection('users').confirmVerification(token) и выставляет
// встроенный флаг users.verified — отдельный от кастомного users.is_verified
// из 1755000001_users_fields.js (тот — публичный "знак доверия", это —
// служебный статус подтверждения email, они не связаны).
//
// ВАЖНО: сами SMTP-креды (хост/логин/пароль почтового ящика) сюда
// сознательно не включены — репозиторий публичный (см. STATUS.md), пароль
// в git класть нельзя. Их нужно один раз внести вручную через админку
// PocketBase на сервере: /_/ → Settings → Mail settings. До этого момента
// requestVerification() на сервере будет падать с ошибкой - фронтенд это
// уже учитывает (web/src/app/register/page.tsx не блокирует регистрацию,
// если письмо не ушло).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  // Плоский объект, а не `new MailerTemplate(...)` — такого конструктора в
  // JSVM PocketBase нет (проверено на живом сервере 2026-08-25:
  // "ReferenceError: MailerTemplate is not defined"), сеттер поля сам
  // принимает {subject, body}.
  collection.verificationTemplate = {
    subject: "Подтвердите почту на НайдИИ",
    body: `
      <p>Здравствуйте!</p>
      <p>Вы зарегистрировались на {APP_NAME}. Подтвердите почту, чтобы
      активировать аккаунт:</p>
      <p><a href="{APP_URL}/verify?token={TOKEN}">Подтвердить почту</a></p>
      <p>Если это были не вы — просто проигнорируйте это письмо.</p>
    `,
  }

  app.save(collection)

  // meta.senderName/senderAddress подтверждены рабочими на живом сервере
  // (2026-08-25) — письмо ушло от "НайдИИ <reg@naidii.ru>". meta.appName
  // тем же способом, скорее всего, тоже применяется, не проверяли отдельно.
  // meta.appUrl — НЕ подтверждено: после этой миграции ссылка в письме
  // всё равно вела на дефолтный http://localhost:8090, а не на
  // https://naidii.ru, то есть либо поле называется иначе в этой версии
  // PocketBase, либо сохраняется по-другому. Пришлось поправить руками
  // через /_/ → Settings → Application. Если завтра снова понадобится
  // поднимать PocketBase с нуля — учтите, что после прогона миграций
  // Application URL тоже надо будет проверить/выставить вручную.
  const settings = app.settings()
  settings.meta.appName = "НайдИИ"
  settings.meta.senderName = "НайдИИ"
  settings.meta.senderAddress = "reg@naidii.ru"

  return app.save(settings)
}, (app) => {
  // Точечный откат текста письма/адреса не требуется — это не структура
  // данных, а конфигурация, безопасно оставить как есть при downgrade.
})
