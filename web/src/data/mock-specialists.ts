import type { Specialist, SpecialistBadge } from "@/types/specialist";

// TODO: replace with a real fetch from PocketBase (specialist_profiles,
// joined with promotions for the Топ-20 grid per ТЗ §4.4/§8.3) once the
// backend is reachable over a public domain — see pocketbase/README.md.
// This placeholder data exists only to preview page layouts while
// naidii.ru's DNS is still pending (expected 2026-08-24).
//
// Один шаблон на направление (см. web/src/data/categories.ts) — площадка
// про AI-агентов и автоматизацию, не про программистов вообще, поэтому
// навыки внутри каждого шаблона — инструменты именно этого направления, а
// не общий IT-стек.
const TEMPLATES: Array<{
  name: string;
  title: string;
  shortDescription: string;
  category: string;
  skills: string[];
  priceFrom: string;
  location: string;
}> = [
  {
    name: "Алексей Морозов",
    title: "AI-агенты для продаж и поддержки",
    shortDescription:
      "Собираю AI-агентов, которые обрабатывают заявки, отвечают на вопросы клиентов и передают тёплых лидов менеджерам.",
    category: "ai-agents",
    skills: ["GPT-4", "LangChain", "n8n", "CRM-интеграция"],
    priceFrom: "От 60 000 ₽ за проект",
    location: "Москва · Удалённо",
  },
  {
    name: "Студия NeuroWorks",
    title: "RAG и корпоративные базы знаний",
    shortDescription:
      "Строим поиск по внутренним документам компании с RAG — базы знаний, ответы саппорта, юридическая экспертиза текстов.",
    category: "rag",
    skills: ["RAG", "Vector DB", "LLM", "Python"],
    priceFrom: "От 150 000 ₽ за проект",
    location: "Удалённо",
  },
  {
    name: "Дмитрий Волков",
    title: "No-code оркестрация процессов",
    shortDescription:
      "Связываю сервисы и AI-модели в сценарии на n8n и Make — без единой строчки кода, от заявки до отчёта.",
    category: "orchestration",
    skills: ["n8n", "Make", "Zapier", "Albato"],
    priceFrom: "От 35 000 ₽ за проект",
    location: "Казань · Удалённо",
  },
  {
    name: "Ирина Соколова",
    title: "AI Telegram-боты под ключ",
    shortDescription:
      "Пишу Telegram- и WhatsApp-ботов с LLM внутри: продажи, запись на услуги, поддержка 24/7.",
    category: "chatbots",
    skills: ["Telegram", "WhatsApp", "GPT", "Python"],
    priceFrom: "От 45 000 ₽ за проект",
    location: "Удалённо",
  },
  {
    name: "Студия «Автоматика»",
    title: "Голосовые AI-агенты для колл-центра",
    shortDescription:
      "Внедряем голосовых AI-агентов для входящих и исходящих звонков — без операторов, с живой речью.",
    category: "voice-ai",
    skills: ["Voice AI", "STT/TTS", "Twilio", "IVR"],
    priceFrom: "От 120 000 ₽ за проект",
    location: "Санкт-Петербург · Удалённо",
  },
  {
    name: "Марина Ким",
    title: "AI-видео и генеративный контент",
    shortDescription:
      "Делаю рекламные и обучающие ролики на нейросетях: AI-аватары, генерация видео, озвучка и монтаж.",
    category: "ai-video",
    skills: ["Runway", "Kling", "AI-аватары", "Монтаж"],
    priceFrom: "От 40 000 ₽ за проект",
    location: "Удалённо",
  },
  {
    name: "Павел Новиков",
    title: "AI-слой поверх CRM и 1С",
    shortDescription:
      "Добавляю AI-логику в amoCRM, Битрикс24 и 1С: автозаполнение карточек, скоринг лидов, умные напоминания.",
    category: "crm-ai",
    skills: ["amoCRM", "Битрикс24", "1С", "API"],
    priceFrom: "От 55 000 ₽ за проект",
    location: "Екатеринбург · Удалённо",
  },
  {
    name: "Артём Лебедев",
    title: "Промпт-инжиниринг и файнтюнинг LLM",
    shortDescription:
      "Настраиваю модели под задачу заказчика: от подбора промптов до дообучения LoRA на своих данных.",
    category: "prompt-engineering",
    skills: ["Fine-tuning", "Prompt Engineering", "OpenAI API", "LoRA"],
    priceFrom: "От 80 000 ₽ за проект",
    location: "Удалённо",
  },
  {
    name: "Ольга Петрова",
    title: "AI-аналитика и умные дашборды",
    shortDescription:
      "Строю дашборды с AI-инсайтами поверх данных бизнеса — прогнозы, аномалии, отчёты на естественном языке.",
    category: "ai-analytics",
    skills: ["Дашборды", "LLM-аналитика", "Python", "BI"],
    priceFrom: "От 70 000 ₽ за проект",
    location: "Новосибирск · Удалённо",
  },
  {
    name: "Сергей Гриценко",
    title: "AI для юридической экспертизы документов",
    shortDescription:
      "Своё направление на стыке права и AI: автоматическая проверка договоров на риски перед подписанием.",
    category: "other",
    skills: ["Document AI", "LLM", "Юриспруденция"],
    priceFrom: "От 90 000 ₽ за проект",
    location: "Удалённо",
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
      category: t.category,
      skills: t.skills,
      priceFrom: t.priceFrom,
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
    };
  });
}

// Топ-20 продвигаемых специалистов для главной (ТЗ §4.4/§8.3).
export const mockTopSpecialists: Specialist[] = buildMockSpecialists(20);

// Полный каталог для /specialists — крупнее, чтобы было на чём проверять
// фильтры и сортировку. Первые 10 совпадают с mockTopSpecialists, т.к. оба
// массива детерминированно строятся из одних и тех же шаблонов.
export const mockSpecialists: Specialist[] = buildMockSpecialists(48);
