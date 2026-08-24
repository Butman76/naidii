// Общие типы/подписи статусов для кабинета специалиста — сами данные
// (заявки/кейсы) теперь приходят живыми из PocketBase (leads, cases —
// см. web/src/lib/dashboard.ts), здесь остаются только enum-значения из
// схемы БД (leads.status) и их русские подписи для UI.

export type LeadStatus =
  | "new"
  | "transferred"
  | "in_progress"
  | "responded"
  | "deal"
  | "closed"
  | "spam";

export interface DashboardLead {
  id: string;
  clientName: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

export interface DashboardCase {
  id: string;
  title: string;
  industry: string;
  result: string;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  transferred: "Передана",
  in_progress: "В работе",
  responded: "Ответили",
  deal: "Сделка",
  closed: "Закрыта",
  spam: "Спам",
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-violet-100 text-violet-800",
  transferred: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-800",
  responded: "bg-sky-100 text-sky-800",
  deal: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-600",
  spam: "bg-red-100 text-red-700",
};
