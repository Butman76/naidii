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
import { pbClient } from "@/lib/auth-client";
import LeadChat from "./LeadChat";
import OrdersTab from "./OrdersTab";
import CustomerJobPostsTab from "./CustomerJobPostsTab";
import DeclinedResponsesTab from "./DeclinedResponsesTab";

type Tab = "overview" | "leads" | "jobposts" | "orders" | "archive" | "reviews" | "favorites" | "suggestions";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Обзор" },
  { id: "leads", label: "Мои заявки" },
  { id: "jobposts", label: "Объявления" },
  { id: "orders", label: "Заказы" },
  { id: "archive", label: "Архив" },
  { id: "reviews", label: "Мои отзывы" },
  { id: "favorites", label: "Избранное" },
  { id: "suggestions", label: "Не нашли то, что нужно?" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

// Идея/пожелание уходит письмом на info@naidii.ru — см.
// pocketbase/pb_hooks/suggestions.pb.js (хук на создание записи в
// suggestions, использует уже настроенный SMTP). Само сообщение всё
// равно сохраняется в базе, даже если письмо не дойдёт.
function SuggestionForm({ userId }: { userId: string }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) return;
    setState("sending");
    try {
      await pbClient.collection("suggestions").create({
        user_id: userId,
        text: text.trim(),
      });
      setState("sent");
      setText("");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-sm font-semibold text-emerald-900">Спасибо, мы получили вашу идею</p>
        <p className="mt-1 text-sm text-emerald-800">
          Команда площадки рассмотрит её и постарается найти или привлечь
          подходящего специалиста.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-3 rounded-full border border-emerald-300 px-4 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          Отправить ещё одну идею
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-semibold text-zinc-900">
        Не нашли то, что вам надо?
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Опишите, какая доработка или автоматизация с помощью новых
        технологий вам нужна, но вы не нашли подходящего специалиста или
        услугу на площадке — сообщение уйдёт прямо команде НайдИИ.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Например: нужен AI-агент для распознавания брака на производстве по фото с камер"
        className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
      />
      {state === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Не получилось отправить — попробуйте ещё раз.
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending" || text.trim().length < 10}
        className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {state === "sending" ? "Отправляем…" : "Отправить идею"}
      </button>
    </form>
  );
}

export default function CustomerDashboard({
  customerName,
  userId,
  leads,
  reviews,
}: {
  customerName: string;
  userId: string;
  leads: CustomerLead[];
  reviews: CustomerReview[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [archiveSubTab, setArchiveSubTab] = useState<"deals" | "declined">("deals");
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

        {tab === "leads" && openLeadId && (() => {
          const lead = leads.find((l) => l.id === openLeadId);
          if (!lead) return null;
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
                currentUserId={userId}
                currentUserRole="customer"
                customerId={userId}
                specialistProfileId={lead.specialistProfileId}
                otherPartyName={lead.specialistName}
                onClose={() => setOpenLeadId(null)}
              />
              <Link
                href={`/specialist/${lead.specialistSlug}`}
                className="mt-2 inline-block text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:underline"
              >
                Открыть профиль специалиста →
              </Link>
            </div>
          );
        })()}

        {tab === "leads" && !openLeadId && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {leads.length === 0 && (
              <p className="col-span-full text-sm text-zinc-500">Вы ещё не отправляли заявок.</p>
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
                        {lead.specialistName}
                      </p>
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
                </button>
              );
            })}
          </div>
        )}

        {tab === "jobposts" && (
          <CustomerJobPostsTab customerId={userId} customerName={customerName} />
        )}

        {tab === "orders" && <OrdersTab role="customer" ownId={userId} archive={false} />}
        {tab === "archive" && (
          <div>
            <div className="mb-4 flex gap-1 rounded-full bg-zinc-100 p-1 text-xs font-medium w-fit">
              <button
                type="button"
                onClick={() => setArchiveSubTab("deals")}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  archiveSubTab === "deals" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
                }`}
              >
                Выполненные заказы
              </button>
              <button
                type="button"
                onClick={() => setArchiveSubTab("declined")}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  archiveSubTab === "declined" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
                }`}
              >
                Отказанные
              </button>
            </div>
            {archiveSubTab === "deals" ? (
              <OrdersTab role="customer" ownId={userId} archive={true} />
            ) : (
              <DeclinedResponsesTab customerId={userId} />
            )}
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

        {tab === "suggestions" && <SuggestionForm userId={userId} />}
      </div>
    </div>
  );
}
