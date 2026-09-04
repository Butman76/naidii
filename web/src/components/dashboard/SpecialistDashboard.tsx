"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice, SERVICE_TAG_LABELS } from "@/types/service-card";
import ServiceCreationForm from "./ServiceCreationForm";
import ProfileEditForm from "./ProfileEditForm";
import LeadChat from "./LeadChat";
import OrdersTab from "./OrdersTab";
import SpecialistJobBoard from "./SpecialistJobBoard";
import PremiumLandingEditor from "./PremiumLandingEditor";
import { getCategoryStyle, getCategoryAccent } from "@/data/category-style";
import { PLANS } from "@/data/plans";
import type { SpecialistDashboardOffer } from "@/lib/dashboard";
import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES } from "@/data/dashboard-mock";
import type { SpecialistDashboardData } from "@/lib/dashboard";
import { useAuth } from "@/lib/use-auth";

type Tab = "overview" | "profile" | "services" | "leads" | "jobboard" | "orders" | "archive" | "reviews" | "plan" | "landing";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Обзор" },
  { id: "profile", label: "Профиль" },
  { id: "services", label: "Услуги" },
  { id: "leads", label: "Заявки" },
  { id: "jobboard", label: "Доска объявлений" },
  { id: "orders", label: "Заказы" },
  { id: "archive", label: "Архив" },
  { id: "reviews", label: "Отзывы" },
  { id: "plan", label: "Тариф" },
];

// Плашка "Тут новые заказы" на главной (HeroDealsBadge.tsx) ведёт сюда через
// ?tab=jobboard — специалист попадает сразу на доску объявлений, а не на
// "Обзор" по умолчанию.
function isValidTab(value: string | null): value is Tab {
  return TABS.some((t) => t.id === value);
}

// Услуги группируются по направлению (не идут вперемешку) — порядок групп
// по первому появлению в списке (сам список уже отсортирован по дате
// создания в dashboard.ts, так что группы получаются в разумном порядке).
function groupOffersByCategory(offers: SpecialistDashboardOffer[]) {
  const groups: { categorySlug: string; categoryName: string; items: SpecialistDashboardOffer[] }[] = [];
  for (const offer of offers) {
    let group = groups.find((g) => g.categorySlug === offer.categorySlug);
    if (!group) {
      group = { categorySlug: offer.categorySlug, categoryName: offer.categoryName, items: [] };
      groups.push(group);
    }
    group.items.push(offer);
  }
  return groups;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

export default function SpecialistDashboard({
  data,
  refresh,
}: {
  data: SpecialistDashboardData;
  refresh: () => void;
}) {
  const { specialist, profileStatus, viewsCount, leadsCount, offers, leads, cases, planCode } = data;
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(isValidTab(requestedTab) ? requestedTab : "overview");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const currentPlan = PLANS.find((p) => p.code === planCode) ?? PLANS[0];

  const [showCreationForm, setShowCreationForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const totalOfferCount = offers.length;

  // "Лендинг" — только на тарифе с профилем-лендингом вместо обычной
  // карточки (см. PremiumSpecialistProfile.tsx), остальным вкладка не нужна.
  const visibleTabs = currentPlan.customLanding
    ? [...TABS.slice(0, -1), { id: "landing" as const, label: "Лендинг" }, TABS[TABS.length - 1]]
    : TABS;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {profileStatus === "pending" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ваш профиль на модерации — станет виден в каталоге, когда его
          проверит команда площадки.
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
          {specialist.avatarInitials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            {specialist.name}
          </h1>
          <p className="text-sm text-zinc-500">
            {specialist.title || "Заголовок профиля ещё не заполнен"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {visibleTabs.map((t) => (
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
              <StatCard label="Просмотры профиля" value={viewsCount} />
              <StatCard label="Заявок всего" value={leadsCount} />
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
                  <span
                    className={
                      specialist.shortDescription
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {specialist.shortDescription ? "Готово" : "Пока не заполнено"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">
                    Услуги ({totalOfferCount})
                  </span>
                  <span
                    className={
                      totalOfferCount > 0 ? "text-emerald-600" : "text-amber-600"
                    }
                  >
                    {totalOfferCount > 0 ? "Готово" : "Добавьте хотя бы одну"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">
                    Кейсы ({cases.length})
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
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Редактировать
                </button>
              )}
            </div>

            {editingProfile ? (
              <ProfileEditForm
                specialist={specialist}
                onSaved={refresh}
                onCancel={() => setEditingProfile(false)}
              />
            ) : (
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Заголовок</dt>
                <dd className="text-zinc-900">
                  {specialist.title || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Краткое описание</dt>
                <dd className="text-zinc-900">
                  {specialist.shortDescription || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Полное описание</dt>
                <dd className="text-zinc-600">
                  {specialist.fullDescription || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Навыки</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {specialist.skills.length > 0 ? (
                    specialist.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500 ring-1 ring-inset ring-zinc-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </dd>
              </div>
            </dl>
            )}
          </div>
        )}

        {tab === "services" && (
          <div className="flex flex-col gap-6">
            {groupOffersByCategory(offers).map((group) => {
              const style = getCategoryStyle(group.categorySlug);
              return (
                <div key={group.categorySlug}>
                  <p
                    className={`inline-block rounded-full bg-gradient-to-r ${style.gradient} px-3 py-1 text-xs font-semibold text-white`}
                  >
                    {group.categoryName}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {group.items.map((offer) => {
                      const accent = getCategoryAccent(offer.categorySlug);
                      return (
                        <div
                          key={offer.id}
                          className={`flex aspect-square flex-col justify-between rounded-2xl border p-3 ${accent.border} ${accent.tint}`}
                        >
                          <div className="min-w-0">
                            <p className="line-clamp-3 text-sm font-medium text-zinc-900">
                              {offer.resultTypeTitle}
                            </p>
                            <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                              {formatPrice(offer.priceType, offer.priceValue)}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {offer.durationFrom}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-end justify-between gap-1">
                            {offer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {offer.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-200"
                                  >
                                    {SERVICE_TAG_LABELS[tag]}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                              Опубликовано
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {offers.length === 0 && !showCreationForm && (
              <p className="text-sm text-zinc-500">У вас пока нет ни одной услуги.</p>
            )}

            {showCreationForm ? (
              <ServiceCreationForm
                specialist={specialist}
                onCreated={refresh}
                onCancel={() => setShowCreationForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowCreationForm(true)}
                className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
              >
                + Добавить услугу
              </button>
            )}
          </div>
        )}

        {tab === "leads" && openLeadId && (() => {
          const lead = leads.find((l) => l.id === openLeadId);
          if (!lead || !user) return null;
          return (
            <div>
              <button
                type="button"
                onClick={() => setOpenLeadId(null)}
                className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                ← Все заявки
              </button>
              <LeadChat
                leadId={lead.id}
                currentUserId={user.id}
                currentUserRole="specialist"
                customerId={lead.customerId}
                specialistProfileId={specialist.id}
                otherPartyName={lead.clientName}
                leadStatus={lead.status}
                onClose={() => setOpenLeadId(null)}
              />
            </div>
          );
        })()}

        {tab === "leads" && !openLeadId && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {leads.length === 0 && (
              <p className="col-span-full text-sm text-zinc-500">У вас пока нет заявок.</p>
            )}
            {leads.map((lead) => {
              const style = getCategoryStyle(lead.categorySlug);
              const accent = getCategoryAccent(lead.categorySlug);
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setOpenLeadId(lead.id)}
                  className={`flex aspect-square flex-col justify-between rounded-2xl border p-3 text-left transition-shadow hover:shadow-md ${accent.border} ${accent.tint}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: style.hex }}
                      />
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {lead.clientName}
                      </p>
                    </div>
                    <p className="mt-1.5 line-clamp-4 text-xs text-zinc-600">
                      {lead.message}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-1">
                    <span className="text-[10px] text-zinc-400">{lead.createdAt}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${LEAD_STATUS_STYLES[lead.status]}`}
                    >
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === "jobboard" && user && (
          <SpecialistJobBoard specialistProfileId={specialist.id} currentUserId={user.id} />
        )}

        {tab === "orders" && <OrdersTab role="specialist" ownId={specialist.id} archive={false} />}
        {tab === "archive" && <OrdersTab role="specialist" ownId={specialist.id} archive={true} />}

        {tab === "reviews" && (
          <div className="flex flex-col gap-3">
            {specialist.reviews.length === 0 && (
              <p className="text-sm text-zinc-500">Отзывов пока нет.</p>
            )}
            {specialist.reviews.map((review, i) => (
              <div
                key={i}
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
                {currentPlan.title}
              </p>
              <p className="mt-2 text-sm text-zinc-600">{currentPlan.description}</p>
              <p className="mt-3 text-xs text-zinc-500">
                Комиссия площадки с подтверждённой сделки: {currentPlan.commissionPercent}%
                {currentPlan.customLanding && " · включён профиль-лендинг вместо обычной карточки"}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                Тариф назначает команда площадки вручную — оплата online ещё не подключена.
              </p>
            </div>

            {!currentPlan.customLanding && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-900">
                  Хотите тариф выше?
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  На старших тарифах ниже комиссия, продвижение в каталоге, а на
                  максимальном — профиль-лендинг вместо обычной карточки.
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

        {tab === "landing" && currentPlan.customLanding && (
          <PremiumLandingEditor specialistId={specialist.id} />
        )}
      </div>
    </div>
  );
}
