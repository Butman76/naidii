import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { PLANS, type Plan } from "@/data/plans";
import { createPayment, getPayment } from "./yookassa";

// Оплата тарифов специалистов через ЮKassa — серверная логика (используется
// Route Handlers в app/api/payments/*). Цена и тариф считаются ЗДЕСЬ, по
// web/src/data/plans.ts, а не берутся из запроса клиента. Тариф в профиле
// (specialist_profiles.plan_code) меняет только этот код под суперпользователем
// после подтверждённой оплаты — специалист сам не может, это держит
// pocketbase/pb_hooks/plan_guard.pb.js.
//
// Модель (договорённость 2026-08-29, см. plans.ts):
//  - basic: разовый вход 500 ₽, без срока;
//  - pro / enterprise: подписка 990 / 2900 ₽ на 30 дней; оплата вручную
//    каждый месяц (автосписание — отдельный шаг), при повторной оплате того
//    же тарифа срок продлевается от текущего конца. Когда срок вышел,
//    pocketbase/pb_hooks/plan_expiry.pb.js возвращает профиль на basic.
//  - апгрейд оплачивается полной ценой нового тарифа на 30 дней с момента
//    оплаты (без пересчёта остатка старого).

const PERIOD_DAYS = 30;
const PLAN_RANK: Record<string, number> = { "": 0, basic: 1, pro: 2, enterprise: 3 };

export type PurchaseCheck =
  | { ok: true; plan: Plan; amountRub: number }
  | { ok: false; reason: string; status: number };

export function checkPurchase(profile: RecordModel, planCode: string): PurchaseCheck {
  const plan = PLANS.find((p) => p.code === planCode);
  if (!plan) return { ok: false, reason: "Неизвестный тариф.", status: 400 };

  const amountRub = plan.monthlyFee > 0 ? plan.monthlyFee : plan.entryFee;
  if (amountRub <= 0) return { ok: false, reason: "Этот тариф не требует оплаты.", status: 400 };

  const currentCode: string = profile.plan_code || "";
  if ((PLAN_RANK[plan.code] ?? 0) < (PLAN_RANK[currentCode] ?? 0)) {
    return { ok: false, reason: "У вас уже подключён более высокий тариф.", status: 409 };
  }
  if (plan.code === "basic" && currentCode === "basic") {
    return { ok: false, reason: "Базовый тариф уже подключён.", status: 409 };
  }
  return { ok: true, plan, amountRub };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function newOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NAI-${ymd}-${rand}`;
}

function paymentDescription(plan: Plan): string {
  return plan.monthlyFee > 0
    ? `НайдИИ: тариф «${plan.title}», 30 дней`
    : `НайдИИ: вход на площадку, тариф «${plan.title}»`;
}

export interface StartedPayment {
  orderId: string;
  url: string;
}

export async function startPlanPayment(
  su: PocketBase,
  params: { user: RecordModel; profile: RecordModel; plan: Plan; amountRub: number; siteUrl: string }
): Promise<StartedPayment> {
  const { user, profile, plan, amountRub, siteUrl } = params;

  // Двойной клик / возврат на страницу тарифа — если по этому же тарифу
  // уже есть свежий неоплаченный платёж, отдаём его ссылку, а не плодим
  // новые заказы.
  const recent = await su.collection("orders").getList(1, 1, {
    filter: su.filter(
      "user_id = {:user} && specialist_profile_id = {:profile} && plan_code = {:plan} && status = 'awaiting_payment' && external_payment_id != ''",
      { user: user.id, profile: profile.id, plan: plan.code }
    ),
    sort: "-created",
  });
  const existing = recent.items[0];
  if (existing && Date.now() - new Date(existing.created).getTime() < 60 * 60 * 1000) {
    try {
      const payment = await getPayment(existing.external_payment_id);
      if (payment.status === "pending" && payment.confirmation?.confirmation_url) {
        return { orderId: existing.id, url: payment.confirmation.confirmation_url };
      }
    } catch {
      // Не вышло проверить старый платёж — просто создадим новый ниже.
    }
  }

  const order = await su.collection("orders").create({
    user_id: user.id,
    order_number: newOrderNumber(),
    product_type: "plan",
    plan_code: plan.code,
    specialist_profile_id: profile.id,
    price_original: amountRub,
    discount_percent: 0,
    discount_amount: 0,
    total_amount: amountRub,
    currency: "RUB",
    payment_provider: "yookassa",
    status: "awaiting_payment",
  });

  try {
    const payment = await createPayment({
      idempotenceKey: order.id,
      amountRub,
      description: paymentDescription(plan),
      returnUrl: `${siteUrl}/dashboard?tab=plan&order=${order.id}`,
      metadata: { order_id: order.id, profile_id: profile.id },
      customerEmail: user.email,
    });
    const url = payment.confirmation?.confirmation_url ?? "";
    await su.collection("orders").update(order.id, {
      external_payment_id: payment.id,
      payment_url: url,
    });
    if (!url) throw new Error("YooKassa не вернула confirmation_url");
    return { orderId: order.id, url };
  } catch (err) {
    await su.collection("orders").update(order.id, { status: "cancelled" }).catch(() => {});
    throw err;
  }
}

export interface SyncResult {
  status: string;
  planCode: string;
}

// Вебхук и страница возврата могут прийти одновременно — без замка
// продление подписки применилось бы дважды. Процесс Next.js на VPS один
// (naidii-web.service), поэтому достаточно замка в памяти по id заказа.
const locks = new Map<string, Promise<unknown>>();

export async function syncOrder(su: PocketBase, orderId: string): Promise<SyncResult> {
  const previous = locks.get(orderId) ?? Promise.resolve();
  const run = previous.catch(() => {}).then(() => doSync(su, orderId));
  locks.set(orderId, run);
  try {
    return await run;
  } finally {
    if (locks.get(orderId) === run) locks.delete(orderId);
  }
}

async function doSync(su: PocketBase, orderId: string): Promise<SyncResult> {
  const order = await su.collection("orders").getOne(orderId);
  const planCode: string = order.plan_code || "";
  if (order.status !== "awaiting_payment" || !order.external_payment_id) {
    return { status: order.status, planCode };
  }

  // Статус берём из API ЮKassa, а не из тела вебхука: тело уведомления
  // никак не подписано, его мог отправить кто угодно.
  const payment = await getPayment(order.external_payment_id);
  if (payment.metadata?.order_id !== order.id) {
    throw new Error(`Платёж ${payment.id} не относится к заказу ${order.id}`);
  }

  if (payment.status === "canceled") {
    await su.collection("orders").update(order.id, { status: "cancelled" });
    return { status: "cancelled", planCode };
  }
  if (payment.status !== "succeeded") {
    return { status: order.status, planCode };
  }

  if (payment.amount.currency !== order.currency || Number(payment.amount.value) !== Number(order.total_amount)) {
    // Оплачено, но сумма не сходится с заказом — тариф автоматически не
    // включаем, заказ уходит на ручную проверку админу.
    console.error(`payments: сумма платежа ${payment.id} не совпала с заказом ${order.id}`);
    await su.collection("orders").update(order.id, { status: "under_review" });
    return { status: "under_review", planCode };
  }

  await applyPaidOrder(su, order);
  return { status: "paid", planCode };
}

async function applyPaidOrder(su: PocketBase, order: RecordModel): Promise<void> {
  const plan = PLANS.find((p) => p.code === order.plan_code);
  if (!plan) throw new Error(`Заказ ${order.id}: неизвестный тариф ${order.plan_code}`);

  const profile = await su.collection("specialist_profiles").getOne(order.specialist_profile_id);
  const now = new Date();

  let serviceStart = now;
  let serviceEnd: Date | null = null;
  if (plan.monthlyFee > 0) {
    const currentEnd =
      profile.plan_code === plan.code && profile.active_until ? new Date(profile.active_until) : null;
    serviceStart = currentEnd && currentEnd > now ? currentEnd : now;
    serviceEnd = addDays(serviceStart, PERIOD_DAYS);
  }

  await su.collection("specialist_profiles").update(profile.id, {
    plan_code: plan.code,
    active_until: serviceEnd ? serviceEnd.toISOString() : "",
  });
  await su.collection("orders").update(order.id, {
    status: "paid",
    paid_at: now.toISOString(),
    service_start_at: serviceStart.toISOString(),
    service_end_at: serviceEnd ? serviceEnd.toISOString() : "",
  });
}
