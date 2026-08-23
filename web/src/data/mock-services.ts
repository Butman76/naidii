import type {
  ResultType,
  ServiceCardTag,
  ServiceOffer,
} from "@/types/service-card";
import { getCoverImagePath } from "./cover-manifest";

// TODO: заменить на запрос к PocketBase — см. pocketbase/README.md и
// PIVOT_SERVICE_CARDS.md, раздел 6 ("следующие шаги") — модель ResultType/
// ServiceOffer описана пока только на фронтенде, схема ещё не разъединена
// на бэкенде так же. Источник контента — раздел 7 PIVOT_SERVICE_CARDS.md
// (42 типа результата на 27 подкатегориях).

interface Provider {
  slug: string;
  name: string;
  initials: string;
  rating: number;
  completedOrders: number;
}

const PROVIDERS: Record<string, Provider> = {
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

// Второй продавец на 2 типа результата — доказать, что модель "несколько
// офферов на один тип" реально работает, без раздувания всех 42 сразу
// (остальные легко доукомплектовать тем же способом позже). Объекты, а не
// строковый ключ по слагу — слаг генерируется транслитерацией заголовка,
// подбирать его вручную для ключа ненадёжно.
const KIRILL_ORLOV: Provider = {
  slug: "specialist-11",
  name: "Кирилл Орлов",
  initials: "КО",
  rating: 4.6,
  completedOrders: 9,
};

const ANNA_GUSEVA: Provider = {
  slug: "specialist-12",
  name: "Анна Гусева",
  initials: "АГ",
  rating: 4.5,
  completedOrders: 12,
};

interface RawOffer {
  price: number;
  duration: string;
  revisions?: number;
  tags: ServiceCardTag[];
  promoted?: boolean;
  tagline: string;
  seller?: Provider; // если не задан — берём провайдера направления
}

interface RawResultType {
  category: string;
  subcategory: string;
  title: string;
  scopeLabel: string;
  offers: RawOffer[];
}

const RAW_TYPES: RawResultType[] = [
  // AI-агенты
  {
    category: "ai-agents",
    subcategory: "Продажи и заявки",
    title: "Продающий AI-агент для сайта/Telegram",
    scopeLabel: "1 сценарий воронки",
    offers: [
      {
        price: 60000,
        duration: "от 2 недель",
        revisions: 2,
        tags: ["top", "has_examples"],
        promoted: true,
        tagline: "Доводит клиента до сделки или передаёт менеджеру — без потерянных заявок ночью",
      },
      {
        price: 42000,
        duration: "от 10 дней",
        revisions: 1,
        tags: ["online"],
        tagline: "Тот же результат для небольшого бизнеса — без переплаты за корпоративный масштаб",
        seller: KIRILL_ORLOV,
      },
    ],
  },
  {
    category: "ai-agents",
    subcategory: "Продажи и заявки",
    title: "AI-агент квалификации лидов для CRM",
    scopeLabel: "до 5 сценариев квалификации",
    offers: [{ price: 45000, duration: "от 10 дней", revisions: 2, tags: ["verified"], tagline: "Расставляет приоритеты сам — менеджер звонит сначала горячим" }],
  },
  {
    category: "ai-agents",
    subcategory: "Поддержка клиентов",
    title: "AI-агент поддержки 24/7 с эскалацией на человека",
    scopeLabel: "до 10 типовых вопросов",
    offers: [{ price: 50000, duration: "от 2 недель", revisions: 2, tags: ["guaranteed"], tagline: "Отвечает клиентам ночью и передаёт сложные случаи оператору утром" }],
  },
  {
    category: "ai-agents",
    subcategory: "Поддержка клиентов",
    title: "Аудит существующего AI-агента с планом доработки",
    scopeLabel: "1 агент, письменный отчёт",
    offers: [{ price: 20000, duration: "от 3 дней", tags: ["urgent", "online"], tagline: "Найду, где агент теряет клиентов, и что исправить в первую очередь" }],
  },
  {
    category: "ai-agents",
    subcategory: "HR и рекрутинг",
    title: "AI-агент для HR (первичный скрининг кандидатов)",
    scopeLabel: "до 3 вакансий",
    offers: [{ price: 35000, duration: "от 1 недели", revisions: 1, tags: ["online"], tagline: "Отсеивает нерелевантные отклики до собеседования с рекрутёром" }],
  },
  {
    category: "ai-agents",
    subcategory: "HR и рекрутинг",
    title: "AI-агент онбординга новых сотрудников",
    scopeLabel: "1 сценарий адаптации",
    offers: [{ price: 25000, duration: "от 1 недели", tags: ["online"], tagline: "Отвечает на типовые вопросы новичка вместо HR в первую неделю" }],
  },

  // RAG / базы знаний
  {
    category: "rag",
    subcategory: "Корпоративные базы знаний",
    title: "База знаний с RAG-поиском по документам компании",
    scopeLabel: "до 500 документов",
    offers: [{ price: 150000, duration: "от 3 недель", tags: ["top", "guaranteed"], promoted: true, tagline: "Сотрудники получают ответ со ссылкой на регламент вместо похода к HR" }],
  },
  {
    category: "rag",
    subcategory: "Корпоративные базы знаний",
    title: "Обновление и переиндексация существующей RAG-базы",
    scopeLabel: "до 1000 документов",
    offers: [{ price: 25000, duration: "от 5 дней", tags: ["urgent", "online"], tagline: "Обновляю базу перед переиндексацией — ответы строятся на актуальных документах" }],
  },
  {
    category: "rag",
    subcategory: "RAG для ботов поддержки",
    title: "Интеграция RAG в существующего бота поддержки",
    scopeLabel: "1 источник данных",
    offers: [{ price: 70000, duration: "от 1 недели", revisions: 2, tags: ["has_examples"], tagline: "Бот отвечает предметно, опираясь на вашу базу знаний" }],
  },
  {
    category: "rag",
    subcategory: "RAG для ботов поддержки",
    title: "RAG поверх базы FAQ и тикетов поддержки",
    scopeLabel: "до 300 тикетов",
    offers: [{ price: 55000, duration: "от 10 дней", tags: ["verified"], tagline: "Ответы строятся на реальной истории обращений в поддержку" }],
  },
  {
    category: "rag",
    subcategory: "Юридический AI-анализ",
    title: "RAG-консультант для юридической проверки договоров",
    scopeLabel: "до 50 шаблонов договоров",
    offers: [{ price: 100000, duration: "от 2 недель", tags: ["verified"], tagline: "Находит спорные пункты в типовых договорах за минуты, не часы" }],
  },

  // No-code оркестрация
  {
    category: "orchestration",
    subcategory: "Автоматизация процессов",
    title: "Сценарий автоматизации под конкретную задачу",
    scopeLabel: "1 сквозной процесс",
    offers: [{ price: 35000, duration: "от 5 дней", revisions: 2, tags: ["top", "online"], tagline: "Один сквозной процесс от заявки до отчёта — без ручного переноса данных" }],
  },
  {
    category: "orchestration",
    subcategory: "Автоматизация процессов",
    title: "Автоматизация приёма и обработки заявок между сервисами",
    scopeLabel: "1 воронка заявок",
    offers: [{ price: 30000, duration: "от 5 дней", tags: ["online"], tagline: "Заявка сама попадает туда, где её обработают, без ручного переноса" }],
  },
  {
    category: "orchestration",
    subcategory: "Миграция между платформами",
    title: "Перенос workflow с Zapier на n8n (self-hosted)",
    scopeLabel: "до 10 сценариев",
    offers: [{ price: 40000, duration: "от 1 недели", tags: ["has_examples"], tagline: "Те же сценарии, но без ежемесячной платы за лимиты Zapier" }],
  },
  {
    category: "orchestration",
    subcategory: "Миграция между платформами",
    title: "Аудит и оптимизация существующих сценариев",
    scopeLabel: "до 10 сценариев, отчёт",
    offers: [{ price: 20000, duration: "от 5 дней", tags: ["urgent"], tagline: "Покажу, какие сценарии дублируют друг друга и где что ломается" }],
  },
  {
    category: "orchestration",
    subcategory: "Отчётность и таблицы",
    title: "Автоматизация отчётности в Google Sheets/таблицы",
    scopeLabel: "1 регулярный отчёт",
    offers: [{ price: 20000, duration: "от 3 дней", tags: ["urgent"], tagline: "Таблица заполняется сама по расписанию — никто не забудет обновить" }],
  },
  {
    category: "orchestration",
    subcategory: "Отчётность и таблицы",
    title: "Ежемесячное сопровождение и доработка сценариев",
    scopeLabel: "до 5 правок в месяц",
    offers: [{ price: 15000, duration: "постоянно", tags: ["guaranteed", "online"], tagline: "Сценарии не ломаются молча, когда сторонний сервис меняет API" }],
  },

  // Чат-боты
  {
    category: "chatbots",
    subcategory: "Продающие боты",
    title: "Telegram-бот с AI-консультантом и оплатой",
    scopeLabel: "1 сценарий продаж",
    offers: [
      {
        price: 45000,
        duration: "от 10 дней",
        revisions: 2,
        tags: ["top", "has_examples"],
        promoted: true,
        tagline: "Ведёт диалог, оформляет заказ и принимает оплату без участия менеджера",
      },
      {
        price: 38000,
        duration: "от 8 дней",
        tags: ["online"],
        tagline: "Быстрый запуск по готовым шаблонам сценариев — без потери качества диалога",
        seller: ANNA_GUSEVA,
      },
    ],
  },
  {
    category: "chatbots",
    subcategory: "Продающие боты",
    title: "Аудит конверсии существующего бота",
    scopeLabel: "1 бот, отчёт с рекомендациями",
    offers: [{ price: 15000, duration: "от 3 дней", tags: ["urgent", "online"], tagline: "Покажу, на каком шаге сценария клиенты уходят, и почему" }],
  },
  {
    category: "chatbots",
    subcategory: "Запись и бронирование",
    title: "Бот записи на услуги с напоминаниями",
    scopeLabel: "до 3 типов услуг",
    offers: [{ price: 30000, duration: "от 1 недели", revisions: 1, tags: ["verified"], tagline: "Клиент сам выбирает время, бот сам напоминает — меньше неявок" }],
  },
  {
    category: "chatbots",
    subcategory: "Поддержка в мессенджерах",
    title: "Перенос Telegram-бота на WhatsApp",
    scopeLabel: "1 бот",
    offers: [{ price: 25000, duration: "от 5 дней", tags: ["online"], tagline: "Та же логика бота, но там, где сидит международная аудитория" }],
  },
  {
    category: "chatbots",
    subcategory: "Поддержка в мессенджерах",
    title: "Бот поддержки клиентов с эскалацией на оператора",
    scopeLabel: "до 10 типовых вопросов",
    offers: [{ price: 35000, duration: "от 10 дней", tags: ["guaranteed"], tagline: "Отвечает на типовые вопросы сам, сложные передаёт живому оператору" }],
  },

  // Голосовые AI-агенты
  {
    category: "voice-ai",
    subcategory: "Приём звонков",
    title: "Голосовой агент для приёма входящих заявок",
    scopeLabel: "1 сценарий, интеграция с телефонией",
    offers: [{ price: 120000, duration: "от 3 недель", tags: ["top", "guaranteed"], promoted: true, tagline: "Принимает звонки 24/7 голосом, который не отличить от живого оператора" }],
  },
  {
    category: "voice-ai",
    subcategory: "Приём звонков",
    title: "Замена IVR-меню на голосового агента",
    scopeLabel: "1 линия",
    offers: [{ price: 60000, duration: "от 10 дней", tags: ["online"], tagline: "Клиент говорит запрос своими словами вместо «нажмите 1»" }],
  },
  {
    category: "voice-ai",
    subcategory: "Исходящий обзвон",
    title: "Обзвон базы с AI-скриптом (подтверждение записи)",
    scopeLabel: "до 1000 контактов/мес",
    offers: [{ price: 80000, duration: "от 2 недель", tags: ["has_examples"], tagline: "Тысяча звонков за ночь вместо недели работы колл-центра" }],
  },
  {
    category: "voice-ai",
    subcategory: "IVR и ресепшн",
    title: "Голосовой агент-ресепшн (переадресация по отделам)",
    scopeLabel: "до 5 направлений",
    offers: [{ price: 90000, duration: "от 2 недель", tags: ["verified"], tagline: "Понимает запрос звонящего и сам соединяет с нужным отделом" }],
  },

  // AI-видео и контент
  {
    category: "ai-video",
    subcategory: "Рекламные ролики",
    title: "Рекламный ролик с AI-аватаром",
    scopeLabel: "1 ролик до 60 секунд",
    offers: [{ price: 15000, duration: "от 3 дней", revisions: 2, tags: ["urgent", "has_examples"], tagline: "Готовое видео без съёмочной группы и актёра на камеру" }],
  },
  {
    category: "ai-video",
    subcategory: "Shorts/Reels",
    title: "Пакет из 10 Shorts/Reels с AI-монтажом",
    scopeLabel: "до 10 роликов",
    offers: [{ price: 35000, duration: "от 1 недели", tags: ["top"], promoted: true, tagline: "Месяц контента для соцсетей за одну съёмку сырого материала" }],
  },
  {
    category: "ai-video",
    subcategory: "Озвучка и локализация",
    title: "Озвучка и локализация видео на 3 языка",
    scopeLabel: "1 ролик, 3 языка",
    offers: [{ price: 12000, duration: "от 3 дней", tags: ["online"], tagline: "Один ролик заговорит на нужных рынках без студии озвучки" }],
  },
  {
    category: "ai-video",
    subcategory: "Обучающее видео",
    title: "Обучающее видео с AI-диктором из текста сценария",
    scopeLabel: "до 10 минут",
    offers: [{ price: 25000, duration: "от 5 дней", revisions: 1, tags: ["verified"], tagline: "Из готового текста — видеоурок без записи голоса преподавателя" }],
  },

  // AI над CRM / учётными системами
  {
    category: "crm-ai",
    subcategory: "Скоринг лидов",
    title: "AI-скоринг лидов в amoCRM/Битрикс24",
    scopeLabel: "1 воронка",
    offers: [{ price: 50000, duration: "от 2 недель", tags: ["top"], promoted: true, tagline: "Менеджер видит, кому звонить в первую очередь, без гадания" }],
  },
  {
    category: "crm-ai",
    subcategory: "Автозаполнение данных",
    title: "Автозаполнение карточек сделок из переписки",
    scopeLabel: "1 канал (почта/мессенджер)",
    offers: [{ price: 40000, duration: "от 10 дней", tags: ["has_examples"], tagline: "Данные из чата попадают в CRM сами — никто не забудет их внести" }],
  },
  {
    category: "crm-ai",
    subcategory: "Автозаполнение данных",
    title: "Интеграция AI-суммаризации звонков в CRM",
    scopeLabel: "1 источник звонков",
    offers: [{ price: 45000, duration: "от 10 дней", tags: ["verified"], tagline: "Краткое содержание звонка появляется в карточке сделки само" }],
  },
  {
    category: "crm-ai",
    subcategory: "Напоминания и уведомления",
    title: "AI-напоминания менеджерам о просроченных задачах",
    scopeLabel: "1 CRM, до 5 триггеров",
    offers: [{ price: 25000, duration: "от 1 недели", tags: ["online"], tagline: "Сделки перестают зависать без ответа клиенту неделями" }],
  },

  // Промпт-инжиниринг / файнтюнинг
  {
    category: "prompt-engineering",
    subcategory: "Промпт-инжиниринг",
    title: "Оптимизация промптов существующего AI-продукта",
    scopeLabel: "до 10 сценариев",
    offers: [{ price: 30000, duration: "от 1 недели", tags: ["urgent"], tagline: "Те же вопросы — точнее ответы, без переписывания продукта с нуля" }],
  },
  {
    category: "prompt-engineering",
    subcategory: "Файнтюнинг",
    title: "Файнтюнинг модели под узкую задачу",
    scopeLabel: "1 датасет, 1 модель",
    offers: [{ price: 80000, duration: "от 2 недель", tags: ["top", "guaranteed"], promoted: true, tagline: "Модель, дообученная именно на ваших данных и терминах" }],
  },
  {
    category: "prompt-engineering",
    subcategory: "Файнтюнинг",
    title: "Сбор и разметка датасета для файнтюнинга",
    scopeLabel: "до 500 примеров",
    offers: [{ price: 35000, duration: "от 1 недели", tags: ["online"], tagline: "Готовый датасет под задачу, если своих примеров пока нет" }],
  },
  {
    category: "prompt-engineering",
    subcategory: "Оптимизация расходов на AI",
    title: "Снижение стоимости AI-продукта (переход на меньшую модель)",
    scopeLabel: "1 продукт, отчёт по экономии",
    offers: [{ price: 40000, duration: "от 10 дней", tags: ["verified"], tagline: "То же качество ответов, но счёт за API заметно меньше" }],
  },

  // AI-аналитика и отчётность
  {
    category: "ai-analytics",
    subcategory: "AI-дашборды",
    title: "Дашборд с AI-инсайтами по продажам",
    scopeLabel: "до 3 источников данных",
    offers: [{ price: 60000, duration: "от 2 недель", tags: ["top", "has_examples"], promoted: true, tagline: "Дашборд сам подсвечивает аномалии в продажах" }],
  },
  {
    category: "ai-analytics",
    subcategory: "Отчёты на естественном языке",
    title: "AI-отчёт «спроси на языке» поверх существующих таблиц",
    scopeLabel: "1 набор данных",
    offers: [{ price: 45000, duration: "от 10 дней", tags: ["verified"], tagline: "Руководитель спрашивает «почему упали продажи» и получает ответ" }],
  },
  {
    category: "ai-analytics",
    subcategory: "Отчёты на естественном языке",
    title: "Автоматический еженедельный AI-отчёт руководителю",
    scopeLabel: "1 отчёт",
    offers: [{ price: 20000, duration: "от 5 дней", tags: ["online"], tagline: "Отчёт приходит сам по понедельникам — никто его не забывает собрать" }],
  },
  {
    category: "ai-analytics",
    subcategory: "Мониторинг и алерты",
    title: "Поиск аномалий в данных с AI-алертами",
    scopeLabel: "1 метрика, ежедневный мониторинг",
    offers: [{ price: 35000, duration: "от 1 недели", tags: ["guaranteed"], tagline: "Узнаёте о проблеме в тот же день, как только она появилась" }],
  },
];

function slugify(category: string, subcategory: string, title: string): string {
  const base = `${category}-${subcategory}-${title}`
    .toLowerCase()
    .replace(/[«»]/g, "")
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .trim();
  // Транслитерация упрощённая — этого достаточно для уникальных читаемых
  // слагов на моках, не для продакшен-транслитерации кириллицы.
  const translitMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  const translit = base
    .split("")
    .map((ch) => translitMap[ch] ?? ch)
    .join("");
  return translit.replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}

export const mockResultTypes: ResultType[] = RAW_TYPES.map((raw) => {
  const slug = slugify(raw.category, raw.subcategory, raw.title);
  return {
    id: slug,
    slug,
    categorySlug: raw.category,
    subcategory: raw.subcategory,
    title: raw.title,
    scopeLabel: raw.scopeLabel,
    coverImageUrl: getCoverImagePath(slug),
  };
});

export const mockServiceOffers: ServiceOffer[] = RAW_TYPES.flatMap((raw) => {
  const resultTypeSlug = slugify(raw.category, raw.subcategory, raw.title);
  const defaultProvider = PROVIDERS[raw.category];
  return raw.offers.map((offer, i) => {
    const provider = offer.seller ?? defaultProvider;
    return {
      id: `${resultTypeSlug}-offer-${i + 1}`,
      resultTypeSlug,
      tagline: offer.tagline,
      priceType: "from" as const,
      priceValue: offer.price,
      durationFrom: offer.duration,
      scopeLabel: raw.scopeLabel,
      revisionsIncluded: offer.revisions,
      tags: offer.tags,
      promoted: offer.promoted,
      specialistSlug: provider.slug,
      specialistName: provider.name,
      specialistAvatarInitials: provider.initials,
      specialistRating: provider.rating,
      specialistCompletedOrders: provider.completedOrders,
    };
  });
});

export interface ResultTypeSummary extends ResultType {
  offersCount: number;
  minPrice: number;
  bestRating: number;
  hasPromoted: boolean;
}

export function getOffersForType(resultTypeSlug: string): ServiceOffer[] {
  return mockServiceOffers
    .filter((o) => o.resultTypeSlug === resultTypeSlug)
    .sort((a, b) => {
      if (Boolean(b.promoted) !== Boolean(a.promoted)) {
        return Number(Boolean(b.promoted)) - Number(Boolean(a.promoted));
      }
      return b.specialistRating - a.specialistRating;
    });
}

export const mockResultTypeSummaries: ResultTypeSummary[] = mockResultTypes.map((type) => {
  const offers = getOffersForType(type.slug);
  return {
    ...type,
    offersCount: offers.length,
    minPrice: Math.min(...offers.map((o) => o.priceValue)),
    bestRating: Math.max(...offers.map((o) => o.specialistRating)),
    hasPromoted: offers.some((o) => o.promoted),
  };
});

// Топ плашек для главной — продвигаемые вперёд, затем по рейтингу лучшего
// предложения (тот же принцип, что раньше применялся к профилям, теперь —
// к типам результата, см. ТЗ §4.4/§8.3 и PIVOT_SERVICE_CARDS.md).
export const mockTopResultTypes: ResultTypeSummary[] = [...mockResultTypeSummaries].sort(
  (a, b) => {
    if (b.hasPromoted !== a.hasPromoted) {
      return Number(b.hasPromoted) - Number(a.hasPromoted);
    }
    return b.bestRating - a.bestRating;
  }
);
