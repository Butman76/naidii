/// <reference path="../pb_data/types.d.ts" />

// Блог специалиста (миграция 1755000070): проверки при создании и повторной
// отправке статьи автором. Админ и суперпользователь (серверные роуты) не
// ограничиваются. Сами проверки — в news_blog_lib.js.

onRecordCreateRequest((e) => {
  const callerRole = e.auth ? e.auth.get("role") : ""
  const isAdmin = e.hasSuperuserAuth() || callerRole === "admin"
  if (!isAdmin && e.record.get("author_profile_id")) {
    const lib = require(`${__hooks}/news_blog_lib.js`)
    const profile = lib.loadAuthor(e.record, e.auth ? e.auth.id : "")
    lib.checkContent(e.record)
    lib.checkRate(profile)
    e.record.set("author_name", profile.get("public_name"))
    e.record.set("status", "pending")
    e.record.set("kind", "article")
    e.record.set("moderation_note", "")
  }
  e.next()
}, "news_posts")

onRecordUpdateRequest((e) => {
  const callerRole = e.auth ? e.auth.get("role") : ""
  const isAdmin = e.hasSuperuserAuth() || callerRole === "admin"
  if (!isAdmin && e.record.get("author_profile_id")) {
    const lib = require(`${__hooks}/news_blog_lib.js`)
    const profile = lib.loadAuthor(e.record, e.auth ? e.auth.id : "")
    lib.checkContent(e.record)
    e.record.set("author_name", profile.get("public_name"))
    // повторная отправка после отказа/правка на модерации: частота не
    // проверяется, статус всегда pending, прежняя причина отказа снимается
    e.record.set("status", "pending")
    e.record.set("moderation_note", "")
  }
  e.next()
}, "news_posts")
