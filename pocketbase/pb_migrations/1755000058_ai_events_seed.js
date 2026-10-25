/// <reference path="../pb_data/types.d.ts" />

// Первые реальные события для /events (не демо): даты, площадки и цены
// сверены с сайтами организаторов и афишами 2026-09-27, в source_note у
// каждого записано, откуда взято. Поля, которых организатор не опубликовал,
// оставлены пустыми, а не выдуманы. Все события опубликованы; дальше ими
// управляют через /admin, вкладка «AI-события».
//
// Откат: down удаляет ровно эти записи по slug, остальные события не трогает.
const D = (s) => s + " 00:00:00.000Z"
const CHECK = "Данные сверены с сайтом организатора 2026-09-27."

const EVENTS = [
  {
    slug: "ai-journey-2026",
    title: "AI Journey 2026",
    short_description: "Международная конференция по ИИ: три дня про общество, бизнес и науку. Организатор Сбербанк, гибридный формат.",
    description: "AI Journey проходит в Москве 25–27 ноября 2026 года. День общества (ИИ в повседневной жизни), день бизнеса (какие возможности дают технологии ИИ) и день науки (последние достижения научного сообщества). Есть специальные треки: AIJ Deep Dive для специалистов по ИИ, AIJ Junior и AIJ ESG. Заявки спикеров и партнёров принимаются на сайте конференции.",
    event_type: "conference", format: "hybrid", start_date: D("2026-11-25"), end_date: D("2026-11-27"),
    city: "Москва", address: "ул. Вавилова, 19", organizer: "Сбербанк",
    official_url: "https://aij.ru/", price_type: "on_request",
    categories: ["ai-agents", "prompt-engineering", "ai-analytics"], speakers_wanted: true,
    source_note: CHECK,
  },
  {
    slug: "ai-konfa-2026",
    title: "ИИ КОНФА 2026",
    short_description: "Практическая конференция по нейросетям для бизнеса: 6 залов, 100+ спикеров, выставка и мастер-классы.",
    description: "Практическая конференция по применению нейросетей и ИИ, 16 ноября 2026, Москва, кластер «Ломоносов». Шесть направлений: ИИ для бизнеса и руководителей, в маркетинге и контенте, в клиентском сервисе и продажах, в HR и управлении командами, в бэк-офисе, практические мастер-классы. Заявлено более 100 спикеров, 30+ партнёров и 800+ участников. Билеты: Standard 10 000 ₽, Pro 15 000 ₽, Pro Plus 12 000 ₽ при покупке от 3 билетов.",
    event_type: "conference_expo", format: "offline", start_date: D("2026-11-16"),
    city: "Москва", venue: "Кластер «Ломоносов»", organizer: "B-FORUMS",
    official_url: "https://ai-confa.ru/", registration_url: "https://b-forums.timepad.ru/event/4082447/",
    price_type: "paid", price_from: 10000,
    categories: ["ai-agents", "chatbots", "crm-ai", "ai-video"],
    source_note: CHECK,
  },
  {
    slug: "global-tech-forum-2026",
    title: "GLOBAL TECH FORUM 2026",
    short_description: "Конференция с выставкой об автоматизации бизнеса и ИИ: 7 потоков, 100+ партнёров. Москва, 16 октября.",
    description: "IT-решения для бизнеса: цифровая трансформация и автоматизация. 16 октября 2026, 09:00–19:00, Москва, кластер «Ломоносов». Потоки: Global Digitization & AI, кибербезопасность, искусственный интеллект, облачные технологии, цифровизация маркетинга и продаж, управление персоналом, роботизация производства, цифровизация клиентского сервиса. Билеты: Standard 14 000 ₽ (обычная цена 20 000 ₽), Pro 21 000 ₽, Business 42 000 ₽.",
    event_type: "conference_expo", format: "offline", start_date: D("2026-10-16"), time_note: "09:00–19:00",
    city: "Москва", venue: "Кластер «Ломоносов»", organizer: "Global Tech Forum",
    official_url: "https://globaltechforum.ru/", registration_url: "https://globaltechforum.ru/ticket",
    price_type: "paid", price_from: 14000,
    categories: ["ai-agents", "chatbots", "crm-ai"],
    source_note: CHECK,
  },
  {
    slug: "stachka-spb-2026",
    title: "Стачка Питер 2026",
    short_description: "Профессиональная IT-конференция, тема года: AI-практики для IT-индустрии. Санкт-Петербург, 3–4 октября.",
    description: "XVI профессиональная IT-конференция «Стачка», 3–4 октября 2026, Санкт-Петербург, отель Cosmos Санкт-Петербург Прибалтийская (ул. Кораблестроителей, 14). Тема: как внедрять ИИ в процессы компании, кейсы и инструменты, как ИИ меняет продукты, команды и бизнес-модели. Заявлено 1500+ участников из 150+ компаний. Формат очный, есть онлайн-билет. Цены до 1 октября: Standard от 24 900 ₽ для частных лиц и 35 900 ₽ для организаций.",
    event_type: "conference", format: "hybrid", start_date: D("2026-10-03"), end_date: D("2026-10-04"),
    city: "Санкт-Петербург", venue: "Cosmos Санкт-Петербург Прибалтийская", address: "ул. Кораблестроителей, 14", organizer: "ООО «Стачка»",
    official_url: "https://spb.nastachku.ru/", registration_url: "https://spb.nastachku.ru/stranitsa-bilety",
    price_type: "paid", price_from: 24900,
    categories: ["ai-agents", "prompt-engineering"],
    source_note: CHECK,
  },
  {
    slug: "tech-week-2026",
    title: "TECH WEEK 2026",
    short_description: "Конференция об инновационных технологиях в бизнесе: ИИ для бизнеса, автоматизация, кибербезопасность. Москва, ВДНХ.",
    description: "18–19 ноября 2026, Москва, Бизнес.Техноград на ВДНХ (пр-т Мира, 119, стр. 38). Конференция и выставка: заявлено 2500 участников, 280 спикеров, 50 экспонентов, 12 параллельных потоков. Темы: искусственный интеллект для бизнеса, цифровая трансформация, автоматизация, финтех, кибербезопасность, маркетинг, ритейл, облачные технологии. Цены на сайте не опубликованы.",
    event_type: "conference_expo", format: "hybrid", start_date: D("2026-11-18"), end_date: D("2026-11-19"),
    city: "Москва", venue: "Бизнес.Техноград, ВДНХ, павильон 38", address: "пр-т Мира, 119, стр. 38",
    official_url: "https://techweek.moscow/", price_type: "on_request",
    categories: ["ai-agents", "crm-ai", "ai-analytics"],
    source_note: CHECK,
  },
  {
    slug: "the-trends-2026",
    title: "THE TRENDS 2026",
    short_description: "Международное бизнес-событие про инвестиции и технологии, 10 конференций, среди них Top AI. Москва, 17–19 ноября.",
    description: "17–19 ноября 2026, Москва, пр-т Мира, 119. Бизнес-форум из 10 конференций: Web3 Capital, 7TIX Conf, Investor Games, BRICS INNO, PR Summit, KS-EXPO, GovTech Future, Moscow Trading Week, Top AI и одна закрытая. Заявлено 250+ спикеров, 80 стендов, 2100 компаний. Для тематики ИИ интересна конференция Top AI. Цены билетов на главной странице не указаны.",
    event_type: "conference_expo", format: "offline", start_date: D("2026-11-17"), end_date: D("2026-11-19"),
    city: "Москва", address: "пр-т Мира, 119", organizer: "ATF Media",
    official_url: "https://thetrends.tech/", price_type: "on_request",
    categories: ["ai-agents"], exhibitors_wanted: true,
    source_note: CHECK,
  },
  {
    slug: "ai-v-obrazovanii-2026",
    title: "Искусственный интеллект в образовании 2026",
    short_description: "Конференция для руководителей школ, колледжей и вузов: внедрение ИИ, документооборот, 152-ФЗ. Москва, 19–20 ноября.",
    description: "19–20 ноября 2026, Москва, отель «Гамма» (Измайловское шоссе, 71). Первый день очный, второй онлайн-интерактивный. Спецпроект форума «Образование 2027». Около 25 тем: цифровая среда, защита персональных данных, локальные акты по ИИ, автоматизация документооборота, выбор и закупка российских ИИ-инструментов, первые 90 дней внедрения. Участникам дают доступ к двум онлайн-курсам. Мероприятие для руководителей образовательных организаций и их заместителей.",
    event_type: "conference", format: "hybrid", start_date: D("2026-11-19"), end_date: D("2026-11-20"),
    city: "Москва", venue: "Отель «Гамма»", address: "Измайловское шоссе, 71", organizer: "ГОСЭКСПЕРТ.РФ",
    official_url: "https://eduforumrussia.ru/ai", price_type: "on_request",
    categories: ["prompt-engineering", "ai-agents"],
    source_note: CHECK,
  },
  {
    slug: "ai-v-hr-2026",
    title: "ИИ в HR 2026",
    short_description: "Конференция по нейросетям для HR: кейсы, мастер-классы по промптам и созданию ИИ-помощников. Москва, 30 сентября.",
    description: "30 сентября 2026, начало в 10:00, Москва, Бизнес.Техноград на ВДНХ (пр-т Мира, 119, стр. 38). В программе кейсы и реальный опыт применения ИИ в HR, обзоры возможностей нейросетей, мастер-классы по написанию промптов и созданию ИИ-помощников, нетворкинг. Стоимость участия от 10 000 ₽ по данным афиши.",
    event_type: "conference", format: "offline", start_date: D("2026-09-30"), time_note: "10:00",
    city: "Москва", venue: "Бизнес.Техноград, ВДНХ, павильон 38", address: "пр-т Мира, 119, стр. 38", organizer: "B-FORUMS",
    official_url: "https://b-forums.ru/", price_type: "paid", price_from: 10000,
    categories: ["prompt-engineering", "ai-agents"],
    source_note: "Данные из афиши ICT2Go и All-Events, проверены 2026-09-27; цена и площадка уточняйте у организатора.",
  },
  {
    slug: "bolshaya-ii-konferentsiya-2",
    title: "Большая ИИ-конференция 2.0",
    short_description: "Онлайн-конференция: 20 минут, один кейс, конкретный результат ИИ в маркетинге, продажах, сервисе и аналитике.",
    description: "Онлайн, 29 сентября 2026, 09:00 по Москве. Каждый спикер разбирает реальную задачу из своей практики и показывает, какую роль в её решении сыграл ИИ. Темы: маркетинг и реклама, контент, продажи, аналитика, внутренние процессы, клиентский сервис. Организатор Jivo. Участие бесплатное по данным афиши.",
    event_type: "conference", format: "online", start_date: D("2026-09-29"), time_note: "09:00 МСК",
    online_platform: "Онлайн-трансляция", organizer: "Jivo",
    official_url: "https://promo.jivo.ru/big-conf-ai", registration_url: "https://promo.jivo.ru/big-conf-ai",
    price_type: "free",
    categories: ["ai-analytics", "crm-ai", "chatbots"],
    source_note: "Данные из афиши ICT2Go и All-Events, проверены 2026-09-27.",
  },
  {
    slug: "fall-into-ml-2026",
    title: "Fall into ML 2026 (Погружение в машинное обучение)",
    short_description: "Пятая конференция ФКН НИУ ВШЭ по машинному обучению: генеративные модели, LLM, обучение с подкреплением. Москва, 23–24 октября.",
    description: "23–24 октября 2026, Москва, Центр культур НИУ ВШЭ (Покровский бульвар, 11, стр. 6). Организатор: Институт искусственного интеллекта и цифровых наук факультета компьютерных наук ВШЭ. Программа охватывает генеративное моделирование, диффузионные модели, большие языковые модели, обучение с подкреплением, компьютерное зрение, робототехнику. Для исследователей и разработчиков.",
    event_type: "conference", format: "offline", start_date: D("2026-10-23"), end_date: D("2026-10-24"),
    city: "Москва", venue: "Центр культур НИУ ВШЭ", address: "Покровский бульвар, 11, стр. 6",
    organizer: "НИУ ВШЭ, ФКН", official_url: "https://www.hse.ru/news/expertise/1199663481.html", price_type: "on_request",
    categories: ["prompt-engineering", "ai-analytics"],
    source_note: "Данные из пресс-релиза ВШЭ и афиши, проверены 2026-09-27; отдельного сайта конференции не нашли.",
  },
  {
    slug: "conversations-2026",
    title: "Conversations 2026",
    short_description: "Конференция Just AI по генеративному ИИ: AI-агенты, голосовые агенты и AI-операторы, экономика внедрения. Москва, 2 декабря.",
    description: "2 декабря 2026, 10:00–18:00, Москва, Soluxe Hotel Moscow (ул. Вильгельма Пика, 16), очно и онлайн. Организатор Just AI. Бизнес-трек: экономика внедрения и владения ИИ, вайбкодинг для внутренних процессов, голосовые агенты и AI-операторы. Продуктовый и технологический трек: эксплуатация агентов, инженерия голосового ИИ, безопасность агентных систем. Заявлено 35+ спикеров и 600+ участников.",
    event_type: "conference", format: "hybrid", start_date: D("2026-12-02"), time_note: "10:00–18:00",
    city: "Москва", venue: "Soluxe Hotel Moscow", address: "ул. Вильгельма Пика, 16", organizer: "Just AI",
    official_url: "https://conversations-ai.com/", price_type: "on_request",
    categories: ["ai-agents", "voice-ai", "chatbots"],
    source_note: CHECK,
  },
  {
    slug: "rossiyskie-crm-sistemy-2026",
    title: "Российские CRM-системы 2026",
    short_description: "Конференция CNews про рынок отечественных CRM, интеграцию ИИ и миграцию с зарубежных продуктов. 3 декабря.",
    description: "3 декабря 2026, очная конференция CNews Conferences. Обсуждают развитие российского рынка CRM, внедрение ИИ и машинного обучения, функциональность отечественных решений, сложности внедрения и прогноз на 3–5 лет. Для представителей клиентских компаний участие бесплатно (по подтверждению организатора), для ИТ-компаний, телекома и консалтинга 24 000 ₽. Площадка на странице не указана, уточняйте у организатора.",
    event_type: "conference", format: "offline", start_date: D("2026-12-03"),
    city: "Москва", organizer: "CNews Conferences",
    official_url: "https://www.cnconf.ru/events/rossiiskie_crm_sistemy_2026.shtml", price_type: "paid", price_from: 24000,
    categories: ["crm-ai", "ai-agents"], speakers_wanted: true,
    source_note: "Данные со страницы CNews Conferences, проверены 2026-09-27; город по афишам, площадка не опубликована.",
  },
  {
    slug: "bolshie-dannye-i-bi-2026",
    title: "Большие данные и BI: новая архитектура решений в эпоху ИИ",
    short_description: "Конференция CNews про рынок больших данных, импортозамещение BI и результаты аналитики на данных. 1 декабря.",
    description: "1 декабря 2026, конференция CNews Conferences. Темы: динамика российского рынка больших данных до 2030 года, импортозамещение и миграция с зарубежных BI-инструментов, технологическая инфраструктура, барьеры и риски внедрения аналитики, бизнес-результат и окупаемость. Для представителей заказчиков участие бесплатно (по подтверждению организатора), для ИТ-компаний, телекома и консалтинга 24 000 ₽.",
    event_type: "conference", format: "offline", start_date: D("2026-12-01"),
    city: "Москва", organizer: "CNews Conferences",
    official_url: "https://www.cnconf.ru/events/bolshie_dannye_i_bi__novaya_arhitektura_reshenii_v_epohu_ii.shtml", price_type: "paid", price_from: 24000,
    categories: ["ai-analytics"], speakers_wanted: true,
    source_note: "Данные со страницы CNews Conferences, проверены 2026-09-27; город по афишам, площадка не опубликована.",
  },
]

migrate((app) => {
  const collection = app.findCollectionByNameOrId("ai_events")
  for (const item of EVENTS) {
    let exists = true
    try {
      app.findFirstRecordByData("ai_events", "slug", item.slug)
    } catch (err) {
      exists = false
    }
    if (exists) continue
    const record = new Record(collection)
    for (const key in item) record.set(key, item[key])
    record.set("status", "published")
    record.set("placement", "basic")
    record.set("reg_clicks", 0)
    app.save(record)
  }
}, (app) => {
  for (const item of EVENTS) {
    try {
      app.delete(app.findFirstRecordByData("ai_events", "slug", item.slug))
    } catch (err) {
      // уже удалена
    }
  }
})
