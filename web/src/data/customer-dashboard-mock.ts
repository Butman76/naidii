// Общие типы/подписи статусов для кабинета заказчика — заявки и отзывы
// теперь приходят живыми из PocketBase (leads/reviews, см.
// web/src/lib/dashboard.ts), здесь остаются только enum-значения из схемы
// БД (leads.status) и их русские подписи для UI. "Избранное" в реальной
// схеме ещё не реализовано (см. pocketbase/README.md, роадмап Этап 3).

export type CustomerLeadStatus =
  | "new"
  | "transferred"
  | "in_progress"
  | "responded"
  | "deal"
  | "closed"
  | "spam";

export interface CustomerLead {
  id: string;
  specialistName: string;
  specialistSlug: string;
  message: string;
  status: CustomerLeadStatus;
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  specialistName: string;
  specialistSlug: string;
  rating: number;
  text: string;
  createdAt: string;
}

export const CUSTOMER_LEAD_STATUS_LABELS: Record<CustomerLeadStatus, string> = {
  new: "Отправлена",
  transferred: "Передана",
  in_progress: "В работе",
  responded: "Специалист ответил",
  deal: "Сделка",
  closed: "Закрыта",
  spam: "Спам",
};

export const CUSTOMER_LEAD_STATUS_STYLES: Record<CustomerLeadStatus, string> = {
  new: "bg-violet-100 text-violet-800",
  transferred: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-800",
  responded: "bg-sky-100 text-sky-800",
  deal: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-600",
  spam: "bg-red-100 text-red-700",
};
