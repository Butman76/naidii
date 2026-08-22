"use client";

import { useState } from "react";
import Link from "next/link";
import type { Specialist } from "@/types/specialist";
import {
  CUSTOMER_LEAD_STATUS_LABELS,
  CUSTOMER_LEAD_STATUS_STYLES,
  mockCustomerLeads,
  mockCustomerReviews,
  mockCustomerStats,
} from "@/data/customer-dashboard-mock";

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
  favorites,
}: {
  customerName: string;
  favorites: Specialist[];
}) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
        Демо-режим: вы вошли как «{customerName}» (роль «заказчик»).
        Реальной авторизации пока нет.{" "}
        <Link href="/dashboard" className="font-medium underline">
          Посмотреть кабинет специалиста →
        </Link>
      </div>

      <h1 className="mt-6 text-xl font-bold text-zinc-900">{customerName}</h1>
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
            <StatCard label="Активных заявок" value={mockCustomerStats.activeLeads} />
            <StatCard label="Всего заявок" value={mockCustomerStats.totalLeads} />
            <StatCard label="В избранном" value={mockCustomerStats.favoritesCount} />
          </div>
        )}

        {tab === "leads" && (
          <div className="flex flex-col gap-3">
            {mockCustomerLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/specialist/${lead.specialistSlug}`}
                    className="text-sm font-medium text-zinc-900 hover:underline"
                  >
                    {lead.specialistName}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${CUSTOMER_LEAD_STATUS_STYLES[lead.status]}`}
                  >
                    {CUSTOMER_LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{lead.message}</p>
                <p className="mt-2 text-xs text-zinc-400">{lead.createdAt}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="flex flex-col gap-3">
            {mockCustomerReviews.length > 0 ? (
              mockCustomerReviews.map((review) => (
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
          <div>
            <p className="mb-4 text-xs text-zinc-500">
              Избранное пока не подключено к бэкенду (роадмап, Этап 3) — ниже
              визуальный пример того, как это будет выглядеть.
            </p>
            <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3">
              {favorites.map((specialist) => (
                <Link
                  key={specialist.id}
                  href={`/specialist/${specialist.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {specialist.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {specialist.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {specialist.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
