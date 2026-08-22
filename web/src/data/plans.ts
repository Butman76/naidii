// Мок для /tariffs — поля соответствуют коллекции plans из
// pocketbase/pb_migrations/1755000008_plans.js. Оплата ещё не подключена
// (см. STATUS.md), поэтому это витрина без реального оформления заказа.
export interface Plan {
  code: string;
  title: string;
  price: number;
  durationDays: number;
  servicesLimit: number | null;
  casesLimit: number | null;
  analyticsEnabled: boolean;
  promotionAccess: boolean;
  trialDays: number;
  richProfile: boolean;
  description: string;
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    code: "start",
    title: "Старт",
    price: 0,
    durationDays: 30,
    servicesLimit: 1,
    casesLimit: 0,
    analyticsEnabled: false,
    promotionAccess: false,
    trialDays: 0,
    richProfile: false,
    description: "Разместить карточку и попробовать площадку без оплаты.",
  },
  {
    code: "standard",
    title: "Стандарт",
    price: 2900,
    durationDays: 30,
    servicesLimit: 5,
    casesLimit: 3,
    analyticsEnabled: true,
    promotionAccess: false,
    trialDays: 14,
    richProfile: false,
    description: "Полноценный профиль для специалиста, который уже работает с клиентами через площадку.",
  },
  {
    code: "max",
    title: "Максимальный",
    price: 9900,
    durationDays: 30,
    servicesLimit: null,
    casesLimit: null,
    analyticsEnabled: true,
    promotionAccess: true,
    trialDays: 14,
    richProfile: true,
    description: "Профиль-лендинг вместо обычной карточки, продвижение в топ-20 и приоритет в выдаче.",
    recommended: true,
  },
];

export const PLAN_FEATURE_ROWS: Array<{
  label: string;
  getValue: (plan: Plan) => string;
}> = [
  {
    label: "Услуг в профиле",
    getValue: (p) => (p.servicesLimit === null ? "Без ограничений" : String(p.servicesLimit)),
  },
  {
    label: "Кейсов в портфолио",
    getValue: (p) => (p.casesLimit === null ? "Без ограничений" : String(p.casesLimit)),
  },
  {
    label: "Аналитика профиля",
    getValue: (p) => (p.analyticsEnabled ? "Есть" : "—"),
  },
  {
    label: "Продвижение в топ-20",
    getValue: (p) => (p.promotionAccess ? "Есть" : "—"),
  },
  {
    label: "Профиль-лендинг",
    getValue: (p) => (p.richProfile ? "Есть" : "—"),
  },
  {
    label: "Пробный период",
    getValue: (p) => (p.trialDays > 0 ? `${p.trialDays} дней` : "—"),
  },
];
