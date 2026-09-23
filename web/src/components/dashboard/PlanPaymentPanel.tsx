"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { pbClient } from "@/lib/auth-client";
import { PLANS, type Plan } from "@/data/plans";

// Оплата тарифа на вкладке "Тариф" кабинета специалиста (через ЮKassa, см.
// lib/payments.ts и app/api/payments/*). Кнопки здесь — только удобство:
// какой тариф можно купить и за сколько, окончательно решает сервер.

const PLAN_RANK: Record<string, number> = { "": 0, basic: 1, pro: 2, enterprise: 3 };

interface OrderRow {
  id: string;
  plan_code: string;
  total_amount: number;
  status: string;
  created: string;
}

const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "ждёт оплаты",
  paid: "оплачен",
  cancelled: "не оплачен",
  under_review: "на проверке",
  refunded: "возвращён",
  expired: "истёк",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function priceLabel(plan: Plan): string {
  return plan.monthlyFee > 0
    ? `${plan.monthlyFee.toLocaleString("ru-RU")} ₽ / 30 дней`
    : `${plan.entryFee.toLocaleString("ru-RU")} ₽ разово`;
}

async function callApi(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: pbClient.authStore.token },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function PlanPaymentPanel({
  planCodeRaw,
  activeUntil,
  refresh,
}: {
  planCodeRaw: string;
  activeUntil: string;
  refresh: () => void;
}) {
  const searchParams = useSearchParams();
  const returnedOrderId = searchParams.get("order");

  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "wait" | "fail"; text: string } | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  // null — ещё не спросили у сервера; false — ключей ЮKassa в окружении нет.
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    callApi("/api/payments/config", {})
      .then((res) => setPaymentsEnabled(res.ok && res.data.enabled === true))
      .catch(() => setPaymentsEnabled(false));
  }, []);

  // refresh приходит новой функцией на каждый рендер родителя — держим его в
  // ref, иначе проверка возврата из ЮKassa перезапускалась бы бесконечно.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  const loadOrders = useCallback(async () => {
    try {
      const res = await pbClient.collection("orders").getList<OrderRow>(1, 8, {
        filter: 'status != "cancelled"',
        sort: "-created",
      });
      setOrders(res.items);
    } catch {
      // История не критична — просто не показываем.
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Возврат со страницы оплаты ЮKassa: спрашиваем сервер, что с платежом.
  // Вебхук может прийти чуть позже возврата пользователя, поэтому при
  // статусе "ждёт оплаты" повторяем проверку несколько раз.
  useEffect(() => {
    if (!returnedOrderId) return;
    let cancelled = false;

    async function check(attempt: number) {
      const res = await callApi("/api/payments/check", { orderId: returnedOrderId });
      if (cancelled) return;
      const status = res.data.status;
      if (res.ok && status === "paid") {
        setNotice({ tone: "ok", text: "Оплата прошла — тариф подключён." });
        loadOrders();
        refreshRef.current();
      } else if (res.ok && status === "awaiting_payment" && attempt < 5) {
        setNotice({ tone: "wait", text: "Платёж обрабатывается, это может занять до минуты…" });
        setTimeout(() => check(attempt + 1), 3000);
      } else if (res.ok && status === "awaiting_payment") {
        setNotice({
          tone: "wait",
          text: "Платёж ещё не подтверждён банком. Если вы уже оплатили, тариф подключится автоматически в течение нескольких минут.",
        });
      } else if (res.ok && status === "under_review") {
        setNotice({ tone: "wait", text: "Платёж получен, но требует ручной проверки — мы свяжемся с вами." });
      } else {
        setNotice({ tone: "fail", text: "Оплата не прошла. Деньги не списаны — можно попробовать ещё раз." });
      }
    }
    check(0);
    return () => {
      cancelled = true;
    };
  }, [returnedOrderId, loadOrders]);

  async function pay(plan: Plan) {
    setBusyPlan(plan.code);
    setError(null);
    try {
      const res = await callApi("/api/payments/create", { planCode: plan.code });
      if (res.ok && typeof res.data.url === "string") {
        window.location.href = res.data.url;
        return;
      }
      setError(
        res.data.error === "not_configured"
          ? "Онлайн-оплата скоро заработает — пока тариф подключает команда площадки."
          : typeof res.data.error === "string"
            ? res.data.error
            : "Не удалось начать оплату. Попробуйте позже."
      );
    } catch {
      setError("Нет связи с сервером. Попробуйте позже.");
    } finally {
      setBusyPlan(null);
    }
  }

  const currentRank = PLAN_RANK[planCodeRaw] ?? 0;
  const purchasable = PLANS.filter((p) => {
    const rank = PLAN_RANK[p.code] ?? 0;
    if (rank < currentRank) return false;
    if (p.code === "basic" && planCodeRaw === "basic") return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            notice.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : notice.tone === "wait"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {activeUntil && (
        <p className="text-xs text-zinc-500">Оплаченный период действует до {formatDate(activeUntil)}.</p>
      )}

      {paymentsEnabled === false && (
        <p className="text-[11px] text-zinc-400">
          Онлайн-оплата тарифов скоро появится — пока тариф подключает команда площадки.
        </p>
      )}

      {paymentsEnabled && purchasable.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">Подключить или продлить тариф</p>
          <div className="mt-3 flex flex-col gap-2">
            {purchasable.map((plan) => {
              const renew = plan.code === planCodeRaw;
              return (
                <div
                  key={plan.code}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{plan.title}</p>
                    <p className="text-xs text-zinc-500">
                      {priceLabel(plan)} · комиссия со сделки {plan.commissionPercent}%
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyPlan !== null}
                    onClick={() => pay(plan)}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    {busyPlan === plan.code ? "Переходим к оплате…" : renew ? "Продлить на 30 дней" : "Оплатить"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            Оплата картой или через СБП на защищённой странице ЮKassa. Подписка не продлевается сама —
            перед окончанием срока её нужно оплатить снова.
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {orders.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">История платежей</p>
          <div className="mt-2 divide-y divide-zinc-100 text-xs">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
                <span className="w-24 text-zinc-400">{formatDate(o.created)}</span>
                <span className="text-zinc-900">
                  Тариф «{PLANS.find((p) => p.code === o.plan_code)?.title ?? o.plan_code}»
                </span>
                <span className="text-zinc-700">{o.total_amount.toLocaleString("ru-RU")} ₽</span>
                <span className={o.status === "paid" ? "text-emerald-700" : "text-zinc-500"}>
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
