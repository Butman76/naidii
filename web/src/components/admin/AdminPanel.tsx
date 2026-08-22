"use client";

import { useState } from "react";
import {
  mockAdminStats,
  mockAuditLog,
  mockPendingProfiles,
  mockPendingReviews,
} from "@/data/admin-mock";
import { CATEGORIES } from "@/data/categories";
import { PLANS } from "@/data/plans";

type Tab = "overview" | "profiles" | "reviews" | "categories" | "plans" | "log";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Обзор" },
  { id: "profiles", label: "Модерация профилей" },
  { id: "reviews", label: "Модерация отзывов" },
  { id: "categories", label: "Категории" },
  { id: "plans", label: "Тарифы" },
  { id: "log", label: "Журнал действий" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
        Демо-режим: вы вошли как «admin@naidii.ru» (роль «admin»). Это
        отдельная от суперпользователя PocketBase бизнес-роль — см.
        pocketbase/README.md. Реальной авторизации и записи в БД пока нет.
      </div>

      <h1 className="mt-6 text-xl font-bold text-zinc-900">Админ-панель</h1>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Профилей на модерации" value={mockAdminStats.pendingProfiles} />
            <StatCard label="Отзывов на модерации" value={mockAdminStats.pendingReviews} />
            <StatCard label="Новых заявок сегодня" value={mockAdminStats.newLeadsToday} />
          </div>
        )}

        {tab === "profiles" && (
          <div className="flex flex-col gap-3">
            {mockPendingProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {profile.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {profile.title} · {profile.category}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Отправлено: {profile.submittedAt}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700">
                    Одобрить
                  </button>
                  <button className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                    На доработку
                  </button>
                  <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50">
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="flex flex-col gap-3">
            {mockPendingReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {review.author}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Отзыв на профиль «{review.specialistName}»
                    </p>
                  </div>
                  <p className="text-sm text-amber-600">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{review.text}</p>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700">
                    Опубликовать
                  </button>
                  <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50">
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "categories" && (
          <div className="flex flex-col gap-3">
            {CATEGORIES.map((category) => (
              <div
                key={category.slug}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-zinc-500">/category/{category.slug}</p>
                </div>
                <button className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                  Редактировать
                </button>
              </div>
            ))}
            <button className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700">
              + Добавить категорию
            </button>
          </div>
        )}

        {tab === "plans" && (
          <div className="flex flex-col gap-3">
            {PLANS.map((plan) => (
              <div
                key={plan.code}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {plan.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {plan.price === 0 ? "Бесплатно" : `${plan.price.toLocaleString("ru-RU")} ₽/мес`}
                  </p>
                </div>
                <button className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                  Редактировать
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "log" && (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-4 py-3 font-medium text-zinc-500">Кто</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Действие</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Объект</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Когда</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLog.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 text-zinc-600">{entry.adminName}</td>
                    <td className="px-4 py-3 text-zinc-900">{entry.action}</td>
                    <td className="px-4 py-3 text-zinc-600">{entry.entityLabel}</td>
                    <td className="px-4 py-3 text-zinc-400">{entry.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-400">
              Журнал неизменяем даже для admin — запись можно только
              добавить (ТЗ §8.6, admin_logs.updateRule/deleteRule = null).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
