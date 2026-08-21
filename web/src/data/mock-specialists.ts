import type { Specialist, SpecialistBadge } from "@/types/specialist";

// TODO: replace with a real fetch from PocketBase (specialist_profiles,
// joined with promotions for the Топ-20 grid per ТЗ §4.4/§8.3) once the
// backend is reachable over a public domain — see pocketbase/README.md.
// This placeholder data exists only to preview page layouts while
// naidii.ru's DNS is still pending (expected 2026-08-24).
const TEMPLATES: Array<{
  name: string;
  title: string;
  shortDescription: string;
  skills: string[];
  priceFrom: string;
  location: string;
}> = [
  {
    name: "Алексей Морозов",
    title: "AI-интегратор · n8n-разработчик",
    shortDescription:
      "Автоматизирую продажи, поддержку и отчётность с помощью AI-агентов и CRM-интеграций.",
    skills: ["n8n", "Битрикс24", "Telegram", "GPT", "API"],
    priceFrom: "От 60 000 ₽ за проект",
    location: "Москва · Удалённо",
  },
  {
    name: "Студия «Автоматика»",
    title: "AI-агенты для отдела продаж",
    shortDescription:
      "Внедряем AI-агентов и голосовых ботов для обработки входящих заявок 24/7.",
    skills: ["RAG", "LLM", "amoCRM", "Python"],
    priceFrom: "От 120 000 ₽ за проект",
    location: "Санкт-Петербург · Удалённо",
  },
  {
    name: "Ирина Соколова",
    title: "Нейрокодировщик · Telegram-боты",
    shortDescription:
      "Пишу Telegram-ботов с AI на Python, интегрирую с 1С и складскими системами.",
    skills: ["Python", "Telegram", "1С", "Webhooks"],
    priceFrom: "От 45 000 ₽ за проект",
    location: "Удалённо",
  },
  {
    name: "Дмитрий Волков",
    title: "RPA-разработчик · Make-эксперт",
    shortDescription:
      "Автоматизирую рутину в бухгалтерии и логистике сценариями Make и RPA.",
    skills: ["Make", "RPA", "Excel", "API"],
    priceFrom: "От 35 000 ₽ за проект",
    location: "Казань · Удалённо",
  },
  {
    name: "Студия NeuroWorks",
    title: "RAG и базы знаний",
    shortDescription:
      "Строим корпоративные базы знаний с RAG-поиском и голосовыми AI-ботами.",
    skills: ["RAG", "LLM", "Python", "JavaScript"],
    priceFrom: "От 150 000 ₽ за проект",
    location: "Удалённо",
  },
  {
    name: "Павел Новиков",
    title: "CRM-интегратор · Zapier / Albato",
    shortDescription:
      "Связываю CRM, сайты и мессенджеры без единой строчки кода на Zapier и Albato.",
    skills: ["Zapier", "Albato", "amoCRM", "Webhooks"],
    priceFrom: "От 25 000 ₽ за проект",
    location: "Екатеринбург · Удалённо",
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
// фильтры и сортировку. Первые 20 совпадают с mockTopSpecialists, т.к. оба
// массива детерминированно строятся из одних и тех же шаблонов.
export const mockSpecialists: Specialist[] = buildMockSpecialists(48);
