/// <reference path="../pb_data/types.d.ts" />

// Публичная копия текста объявления: public_text = description, где контакты
// (телефоны, e-mail, @ники, ссылки) заменены на «[контакты скрыты]». Её
// отдаёт публичная view-коллекция job_posts_public (страница /orders для
// всех, миграция 1755000069) — сам description и данные заказчика видят
// только специалисты/автор/админ. Пересчитывается при каждом сохранении
// объявления, так что правка описания не оставляет в public_text старых
// контактов. Обработчики JSVM изолированы — функция определена внутри.

onRecordCreate((e) => {
  const mask = (text) => {
    let t = String(text || "")
    t = t.replace(/https?:\/\/\S+/gi, "[контакты скрыты]")
    t = t.replace(/\bwww\.\S+/gi, "[контакты скрыты]")
    t = t.replace(/t\.me\/\S+/gi, "[контакты скрыты]")
    t = t.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[контакты скрыты]")
    t = t.replace(/@[a-zA-Z0-9_]{4,}/g, "[контакты скрыты]")
    t = t.replace(/\+?\d[\d\s\-()]{7,}\d/g, "[контакты скрыты]")
    return t
  }
  e.record.set("public_text", mask(e.record.get("description")))
  e.next()
}, "job_posts")

onRecordUpdate((e) => {
  const mask = (text) => {
    let t = String(text || "")
    t = t.replace(/https?:\/\/\S+/gi, "[контакты скрыты]")
    t = t.replace(/\bwww\.\S+/gi, "[контакты скрыты]")
    t = t.replace(/t\.me\/\S+/gi, "[контакты скрыты]")
    t = t.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[контакты скрыты]")
    t = t.replace(/@[a-zA-Z0-9_]{4,}/g, "[контакты скрыты]")
    t = t.replace(/\+?\d[\d\s\-()]{7,}\d/g, "[контакты скрыты]")
    return t
  }
  e.record.set("public_text", mask(e.record.get("description")))
  e.next()
}, "job_posts")
