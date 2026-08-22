// Мок-данные только для демо личного кабинета — не часть общей модели
// Specialist, т.к. заявки/просмотры/кейсы в реальной схеме лежат в
// отдельных коллекциях PocketBase (leads, cases, orders), которые ещё не
// подключены к фронту.

export type LeadStatus = "new" | "in_progress" | "closed";

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
  in_progress: "В работе",
  closed: "Закрыта",
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-violet-100 text-violet-800",
  in_progress: "bg-amber-100 text-amber-800",
  closed: "bg-zinc-100 text-zinc-600",
};

export const mockDashboardStats = {
  profileViews: 342,
  profileViewsChange: "+18% за месяц",
  leadsThisMonth: 8,
  leadsChange: "+2 к прошлому месяцу",
};

export const mockDashboardLeads: DashboardLead[] = [
  {
    id: "lead-1",
    clientName: "Виктор, интернет-магазин",
    message: "Нужен AI-агент для обработки заявок с сайта, до 200 в день.",
    status: "new",
    createdAt: "2026-08-20",
  },
  {
    id: "lead-2",
    clientName: "Мария, онлайн-школа",
    message: "Хотим квалификацию лидов перед звонком менеджера.",
    status: "in_progress",
    createdAt: "2026-08-18",
  },
  {
    id: "lead-3",
    clientName: "Артур, логистическая компания",
    message: "Интересует интеграция агента с нашей CRM (Битрикс24).",
    status: "in_progress",
    createdAt: "2026-08-15",
  },
  {
    id: "lead-4",
    clientName: "Светлана, сеть клиник",
    message: "Нужна запись на приём через AI-агента в Telegram.",
    status: "closed",
    createdAt: "2026-08-05",
  },
];

export const mockDashboardCases: DashboardCase[] = [
  {
    id: "case-1",
    title: "AI-агент для приёма заявок интернет-магазина электроники",
    industry: "E-commerce",
    result: "Треть обращений в поддержку теперь закрывает агент без оператора",
  },
  {
    id: "case-2",
    title: "Квалификация лидов для онлайн-школы",
    industry: "Образование",
    result: "Конверсия из заявки в оплату выросла на 22%",
  },
];
