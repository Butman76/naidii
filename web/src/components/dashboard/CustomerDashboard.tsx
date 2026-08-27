"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CUSTOMER_LEAD_STATUS_LABELS,
  CUSTOMER_LEAD_STATUS_STYLES,
  type CustomerLead,
  type CustomerReview,
} from "@/data/customer-dashboard-mock";
import { getCategoryStyle, getCategoryAccent } from "@/data/category-style";

type Tab = "overview" | "leads" | "reviews" | "favorites";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Обзор" },
  { id: "leads", label: "Мои заявки" },
  { id: "reviews", label: "Мои отзывы" },
  { id: "favorites", label: "Избранное" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

export default function CustomerDashboard({
  customerName,
  leads,
  reviews,
}: {
  customerName: string;
  leads: CustomerLead[];
  reviews: CustomerReview[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const activeLeads = leads.filter(
    (l) => l.status !== "closed" && l.status !== "spam"
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-zinc-900">{customerName}</h1>
      <p className="text-sm text-zinc-500">Личный кабинет заказчика</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Активных заявок" value={activeLeads} />
            <StatCard label="Всего заявок" value={leads.length} />
            <StatCard label="Отзывов оставлено" value={reviews.length} />
          </div>
        )}

        {tab === "leads" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {leads.length === 0 && (
              <p className="col-span-full text-sm text-zinc-500">Вы ещё не отправляли заявок.</p>
            )}
            {leads.map((lead) => {
              const style = getCategoryStyle(lead.categorySlug);
              const accent = getCategoryAccent(lead.categorySlug);
              return (
                <div
                  key={lead.id}
                  className={`flex aspect-square flex-col justify-between rounded-2xl border p-3 ${accent.border} ${accent.tint}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: style.hex }}
                      />
                      <Link
                        href={`/specialist/${lead.specialistSlug}`}
                        className="truncate text-sm font-medium text-zinc-900 hover:underline"
                      >
                        {lead.specialistName}
                      </Link>
                    </div>
                    <p className="mt-1.5 line-clamp-4 text-xs text-zinc-600">
                      {lead.message}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-1">
                    <span className="text-[10px] text-zinc-400">{lead.createdAt}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${CUSTOMER_LEAD_STATUS_STYLES[lead.status]}`}
                    >
                      {CUSTOMER_LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "reviews" && (
          <div className="flex flex-col gap-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/specialist/${review.specialistSlug}`}
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      {review.specialistName}
                    </Link>
                    <p className="text-sm text-amber-600">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{review.text}</p>
                  <p className="mt-2 text-xs text-zinc-400">{review.createdAt}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                Вы ещё не оставили ни одного отзыва.
              </p>
            )}
          </div>
        )}

        {tab === "favorites" && (
          <p className="text-sm text-zinc-500">
            Избранное пока не подключено к бэкенду — эта функция появится
            позже.
          </p>
        )}
      </div>
    </div>
  );
}
