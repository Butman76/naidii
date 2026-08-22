// Мок для /admin. Статусы и сущности соответствуют коллекциям
// specialist_profiles.profile_status, reviews.status и admin_logs из
// pocketbase/pb_migrations — очередь модерации и журнал действий здесь
// показывают форму, реальных проверок и записи в БД ещё нет.

export interface PendingProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  submittedAt: string;
}

export interface PendingReview {
  id: string;
  author: string;
  specialistName: string;
  rating: number;
  text: string;
  submittedAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  entityLabel: string;
  createdAt: string;
}

export const mockAdminStats = {
  pendingProfiles: 3,
  pendingReviews: 2,
  newLeadsToday: 6,
};

export const mockPendingProfiles: PendingProfile[] = [
  {
    id: "pp-1",
    name: "Егор Данилов",
    title: "AI-агенты для e-commerce",
    category: "AI-агенты",
    submittedAt: "2026-08-21",
  },
  {
    id: "pp-2",
    name: "Студия «Гелиос»",
    title: "Голосовые боты для здравоохранения",
    category: "Голосовые AI-агенты",
    submittedAt: "2026-08-20",
  },
  {
    id: "pp-3",
    name: "Анна Реброва",
    title: "Промпт-инжиниринг под ключ",
    category: "Промпт-инжиниринг / файнтюнинг",
    submittedAt: "2026-08-19",
  },
];

export const mockPendingReviews: PendingReview[] = [
  {
    id: "pr-1",
    author: "Клиент, розничная сеть",
    specialistName: "Ольга Петрова",
    rating: 5,
    text: "Дашборд с AI-инсайтами реально экономит время на еженедельной отчётности.",
    submittedAt: "2026-08-21",
  },
  {
    id: "pr-2",
    author: "Клиент, IT-стартап",
    specialistName: "Артём Лебедев",
    rating: 4,
    text: "Промпты стали заметно точнее, но пришлось подождать пару итераций.",
    submittedAt: "2026-08-20",
  },
];

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: "log-1",
    adminName: "admin@naidii.ru",
    action: "Одобрил профиль",
    entityLabel: "Дмитрий Волков",
    createdAt: "2026-08-21 14:02",
  },
  {
    id: "log-2",
    adminName: "admin@naidii.ru",
    action: "Отклонил отзыв",
    entityLabel: "Отзыв к профилю «Ирина Соколова»",
    createdAt: "2026-08-21 11:47",
  },
  {
    id: "log-3",
    adminName: "moderator@naidii.ru",
    action: "Изменил тариф",
    entityLabel: "План «Стандарт»",
    createdAt: "2026-08-20 16:30",
  },
];
