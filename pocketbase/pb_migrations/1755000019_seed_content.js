/// <reference path="../pb_data/types.d.ts" />

// Наполняет живую базу реальными записями по содержимому мок-данных
// фронтенда (web/src/data/*.ts) — 2026-08-24, часть перехода с моков на
// живые данные (см. STATUS.md). Специалисты — демо-аккаунты для
// первичного наполнения каталога, не настоящие люди; пароль общий и
// временный, сменить/удалить, когда появятся реальные специалисты.
const SEED_PASSWORD = "NaidiiSeed2026!"

migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  const categories = app.findCollectionByNameOrId("categories")
  const resultTypes = app.findCollectionByNameOrId("result_types")
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  const services = app.findCollectionByNameOrId("services")
  const promotions = app.findCollectionByNameOrId("promotions")

  // --- categories ---
  {
    const record = new Record(categories, {
      name: "AI-агенты",
      slug: "ai-agents",
      seo_title: "AI-агенты для продаж и поддержки — специалисты | НайдИИ",
      seo_description: "Найдите специалиста по AI-агентам: боты для продаж, поддержки и HR, которые обрабатывают заявки и квалифицируют лидов без участия человека.",
      h1: "AI-агенты для продаж и поддержки",
      description: "AI-агент — это не просто чат-бот со скриптом, а модель, которая понимает контекст диалога, подтягивает данные из CRM и доводит клиента до сделки или передаёт сложный случай менеджеру. Специалисты этого направления проектируют такие сценарии под конкретный бизнес-процесс — от первого касания до закрытия заявки.",
      faq: [{"question":"Чем AI-агент отличается от обычного чат-бота?","answer":"Обычный бот работает по жёсткому дереву сценариев. AI-агент понимает свободную речь, держит контекст всего диалога и может сам решить, когда передать разговор человеку."},{"question":"Сколько стоит внедрение AI-агента?","answer":"Зависит от сложности интеграций с вашими системами — у специалистов на площадке цены начинаются от 60 000 ₽ за проект, финальную стоимость озвучивает исполнитель после брифа."},{"question":"Нужно ли менять текущую CRM?","answer":"Нет, специалисты обычно встраивают агента поверх существующей CRM и мессенджеров, не меняя привычный интерфейс для команды."}],
      sort_order: 0,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "RAG / базы знаний",
      slug: "rag",
      seo_title: "RAG и корпоративные базы знаний — специалисты | НайдИИ",
      seo_description: "Специалисты по RAG строят поиск по внутренним документам компании с помощью LLM — ответы со ссылкой на источник вместо ручного поиска по папкам.",
      h1: "RAG и корпоративные базы знаний",
      description: "RAG (Retrieval-Augmented Generation) позволяет модели отвечать на вопросы по вашим документам — регламентам, базе поддержки, договорам — со ссылкой на конкретный источник. Это снижает риск галлюцинаций и экономит часы на поиске информации вручную.",
      faq: [{"question":"Какие документы можно загрузить в RAG-систему?","answer":"Практически любые текстовые форматы: PDF, Word, вики-страницы, экспорт из Confluence или Notion. Специалист поможет подготовить и разметить корпус документов."},{"question":"Модель может ошибиться и придумать ответ?","answer":"Риск ниже, чем у обычной модели без RAG, так как ответ строится на найденных фрагментах документов со ссылкой на источник — это можно проверить."},{"question":"Подходит ли RAG для конфиденциальных данных?","answer":"Да, специалисты могут развернуть решение на закрытой инфраструктуре заказчика, без передачи документов во внешние сервисы."}],
      sort_order: 1,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "No-code оркестрация",
      slug: "orchestration",
      seo_title: "No-code автоматизация n8n, Make, Zapier — специалисты | НайдИИ",
      seo_description: "Специалисты по n8n, Make, Zapier и Albato связывают сервисы и AI-модели в единые сценарии автоматизации без написания кода.",
      h1: "No-code оркестрация процессов",
      description: "No-code оркестраторы связывают разрозненные сервисы — сайт, CRM, таблицы, мессенджеры — в единый сценарий, куда можно встроить и AI-модель для классификации или обогащения данных. Специалисты этого направления собирают такие сценарии быстро и без миграции на новую инфраструктуру.",
      faq: [{"question":"Чем n8n отличается от Zapier и Make?","answer":"Это похожие по идее инструменты с разными ценами, лимитами и возможностью самостоятельного размещения (n8n можно развернуть на своём сервере). Специалист подберёт подходящий под ваш бюджет и задачи."},{"question":"Можно ли встроить в сценарий свою нейросеть?","answer":"Да, оркестраторы легко подключаются к любому AI по API — от OpenAI до собственных моделей заказчика."},{"question":"Что если один из сервисов в цепочке изменит API?","answer":"Специалисты, как правило, предлагают и последующее сопровождение сценариев на случай таких изменений — уточняйте это при обсуждении проекта."}],
      sort_order: 2,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "Чат-боты / мессенджеры",
      slug: "chatbots",
      seo_title: "AI чат-боты для Telegram и WhatsApp — специалисты | НайдИИ",
      seo_description: "Разработчики Telegram- и WhatsApp-ботов с LLM внутри: продажи, запись на услуги и поддержка клиентов 24/7.",
      h1: "AI-боты для Telegram и WhatsApp",
      description: "В отличие от кнопочных ботов, AI-бот с LLM внутри ведёт живой диалог: отвечает на нестандартные вопросы, оформляет заказ и подсказывает следующий шаг. Специалисты этого направления пишут таких ботов под конкретный сценарий — продажи, запись на услуги, поддержку.",
      faq: [{"question":"На какой платформе лучше делать бота — Telegram или WhatsApp?","answer":"Зависит от аудитории: для России и СНГ чаще выбирают Telegram, для международной аудитории — WhatsApp. Многие специалисты делают ботов сразу под обе платформы."},{"question":"Бот сможет принимать оплату?","answer":"Да, подключение платёжных систем — стандартная часть работы над ботом для продаж."},{"question":"Что происходит, если бот не может ответить на вопрос?","answer":"Хороший AI-бот распознаёт такие случаи и передаёт диалог живому оператору вместо того, чтобы придумывать ответ."}],
      sort_order: 3,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "Голосовые AI-агенты",
      slug: "voice-ai",
      seo_title: "Голосовые AI-агенты для колл-центра — специалисты | НайдИИ",
      seo_description: "Специалисты по голосовым AI-агентам внедряют автоматический приём и обзвон звонков — без операторов, с живой естественной речью.",
      h1: "Голосовые AI-агенты для звонков",
      description: "Голосовой AI-агент принимает или совершает звонки, понимает свободную речь собеседника и держит контекст разговора — для приёма заявок, обзвона базы или подтверждения записи. Специалисты интегрируют такие решения с телефонией и CRM заказчика.",
      faq: [{"question":"Голос агента звучит как робот?","answer":"Современные голосовые модели звучат близко к живой речи — многие клиенты не сразу понимают, что говорят с AI."},{"question":"Можно ли использовать голосового агента для исходящих звонков?","answer":"Да, это одно из основных применений — обзвон базы с подтверждением записи или актуализацией данных."},{"question":"Что если клиент задаст неожиданный вопрос?","answer":"Агент передаёт сложные случаи живому оператору — это закладывается в сценарий на этапе разработки."}],
      sort_order: 4,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "AI-видео и контент",
      slug: "ai-video",
      seo_title: "AI-видео и генеративный контент — специалисты | НайдИИ",
      seo_description: "Специалисты по AI-видео делают рекламные и обучающие ролики на нейросетях: AI-аватары, генерация видео, синтез речи и монтаж.",
      h1: "AI-видео и генеративный контент",
      description: "Генеративные нейросети позволяют делать рекламные и обучающие ролики без съёмочной группы: AI-аватары вместо диктора, синтезированная озвучка, автоматический монтаж. Специалисты этого направления берут на себя весь цикл — от сценария до готового видео под нужный формат.",
      faq: [{"question":"Чем AI-аватар отличается от обычной анимации?","answer":"AI-аватар выглядит и говорит как реальный человек — с мимикой и синхронизацией губ под озвучку, похоже на обычную съёмку с диктором."},{"question":"Можно ли сделать видео на нескольких языках?","answer":"Да, один и тот же ролик можно быстро адаптировать под другой язык — переозвучка и синхронизация делаются нейросетью."},{"question":"Подходит ли AI-видео для рекламы в соцсетях?","answer":"Это одно из самых частых применений — короткие ролики для соцсетей и маркетплейсов, где важна скорость и низкая стоимость производства."}],
      sort_order: 5,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "AI над CRM / учётными системами",
      slug: "crm-ai",
      seo_title: "AI-автоматизация amoCRM, Битрикс24, 1С — специалисты | НайдИИ",
      seo_description: "Специалисты встраивают AI-логику в amoCRM, Битрикс24 и 1С: автозаполнение карточек, скоринг лидов, умные напоминания менеджерам.",
      h1: "AI-слой поверх CRM и учётных систем",
      description: "Вместо замены привычной CRM специалисты этого направления добавляют в неё AI-логику: автоматическое заполнение карточек из переписки, приоритизацию горячих лидов, умные напоминания. Команда продолжает работать в знакомом интерфейсе — AI работает в фоне.",
      faq: [{"question":"Нужно ли менять CRM на новую?","answer":"Нет, специалисты встраивают AI-функциональность в вашу текущую систему — amoCRM, Битрикс24, 1С — без миграции данных."},{"question":"Что такое AI-скоринг лидов?","answer":"Модель анализирует поведение и переписку с клиентом и расставляет приоритеты, кому из лидов менеджеру стоит перезвонить в первую очередь."},{"question":"Насколько это безопасно для данных клиентов?","answer":"Работа идёт в рамках вашей CRM и её собственных прав доступа — специалист не выгружает данные во внешние базы без согласования."}],
      sort_order: 6,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "Промпт-инжиниринг / файнтюнинг",
      slug: "prompt-engineering",
      seo_title: "Промпт-инжиниринг и файнтюнинг LLM — специалисты | НайдИИ",
      seo_description: "Специалисты по промпт-инжинирингу и файнтюнингу доводят качество ответов LLM до продакшн-уровня и снижают стоимость запросов.",
      h1: "Промпт-инжиниринг и файнтюнинг LLM",
      description: "Качество ответов модели сильно зависит от того, как её настроить: системные промпты, few-shot примеры, а для узких задач — дообучение (файнтюнинг) на своих данных. Специалисты этого направления доводят точность ответов до уровня, пригодного для продакшена, и часто снижают расходы на API за счёт перехода на модель меньшего размера.",
      faq: [{"question":"Что лучше — промпт-инжиниринг или файнтюнинг?","answer":"Обычно начинают с промптов — это быстрее и дешевле. Файнтюнинг имеет смысл, когда задача узкая и повторяющаяся, а промптами нужного качества уже не добиться."},{"question":"Нужны ли свои данные для файнтюнинга?","answer":"Да, понадобится датасет примеров под вашу задачу — специалист поможет его собрать и разметить, если готового набора нет."},{"question":"Файнтюнинг снижает расходы на модель?","answer":"Часто да — дообученная маленькая модель может заменить дорогой запрос к большой модели без потери качества на конкретной задаче."}],
      sort_order: 7,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "AI-аналитика и отчётность",
      slug: "ai-analytics",
      seo_title: "AI-аналитика и дашборды с инсайтами — специалисты | НайдИИ",
      seo_description: "Специалисты строят дашборды с AI-инсайтами поверх данных бизнеса: прогнозы, аномалии и отчёты на естественном языке.",
      h1: "AI-аналитика и умные дашборды",
      description: "AI-слой поверх обычного дашборда умеет находить аномалии, строить прогнозы и отвечать на вопросы о данных на естественном языке — без ручных SQL-запросов. Специалисты собирают данные из разрозненных источников и настраивают такую аналитику под ключевые метрики бизнеса.",
      faq: [{"question":"Из каких источников можно собрать данные?","answer":"CRM, таблицы, рекламные кабинеты, базы данных — специалист поможет подключить нужные источники в единый дашборд."},{"question":"Руководитель сможет сам задавать вопросы дашборду?","answer":"Да, часть решений позволяет спрашивать «почему упали продажи» на обычном языке и получать содержательный ответ вместо графика без объяснений."},{"question":"Как часто обновляются данные?","answer":"Периодичность обновления настраивается под задачу — от реального времени до ежедневных или еженедельных отчётов."}],
      sort_order: 8,
      active: true,
    })
    app.save(record)
  }
  {
    const record = new Record(categories, {
      name: "Другое",
      slug: "other",
      seo_title: "Специалисты по нестандартным AI-задачам | НайдИИ",
      seo_description: "Специалисты, чьё направление не укладывается в стандартный список — от AI для юридической экспертизы до других нишевых применений искусственного интеллекта.",
      h1: "Специалисты с собственным AI-направлением",
      description: "Рынок AI-автоматизации меняется быстрее, чем любой фиксированный список категорий. Здесь собраны специалисты, которые сами описали свою нишу — если направление наберёт достаточно исполнителей и запросов, оно станет отдельной категорией на площадке.",
      faq: [{"question":"Почему у этих специалистов нет конкретной категории?","answer":"Их направление ещё слишком узкое или новое, чтобы выделять под него отдельную категорию — но задача от этого не менее реальная."},{"question":"Как понять, подходит ли специалист под мою задачу?","answer":"Загляните в описание профиля — там специалист сам объясняет, чем занимается и какие задачи решает."},{"question":"Может ли моё направление тоже попасть в этот список?","answer":"Да, при размещении карточки можно описать своё направление, даже если его нет в стандартном списке категорий."}],
      sort_order: 9,
      active: true,
    })
    app.save(record)
  }

  // --- result_types ---
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-agents" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Продажи и заявки",
      title: "Продающий AI-агент для сайта/Telegram",
      slug: "ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt",
      scope_label: "1 сценарий воронки",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-agents" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Продажи и заявки",
      title: "AI-агент квалификации лидов для CRM",
      slug: "ai-agents-prodazhi-i-zayavki-ai-agent-kvalifikacii-lidov-dly",
      scope_label: "до 5 сценариев квалификации",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-agents" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Поддержка клиентов",
      title: "AI-агент поддержки 24/7 с эскалацией на человека",
      slug: "ai-agents-podderzhka-klientov-ai-agent-podderzhki-247-s-eska",
      scope_label: "до 10 типовых вопросов",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-agents" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Поддержка клиентов",
      title: "Аудит существующего AI-агента с планом доработки",
      slug: "ai-agents-podderzhka-klientov-audit-suschestvuyuschego-ai-ag",
      scope_label: "1 агент, письменный отчёт",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-agents" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "HR и рекрутинг",
      title: "AI-агент для HR (первичный скрининг кандидатов)",
      slug: "ai-agents-hr-i-rekruting-ai-agent-dlya-hr-pervichnyy-skrinin",
      scope_label: "до 3 вакансий",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-agents" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "HR и рекрутинг",
      title: "AI-агент онбординга новых сотрудников",
      slug: "ai-agents-hr-i-rekruting-ai-agent-onbordinga-novyh-sotrudnik",
      scope_label: "1 сценарий адаптации",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "rag" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Корпоративные базы знаний",
      title: "База знаний с RAG-поиском по документам компании",
      slug: "rag-korporativnye-bazy-znaniy-baza-znaniy-s-rag-poiskom-po-d",
      scope_label: "до 500 документов",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "rag" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Корпоративные базы знаний",
      title: "Обновление и переиндексация существующей RAG-базы",
      slug: "rag-korporativnye-bazy-znaniy-obnovlenie-i-pereindeksaciya-s",
      scope_label: "до 1000 документов",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "rag" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "RAG для ботов поддержки",
      title: "Интеграция RAG в существующего бота поддержки",
      slug: "rag-rag-dlya-botov-podderzhki-integraciya-rag-v-suschestvuyu",
      scope_label: "1 источник данных",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "rag" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "RAG для ботов поддержки",
      title: "RAG поверх базы FAQ и тикетов поддержки",
      slug: "rag-rag-dlya-botov-podderzhki-rag-poverh-bazy-faq-i-tiketov-",
      scope_label: "до 300 тикетов",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "rag" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Юридический AI-анализ",
      title: "RAG-консультант для юридической проверки договоров",
      slug: "rag-yuridicheskiy-ai-analiz-rag-konsultant-dlya-yuridichesko",
      scope_label: "до 50 шаблонов договоров",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "orchestration" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Автоматизация процессов",
      title: "Сценарий автоматизации под конкретную задачу",
      slug: "orchestration-avtomatizaciya-processov-scenariy-avtomatizaci",
      scope_label: "1 сквозной процесс",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "orchestration" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Автоматизация процессов",
      title: "Автоматизация приёма и обработки заявок между сервисами",
      slug: "orchestration-avtomatizaciya-processov-avtomatizaciya-priema",
      scope_label: "1 воронка заявок",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "orchestration" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Миграция между платформами",
      title: "Перенос workflow с Zapier на n8n (self-hosted)",
      slug: "orchestration-migraciya-mezhdu-platformami-perenos-workflow-",
      scope_label: "до 10 сценариев",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "orchestration" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Миграция между платформами",
      title: "Аудит и оптимизация существующих сценариев",
      slug: "orchestration-migraciya-mezhdu-platformami-audit-i-optimizac",
      scope_label: "до 10 сценариев, отчёт",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "orchestration" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Отчётность и таблицы",
      title: "Автоматизация отчётности в Google Sheets/таблицы",
      slug: "orchestration-otchetnost-i-tablicy-avtomatizaciya-otchetnost",
      scope_label: "1 регулярный отчёт",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "orchestration" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Отчётность и таблицы",
      title: "Ежемесячное сопровождение и доработка сценариев",
      slug: "orchestration-otchetnost-i-tablicy-ezhemesyachnoe-soprovozhd",
      scope_label: "до 5 правок в месяц",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "chatbots" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Продающие боты",
      title: "Telegram-бот с AI-консультантом и оплатой",
      slug: "chatbots-prodayuschie-boty-telegram-bot-s-ai-konsultantom-i-",
      scope_label: "1 сценарий продаж",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "chatbots" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Продающие боты",
      title: "Аудит конверсии существующего бота",
      slug: "chatbots-prodayuschie-boty-audit-konversii-suschestvuyuscheg",
      scope_label: "1 бот, отчёт с рекомендациями",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "chatbots" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Запись и бронирование",
      title: "Бот записи на услуги с напоминаниями",
      slug: "chatbots-zapis-i-bronirovanie-bot-zapisi-na-uslugi-s-napomin",
      scope_label: "до 3 типов услуг",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "chatbots" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Поддержка в мессенджерах",
      title: "Перенос Telegram-бота на WhatsApp",
      slug: "chatbots-podderzhka-v-messendzherah-perenos-telegram-bota-na",
      scope_label: "1 бот",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "chatbots" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Поддержка в мессенджерах",
      title: "Бот поддержки клиентов с эскалацией на оператора",
      slug: "chatbots-podderzhka-v-messendzherah-bot-podderzhki-klientov-",
      scope_label: "до 10 типовых вопросов",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "voice-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Приём звонков",
      title: "Голосовой агент для приёма входящих заявок",
      slug: "voice-ai-priem-zvonkov-golosovoy-agent-dlya-priema-vhodyasch",
      scope_label: "1 сценарий, интеграция с телефонией",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "voice-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Приём звонков",
      title: "Замена IVR-меню на голосового агента",
      slug: "voice-ai-priem-zvonkov-zamena-ivr-menyu-na-golosovogo-agenta",
      scope_label: "1 линия",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "voice-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Исходящий обзвон",
      title: "Обзвон базы с AI-скриптом (подтверждение записи)",
      slug: "voice-ai-ishodyaschiy-obzvon-obzvon-bazy-s-ai-skriptom-podtv",
      scope_label: "до 1000 контактов/мес",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "voice-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "IVR и ресепшн",
      title: "Голосовой агент-ресепшн (переадресация по отделам)",
      slug: "voice-ai-ivr-i-resepshn-golosovoy-agent-resepshn-pereadresac",
      scope_label: "до 5 направлений",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-video" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Рекламные ролики",
      title: "Рекламный ролик с AI-аватаром",
      slug: "ai-video-reklamnye-roliki-reklamnyy-rolik-s-ai-avatarom",
      scope_label: "1 ролик до 60 секунд",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-video" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Shorts/Reels",
      title: "Пакет из 10 Shorts/Reels с AI-монтажом",
      slug: "ai-video-shortsreels-paket-iz-10-shortsreels-s-ai-montazhom",
      scope_label: "до 10 роликов",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-video" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Озвучка и локализация",
      title: "Озвучка и локализация видео на 3 языка",
      slug: "ai-video-ozvuchka-i-lokalizaciya-ozvuchka-i-lokalizaciya-vid",
      scope_label: "1 ролик, 3 языка",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-video" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Обучающее видео",
      title: "Обучающее видео с AI-диктором из текста сценария",
      slug: "ai-video-obuchayuschee-video-obuchayuschee-video-s-ai-diktor",
      scope_label: "до 10 минут",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "crm-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Скоринг лидов",
      title: "AI-скоринг лидов в amoCRM/Битрикс24",
      slug: "crm-ai-skoring-lidov-ai-skoring-lidov-v-amocrmbitriks24",
      scope_label: "1 воронка",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "crm-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Автозаполнение данных",
      title: "Автозаполнение карточек сделок из переписки",
      slug: "crm-ai-avtozapolnenie-dannyh-avtozapolnenie-kartochek-sdelok",
      scope_label: "1 канал (почта/мессенджер)",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "crm-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Автозаполнение данных",
      title: "Интеграция AI-суммаризации звонков в CRM",
      slug: "crm-ai-avtozapolnenie-dannyh-integraciya-ai-summarizacii-zvo",
      scope_label: "1 источник звонков",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "crm-ai" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Напоминания и уведомления",
      title: "AI-напоминания менеджерам о просроченных задачах",
      slug: "crm-ai-napominaniya-i-uvedomleniya-ai-napominaniya-menedzher",
      scope_label: "1 CRM, до 5 триггеров",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "prompt-engineering" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Промпт-инжиниринг",
      title: "Оптимизация промптов существующего AI-продукта",
      slug: "prompt-engineering-prompt-inzhiniring-optimizaciya-promptov-",
      scope_label: "до 10 сценариев",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "prompt-engineering" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Файнтюнинг",
      title: "Файнтюнинг модели под узкую задачу",
      slug: "prompt-engineering-fayntyuning-fayntyuning-modeli-pod-uzkuyu",
      scope_label: "1 датасет, 1 модель",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "prompt-engineering" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Файнтюнинг",
      title: "Сбор и разметка датасета для файнтюнинга",
      slug: "prompt-engineering-fayntyuning-sbor-i-razmetka-dataseta-dlya",
      scope_label: "до 500 примеров",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "prompt-engineering" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Оптимизация расходов на AI",
      title: "Снижение стоимости AI-продукта (переход на меньшую модель)",
      slug: "prompt-engineering-optimizaciya-rashodov-na-ai-snizhenie-sto",
      scope_label: "1 продукт, отчёт по экономии",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-analytics" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "AI-дашборды",
      title: "Дашборд с AI-инсайтами по продажам",
      slug: "ai-analytics-ai-dashbordy-dashbord-s-ai-insaytami-po-prodazh",
      scope_label: "до 3 источников данных",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-analytics" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Отчёты на естественном языке",
      title: "AI-отчёт «спроси на языке» поверх существующих таблиц",
      slug: "ai-analytics-otchety-na-estestvennom-yazyke-ai-otchet-sprosi",
      scope_label: "1 набор данных",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-analytics" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Отчёты на естественном языке",
      title: "Автоматический еженедельный AI-отчёт руководителю",
      slug: "ai-analytics-otchety-na-estestvennom-yazyke-avtomaticheskiy-",
      scope_label: "1 отчёт",
    })
    app.save(record)
  }
  {
    const category = app.findFirstRecordByFilter("categories", "slug = {:slug}", { slug: "ai-analytics" })
    const record = new Record(resultTypes, {
      category_id: category.id,
      subcategory: "Мониторинг и алерты",
      title: "Поиск аномалий в данных с AI-алертами",
      slug: "ai-analytics-monitoring-i-alerty-poisk-anomaliy-v-dannyh-s-a",
      scope_label: "1 метрика, ежедневный мониторинг",
    })
    app.save(record)
  }

  // --- specialists: users + specialist_profiles ---
  {
    const user = new Record(users, {
      email: "specialist-1@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Алексей Морозов",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Алексей Морозов",
      slug: "specialist-1",
      title: "AI-агенты для продаж и поддержки",
      short_description: "Собираю AI-агентов, которые обрабатывают заявки, отвечают на вопросы клиентов и передают тёплых лидов менеджерам.",
      full_description: "Проектирую и внедряю AI-агентов полного цикла: от первого касания с клиентом до передачи готовой сделки менеджеру. Агент понимает контекст диалога, подтягивает данные из CRM и эскалирует сложные случаи на человека. Работаю с готовыми интеграциями (Telegram, WhatsApp, сайт) и настраиваю сценарии под конкретные бизнес-процессы заказчика.",
      city: "Москва",
      remote_work: true,
      experience_years: 4,
      project_rate_from: 60000,
      response_time: "within_hour",
      profile_status: "published",
      verified_status: true,
      rating: 4.6,
      reviews_count: 6,
      completed_orders_count: 34,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-2@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Студия NeuroWorks",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "studio",
      public_name: "Студия NeuroWorks",
      slug: "specialist-2",
      title: "RAG и корпоративные базы знаний",
      short_description: "Строим поиск по внутренним документам компании с RAG — базы знаний, ответы саппорта, юридическая экспертиза текстов.",
      full_description: "Разворачиваем RAG-контур поверх документов заказчика: регламентов, договоров, баз знаний поддержки. Модель отвечает со ссылками на источник, что снижает риск галлюцинаций. Помогаем выбрать векторную БД, настроить пайплайн индексации и обновления документов, интегрируем с внутренними порталами и Telegram.",
      city: "",
      remote_work: true,
      experience_years: 5,
      project_rate_from: 150000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.699999999999999,
      reviews_count: 8,
      completed_orders_count: 21,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-3@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Дмитрий Волков",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Дмитрий Волков",
      slug: "specialist-3",
      title: "No-code оркестрация процессов",
      short_description: "Связываю сервисы и AI-модели в сценарии на n8n и Make — без единой строчки кода, от заявки до отчёта.",
      full_description: "Автоматизирую сквозные процессы через no-code оркестраторы: заявка попадает в CRM, AI-модель классифицирует и обогащает данные, результат уходит в нужный канал — от Telegram-уведомления до отчёта в Google Sheets. Работаю с готовой инфраструктурой заказчика, без миграции на новые сервисы, если это не требуется.",
      city: "Казань",
      remote_work: true,
      experience_years: 3,
      project_rate_from: 35000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.8,
      reviews_count: 10,
      completed_orders_count: 45,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-4@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Ирина Соколова",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Ирина Соколова",
      slug: "specialist-4",
      title: "AI Telegram-боты под ключ",
      short_description: "Пишу Telegram- и WhatsApp-ботов с LLM внутри: продажи, запись на услуги, поддержка 24/7.",
      full_description: "Разрабатываю ботов на Python с интеграцией LLM: от простых сценариев записи до полноценных консультантов, которые ведут диалог и оформляют заказ. Подключаю оплату, CRM и уведомления команде. Передаю исходный код и документацию, поддерживаю после запуска.",
      city: "",
      remote_work: true,
      experience_years: 3,
      project_rate_from: 45000,
      response_time: "within_hour",
      profile_status: "published",
      verified_status: true,
      rating: 4.8999999999999995,
      reviews_count: 12,
      completed_orders_count: 38,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-5@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Студия «Автоматика»",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "studio",
      public_name: "Студия «Автоматика»",
      slug: "specialist-5",
      title: "Голосовые AI-агенты для колл-центра",
      short_description: "Внедряем голосовых AI-агентов для входящих и исходящих звонков — без операторов, с живой речью.",
      full_description: "Строим голосовых агентов на связке STT/LLM/TTS: агент понимает свободную речь, держит контекст разговора и передаёт сложные случаи оператору. Подходит для приёма заявок, обзвона базы, подтверждения записи. Интегрируем с телефонией и CRM заказчика.",
      city: "Санкт-Петербург",
      remote_work: true,
      experience_years: 4,
      project_rate_from: 120000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.6,
      reviews_count: 14,
      completed_orders_count: 27,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-6@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Марина Ким",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Марина Ким",
      slug: "specialist-6",
      title: "AI-видео и генеративный контент",
      short_description: "Делаю рекламные и обучающие ролики на нейросетях: AI-аватары, генерация видео, озвучка и монтаж.",
      full_description: "Произвожу видео с помощью генеративных нейросетей: рекламные ролики, обучающие материалы, контент для соцсетей с AI-аватарами и синтезированной озвучкой. Беру на себя весь цикл — от сценария до финального монтажа, могу адаптировать один ролик под несколько форматов и языков.",
      city: "",
      remote_work: true,
      experience_years: 2,
      project_rate_from: 40000,
      response_time: "within_hour",
      profile_status: "published",
      verified_status: true,
      rating: 4.699999999999999,
      reviews_count: 16,
      completed_orders_count: 19,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-7@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Павел Новиков",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Павел Новиков",
      slug: "specialist-7",
      title: "AI-слой поверх CRM и 1С",
      short_description: "Добавляю AI-логику в amoCRM, Битрикс24 и 1С: автозаполнение карточек, скоринг лидов, умные напоминания.",
      full_description: "Встраиваю AI-функциональность в существующие CRM и учётные системы: автоматическое заполнение карточек из переписки, скоринг и приоритизация лидов, умные напоминания менеджерам. Не меняю привычный интерфейс CRM для команды — AI работает в фоне и подсказывает следующий шаг.",
      city: "Екатеринбург",
      remote_work: true,
      experience_years: 6,
      project_rate_from: 55000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.8,
      reviews_count: 18,
      completed_orders_count: 29,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-8@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Артём Лебедев",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Артём Лебедев",
      slug: "specialist-8",
      title: "Промпт-инжиниринг и файнтюнинг LLM",
      short_description: "Настраиваю модели под задачу заказчика: от подбора промптов до дообучения LoRA на своих данных.",
      full_description: "Довожу качество ответов модели до продакшн-уровня: проектирую системные промпты, собираю датасеты для дообучения, провожу файнтюнинг с LoRA под узкую задачу заказчика. Помогаю снизить стоимость запросов за счёт перехода на модель меньшего размера без потери качества.",
      city: "",
      remote_work: true,
      experience_years: 4,
      project_rate_from: 80000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.8999999999999995,
      reviews_count: 20,
      completed_orders_count: 16,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-9@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Ольга Петрова",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Ольга Петрова",
      slug: "specialist-9",
      title: "AI-аналитика и умные дашборды",
      short_description: "Строю дашборды с AI-инсайтами поверх данных бизнеса — прогнозы, аномалии, отчёты на естественном языке.",
      full_description: "Собираю данные из разрозненных источников в единый дашборд и добавляю AI-слой: автоматические выводы, обнаружение аномалий, ответы на вопросы о данных на естественном языке вместо ручных SQL-запросов. Подходит для еженедельной отчётности и мониторинга ключевых метрик бизнеса.",
      city: "Новосибирск",
      remote_work: true,
      experience_years: 5,
      project_rate_from: 70000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.6,
      reviews_count: 22,
      completed_orders_count: 23,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-11@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Кирилл Орлов",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Кирилл Орлов",
      slug: "specialist-11",
      title: "AI-агенты для малого бизнеса",
      short_description: "Собираю AI-агентов для продаж и заявок на бюджете небольшого бизнеса — без лишних интеграций и переплаты за корпоративный масштаб.",
      full_description: "Работаю в одиночку, поэтому дешевле студии, но закрываю тот же результат для небольшого бизнеса: AI-агент отвечает на заявки в Telegram или на сайте, квалифицирует клиента и передаёт менеджеру. Не берусь за сложные корпоративные интеграции — специализируюсь на быстром запуске без лишних затрат.",
      city: "",
      remote_work: true,
      experience_years: 2,
      project_rate_from: 35000,
      response_time: "within_day",
      profile_status: "published",
      verified_status: true,
      rating: 4.8,
      reviews_count: 26,
      completed_orders_count: 9,
    })
    app.save(profile)
  }
  {
    const user = new Record(users, {
      email: "specialist-12@seed.naidii.ru",
      emailVisibility: false,
      password: SEED_PASSWORD,
      passwordConfirm: SEED_PASSWORD,
      verified: true,
      name: "Анна Гусева",
      role: "specialist",
      is_verified: true,
      status: "active",
    })
    app.save(user)

    const profile = new Record(profiles, {
      user_id: user.id,
      profile_type: "individual",
      public_name: "Анна Гусева",
      slug: "specialist-12",
      title: "Telegram-боты для продаж и записи",
      short_description: "Делаю Telegram-ботов с оплатой и записью на услуги — быстрый запуск по готовым шаблонам сценариев.",
      full_description: "Специализируюсь на Telegram-ботах для малого и среднего бизнеса: приём оплаты, запись на услуги, консультации на базе GPT. Использую отработанные шаблоны сценариев, поэтому запускаю быстрее студии, но без потери качества диалога.",
      city: "Ростов-на-Дону",
      remote_work: true,
      experience_years: 3,
      project_rate_from: 38000,
      response_time: "within_hour",
      profile_status: "published",
      verified_status: true,
      rating: 4.8999999999999995,
      reviews_count: 28,
      completed_orders_count: 12,
    })
    app.save(profile)
  }

  // --- services (офферы специалистов по типам результата) ---
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-1" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Доводит клиента до сделки или передаёт менеджеру — без потерянных заявок ночью",
      price_type: "from",
      price_from: 60000,
      duration_from: "от 2 недель",
      scope_label: "1 сценарий воронки",
      revisions_included: 2,
      tags: ["top","has_examples"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-11" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Тот же результат для небольшого бизнеса — без переплаты за корпоративный масштаб",
      price_type: "from",
      price_from: 42000,
      duration_from: "от 10 дней",
      scope_label: "1 сценарий воронки",
      revisions_included: 1,
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-1" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-prodazhi-i-zayavki-ai-agent-kvalifikacii-lidov-dly" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Расставляет приоритеты сам — менеджер звонит сначала горячим",
      price_type: "from",
      price_from: 45000,
      duration_from: "от 10 дней",
      scope_label: "до 5 сценариев квалификации",
      revisions_included: 2,
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-1" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-podderzhka-klientov-ai-agent-podderzhki-247-s-eska" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Отвечает клиентам ночью и передаёт сложные случаи оператору утром",
      price_type: "from",
      price_from: 50000,
      duration_from: "от 2 недель",
      scope_label: "до 10 типовых вопросов",
      revisions_included: 2,
      tags: ["guaranteed"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-1" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-podderzhka-klientov-audit-suschestvuyuschego-ai-ag" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Найду, где агент теряет клиентов, и что исправить в первую очередь",
      price_type: "from",
      price_from: 20000,
      duration_from: "от 3 дней",
      scope_label: "1 агент, письменный отчёт",
      
      tags: ["urgent","online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-1" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-hr-i-rekruting-ai-agent-dlya-hr-pervichnyy-skrinin" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Отсеивает нерелевантные отклики до собеседования с рекрутёром",
      price_type: "from",
      price_from: 35000,
      duration_from: "от 1 недели",
      scope_label: "до 3 вакансий",
      revisions_included: 1,
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-1" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-agents-hr-i-rekruting-ai-agent-onbordinga-novyh-sotrudnik" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Отвечает на типовые вопросы новичка вместо HR в первую неделю",
      price_type: "from",
      price_from: 25000,
      duration_from: "от 1 недели",
      scope_label: "1 сценарий адаптации",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-2" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "rag-korporativnye-bazy-znaniy-baza-znaniy-s-rag-poiskom-po-d" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Сотрудники получают ответ со ссылкой на регламент вместо похода к HR",
      price_type: "from",
      price_from: 150000,
      duration_from: "от 3 недель",
      scope_label: "до 500 документов",
      
      tags: ["top","guaranteed"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-2" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "rag-korporativnye-bazy-znaniy-obnovlenie-i-pereindeksaciya-s" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Обновляю базу перед переиндексацией — ответы строятся на актуальных документах",
      price_type: "from",
      price_from: 25000,
      duration_from: "от 5 дней",
      scope_label: "до 1000 документов",
      
      tags: ["urgent","online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-2" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "rag-rag-dlya-botov-podderzhki-integraciya-rag-v-suschestvuyu" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Бот отвечает предметно, опираясь на вашу базу знаний",
      price_type: "from",
      price_from: 70000,
      duration_from: "от 1 недели",
      scope_label: "1 источник данных",
      revisions_included: 2,
      tags: ["has_examples"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-2" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "rag-rag-dlya-botov-podderzhki-rag-poverh-bazy-faq-i-tiketov-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Ответы строятся на реальной истории обращений в поддержку",
      price_type: "from",
      price_from: 55000,
      duration_from: "от 10 дней",
      scope_label: "до 300 тикетов",
      
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-2" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "rag-yuridicheskiy-ai-analiz-rag-konsultant-dlya-yuridichesko" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Находит спорные пункты в типовых договорах за минуты, не часы",
      price_type: "from",
      price_from: 100000,
      duration_from: "от 2 недель",
      scope_label: "до 50 шаблонов договоров",
      
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-3" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "orchestration-avtomatizaciya-processov-scenariy-avtomatizaci" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Один сквозной процесс от заявки до отчёта — без ручного переноса данных",
      price_type: "from",
      price_from: 35000,
      duration_from: "от 5 дней",
      scope_label: "1 сквозной процесс",
      revisions_included: 2,
      tags: ["top","online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-3" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "orchestration-avtomatizaciya-processov-avtomatizaciya-priema" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Заявка сама попадает туда, где её обработают, без ручного переноса",
      price_type: "from",
      price_from: 30000,
      duration_from: "от 5 дней",
      scope_label: "1 воронка заявок",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-3" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "orchestration-migraciya-mezhdu-platformami-perenos-workflow-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Те же сценарии, но без ежемесячной платы за лимиты Zapier",
      price_type: "from",
      price_from: 40000,
      duration_from: "от 1 недели",
      scope_label: "до 10 сценариев",
      
      tags: ["has_examples"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-3" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "orchestration-migraciya-mezhdu-platformami-audit-i-optimizac" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Покажу, какие сценарии дублируют друг друга и где что ломается",
      price_type: "from",
      price_from: 20000,
      duration_from: "от 5 дней",
      scope_label: "до 10 сценариев, отчёт",
      
      tags: ["urgent"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-3" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "orchestration-otchetnost-i-tablicy-avtomatizaciya-otchetnost" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Таблица заполняется сама по расписанию — никто не забудет обновить",
      price_type: "from",
      price_from: 20000,
      duration_from: "от 3 дней",
      scope_label: "1 регулярный отчёт",
      
      tags: ["urgent"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-3" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "orchestration-otchetnost-i-tablicy-ezhemesyachnoe-soprovozhd" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Сценарии не ломаются молча, когда сторонний сервис меняет API",
      price_type: "from",
      price_from: 15000,
      duration_from: "постоянно",
      scope_label: "до 5 правок в месяц",
      
      tags: ["guaranteed","online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-4" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "chatbots-prodayuschie-boty-telegram-bot-s-ai-konsultantom-i-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Ведёт диалог, оформляет заказ и принимает оплату без участия менеджера",
      price_type: "from",
      price_from: 45000,
      duration_from: "от 10 дней",
      scope_label: "1 сценарий продаж",
      revisions_included: 2,
      tags: ["top","has_examples"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-12" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "chatbots-prodayuschie-boty-telegram-bot-s-ai-konsultantom-i-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Быстрый запуск по готовым шаблонам сценариев — без потери качества диалога",
      price_type: "from",
      price_from: 38000,
      duration_from: "от 8 дней",
      scope_label: "1 сценарий продаж",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-4" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "chatbots-prodayuschie-boty-audit-konversii-suschestvuyuscheg" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Покажу, на каком шаге сценария клиенты уходят, и почему",
      price_type: "from",
      price_from: 15000,
      duration_from: "от 3 дней",
      scope_label: "1 бот, отчёт с рекомендациями",
      
      tags: ["urgent","online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-4" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "chatbots-zapis-i-bronirovanie-bot-zapisi-na-uslugi-s-napomin" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Клиент сам выбирает время, бот сам напоминает — меньше неявок",
      price_type: "from",
      price_from: 30000,
      duration_from: "от 1 недели",
      scope_label: "до 3 типов услуг",
      revisions_included: 1,
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-4" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "chatbots-podderzhka-v-messendzherah-perenos-telegram-bota-na" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Та же логика бота, но там, где сидит международная аудитория",
      price_type: "from",
      price_from: 25000,
      duration_from: "от 5 дней",
      scope_label: "1 бот",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-4" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "chatbots-podderzhka-v-messendzherah-bot-podderzhki-klientov-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Отвечает на типовые вопросы сам, сложные передаёт живому оператору",
      price_type: "from",
      price_from: 35000,
      duration_from: "от 10 дней",
      scope_label: "до 10 типовых вопросов",
      
      tags: ["guaranteed"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-5" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "voice-ai-priem-zvonkov-golosovoy-agent-dlya-priema-vhodyasch" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Принимает звонки 24/7 голосом, который не отличить от живого оператора",
      price_type: "from",
      price_from: 120000,
      duration_from: "от 3 недель",
      scope_label: "1 сценарий, интеграция с телефонией",
      
      tags: ["top","guaranteed"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-5" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "voice-ai-priem-zvonkov-zamena-ivr-menyu-na-golosovogo-agenta" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Клиент говорит запрос своими словами вместо «нажмите 1»",
      price_type: "from",
      price_from: 60000,
      duration_from: "от 10 дней",
      scope_label: "1 линия",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-5" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "voice-ai-ishodyaschiy-obzvon-obzvon-bazy-s-ai-skriptom-podtv" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Тысяча звонков за ночь вместо недели работы колл-центра",
      price_type: "from",
      price_from: 80000,
      duration_from: "от 2 недель",
      scope_label: "до 1000 контактов/мес",
      
      tags: ["has_examples"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-5" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "voice-ai-ivr-i-resepshn-golosovoy-agent-resepshn-pereadresac" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Понимает запрос звонящего и сам соединяет с нужным отделом",
      price_type: "from",
      price_from: 90000,
      duration_from: "от 2 недель",
      scope_label: "до 5 направлений",
      
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-6" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-video-reklamnye-roliki-reklamnyy-rolik-s-ai-avatarom" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Готовое видео без съёмочной группы и актёра на камеру",
      price_type: "from",
      price_from: 15000,
      duration_from: "от 3 дней",
      scope_label: "1 ролик до 60 секунд",
      revisions_included: 2,
      tags: ["urgent","has_examples"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-6" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-video-shortsreels-paket-iz-10-shortsreels-s-ai-montazhom" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Месяц контента для соцсетей за одну съёмку сырого материала",
      price_type: "from",
      price_from: 35000,
      duration_from: "от 1 недели",
      scope_label: "до 10 роликов",
      
      tags: ["top"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-6" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-video-ozvuchka-i-lokalizaciya-ozvuchka-i-lokalizaciya-vid" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Один ролик заговорит на нужных рынках без студии озвучки",
      price_type: "from",
      price_from: 12000,
      duration_from: "от 3 дней",
      scope_label: "1 ролик, 3 языка",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-6" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-video-obuchayuschee-video-obuchayuschee-video-s-ai-diktor" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Из готового текста — видеоурок без записи голоса преподавателя",
      price_type: "from",
      price_from: 25000,
      duration_from: "от 5 дней",
      scope_label: "до 10 минут",
      revisions_included: 1,
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-7" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "crm-ai-skoring-lidov-ai-skoring-lidov-v-amocrmbitriks24" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Менеджер видит, кому звонить в первую очередь, без гадания",
      price_type: "from",
      price_from: 50000,
      duration_from: "от 2 недель",
      scope_label: "1 воронка",
      
      tags: ["top"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-7" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "crm-ai-avtozapolnenie-dannyh-avtozapolnenie-kartochek-sdelok" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Данные из чата попадают в CRM сами — никто не забудет их внести",
      price_type: "from",
      price_from: 40000,
      duration_from: "от 10 дней",
      scope_label: "1 канал (почта/мессенджер)",
      
      tags: ["has_examples"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-7" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "crm-ai-avtozapolnenie-dannyh-integraciya-ai-summarizacii-zvo" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Краткое содержание звонка появляется в карточке сделки само",
      price_type: "from",
      price_from: 45000,
      duration_from: "от 10 дней",
      scope_label: "1 источник звонков",
      
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-7" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "crm-ai-napominaniya-i-uvedomleniya-ai-napominaniya-menedzher" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Сделки перестают зависать без ответа клиенту неделями",
      price_type: "from",
      price_from: 25000,
      duration_from: "от 1 недели",
      scope_label: "1 CRM, до 5 триггеров",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-8" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "prompt-engineering-prompt-inzhiniring-optimizaciya-promptov-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Те же вопросы — точнее ответы, без переписывания продукта с нуля",
      price_type: "from",
      price_from: 30000,
      duration_from: "от 1 недели",
      scope_label: "до 10 сценариев",
      
      tags: ["urgent"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-8" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "prompt-engineering-fayntyuning-fayntyuning-modeli-pod-uzkuyu" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Модель, дообученная именно на ваших данных и терминах",
      price_type: "from",
      price_from: 80000,
      duration_from: "от 2 недель",
      scope_label: "1 датасет, 1 модель",
      
      tags: ["top","guaranteed"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-8" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "prompt-engineering-fayntyuning-sbor-i-razmetka-dataseta-dlya" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Готовый датасет под задачу, если своих примеров пока нет",
      price_type: "from",
      price_from: 35000,
      duration_from: "от 1 недели",
      scope_label: "до 500 примеров",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-8" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "prompt-engineering-optimizaciya-rashodov-na-ai-snizhenie-sto" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "То же качество ответов, но счёт за API заметно меньше",
      price_type: "from",
      price_from: 40000,
      duration_from: "от 10 дней",
      scope_label: "1 продукт, отчёт по экономии",
      
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-9" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-analytics-ai-dashbordy-dashbord-s-ai-insaytami-po-prodazh" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Дашборд сам подсвечивает аномалии в продажах",
      price_type: "from",
      price_from: 60000,
      duration_from: "от 2 недель",
      scope_label: "до 3 источников данных",
      
      tags: ["top","has_examples"],
      active: true,
    })
    app.save(offer)

    const promo = new Record(promotions, {
      specialist_profile_id: profile.id,
      service_id: offer.id,
      promotion_type: "top30",
      status: "active",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rotation_enabled: true,
    })
    app.save(promo)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-9" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-analytics-otchety-na-estestvennom-yazyke-ai-otchet-sprosi" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Руководитель спрашивает «почему упали продажи» и получает ответ",
      price_type: "from",
      price_from: 45000,
      duration_from: "от 10 дней",
      scope_label: "1 набор данных",
      
      tags: ["verified"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-9" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-analytics-otchety-na-estestvennom-yazyke-avtomaticheskiy-" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Отчёт приходит сам по понедельникам — никто его не забывает собрать",
      price_type: "from",
      price_from: 20000,
      duration_from: "от 5 дней",
      scope_label: "1 отчёт",
      
      tags: ["online"],
      active: true,
    })
    app.save(offer)
  }
  {
    const profile = app.findFirstRecordByFilter("specialist_profiles", "slug = {:slug}", { slug: "specialist-9" })
    const resultType = app.findFirstRecordByFilter("result_types", "slug = {:slug}", { slug: "ai-analytics-monitoring-i-alerty-poisk-anomaliy-v-dannyh-s-a" })
    const offer = new Record(services, {
      specialist_profile_id: profile.id,
      result_type_id: resultType.id,
      tagline: "Узнаёте о проблеме в тот же день, как только она появилась",
      price_type: "from",
      price_from: 35000,
      duration_from: "от 1 недели",
      scope_label: "1 метрика, ежедневный мониторинг",
      
      tags: ["guaranteed"],
      active: true,
    })
    app.save(offer)
  }

}, (app) => {
  // Откат: удаляем всё, что создал этот сид (по email-паттерну для
  // пользователей, остальное каскадом через specialist_profile_id, где
  // cascadeDelete включён, либо явными фильтрами).
  for (const collectionName of ["promotions", "services", "specialist_profiles"]) {
    const records = app.findRecordsByFilter(collectionName, "id != ''", "", 500, 0)
    for (const r of records) {
      app.delete(r)
    }
  }
  const seedUsers = app.findRecordsByFilter("users", "email ~ '@seed.naidii.ru'", "", 500, 0)
  for (const u of seedUsers) {
    app.delete(u)
  }
  const resultTypeRecords = app.findRecordsByFilter("result_types", "id != ''", "", 500, 0)
  for (const r of resultTypeRecords) {
    app.delete(r)
  }
  const categoryRecords = app.findRecordsByFilter("categories", "id != ''", "", 500, 0)
  for (const r of categoryRecords) {
    app.delete(r)
  }
})
