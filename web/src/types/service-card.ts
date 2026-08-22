// Карточка услуги — теперь главный объект каталога (см.
// PIVOT_SERVICE_CARDS.md). Поля соответствуют разделу 2 правки ТЗ и полям,
// добавленным в pocketbase/pb_migrations/1755000016_service_cards_pivot.js.

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

export interface ServiceCard {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  tagline: string;
  priceType: ServicePriceType;
  priceValue: number;
  durationFrom: string;
  scopeLabel: string;
  revisionsIncluded?: number;
  tags: ServiceCardTag[];
  promoted?: boolean;
  specialistSlug: string;
  specialistName: string;
  specialistAvatarInitials: string;
  specialistRating: number;
  specialistCompletedOrders: number;
}

export function formatServicePrice(card: ServiceCard): string {
  const amount = card.priceValue.toLocaleString("ru-RU");
  return card.priceType === "fixed" ? `${amount} ₽` : `от ${amount} ₽`;
}
