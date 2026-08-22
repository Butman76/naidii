// Мок для кабинета заказчика (/dashboard/customer). Поля заявок/отзывов
// соответствуют коллекциям leads и reviews из pocketbase/pb_migrations —
// статусы заявок взяты из leads.status, "Избранное" в реальной схеме ещё
// не реализовано (см. pocketbase/README.md, роадмап Этап 3), здесь только
// визуальный мокап этой функции.

export type CustomerLeadStatus =
  | "new"
  | "in_progress"
  | "responded"
  | "deal"
  | "closed";

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
  in_progress: "В работе",
  responded: "Специалист ответил",
  deal: "Сделка",
  closed: "Закрыта",
};

export const CUSTOMER_LEAD_STATUS_STYLES: Record<CustomerLeadStatus, string> = {
  new: "bg-violet-100 text-violet-800",
  in_progress: "bg-amber-100 text-amber-800",
  responded: "bg-sky-100 text-sky-800",
  deal: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-600",
};

export const mockCustomerStats = {
  activeLeads: 2,
  totalLeads: 5,
  favoritesCount: 3,
};

export const mockCustomerLeads: CustomerLead[] = [
  {
    id: "clead-1",
    specialistName: "Студия NeuroWorks",
    specialistSlug: "specialist-2",
    message: "Хотим RAG-поиск по базе договоров, около 5000 документов.",
    status: "responded",
    createdAt: "2026-08-20",
  },
  {
    id: "clead-2",
    specialistName: "Ирина Соколова",
    specialistSlug: "specialist-4",
    message: "Нужен Telegram-бот для записи в барбершоп с оплатой.",
    status: "in_progress",
    createdAt: "2026-08-17",
  },
  {
    id: "clead-3",
    specialistName: "Студия «Автоматика»",
    specialistSlug: "specialist-5",
    message: "Обзвон базы клиентов голосовым агентом, около 2000 контактов.",
    status: "deal",
    createdAt: "2026-08-10",
  },
  {
    id: "clead-4",
    specialistName: "Павел Новиков",
    specialistSlug: "specialist-7",
    message: "Скоринг лидов в amoCRM.",
    status: "closed",
    createdAt: "2026-07-28",
  },
];

export const mockCustomerReviews: CustomerReview[] = [
  {
    id: "crev-1",
    specialistName: "Студия «Автоматика»",
    specialistSlug: "specialist-5",
    rating: 5,
    text: "Голосовой агент подтверждает заказы без участия операторов, качество речи не отличить от живого человека.",
    createdAt: "2026-08-11",
  },
];

export const mockCustomerFavoriteSlugs: string[] = [
  "specialist-1",
  "specialist-5",
  "specialist-9",
];
