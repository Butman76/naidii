import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";

// Элементы лендинга специалиста (enterprise) и их модерация (2026-09-20).
// Схема, правила и серверные хуки: pocketbase/pb_migrations/
// 1755000046_landing_items.js, pocketbase/pb_hooks/landing_moderation.pb.js
// (проверены локально на реальном PocketBase: попытки самоодобрения, чужой
// профиль, не-enterprise, замена версии, отказ, типы файлов).
//
// Модель: один элемент = одна строка landing_items. Публично видно только
// moderation_status = "approved". Правка ОДОБРЕННОГО элемента не меняет его
// на месте — создаётся новая строка с replaces_item_id (пока идёт проверка,
// на сайте остаётся старая версия; после одобрения хук переводит старую в
// "superseded"). Здесь это называется "слот" (LandingSlot): live — то, что
// сейчас на сайте, draft — версия, которая проверяется/отклонена.

export type LandingKind = "cover" | "logo" | "video" | "service_card" | "photo" | "presentation";
export type ModerationStatus = "pending" | "approved" | "rejected" | "superseded";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export interface LandingItem {
  id: string;
  profileId: string;
  kind: LandingKind;
  title: string;
  description: string;
  priceText: string;
  durationText: string;
  videoUrl: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  documentUrl: string | null;
  sortOrder: number;
  status: ModerationStatus;
  rejectReason: string;
  replacesId: string;
  reviewedAt: string;
  createdAt: string;
}

export function mapLandingItem(pb: PocketBase, r: RecordModel): LandingItem {
  return {
    id: r.id,
    profileId: r.specialist_profile_id,
    kind: r.kind,
    title: r.title ?? "",
    description: r.description ?? "",
    priceText: r.price_text ?? "",
    durationText: r.duration_text ?? "",
    videoUrl: r.video_url ?? "",
    imageUrl: r.image ? pb.files.getURL(r, r.image) : null,
    thumbUrl: r.image ? pb.files.getURL(r, r.image, { thumb: "800x0" }) : null,
    documentUrl: r.document ? pb.files.getURL(r, r.document) : null,
    sortOrder: r.sort_order ?? 0,
    status: r.moderation_status,
    rejectReason: r.reject_reason ?? "",
    replacesId: r.replaces_item_id ?? "",
    reviewedAt: r.reviewed_at ?? "",
    createdAt: r.created,
  };
}

// ---------------------------------------------------------------- владелец

export async function fetchOwnLandingItems(pb: PocketBase, profileId: string): Promise<LandingItem[]> {
  const records = await pb.collection("landing_items").getFullList({
    filter: pb.filter('specialist_profile_id = {:id} && moderation_status != "superseded"', { id: profileId }),
    sort: "sort_order,created",
  });
  return records.map((r) => mapLandingItem(pb, r));
}

export interface LandingSlot {
  live: LandingItem | null;
  draft: LandingItem | null;
}

const SINGLETON_KINDS: LandingKind[] = ["cover", "logo", "video"];

function newestFirst(a: LandingItem, b: LandingItem): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function buildSlots(items: LandingItem[], kind: LandingKind): LandingSlot[] {
  const ofKind = items.filter((i) => i.kind === kind);
  const approved = ofKind.filter((i) => i.status === "approved").sort(newestFirst);
  const drafts = ofKind.filter((i) => i.status === "pending" || i.status === "rejected").sort(newestFirst);

  if (SINGLETON_KINDS.includes(kind)) {
    if (!approved[0] && !drafts[0]) return [];
    return [{ live: approved[0] ?? null, draft: drafts[0] ?? null }];
  }

  const slots: LandingSlot[] = approved.map((live) => ({
    live,
    draft: drafts.find((d) => d.replacesId === live.id) ?? null,
  }));
  const attached = new Set(slots.map((s) => s.draft?.id));
  for (const d of drafts) {
    if (!attached.has(d.id)) slots.push({ live: null, draft: d });
  }
  const orderOf = (s: LandingSlot) => (s.live ?? s.draft)!;
  return slots.sort((a, b) => {
    const x = orderOf(a);
    const y = orderOf(b);
    return x.sortOrder - y.sortOrder || x.createdAt.localeCompare(y.createdAt);
  });
}

export interface LandingItemInput {
  title?: string;
  description?: string;
  priceText?: string;
  durationText?: string;
  videoUrl?: string;
  image?: File | null;
  document?: File | null;
}

// Скачивает уже загруженный файл обратно как File — нужно, когда правится
// одобренная карточка и автор не выбрал новую картинку: замена создаётся
// новой строкой, а файл в PocketBase нельзя "сослать" на другую запись.
export async function refetchAsFile(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Не удалось получить текущий файл");
  const blob = await res.blob();
  const name = decodeURIComponent(url.split("?")[0].split("/").pop() ?? "file");
  return new File([blob], name, { type: blob.type });
}

function appendText(fd: FormData, input: LandingItemInput) {
  if (input.title !== undefined) fd.set("title", input.title);
  if (input.description !== undefined) fd.set("description", input.description);
  if (input.priceText !== undefined) fd.set("price_text", input.priceText);
  if (input.durationText !== undefined) fd.set("duration_text", input.durationText);
  if (input.videoUrl !== undefined) fd.set("video_url", input.videoUrl);
}

// Сохраняет правку слота по правилам модерации (см. шапку файла):
//  - есть черновик (pending/rejected) -> правим его на месте, он снова
//    уходит на проверку (статус сбрасывает сервер);
//  - есть только одобренная версия -> создаём замену (replaces_item_id);
//  - слота нет -> новый элемент.
export async function saveLandingItem(
  pb: PocketBase,
  params: {
    profileId: string;
    kind: LandingKind;
    slot: LandingSlot | null;
    input: LandingItemInput;
    sortOrder?: number;
  }
): Promise<void> {
  const { profileId, kind, slot, input } = params;
  const col = pb.collection("landing_items");

  if (slot?.draft) {
    const fd = new FormData();
    appendText(fd, input);
    if (input.image) fd.set("image", input.image);
    if (input.document) fd.set("document", input.document);
    await col.update(slot.draft.id, fd);
    return;
  }

  const fd = new FormData();
  fd.set("specialist_profile_id", profileId);
  fd.set("kind", kind);
  fd.set("moderation_status", "pending");
  if (params.sortOrder !== undefined) fd.set("sort_order", String(params.sortOrder));
  appendText(fd, input);

  const live = slot?.live ?? null;
  if (live) {
    fd.set("replaces_item_id", live.id);
    fd.set("sort_order", String(live.sortOrder));
  }

  if (input.image) fd.set("image", input.image);
  else if (live?.imageUrl) fd.set("image", await refetchAsFile(live.imageUrl));

  if (input.document) fd.set("document", input.document);
  else if (live?.documentUrl) fd.set("document", await refetchAsFile(live.documentUrl));

  await col.create(fd);
}

export async function deleteLandingSlot(pb: PocketBase, slot: LandingSlot): Promise<void> {
  const col = pb.collection("landing_items");
  if (slot.draft) await col.delete(slot.draft.id);
  if (slot.live) await col.delete(slot.live.id);
}

// ------------------------------------------------------------ модерация

export interface PendingLandingItem {
  item: LandingItem;
  profileName: string;
  ownerEmail: string;
  replaces: LandingItem | null;
}

export async function fetchPendingLandingItems(pb: PocketBase): Promise<PendingLandingItem[]> {
  const records = await pb.collection("landing_items").getFullList({
    filter: 'moderation_status = "pending"',
    expand: "specialist_profile_id,specialist_profile_id.user_id,replaces_item_id",
    sort: "created",
  });
  return records.map((r) => ({
    item: mapLandingItem(pb, r),
    profileName: r.expand?.specialist_profile_id?.public_name ?? "Без названия",
    ownerEmail: r.expand?.specialist_profile_id?.expand?.user_id?.email ?? "",
    replaces: r.expand?.replaces_item_id ? mapLandingItem(pb, r.expand.replaces_item_id) : null,
  }));
}

export interface LandingDecision {
  item: LandingItem;
  profileName: string;
}

// Последние решения (одобрено/отклонено) — "изменения фиксируются": видно,
// что и когда решили. Полный неизменяемый журнал по каждому решению пишет
// ещё и admin_logs (lib/admin.ts, logAdminAction).
export async function fetchRecentLandingDecisions(pb: PocketBase, limit = 30): Promise<LandingDecision[]> {
  const result = await pb.collection("landing_items").getList(1, limit, {
    filter: 'reviewed_at != "" && (moderation_status = "approved" || moderation_status = "rejected")',
    expand: "specialist_profile_id",
    sort: "-reviewed_at",
    skipTotal: true,
  });
  return result.items.map((r) => ({
    item: mapLandingItem(pb, r),
    profileName: r.expand?.specialist_profile_id?.public_name ?? "Без названия",
  }));
}

export async function countPendingLandingItems(pb: PocketBase): Promise<number> {
  const result = await pb.collection("landing_items").getList(1, 1, {
    filter: 'moderation_status = "pending"',
    fields: "id",
  });
  return result.totalItems;
}

export async function moderateLandingItem(
  pb: PocketBase,
  itemId: string,
  decision: "approved" | "rejected",
  rejectReason = ""
): Promise<void> {
  await pb.collection("landing_items").update(itemId, {
    moderation_status: decision,
    reject_reason: decision === "rejected" ? rejectReason : "",
    reviewed_by: pb.authStore.record?.id ?? "",
    reviewed_at: new Date().toISOString(),
  });
}
