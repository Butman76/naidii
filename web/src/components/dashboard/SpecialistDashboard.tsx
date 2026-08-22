"use client";

import { useState } from "react";
import Link from "next/link";
import type { Specialist } from "@/types/specialist";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  mockDashboardCases,
  mockDashboardLeads,
  mockDashboardStats,
} from "@/data/dashboard-mock";

type Tab = "overview" | "profile" | "services" | "leads" | "reviews" | "plan";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Обзор" },
  { id: "profile", label: "Профиль" },
  { id: "services", label: "Услуги" },
  { id: "leads", label: "Заявки" },
  { id: "reviews", label: "Отзывы" },
  { id: "plan", label: "Тариф" },
];

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string | number;
  change?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
      {change && <p className="mt-1 text-xs text-emerald-600">{change}</p>}
    </div>
  );
}

export default function SpecialistDashboard({
  specialist,
}: {
  specialist: Specialist;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const isPremium = Boolean(specialist.premium);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
        Демо-режим: вы вошли как «{specialist.name}». Реальной авторизации
        пока нет — эти данные показывают, как будет выглядеть кабинет.
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
          {specialist.avatarInitials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            {specialist.name}
          </h1>
          <p className="text-sm text-zinc-500">{specialist.title}</p>
        </div>
      </div>

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
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Просмотры профиля"
                value={mockDashboardStats.profileViews}
                change={mockDashboardStats.profileViewsChange}
              />
              <StatCard
                label="Заявки за месяц"
                value={mockDashboardStats.leadsThisMonth}
                change={mockDashboardStats.leadsChange}
              />
              <StatCard label="Рейтинг" value={`★ ${specialist.rating.toFixed(1)}`} />
              <StatCard label="Отзывов" value={specialist.reviewsCount} />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-900">
                Заполненность профиля
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Описание и навыки</span>
                  <span className="text-emerald-600">Готово</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">
                    Услуги ({specialist.services.length})
                  </span>
                  <span className="text-emerald-600">Готово</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">
                    Кейсы ({mockDashboardCases.length})
                  </span>
                  <span className="text-amber-600">
                    Добавьте ещё для полноты
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">
                Публичный профиль
              </p>
              <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                Редактировать
              </button>
            </div>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Заголовок</dt>
                <dd className="text-zinc-900">{specialist.title}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Краткое описание</dt>
                <dd className="text-zinc-900">{specialist.shortDescription}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Полное описание</dt>
                <dd className="text-zinc-600">{specialist.fullDescription}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Навыки</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {specialist.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500 ring-1 ring-inset ring-zinc-200"
                    >
                      {skill}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {tab === "services" && (
          <div className="flex flex-col gap-4">
            {specialist.services.map((service) => (
              <div
                key={service.title}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {service.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {service.priceFrom} · {service.durationFrom}
                  </p>
                </div>
                <button className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                  Изменить
                </button>
              </div>
            ))}
            <button className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700">
              + Добавить услугу
            </button>
          </div>
        )}

        {tab === "leads" && (
          <div className="flex flex-col gap-3">
            {mockDashboardLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900">
                    {lead.clientName}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${LEAD_STATUS_STYLES[lead.status]}`}
                  >
                    {LEAD_STATUS_LABELS[lead.status]}
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
            {specialist.reviews.map((review) => (
              <div
                key={review.author}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900">
                    {review.author}
                  </p>
                  <p className="text-sm text-amber-600">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{review.text}</p>
                <button className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-900">
                  Ответить
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "plan" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs text-zinc-500">Текущий тариф</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">
                {isPremium ? "Максимальный" : "Стандарт"}
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                {isPremium
                  ? "Доступен расширенный профиль-лендинг: обложка, галерея, команда, сертификаты."
                  : "Базовая карточка в каталоге и обычный профиль. Расширенный профиль-лендинг с обложкой, галереей и командой доступен на максимальном тарифе."}
              </p>
            </div>

            {!isPremium && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-900">
                  Максимальный тариф
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Профиль-лендинг вместо обычной карточки, приоритет в
                  каталоге и расширенная аналитика.
                </p>
                <Link
                  href="/tariffs"
                  className="mt-3 inline-block rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  Сравнить тарифы
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
