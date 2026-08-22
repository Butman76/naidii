import type { ServiceCard, ServiceCardTag } from "@/types/service-card";

// TODO: заменить на запрос к PocketBase (services, расширенная миграцией
// 1755000016_service_cards_pivot.js) — см. pocketbase/README.md. Пока
// PocketBase недоступен по интернету, каталог карточек услуг живёт на
// этих данных.
//
// Источник контента — черновой список продаваемых продуктов по каждому
// направлению из PIVOT_SERVICE_CARDS.md (раздел 5): решает проблему
// "специалист не знает, что продавать", когда профиль сформулирован
// слишком широко. Специалист прикреплён к направлению из
// web/src/data/mock-specialists.ts (там же категория → 1 специалист).

interface ServiceProvider {
  slug: string;
  name: string;
  initials: string;
  rating: number;
  completedOrders: number;
}

const PROVIDERS: Record<string, ServiceProvider> = {
  "ai-agents": { slug: "specialist-1", name: "Алексей Морозов", initials: "АМ", rating: 4.9, completedOrders: 34 },
  rag: { slug: "specialist-2", name: "Студия NeuroWorks", initials: "СN", rating: 4.8, completedOrders: 21 },
  orchestration: { slug: "specialist-3", name: "Дмитрий Волков", initials: "ДВ", rating: 4.7, completedOrders: 45 },
  chatbots: { slug: "specialist-4", name: "Ирина Соколова", initials: "ИС", rating: 4.9, completedOrders: 38 },
  "voice-ai": { slug: "specialist-5", name: "Студия «Автоматика»", initials: "С«", rating: 5.0, completedOrders: 27 },
  "ai-video": { slug: "specialist-6", name: "Марина Ким", initials: "МК", rating: 4.8, completedOrders: 19 },
  "crm-ai": { slug: "specialist-7", name: "Павел Новиков", initials: "ПН", rating: 4.6, completedOrders: 29 },
  "prompt-engineering": { slug: "specialist-8", name: "Артём Лебедев", initials: "АЛ", rating: 4.9, completedOrders: 16 },
  "ai-analytics": { slug: "specialist-9", name: "Ольга Петрова", initials: "ОП", rating: 4.7, completedOrders: 23 },
};

interface RawService {
  category: string;
  title: string;
  tagline: string;
  scopeLabel: string;
  price: number;
  duration: string;
  revisions?: number;
  tags: ServiceCardTag[];
  promoted?: boolean;
}

const RAW_SERVICES: RawService[] = [
  // AI-агенты
  {
    category: "ai-agents",
    title: "Продающий AI-агент для сайта/Telegram",
    tagline: "Доводит клиента до сделки или передаёт менеджеру — без потерянных заявок ночью",
    scopeLabel: "1 сценарий воронки",
    price: 60000,
    duration: "от 2 недель",
    revisions: 2,
    tags: ["top", "has_examples"],
    promoted: true,
  },
  {
    category: "ai-agents",
    title: "AI-агент квалификации лидов для CRM",
    tagline: "Расставляет приоритеты сам — менеджер звонит сначала горячим",
    scopeLabel: "до 5 сценариев квалификации",
    price: 45000,
    duration: "от 10 дней",
    revisions: 2,
    tags: ["verified"],
  },
  {
    category: "ai-agents",
    title: "Аудит существующего AI-агента с планом доработки",
    tagline: "Найду, где агент теряет клиентов, и что исправить в первую очередь",
    scopeLabel: "1 агент, письменный отчёт",
    price: 20000,
    duration: "от 3 дней",
    tags: ["urgent", "online"],
  },
  {
    category: "ai-agents",
    title: "AI-агент для HR (первичный скрининг кандидатов)",
    tagline: "Отсеивает нерелевантные отклики до собеседования с рекрутёром",
    scopeLabel: "до 3 вакансий",
    price: 35000,
    duration: "от 1 недели",
    revisions: 1,
    tags: ["online"],
  },

  // RAG / базы знаний
  {
    category: "rag",
    title: "База знаний с RAG-поиском по документам компании",
    tagline: "Сотрудники получают ответ со ссылкой на регламент вместо похода к HR",
    scopeLabel: "до 500 документов",
    price: 150000,
    duration: "от 3 недель",
    tags: ["top", "guaranteed"],
    promoted: true,
  },
  {
    category: "rag",
    title: "Интеграция RAG в существующего бота поддержки",
    tagline: "Бот начинает отвечать по вашей базе знаний, а не общими фразами",
    scopeLabel: "1 источник данных",
    price: 70000,
    duration: "от 1 недели",
    revisions: 2,
    tags: ["has_examples"],
  },
  {
    category: "rag",
    title: "RAG-консультант для юридической проверки договоров",
    tagline: "Находит спорные пункты в типовых договорах за минуты, не часы",
    scopeLabel: "до 50 шаблонов договоров",
    price: 100000,
    duration: "от 2 недель",
    tags: ["verified"],
  },
  {
    category: "rag",
    title: "Обновление и переиндексация существующей RAG-базы",
    tagline: "База отвечает по актуальным документам, а не по архиву годовой давности",
    scopeLabel: "до 1000 документов",
    price: 25000,
    duration: "от 5 дней",
    tags: ["urgent", "online"],
  },

  // No-code оркестрация
  {
    category: "orchestration",
    title: "Сценарий автоматизации под конкретную задачу",
    tagline: "Один сквозной процесс от заявки до отчёта — без ручного переноса данных",
    scopeLabel: "1 сквозной процесс",
    price: 35000,
    duration: "от 5 дней",
    revisions: 2,
    tags: ["top", "online"],
  },
  {
    category: "orchestration",
    title: "Перенос workflow с Zapier на n8n (self-hosted)",
    tagline: "Те же сценарии, но без ежемесячной платы за лимиты Zapier",
    scopeLabel: "до 10 сценариев",
    price: 40000,
    duration: "от 1 недели",
    tags: ["has_examples"],
  },
  {
    category: "orchestration",
    title: "Ежемесячное сопровождение и доработка сценариев",
    tagline: "Сценарии не ломаются молча, когда сторонний сервис меняет API",
    scopeLabel: "до 5 правок в месяц",
    price: 15000,
    duration: "постоянно",
    tags: ["guaranteed", "online"],
  },
  {
    category: "orchestration",
    title: "Автоматизация отчётности в Google Sheets/таблицы",
    tagline: "Таблица заполняется сама по расписанию — никто не забудет обновить",
    scopeLabel: "1 регулярный отчёт",
    price: 20000,
    duration: "от 3 дней",
    tags: ["urgent"],
  },

  // Чат-боты
  {
    category: "chatbots",
    title: "Telegram-бот с AI-консультантом и оплатой",
    tagline: "Ведёт диалог, оформляет заказ и принимает оплату без участия менеджера",
    scopeLabel: "1 сценарий продаж",
    price: 45000,
    duration: "от 10 дней",
    revisions: 2,
    tags: ["top", "has_examples"],
    promoted: true,
  },
  {
    category: "chatbots",
    title: "Перенос Telegram-бота на WhatsApp",
    tagline: "Та же логика бота, но там, где сидит международная аудитория",
    scopeLabel: "1 бот",
    price: 25000,
    duration: "от 5 дней",
    tags: ["online"],
  },
  {
    category: "chatbots",
    title: "Бот записи на услуги с напоминаниями",
    tagline: "Клиент сам выбирает время, бот сам напоминает — меньше неявок",
    scopeLabel: "до 3 типов услуг",
    price: 30000,
    duration: "от 1 недели",
    revisions: 1,
    tags: ["verified"],
  },
  {
    category: "chatbots",
    title: "Аудит конверсии существующего бота",
    tagline: "Покажу, на каком шаге сценария клиенты уходят, и почему",
    scopeLabel: "1 бот, отчёт с рекомендациями",
    price: 15000,
    duration: "от 3 дней",
    tags: ["urgent", "online"],
  },

  // Голосовые AI-агенты
  {
    category: "voice-ai",
    title: "Голосовой агент для приёма входящих заявок",
    tagline: "Принимает звонки 24/7 голосом, который не отличить от живого оператора",
    scopeLabel: "1 сценарий, интеграция с телефонией",
    price: 120000,
    duration: "от 3 недель",
    tags: ["top", "guaranteed"],
    promoted: true,
  },
  {
    category: "voice-ai",
    title: "Обзвон базы с AI-скриптом (подтверждение записи)",
    tagline: "Тысяча звонков за ночь вместо недели работы колл-центра",
    scopeLabel: "до 1000 контактов/мес",
    price: 80000,
    duration: "от 2 недель",
    tags: ["has_examples"],
  },
  {
    category: "voice-ai",
    title: "Голосовой агент-ресепшн (переадресация по отделам)",
    tagline: "Понимает запрос звонящего и сам соединяет с нужным отделом",
    scopeLabel: "до 5 направлений",
    price: 90000,
    duration: "от 2 недель",
    tags: ["verified"],
  },
  {
    category: "voice-ai",
    title: "Замена IVR-меню на голосового агента",
    tagline: "Клиент говорит запрос своими словами вместо «нажмите 1»",
    scopeLabel: "1 линия",
    price: 60000,
    duration: "от 10 дней",
    tags: ["online"],
  },

  // AI-видео и контент
  {
    category: "ai-video",
    title: "Рекламный ролик с AI-аватаром",
    tagline: "Готовое видео без съёмочной группы и актёра на камеру",
    scopeLabel: "1 ролик до 60 секунд",
    price: 15000,
    duration: "от 3 дней",
    revisions: 2,
    tags: ["urgent", "has_examples"],
  },
  {
    category: "ai-video",
    title: "Пакет из 10 Shorts/Reels с AI-монтажом",
    tagline: "Месяц контента для соцсетей за одну съёмку сырого материала",
    scopeLabel: "до 10 роликов",
    price: 35000,
    duration: "от 1 недели",
    tags: ["top"],
    promoted: true,
  },
  {
    category: "ai-video",
    title: "Озвучка и локализация видео на 3 языка",
    tagline: "Один ролик заговорит на нужных рынках без студии озвучки",
    scopeLabel: "1 ролик, 3 языка",
    price: 12000,
    duration: "от 3 дней",
    tags: ["online"],
  },
  {
    category: "ai-video",
    title: "Обучающее видео с AI-диктором из текста сценария",
    tagline: "Из готового текста — видеоурок без записи голоса преподавателя",
    scopeLabel: "до 10 минут",
    price: 25000,
    duration: "от 5 дней",
    revisions: 1,
    tags: ["verified"],
  },

  // AI над CRM / учётными системами
  {
    category: "crm-ai",
    title: "AI-скоринг лидов в amoCRM/Битрикс24",
    tagline: "Менеджер видит, кому звонить в первую очередь, без гадания",
    scopeLabel: "1 воронка",
    price: 50000,
    duration: "от 2 недель",
    tags: ["top"],
    promoted: true,
  },
  {
    category: "crm-ai",
    title: "Автозаполнение карточек сделок из переписки",
    tagline: "Данные из чата попадают в CRM сами — никто не забудет их внести",
    scopeLabel: "1 канал (почта/мессенджер)",
    price: 40000,
    duration: "от 10 дней",
    tags: ["has_examples"],
  },
  {
    category: "crm-ai",
    title: "AI-напоминания менеджерам о просроченных задачах",
    tagline: "Сделки перестают зависать без ответа клиенту неделями",
    scopeLabel: "1 CRM, до 5 триггеров",
    price: 25000,
    duration: "от 1 недели",
    tags: ["online"],
  },
  {
    category: "crm-ai",
    title: "Интеграция AI-суммаризации звонков в CRM",
    tagline: "Краткое содержание звонка появляется в карточке сделки само",
    scopeLabel: "1 источник звонков",
    price: 45000,
    duration: "от 10 дней",
    tags: ["verified"],
  },

  // Промпт-инжиниринг / файнтюнинг
  {
    category: "prompt-engineering",
    title: "Оптимизация промптов существующего AI-продукта",
    tagline: "Те же вопросы — точнее ответы, без переписывания продукта с нуля",
    scopeLabel: "до 10 сценариев",
    price: 30000,
    duration: "от 1 недели",
    tags: ["urgent"],
  },
  {
    category: "prompt-engineering",
    title: "Файнтюнинг модели под узкую задачу",
    tagline: "Модель, дообученная именно на ваших данных и терминах",
    scopeLabel: "1 датасет, 1 модель",
    price: 80000,
    duration: "от 2 недель",
    tags: ["top", "guaranteed"],
    promoted: true,
  },
  {
    category: "prompt-engineering",
    title: "Снижение стоимости AI-продукта (переход на меньшую модель)",
    tagline: "То же качество ответов, но счёт за API заметно меньше",
    scopeLabel: "1 продукт, отчёт по экономии",
    price: 40000,
    duration: "от 10 дней",
    tags: ["verified"],
  },
  {
    category: "prompt-engineering",
    title: "Сбор и разметка датасета для файнтюнинга",
    tagline: "Готовый датасет под задачу, если своих примеров пока нет",
    scopeLabel: "до 500 примеров",
    price: 35000,
    duration: "от 1 недели",
    tags: ["online"],
  },

  // AI-аналитика и отчётность
  {
    category: "ai-analytics",
    title: "Дашборд с AI-инсайтами по продажам",
    tagline: "Дашборд сам подсвечивает аномалии, а не просто рисует графики",
    scopeLabel: "до 3 источников данных",
    price: 60000,
    duration: "от 2 недель",
    tags: ["top", "has_examples"],
    promoted: true,
  },
  {
    category: "ai-analytics",
    title: "AI-отчёт «спроси на языке» поверх существующих таблиц",
    tagline: "Руководитель спрашивает «почему упали продажи» и получает ответ",
    scopeLabel: "1 набор данных",
    price: 45000,
    duration: "от 10 дней",
    tags: ["verified"],
  },
  {
    category: "ai-analytics",
    title: "Поиск аномалий в данных с AI-алертами",
    tagline: "Узнаёте о проблеме в тот же день, а не в конце месяца из отчёта",
    scopeLabel: "1 метрика, ежедневный мониторинг",
    price: 35000,
    duration: "от 1 недели",
    tags: ["guaranteed"],
  },
  {
    category: "ai-analytics",
    title: "Автоматический еженедельный AI-отчёт руководителю",
    tagline: "Отчёт приходит сам по понедельникам — никто его не забывает собрать",
    scopeLabel: "1 отчёт",
    price: 20000,
    duration: "от 5 дней",
    tags: ["online"],
  },
];

export const mockServices: ServiceCard[] = RAW_SERVICES.map((raw, index) => {
  const provider = PROVIDERS[raw.category];
  return {
    id: `service-${index + 1}`,
    slug: `service-${index + 1}`,
    categorySlug: raw.category,
    title: raw.title,
    tagline: raw.tagline,
    priceType: "from",
    priceValue: raw.price,
    durationFrom: raw.duration,
    scopeLabel: raw.scopeLabel,
    revisionsIncluded: raw.revisions,
    tags: raw.tags,
    promoted: raw.promoted,
    specialistSlug: provider.slug,
    specialistName: provider.name,
    specialistAvatarInitials: provider.initials,
    specialistRating: provider.rating,
    specialistCompletedOrders: provider.completedOrders,
  };
});

// Топ карточек для главной — продвигаемые вперёд, затем добор органикой,
// как и было устроено для специалистов в §4.4/§8.3 ТЗ (тот же принцип,
// применённый теперь к карточкам услуг, а не профилям).
export const mockTopServices: ServiceCard[] = [...mockServices].sort((a, b) => {
  if (Boolean(b.promoted) !== Boolean(a.promoted)) {
    return Number(Boolean(b.promoted)) - Number(Boolean(a.promoted));
  }
  return b.specialistRating - a.specialistRating;
});
