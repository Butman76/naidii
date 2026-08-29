// Мок для /tariffs. Оплата ещё не подключена (см. STATUS.md), поэтому это
// витрина без реального оформления заказа. Модель сменилась с чистой
// подписки на вход/подписку + процент с подтверждённой сделки (эскроу) —
// см. STATUS.md, договорённость от 2026-08-29. PocketBase-коллекция
// pocketbase/pb_migrations/1755000008_plans.js под старую модель фронтендом
// не используется (данные всегда шли из этого файла), поэтому её схему не
// трогаем — почему это безопасно, см. комментарий в самой миграции.
export interface Plan {
  code: string;
  title: string;
  /** Разовый платёж при регистрации на тариф, ₽. 0, если входа нет. */
  entryFee: number;
  /** Абонентская плата, ₽/мес. 0, если тариф без подписки. */
  monthlyFee: number;
  /** Комиссия площадки с суммы подтверждённой сделки (безопасная сделка/эскроу), %. */
  commissionPercent: number;
  /** Снижение комиссии при объёме — например, для Enterprise. */
  volumeDiscount?: { minDeals: number; commissionPercent: number };
  analyticsEnabled: boolean;
  promotionAccess: boolean;
  dedicatedManager: boolean;
  prioritySupport: boolean;
  customLanding: boolean;
  description: string;
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    code: "basic",
    title: "Базовый",
    entryFee: 500,
    monthlyFee: 0,
    commissionPercent: 12,
    analyticsEnabled: false,
    promotionAccess: false,
    dedicatedManager: false,
    prioritySupport: false,
    customLanding: false,
    description: "Разовый вход на площадку, дальше — без абонентской платы. Комиссия берётся только с подтверждённых сделок.",
  },
  {
    code: "pro",
    title: "Pro",
    entryFee: 0,
    monthlyFee: 990,
    commissionPercent: 10,
    analyticsEnabled: true,
    promotionAccess: true,
    dedicatedManager: false,
    prioritySupport: false,
    customLanding: false,
    description: "Ниже комиссия с каждой сделки, плюс аналитика профиля и продвижение в топ-20 каталога.",
    recommended: true,
  },
  {
    code: "enterprise",
    title: "Enterprise",
    entryFee: 0,
    monthlyFee: 2900,
    commissionPercent: 8,
    volumeDiscount: { minDeals: 50, commissionPercent: 5 },
    analyticsEnabled: true,
    promotionAccess: true,
    dedicatedManager: true,
    prioritySupport: true,
    customLanding: true,
    description: "Для студий с объёмом: выделенный менеджер, приоритетная поддержка и собственный лендинг вместо карточки.",
  },
];

export const PLAN_FEATURE_ROWS: Array<{
  label: string;
  getValue: (plan: Plan) => string;
}> = [
  {
    label: "Вход на площадку",
    getValue: (p) => (p.entryFee > 0 ? `${p.entryFee.toLocaleString("ru-RU")} ₽ разово` : "—"),
  },
  {
    label: "Подписка",
    getValue: (p) => (p.monthlyFee > 0 ? `${p.monthlyFee.toLocaleString("ru-RU")} ₽/мес` : "—"),
  },
  {
    label: "Комиссия с сделки",
    getValue: (p) =>
      p.volumeDiscount
        ? `${p.commissionPercent}% (от ${p.volumeDiscount.minDeals} сделок — ${p.volumeDiscount.commissionPercent}%)`
        : `${p.commissionPercent}%`,
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
    label: "Выделенный менеджер",
    getValue: (p) => (p.dedicatedManager ? "Есть" : "—"),
  },
  {
    label: "Приоритетная поддержка",
    getValue: (p) => (p.prioritySupport ? "Есть" : "—"),
  },
  {
    label: "Собственный лендинг",
    getValue: (p) => (p.customLanding ? "Есть" : "—"),
  },
];
