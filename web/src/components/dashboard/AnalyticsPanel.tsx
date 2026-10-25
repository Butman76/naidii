"use client";

import { useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { CATEGORIES } from "@/data/categories";
import { hasAnalyticsAccess, type AnalyticsResult, type PeriodTotals } from "@/lib/analytics";

// Вкладка "Аналитика" кабинета специалиста — тарифы Pro и Enterprise (см.
// plans.ts, analyticsEnabled). На Базовом — заглушка со ссылкой на оплату
// тарифа. Данные отдаёт api/analytics/route.ts, доступ по тарифу
// проверяется и там.

const PERIODS = [7, 30, 90] as const;
// Просмотры профиля начали считаться с этой даты (api/track) — раньше
// счётчика не было, поэтому в более ранних днях нули не означают "никто не
// заходил".
const TRACKING_SINCE = "25.09.2026";

function formatDay(day: string): string {
  const [, month, date] = day.split("-");
  return `${date}.${month}`;
}

function delta(current: number, previous: number): { text: string; tone: string } {
  if (previous === 0) return current === 0 ? { text: "без изменений", tone: "text-zinc-400" } : { text: "новое", tone: "text-emerald-600" };
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { text: "без изменений", tone: "text-zinc-400" };
  return { text: `${percent > 0 ? "+" : ""}${percent}% к прошлому периоду`, tone: percent > 0 ? "text-emerald-600" : "text-red-600" };
}

function Kpi({ label, value, current, previous }: { label: string; value: string; current: number; previous: number }) {
  const d = delta(current, previous);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
      <p className={`mt-1 text-[11px] ${d.tone}`}>{d.text}</p>
    </div>
  );
}

function BarChart({ title, values, labels, unit, color }: { title: string; values: number[]; labels: string[]; unit: string; color: string }) {
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-500">всего {total.toLocaleString("ru-RU")}</p>
      </div>
      <div className="mt-3 flex h-28 items-end gap-[2px]">
        {values.map((value, i) => (
          <div
            key={labels[i]}
            title={`${labels[i]}: ${value} ${unit}`}
            className={`min-w-0 flex-1 rounded-t ${value === 0 ? "bg-zinc-100" : color}`}
            style={{ height: `${value === 0 ? 4 : Math.max(8, (value / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

function percent(ratio: number): string {
  return `${(ratio * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
}

export default function AnalyticsPanel({
  planCodeRaw,
  activeUntil,
  onOpenPlan,
}: {
  planCodeRaw: string;
  activeUntil: string;
  onOpenPlan: () => void;
}) {
  const allowed = hasAnalyticsAccess({ plan_code: planCodeRaw, active_until: activeUntil });
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(30);
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setData(null);
    setError(null);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: pbClient.authStore.token },
      body: JSON.stringify({ days: period }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) setData(body as AnalyticsResult);
        else setError(body.error === "plan" ? "Аналитика недоступна на вашем тарифе." : (body.error ?? "Не удалось загрузить аналитику."));
      })
      .catch(() => !cancelled && setError("Нет связи с сервером."));
    return () => {
      cancelled = true;
    };
  }, [allowed, period]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">Аналитика профиля — на тарифах Pro и Enterprise</p>
        <p className="mt-1 text-sm text-amber-800">
          Просмотры и уникальные посетители по дням, заявки, конверсия и сравнение с прошлым периодом —
          чтобы понимать, что работает в вашем профиле.
        </p>
        <button
          type="button"
          onClick={onOpenPlan}
          className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Открыть тарифы
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {p} дней
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-zinc-500">Загружаем…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Просмотры профиля" value={data.totals.views.toLocaleString("ru-RU")} current={data.totals.views} previous={data.previous.views} />
            <Kpi label="Уникальные посетители" value={data.totals.visitors.toLocaleString("ru-RU")} current={data.totals.visitors} previous={data.previous.visitors} />
            <Kpi label="Заявки" value={data.totals.leads.toLocaleString("ru-RU")} current={data.totals.leads} previous={data.previous.leads} />
            <ConversionKpi totals={data.totals} previous={data.previous} />
          </div>

          <BarChart
            title="Просмотры по дням"
            values={data.days.map((d) => d.views)}
            labels={data.days.map((d) => formatDay(d.day))}
            unit="просмотров"
            color="bg-zinc-800"
          />
          <BarChart
            title="Заявки по дням"
            values={data.days.map((d) => d.leads)}
            labels={data.days.map((d) => formatDay(d.day))}
            unit="заявок"
            color="bg-emerald-500"
          />

          {data.byCategory.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-sm font-semibold text-zinc-900">Заявки по направлениям</p>
              <div className="mt-2 divide-y divide-zinc-100 text-sm">
                {data.byCategory.map((c) => (
                  <div key={c.slug} className="flex justify-between py-1.5">
                    <span className="text-zinc-700">{CATEGORIES.find((x) => x.slug === c.slug)?.name ?? "Другое"}</span>
                    <span className="text-zinc-900">{c.leads}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-zinc-400">
            Просмотры считаются с {TRACKING_SINCE}: нули за более ранние дни не значат, что никто не заходил. Не
            учитываются боты, а также заходы владельца профиля и модераторов. Дни — по московскому времени.
          </p>
        </>
      )}
    </div>
  );
}

function ConversionKpi({ totals, previous }: { totals: PeriodTotals; previous: PeriodTotals }) {
  const d = delta(Math.round(totals.conversion * 1000), Math.round(previous.conversion * 1000));
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">Заявок на посетителя</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{percent(totals.conversion)}</p>
      <p className={`mt-1 text-[11px] ${d.tone}`}>{d.text}</p>
    </div>
  );
}
