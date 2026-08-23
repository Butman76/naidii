// Слайды карусели на главной — по одному на направление (кроме "other",
// у него нет фиксированного набора продуктов для рекламной картинки).
// Изображения — см. BANNER_PROMPTS.md и banner-manifest.ts; пока баннер не
// сгенерирован, слайд показывает градиент направления + иконку вместо
// картинки (тот же приём, что у ResultTypePlate).
export interface HeroBannerSlide {
  categorySlug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export const HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    categorySlug: "ai-agents",
    eyebrow: "AI-агенты",
    title: "Незаменимый помощник для бизнеса",
    subtitle: "Обрабатывает заявки и экономит бюджет на найме",
  },
  {
    categorySlug: "rag",
    eyebrow: "RAG",
    title: "Умный поиск по вашим документам",
    subtitle: "Ответ со ссылкой на источник за секунды",
  },
  {
    categorySlug: "orchestration",
    eyebrow: "Оркестрация",
    title: "Сервисы работают заодно",
    subtitle: "Заявка сама доходит от сайта до отчёта",
  },
  {
    categorySlug: "chatbots",
    eyebrow: "Чат-боты",
    title: "Продажи и поддержка 24/7",
    subtitle: "Отвечает клиентам, пока вы спите",
  },
  {
    categorySlug: "voice-ai",
    eyebrow: "Голосовые агенты",
    title: "Звонки без операторов",
    subtitle: "Живая речь, которую не отличить от человека",
  },
  {
    categorySlug: "ai-video",
    eyebrow: "AI-видео",
    title: "Ролики без съёмочной группы",
    subtitle: "AI-аватар, монтаж и озвучка за считанные дни",
  },
  {
    categorySlug: "crm-ai",
    eyebrow: "CRM + AI",
    title: "CRM, которая думает за менеджера",
    subtitle: "Сама расставляет приоритеты по горячим лидам",
  },
  {
    categorySlug: "prompt-engineering",
    eyebrow: "Промпт-инжиниринг",
    title: "Модель, настроенная под задачу",
    subtitle: "Точнее ответы, дешевле каждый запрос",
  },
  {
    categorySlug: "ai-analytics",
    eyebrow: "AI-аналитика",
    title: "Данные сами всё объясняют",
    subtitle: "Спросите дашборд — получите ответ на языке",
  },
];
