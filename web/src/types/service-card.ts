// Карточка услуги — главный объект каталога (см. PIVOT_SERVICE_CARDS.md).
// Модель на два уровня, разделы 1/6 правки ТЗ:
//
// - ResultType — «Тип результата», сама плашка (обложка, название,
//   подкатегория). Одна и та же плашка для всех специалистов, которые его
//   предлагают — как «Telegram Звёзды» у Playerok, а не отдельная карточка
//   на каждого продавца.
// - ServiceOffer — конкретное предложение специалиста ПО этому типу: цена,
//   срок, свои метки. Несколько офферов могут ссылаться на один и тот же
//   ResultType (сравнение цены/срока/исполнителя), либо всего один.
//
// Поля соответствуют pocketbase/pb_migrations/1755000016_service_cards_pivot.js
// — при переносе на бэкенд ResultType, скорее всего, живёт в отдельной
// коллекции (или в services без specialist_profile_id), а ServiceOffer —
// в services с обязательным specialist_profile_id и ссылкой на ResultType.
// Это ещё не реализовано на бэкенде, см. STATUS.md.

export type ServiceCardTag =
  | "urgent"
  | "online"
  | "guaranteed"
  | "has_examples"
  | "verified"
  | "top";

export const SERVICE_TAG_LABELS: Record<ServiceCardTag, string> = {
  urgent: "Срочно",
  online: "Онлайн",
  guaranteed: "С гарантией",
  has_examples: "Есть примеры",
  verified: "Проверенный исполнитель",
  top: "Топ-исполнитель",
};

export type ServicePriceType = "fixed" | "from";

export interface ResultType {
  id: string;
  slug: string;
  categorySlug: string;
  subcategory: string;
  title: string;
  scopeLabel: string;
  // Путь к настоящей обложке (web/public/covers/{slug}.png), когда она уже
  // сгенерирована — см. cover-manifest.ts. Пока не задана — плашка
  // показывает CSS-градиент направления + эмодзи-иконку вместо неё.
  coverImageUrl?: string;
}

export interface ServiceOffer {
  id: string;
  resultTypeSlug: string;
  tagline: string;
  priceType: ServicePriceType;
  priceValue: number;
  durationFrom: string;
  scopeLabel: string;
  revisionsIncluded?: number;
  tags: ServiceCardTag[];
  promoted?: boolean;
  // Реальный id записи specialist_profiles (не слаг) — нужен, чтобы отправить
  // заявку (leads.specialist_profile_id — relation, ждёт id, не слаг).
  specialistProfileId: string;
  specialistSlug: string;
  specialistName: string;
  specialistAvatarInitials: string;
  specialistRating: number;
  specialistCompletedOrders: number;
}

export function formatPrice(priceType: ServicePriceType, priceValue: number): string {
  const amount = priceValue.toLocaleString("ru-RU");
  return priceType === "fixed" ? `${amount} ₽` : `от ${amount} ₽`;
}
