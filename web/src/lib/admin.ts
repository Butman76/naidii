import type PocketBase from "pocketbase";

// Данные для кабинета модератора/админа (Фаза 2) — четыре очереди
// (профили специалистов, заявки на новые типы услуг, отзывы, пользователи)
// плюс запись каждого действия в admin_logs (ТЗ §8.6, неизменяемый журнал —
// см. pocketbase/pb_migrations/1755000013_admin_logs.js).

export interface PendingProfile {
  id: string;
  userId: string;
  publicName: string;
  title: string;
  status: string;
  ownerEmail: string;
  createdAt: string;
}

export interface PendingResultType {
  id: string;
  title: string;
  subcategory: string;
  categoryName: string;
  description: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface PendingReview {
  id: string;
  rating: number;
  text: string;
  specialistName: string;
  customerName: string;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminLogEntry {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface ModerationData {
  profiles: PendingProfile[];
  resultTypes: PendingResultType[];
  reviews: PendingReview[];
  users: AdminUserRow[];
}

export async function fetchModerationData(pb: PocketBase): Promise<ModerationData> {
  const [profileRecords, typeRecords, reviewRecords, userRecords] = await Promise.all([
    pb.collection("specialist_profiles").getFullList({
      filter: 'profile_status = "pending"',
      expand: "user_id",
      sort: "created",
    }),
    pb.collection("result_types").getFullList({
      filter: 'status = "pending"',
      expand: "category_id,created_by",
      sort: "created",
    }),
    pb.collection("reviews").getFullList({
      filter: 'status = "pending"',
      expand: "specialist_profile_id,customer_id",
      sort: "created",
    }),
    pb.collection("users").getFullList({ sort: "-created" }),
  ]);

  const profiles: PendingProfile[] = profileRecords.map((p) => ({
    id: p.id,
    userId: p.user_id,
    publicName: p.public_name || "Без названия",
    title: p.title || "",
    status: p.profile_status,
    ownerEmail: p.expand?.user_id?.email ?? "",
    createdAt: p.created,
  }));

  const resultTypes: PendingResultType[] = typeRecords.map((t) => ({
    id: t.id,
    title: t.title,
    subcategory: t.subcategory,
    categoryName: t.expand?.category_id?.title ?? t.expand?.category_id?.slug ?? "",
    description: t.description ?? "",
    authorName: t.expand?.created_by?.name ?? "",
    authorEmail: t.expand?.created_by?.email ?? "",
    createdAt: t.created,
  }));

  const reviews: PendingReview[] = reviewRecords.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text ?? "",
    specialistName: r.expand?.specialist_profile_id?.public_name ?? "",
    customerName: r.expand?.customer_id?.name ?? r.expand?.customer_id?.email ?? "",
    createdAt: r.created,
  }));

  const users: AdminUserRow[] = userRecords.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.created,
  }));

  return { profiles, resultTypes, reviews, users };
}

export async function logAdminAction(
  pb: PocketBase,
  params: {
    action: string;
    entityType: string;
    entityId: string;
    oldData?: unknown;
    newData?: unknown;
  }
): Promise<void> {
  const adminId = pb.authStore.record?.id;
  if (!adminId) return;
  try {
    await pb.collection("admin_logs").create({
      admin_id: adminId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
    });
  } catch {
    // Журнал — вспомогательная вещь: если запись в него не прошла, само
    // модераторское действие (уже применённое до вызова этой функции) не
    // должно откатываться из-за этого.
  }
}

export async function fetchAdminLogs(pb: PocketBase): Promise<AdminLogEntry[]> {
  const records = await pb.collection("admin_logs").getFullList({
    expand: "admin_id",
    sort: "-created",
  });
  return records.map((r) => ({
    id: r.id,
    adminName: r.expand?.admin_id?.name ?? r.expand?.admin_id?.email ?? "—",
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id ?? "",
    createdAt: r.created,
  }));
}
