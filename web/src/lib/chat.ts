import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";

// Переписка внутри заявки (Фаза B стратегии "заказчик заказывает услугу",
// см. STATUS.md 2026-08-27/29) и сущность "сделка", в которую превращается
// договорённость, когда обе стороны подтвердили условия — включая полный
// жизненный цикл заказа (2026-08-29): подтверждена -> оказана -> принята
// (архив) или на доработку -> снова оказана, плюс спор с эскалацией
// модератору. Схема и правила доступа —
// pocketbase/pb_migrations/1755000038_chat_and_deals.js и
// 1755000039_deal_lifecycle.js, протестированы локально на реальном
// PocketBase перед деплоем (весь сценарий целиком, включая хук письма на
// claim@naidii.ru при споре).

export interface LeadMessage {
  id: string;
  leadId: string;
  senderId: string;
  body: string;
  isSystem: boolean;
  createdAt: string;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type DealStatus =
  | "proposed"
  | "confirmed"
  | "delivered"
  | "needs_revision"
  | "archived"
  | "declined"
  | "disputed";

export interface Deal {
  id: string;
  leadId: string;
  customerId: string;
  specialistProfileId: string;
  proposedBy: string;
  resultText: string;
  price: number;
  dueDate: string;
  customerConfirmed: boolean;
  specialistConfirmed: boolean;
  confirmedAt: string;
  deliveredAt: string;
  disputedBy: string;
  status: DealStatus;
  createdAt: string;
}

export function formatMoney(value: number): string {
  return value.toLocaleString("ru-RU") + " ₽";
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function pluralizeDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "дня";
  return "дней";
}

export function daysRemainingLabel(dueDateIso: string): string {
  const due = new Date(dueDateIso).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (days > 0) return `Осталось ${days} ${pluralizeDays(days)}`;
  if (days === 0) return "Срок — сегодня";
  return `Просрочено на ${Math.abs(days)} ${pluralizeDays(Math.abs(days))}`;
}

function mapMessage(r: RecordModel): LeadMessage {
  return {
    id: r.id,
    leadId: r.lead_id,
    senderId: r.sender_id,
    body: r.body,
    isSystem: Boolean(r.is_system),
    createdAt: r.created,
  };
}

function mapDeal(r: RecordModel): Deal {
  return {
    id: r.id,
    leadId: r.lead_id,
    customerId: r.customer_id,
    specialistProfileId: r.specialist_profile_id,
    proposedBy: r.proposed_by,
    resultText: r.result_text,
    price: r.price,
    dueDate: r.due_date,
    customerConfirmed: Boolean(r.customer_confirmed),
    specialistConfirmed: Boolean(r.specialist_confirmed),
    confirmedAt: r.confirmed_at,
    deliveredAt: r.delivered_at,
    disputedBy: r.disputed_by,
    status: r.status,
    createdAt: r.created,
  };
}

export async function fetchLeadMessages(pb: PocketBase, leadId: string): Promise<LeadMessage[]> {
  const records = await pb.collection("lead_messages").getFullList({
    filter: pb.filter("lead_id = {:id}", { id: leadId }),
    sort: "created",
  });
  return records.map(mapMessage);
}

export async function sendLeadMessage(
  pb: PocketBase,
  leadId: string,
  senderId: string,
  body: string
): Promise<LeadMessage> {
  const r = await pb.collection("lead_messages").create({
    lead_id: leadId,
    sender_id: senderId,
    body,
  });
  return mapMessage(r);
}

// Подписка на новые сообщения этой заявки — без неё пришлось бы обновлять
// страницу, чтобы увидеть ответ собеседника. Возвращает функцию отписки.
export async function subscribeToLeadMessages(
  pb: PocketBase,
  leadId: string,
  onCreate: (message: LeadMessage) => void
): Promise<() => void> {
  return pb.collection("lead_messages").subscribe("*", (e) => {
    if (e.action === "create" && e.record.lead_id === leadId) {
      onCreate(mapMessage(e.record));
    }
  });
}

// Служебная запись в чате ("Заказчик предложил заключить сделку" и т.п.) —
// обычное сообщение с флагом is_system, чтобы бесплатно получить и место в
// истории переписки, и доставку через ту же realtime-подписку выше.
export async function sendSystemMessage(
  pb: PocketBase,
  leadId: string,
  senderId: string,
  body: string
): Promise<LeadMessage> {
  const r = await pb.collection("lead_messages").create({
    lead_id: leadId,
    sender_id: senderId,
    body,
    is_system: true,
  });
  return mapMessage(r);
}

// Подписка на изменения сделки этой заявки — чтобы предложение/подтверждение/
// отклонение от собеседника появлялось сразу, без обновления страницы (та же
// логика, что и у subscribeToLeadMessages выше, только для deals).
export async function subscribeToDeal(
  pb: PocketBase,
  leadId: string,
  onChange: (deal: Deal | null) => void
): Promise<() => void> {
  return pb.collection("deals").subscribe("*", (e) => {
    if (e.record.lead_id !== leadId) return;
    onChange(e.action === "delete" ? null : mapDeal(e.record));
  });
}

export async function fetchDeal(pb: PocketBase, leadId: string): Promise<Deal | null> {
  try {
    const r = await pb
      .collection("deals")
      .getFirstListItem(pb.filter("lead_id = {:id}", { id: leadId }));
    return mapDeal(r);
  } catch {
    return null;
  }
}

// Предлагает сделку. Если для этой заявки уже есть запись (например,
// предыдущее предложение отклонили) — обновляет её вместо создания новой:
// на lead_id стоит уникальный индекс, второй deals-записи для одной заявки
// быть не может.
export async function proposeDeal(
  pb: PocketBase,
  params: {
    leadId: string;
    customerId: string;
    specialistProfileId: string;
    proposedBy: string;
    proposerRole: "customer" | "specialist";
    resultText: string;
    price: number;
    dueDate: string;
  }
): Promise<Deal> {
  const existing = await fetchDeal(pb, params.leadId);
  const payload = {
    lead_id: params.leadId,
    customer_id: params.customerId,
    specialist_profile_id: params.specialistProfileId,
    proposed_by: params.proposedBy,
    result_text: params.resultText,
    price: params.price,
    due_date: params.dueDate,
    customer_confirmed: params.proposerRole === "customer",
    specialist_confirmed: params.proposerRole === "specialist",
    status: "proposed" as const,
  };
  const r = existing
    ? await pb.collection("deals").update(existing.id, payload)
    : await pb.collection("deals").create(payload);
  return mapDeal(r);
}

export async function confirmDeal(
  pb: PocketBase,
  deal: Deal,
  role: "customer" | "specialist"
): Promise<Deal> {
  const field = role === "customer" ? "customer_confirmed" : "specialist_confirmed";
  const otherConfirmed =
    role === "customer" ? deal.specialistConfirmed : deal.customerConfirmed;
  const becomesConfirmed = otherConfirmed;
  const r = await pb.collection("deals").update(deal.id, {
    [field]: true,
    status: becomesConfirmed ? "confirmed" : "proposed",
    ...(becomesConfirmed ? { confirmed_at: new Date().toISOString() } : {}),
  });
  return mapDeal(r);
}

export async function declineDeal(pb: PocketBase, dealId: string): Promise<void> {
  await pb.collection("deals").update(dealId, { status: "declined" });
}

// Исполнитель отмечает, что услуга оказана — ждём реакции заказчика.
export async function markDelivered(pb: PocketBase, dealId: string): Promise<Deal> {
  const r = await pb.collection("deals").update(dealId, {
    status: "delivered",
    delivered_at: new Date().toISOString(),
  });
  return mapDeal(r);
}

// Заказчик доволен результатом — сделка уходит в архив заказов.
export async function acceptDelivery(pb: PocketBase, dealId: string): Promise<Deal> {
  const r = await pb.collection("deals").update(dealId, { status: "archived" });
  return mapDeal(r);
}

// Заказчик просит доработку — возврат в чат, исполнитель снова сможет
// нажать "Услуга оказана", когда будет готово.
export async function requestRevision(pb: PocketBase, dealId: string): Promise<Deal> {
  const r = await pb.collection("deals").update(dealId, { status: "needs_revision" });
  return mapDeal(r);
}

// "Жалоба модераторам" — эскалация конфликта. Письмо на claim@naidii.ru
// уходит хуком pb_hooks/dispute.pb.js при этом переходе статуса.
export async function fileDispute(pb: PocketBase, dealId: string, userId: string): Promise<Deal> {
  const r = await pb.collection("deals").update(dealId, {
    status: "disputed",
    disputed_by: userId,
  });
  return mapDeal(r);
}

// Действия модератора по спору — либо закрыть сделку своей властью
// (в архив), либо отправить на доработку.
export async function moderatorCloseDispute(pb: PocketBase, dealId: string): Promise<Deal> {
  const r = await pb.collection("deals").update(dealId, { status: "archived" });
  return mapDeal(r);
}

export async function moderatorSendToRevision(pb: PocketBase, dealId: string): Promise<Deal> {
  const r = await pb.collection("deals").update(dealId, { status: "needs_revision" });
  return mapDeal(r);
}

export interface UserDealSummary {
  deal: Deal;
  leadId: string;
  otherPartyName: string;
  customerId: string;
  specialistProfileId: string;
}

// Все сделки текущего пользователя (для вкладок "Заказы"/"Архив" в обоих
// кабинетах) — заказчик ищет по customer_id, специалист — по
// specialist_profile_id. expand достаёт имя второй стороны одним запросом.
export async function fetchUserDeals(
  pb: PocketBase,
  role: "customer" | "specialist",
  ownId: string
): Promise<UserDealSummary[]> {
  const filter =
    role === "customer"
      ? pb.filter("customer_id = {:id}", { id: ownId })
      : pb.filter("specialist_profile_id = {:id}", { id: ownId });

  const records = await pb.collection("deals").getFullList({
    filter,
    expand: "customer_id,specialist_profile_id",
    sort: "-created",
  });

  return records.map((r) => ({
    deal: mapDeal(r),
    leadId: r.lead_id,
    otherPartyName:
      role === "customer"
        ? (r.expand?.specialist_profile_id?.public_name ?? "Специалист")
        : (r.expand?.customer_id?.name ?? r.expand?.customer_id?.email ?? "Заказчик"),
    customerId: r.customer_id,
    specialistProfileId: r.specialist_profile_id,
  }));
}

export interface DisputedDealSummary {
  deal: Deal;
  leadId: string;
  customerName: string;
  specialistName: string;
}

// Для кабинета модератора: все сделки со статусом disputed сразу с именами
// обеих сторон.
export async function fetchDisputedDeals(pb: PocketBase): Promise<DisputedDealSummary[]> {
  const records = await pb.collection("deals").getFullList({
    filter: 'status = "disputed"',
    expand: "customer_id,specialist_profile_id",
    sort: "-updated",
  });
  return records.map((r) => ({
    deal: mapDeal(r),
    leadId: r.lead_id,
    customerName: r.expand?.customer_id?.name ?? r.expand?.customer_id?.email ?? "Заказчик",
    specialistName: r.expand?.specialist_profile_id?.public_name ?? "Специалист",
  }));
}
