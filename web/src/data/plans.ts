// Источник цен для /tariffs, кабинета специалиста и живой оплаты через
// ЮKassa (web/src/lib/payments.ts читает именно эти цифры, не берёт их из
// запроса клиента) — см. STATUS.md. Модель — только подписка.
// PocketBase-коллекция pocketbase/pb_migrations/1755000008_plans.js под
// старую модель фронтендом не используется (данные всегда шли из этого
// файла), поэтому её схему не трогаем — почему это безопасно, см.
// комментарий в самой миграции.
//
// Комиссия с подтверждённой сделки (эскроу/«безопасная сделка») временно
// убрана из тарифов (2026-09-27): у ЮKassa такой механизм доступен только
// при обороте площадки от 800 000 ₽/мес, у нас пока меньше. Поле
// commissionPercent убрано из Plan — вернуть вместе с реальной интеграцией,
// когда оборот это позволит; commissionPercent в pb_migrations/1755000008
// не трогаем, он и так не используется фронтендом.
//
// Базовый — подписка 500 ₽/мес (2026-09-28: раньше по ошибке был
// разовый вход 500 ₽ без подписки, поправлено по просьбе пользователя).
// До конца октября 2026 действует акция: первая оплата Базового даёт не
// 30, а 90 дней (3 месяца по цене одного) — см. BASIC_PROMO_END_ISO и
// isBasicPromoActive() ниже, читает и страница тарифов (баннер со
// счётчиком), и lib/payments.ts (реальный срок при оплате).
export interface Plan {
  code: string;
  title: string;
  /** Разовый платёж при регистрации на тариф, ₽. 0, если входа нет. */
  entryFee: number;
  /** Абонентская плата, ₽/мес. 0, если тариф без подписки. */
  monthlyFee: number;
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
    entryFee: 0,
    monthlyFee: 500,
    analyticsEnabled: false,
    promotionAccess: false,
    dedicatedManager: false,
    prioritySupport: false,
    customLanding: false,
    description: "Карточка в каталоге и приём заявок.",
  },
  {
    code: "pro",
    title: "Pro",
    entryFee: 0,
    monthlyFee: 990,
    analyticsEnabled: true,
    promotionAccess: true,
    dedicatedManager: false,
    prioritySupport: false,
    customLanding: false,
    description: "Аналитика профиля и продвижение в топ-20 каталога.",
    recommended: true,
  },
  {
    code: "enterprise",
    title: "Enterprise",
    entryFee: 0,
    monthlyFee: 2900,
    analyticsEnabled: true,
    promotionAccess: true,
    dedicatedManager: true,
    prioritySupport: true,
    customLanding: true,
    description: "Для студий с объёмом: выделенный менеджер, приоритетная поддержка и собственный лендинг вместо карточки.",
  },
];

// Акция на Базовый: первая оплата даёт 3 месяца вместо одного. Дата — конец
// дня 31 октября 2026 по Москве (UTC+3, без перехода на зимнее время).
export const BASIC_PROMO_END_ISO = "2026-10-31T20:59:59.000Z";
export const BASIC_PROMO_MONTHS = 3;

export function isBasicPromoActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(BASIC_PROMO_END_ISO).getTime();
}

export const PLAN_FEATURE_ROWS: Array<{
  label: string;
  getValue: (plan: Plan) => string;
}> = [
  {
    label: "Подписка",
    getValue: (p) => (p.monthlyFee > 0 ? `${p.monthlyFee.toLocaleString("ru-RU")} ₽/мес` : "—"),
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
