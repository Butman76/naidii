import type {
  Specialist,
  SpecialistBadge,
  SpecialistPremiumContent,
  SpecialistReview,
  SpecialistService,
} from "@/types/specialist";

// TODO: replace with a real fetch from PocketBase (specialist_profiles,
// joined with promotions for the Топ-20 grid per ТЗ §4.4/§8.3, and with
// services/reviews for the profile page) once the backend is reachable
// over a public domain — see pocketbase/README.md. This placeholder data
// exists only to preview page layouts while naidii.ru's DNS is still
// pending (expected 2026-08-24).
//
// Один шаблон на направление (см. web/src/data/categories.ts) — площадка
// про AI-агентов и автоматизацию, не про программистов вообще, поэтому
// навыки внутри каждого шаблона — инструменты именно этого направления, а
// не общий IT-стек.
const TEMPLATES: Array<{
  name: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  skills: string[];
  priceFrom: string;
  experienceYears: number;
  responseTime: string;
  location: string;
  services: SpecialistService[];
  reviews: SpecialistReview[];
  premium?: SpecialistPremiumContent;
}> = [
  {
    name: "Алексей Морозов",
    title: "AI-агенты для продаж и поддержки",
    shortDescription:
      "Собираю AI-агентов, которые обрабатывают заявки, отвечают на вопросы клиентов и передают тёплых лидов менеджерам.",
    fullDescription:
      "Проектирую и внедряю AI-агентов полного цикла: от первого касания с клиентом до передачи готовой сделки менеджеру. Агент понимает контекст диалога, подтягивает данные из CRM и эскалирует сложные случаи на человека. Работаю с готовыми интеграциями (Telegram, WhatsApp, сайт) и настраиваю сценарии под конкретные бизнес-процессы заказчика.",
    category: "ai-agents",
    skills: ["GPT-4", "LangChain", "n8n", "CRM-интеграция"],
    priceFrom: "От 60 000 ₽ за проект",
    experienceYears: 4,
    responseTime: "Отвечает в течение часа",
    location: "Москва · Удалённо",
    services: [
      {
        title: "AI-агент для входящих заявок",
        priceFrom: "От 60 000 ₽",
        durationFrom: "от 2 недель",
      },
      {
        title: "Аудит и оптимизация существующего агента",
        priceFrom: "От 20 000 ₽",
        durationFrom: "от 3 дней",
      },
    ],
    reviews: [
      {
        author: "Максим, интернет-магазин электроники",
        rating: 5,
        text: "Агент забирает на себя треть обращений в поддержку — отвечает быстрее операторов и не ошибается в базовых вопросах.",
      },
      {
        author: "Ольга, онлайн-школа",
        rating: 5,
        text: "Настроили квалификацию лидов через агента, конверсия в оплату выросла заметно.",
      },
    ],
  },
  {
    name: "Студия NeuroWorks",
    title: "RAG и корпоративные базы знаний",
    shortDescription:
      "Строим поиск по внутренним документам компании с RAG — базы знаний, ответы саппорта, юридическая экспертиза текстов.",
    fullDescription:
      "Разворачиваем RAG-контур поверх документов заказчика: регламентов, договоров, баз знаний поддержки. Модель отвечает со ссылками на источник, что снижает риск галлюцинаций. Помогаем выбрать векторную БД, настроить пайплайн индексации и обновления документов, интегрируем с внутренними порталами и Telegram.",
    category: "rag",
    skills: ["RAG", "Vector DB", "LLM", "Python"],
    priceFrom: "От 150 000 ₽ за проект",
    experienceYears: 5,
    responseTime: "Отвечает в течение дня",
    location: "Удалённо",
    services: [
      {
        title: "База знаний с RAG-поиском",
        priceFrom: "От 150 000 ₽",
        durationFrom: "от 3 недель",
      },
      {
        title: "Интеграция RAG в существующего бота поддержки",
        priceFrom: "От 70 000 ₽",
        durationFrom: "от 1 недели",
      },
    ],
    reviews: [
      {
        author: "Дмитрий, IT-компания",
        rating: 5,
        text: "Сотрудники перестали дёргать HR и юристов по типовым вопросам — бот отвечает точно и со ссылкой на регламент.",
      },
    ],
  },
  {
    name: "Дмитрий Волков",
    title: "No-code оркестрация процессов",
    shortDescription:
      "Связываю сервисы и AI-модели в сценарии на n8n и Make — без единой строчки кода, от заявки до отчёта.",
    fullDescription:
      "Автоматизирую сквозные процессы через no-code оркестраторы: заявка попадает в CRM, AI-модель классифицирует и обогащает данные, результат уходит в нужный канал — от Telegram-уведомления до отчёта в Google Sheets. Работаю с готовой инфраструктурой заказчика, без миграции на новые сервисы, если это не требуется.",
    category: "orchestration",
    skills: ["n8n", "Make", "Zapier", "Albato"],
    priceFrom: "От 35 000 ₽ за проект",
    experienceYears: 3,
    responseTime: "Отвечает в течение дня",
    location: "Казань · Удалённо",
    services: [
      {
        title: "Сценарий автоматизации под задачу",
        priceFrom: "От 35 000 ₽",
        durationFrom: "от 5 дней",
      },
      {
        title: "Сопровождение и доработка сценариев",
        priceFrom: "От 15 000 ₽/мес",
        durationFrom: "постоянно",
      },
    ],
    reviews: [
      {
        author: "Анна, логистическая компания",
        rating: 4,
        text: "Убрали ручной перенос заявок между системами, экономим пару часов в день.",
      },
    ],
  },
  {
    name: "Ирина Соколова",
    title: "AI Telegram-боты под ключ",
    shortDescription:
      "Пишу Telegram- и WhatsApp-ботов с LLM внутри: продажи, запись на услуги, поддержка 24/7.",
    fullDescription:
      "Разрабатываю ботов на Python с интеграцией LLM: от простых сценариев записи до полноценных консультантов, которые ведут диалог и оформляют заказ. Подключаю оплату, CRM и уведомления команде. Передаю исходный код и документацию, поддерживаю после запуска.",
    category: "chatbots",
    skills: ["Telegram", "WhatsApp", "GPT", "Python"],
    priceFrom: "От 45 000 ₽ за проект",
    experienceYears: 3,
    responseTime: "Отвечает в течение часа",
    location: "Удалённо",
    services: [
      {
        title: "Telegram-бот с AI-консультантом",
        priceFrom: "От 45 000 ₽",
        durationFrom: "от 10 дней",
      },
      {
        title: "Перенос бота на WhatsApp",
        priceFrom: "От 25 000 ₽",
        durationFrom: "от 5 дней",
      },
    ],
    reviews: [
      {
        author: "Сергей, сеть барбершопов",
        rating: 5,
        text: "Бот сам записывает клиентов и напоминает о визите — администратор освободился для других задач.",
      },
    ],
  },
  {
    name: "Студия «Автоматика»",
    title: "Голосовые AI-агенты для колл-центра",
    shortDescription:
      "Внедряем голосовых AI-агентов для входящих и исходящих звонков — без операторов, с живой речью.",
    fullDescription:
      "Строим голосовых агентов на связке STT/LLM/TTS: агент понимает свободную речь, держит контекст разговора и передаёт сложные случаи оператору. Подходит для приёма заявок, обзвона базы, подтверждения записи. Интегрируем с телефонией и CRM заказчика.",
    category: "voice-ai",
    skills: ["Voice AI", "STT/TTS", "Twilio", "IVR"],
    priceFrom: "От 120 000 ₽ за проект",
    experienceYears: 4,
    responseTime: "Отвечает в течение дня",
    location: "Санкт-Петербург · Удалённо",
    services: [
      {
        title: "Голосовой агент для приёма заявок",
        priceFrom: "От 120 000 ₽",
        durationFrom: "от 3 недель",
      },
      {
        title: "Обзвон базы с AI-скриптом",
        priceFrom: "От 80 000 ₽",
        durationFrom: "от 2 недель",
      },
    ],
    reviews: [
      {
        author: "Виктор, сервис доставки",
        rating: 5,
        text: "Голосовой агент подтверждает заказы без участия операторов, качество речи не отличить от живого человека.",
      },
    ],
    // Пример профиля на максимальном тарифе — расширенный лендинг вместо
    // обычной карточки (обложка, галерея, команда, сертификаты).
    premium: {
      tagline: "Голосовые AI-агенты, которые звучат как живые операторы",
      coverGradient: "bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-500",
      coverImageUrl: "/premium/studio-avtomatika-cover.png",
      logoImageUrl: "/premium/studio-avtomatika-logo.png",
      gallery: [
        "Дашборд обзвона в реальном времени",
        "Конструктор диалоговых сценариев",
        "Аналитика звонков и конверсий",
        "Интеграция с телефонией и CRM",
      ],
      videoPitchLabel: "Видео: как работает голосовой агент «Автоматики»",
      team: [
        { name: "Марк Соловьёв", role: "Основатель, AI-архитектор", initials: "МС" },
        { name: "Полина Даль", role: "Голосовые интерфейсы", initials: "ПД" },
        { name: "Роман Ким", role: "Интеграции с телефонией", initials: "РК" },
      ],
      certificates: [
        "Партнёр OpenAI",
        "Twilio Certified",
        "Сертификат ISO 27001",
      ],
    },
  },
  {
    name: "Марина Ким",
    title: "AI-видео и генеративный контент",
    shortDescription:
      "Делаю рекламные и обучающие ролики на нейросетях: AI-аватары, генерация видео, озвучка и монтаж.",
    fullDescription:
      "Произвожу видео с помощью генеративных нейросетей: рекламные ролики, обучающие материалы, контент для соцсетей с AI-аватарами и синтезированной озвучкой. Беру на себя весь цикл — от сценария до финального монтажа, могу адаптировать один ролик под несколько форматов и языков.",
    category: "ai-video",
    skills: ["Runway", "Kling", "AI-аватары", "Монтаж"],
    priceFrom: "От 40 000 ₽ за проект",
    experienceYears: 2,
    responseTime: "Отвечает в течение часа",
    location: "Удалённо",
    services: [
      {
        title: "Рекламный ролик с AI-аватаром",
        priceFrom: "От 40 000 ₽",
        durationFrom: "от 5 дней",
      },
      {
        title: "Серия коротких видео для соцсетей",
        priceFrom: "От 60 000 ₽",
        durationFrom: "от 1 недели",
      },
    ],
    reviews: [
      {
        author: "Екатерина, онлайн-школа",
        rating: 5,
        text: "Сделали серию обучающих видео с AI-аватаром вместо съёмки с преподавателем — быстрее и дешевле в разы.",
      },
    ],
  },
  {
    name: "Павел Новиков",
    title: "AI-слой поверх CRM и 1С",
    shortDescription:
      "Добавляю AI-логику в amoCRM, Битрикс24 и 1С: автозаполнение карточек, скоринг лидов, умные напоминания.",
    fullDescription:
      "Встраиваю AI-функциональность в существующие CRM и учётные системы: автоматическое заполнение карточек из переписки, скоринг и приоритизация лидов, умные напоминания менеджерам. Не меняю привычный интерфейс CRM для команды — AI работает в фоне и подсказывает следующий шаг.",
    category: "crm-ai",
    skills: ["amoCRM", "Битрикс24", "1С", "API"],
    priceFrom: "От 55 000 ₽ за проект",
    experienceYears: 6,
    responseTime: "Отвечает в течение дня",
    location: "Екатеринбург · Удалённо",
    services: [
      {
        title: "AI-скоринг лидов в CRM",
        priceFrom: "От 55 000 ₽",
        durationFrom: "от 2 недель",
      },
      {
        title: "Автозаполнение карточек из переписки",
        priceFrom: "От 40 000 ₽",
        durationFrom: "от 10 дней",
      },
    ],
    reviews: [
      {
        author: "Игорь, оптовая торговля",
        rating: 4,
        text: "Менеджеры перестали забывать перезванивать горячим клиентам — AI сам расставляет приоритеты.",
      },
    ],
  },
  {
    name: "Артём Лебедев",
    title: "Промпт-инжиниринг и файнтюнинг LLM",
    shortDescription:
      "Настраиваю модели под задачу заказчика: от подбора промптов до дообучения LoRA на своих данных.",
    fullDescription:
      "Довожу качество ответов модели до продакшн-уровня: проектирую системные промпты, собираю датасеты для дообучения, провожу файнтюнинг с LoRA под узкую задачу заказчика. Помогаю снизить стоимость запросов за счёт перехода на модель меньшего размера без потери качества.",
    category: "prompt-engineering",
    skills: ["Fine-tuning", "Prompt Engineering", "OpenAI API", "LoRA"],
    priceFrom: "От 80 000 ₽ за проект",
    experienceYears: 4,
    responseTime: "Отвечает в течение дня",
    location: "Удалённо",
    services: [
      {
        title: "Проектирование системных промптов",
        priceFrom: "От 30 000 ₽",
        durationFrom: "от 5 дней",
      },
      {
        title: "Файнтюнинг модели под задачу",
        priceFrom: "От 80 000 ₽",
        durationFrom: "от 2 недель",
      },
    ],
    reviews: [
      {
        author: "Наталья, стартап",
        rating: 5,
        text: "После доработки промптов ответы бота стали в разы точнее, а расходы на API упали почти вдвое.",
      },
    ],
  },
  {
    name: "Ольга Петрова",
    title: "AI-аналитика и умные дашборды",
    shortDescription:
      "Строю дашборды с AI-инсайтами поверх данных бизнеса — прогнозы, аномалии, отчёты на естественном языке.",
    fullDescription:
      "Собираю данные из разрозненных источников в единый дашборд и добавляю AI-слой: автоматические выводы, обнаружение аномалий, ответы на вопросы о данных на естественном языке вместо ручных SQL-запросов. Подходит для еженедельной отчётности и мониторинга ключевых метрик бизнеса.",
    category: "ai-analytics",
    skills: ["Дашборды", "LLM-аналитика", "Python", "BI"],
    priceFrom: "От 70 000 ₽ за проект",
    experienceYears: 5,
    responseTime: "Отвечает в течение дня",
    location: "Новосибирск · Удалённо",
    services: [
      {
        title: "Дашборд с AI-инсайтами",
        priceFrom: "От 70 000 ₽",
        durationFrom: "от 2 недель",
      },
      {
        title: "Отчёт на естественном языке по данным",
        priceFrom: "От 30 000 ₽",
        durationFrom: "от 1 недели",
      },
    ],
    reviews: [
      {
        author: "Роман, розничная сеть",
        rating: 5,
        text: "Теперь руководитель сам спрашивает у дашборда «почему упали продажи» и получает внятный ответ.",
      },
    ],
  },
  {
    name: "Сергей Гриценко",
    title: "AI для юридической экспертизы документов",
    shortDescription:
      "Своё направление на стыке права и AI: автоматическая проверка договоров на риски перед подписанием.",
    fullDescription:
      "Ниша на стыке права и AI: модель проверяет договоры и другие юридические документы на типовые риски перед подписанием, подсвечивает спорные пункты и предлагает формулировки. Не заменяет юриста, а ускоряет первичную проверку — то, на что раньше уходили часы, занимает минуты.",
    category: "other",
    skills: ["Document AI", "LLM", "Юриспруденция"],
    priceFrom: "От 90 000 ₽ за проект",
    experienceYears: 7,
    responseTime: "Отвечает в течение дня",
    location: "Удалённо",
    services: [
      {
        title: "AI-проверка типового договора",
        priceFrom: "От 90 000 ₽",
        durationFrom: "от 3 недель",
      },
    ],
    reviews: [
      {
        author: "Юлия, юридическая фирма",
        rating: 5,
        text: "Экономим время младших юристов на первичной вычитке — система находит то, что раньше пропускали.",
      },
    ],
  },
];

const BADGE_CYCLE: SpecialistBadge[][] = [
  ["top"],
  ["promoted"],
  ["popular"],
  ["founder", "top"],
  [],
];

function buildMockSpecialists(count: number): Specialist[] {
  return Array.from({ length: count }, (_, i) => {
    const t = TEMPLATES[i % TEMPLATES.length];
    return {
      id: `mock-${i + 1}`,
      slug: `specialist-${i + 1}`,
      name: t.name,
      title: t.title,
      shortDescription: t.shortDescription,
      fullDescription: t.fullDescription,
      category: t.category,
      skills: t.skills,
      priceFrom: t.priceFrom,
      experienceYears: t.experienceYears,
      responseTime: t.responseTime,
      rating: 4.6 + ((i % 4) * 0.1),
      reviewsCount: 6 + i * 2,
      location: t.location,
      badges: BADGE_CYCLE[i % BADGE_CYCLE.length],
      avatarInitials: t.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      services: t.services,
      reviews: t.reviews,
      // Только первый проход по шаблонам несёт premium-контент — иначе
      // в каталоге появлялось бы несколько "одинаковых" премиум-студий
      // на повторах цикла (specialist-15, -25, ...).
      premium: i < TEMPLATES.length ? t.premium : undefined,
    };
  });
}

// Топ-20 продвигаемых специалистов для главной (ТЗ §4.4/§8.3).
export const mockTopSpecialists: Specialist[] = buildMockSpecialists(20);

// Полный каталог для /specialists — крупнее, чтобы было на чём проверять
// фильтры и сортировку. Первые 10 совпадают с mockTopSpecialists, т.к. оба
// массива детерминированно строятся из одних и тех же шаблонов.
export const mockSpecialists: Specialist[] = buildMockSpecialists(48);
