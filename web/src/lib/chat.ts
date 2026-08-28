import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";

// Переписка внутри заявки (Фаза B стратегии "заказчик заказывает услугу",
// см. STATUS.md 2026-08-27/29) и сущность "сделка", в которую превращается
// договорённость, когда обе стороны подтвердили условия. Схема и правила
// доступа — pocketbase/pb_migrations/1755000038_chat_and_deals.js,
// протестированы локально на реальном PocketBase перед деплоем.

export interface LeadMessage {
  id: string;
  leadId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export type DealStatus = "proposed" | "confirmed" | "declined";

export interface Deal {
  id: string;
  leadId: string;
  customerId: string;
  specialistProfileId: string;
  proposedBy: string;
  resultText: string;
  price: number;
  deadline: string;
  customerConfirmed: boolean;
  specialistConfirmed: boolean;
  status: DealStatus;
}

function mapMessage(r: RecordModel): LeadMessage {
  return {
    id: r.id,
    leadId: r.lead_id,
    senderId: r.sender_id,
    body: r.body,
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
    deadline: r.deadline,
    customerConfirmed: Boolean(r.customer_confirmed),
    specialistConfirmed: Boolean(r.specialist_confirmed),
    status: r.status,
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
    deadline: string;
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
    deadline: params.deadline,
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
  const r = await pb.collection("deals").update(deal.id, {
    [field]: true,
    status: otherConfirmed ? "confirmed" : "proposed",
  });
  return mapDeal(r);
}

export async function declineDeal(pb: PocketBase, dealId: string): Promise<void> {
  await pb.collection("deals").update(dealId, { status: "declined" });
}
