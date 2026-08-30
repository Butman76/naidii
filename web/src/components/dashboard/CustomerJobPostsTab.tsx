"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle, getCategoryAccent } from "@/data/category-style";
import {
  createJobPost,
  fetchCustomerJobPosts,
  closeJobPost,
  fetchJobPostResponses,
  fetchJobPostResponseCounts,
  declineJobPostResponse,
  subscribeToJobPostResponses,
  type JobPost,
  type JobPostResponse,
} from "@/lib/jobPosts";
import LeadChat from "./LeadChat";

// "Разместить объявление" (2026-08-29, по прямому запросу пользователя) —
// заказчик описывает задачу без привязки к конкретной карточке услуги,
// категория/подкатегория опциональны. Внутри одного объявления параллельно
// живёт несколько чатов — по одному на каждого откликнувшегося специалиста
// (см. lib/jobPosts.ts); неинтересные заказчик "отказывает" — чат гаснет
// (lead.status = "closed"), но остаётся в списке, не удаляется.
function JobPostForm({
  customerId,
  customerName,
  onCreated,
  onCancel,
}: {
  customerId: string;
  customerName: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = description.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      await createJobPost(pbClient, {
        customerId,
        customerName,
        categorySlug: categorySlug || undefined,
        subcategory: subcategory.trim() || undefined,
        description: description.trim(),
      });
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-semibold text-zinc-900">Разместить объявление</p>
      <p className="mt-1 text-sm text-zinc-500">
        Опишите задачу своими словами — категорию можно выбрать для удобства
        поиска, но это необязательно.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none sm:w-1/2"
          >
            <option value="">Без категории</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Подкатегория (необязательно)"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none sm:w-1/2"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Например: нужен человек, который разберётся с нашей CRM и настроит автоматическую рассылку по лидам"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit || busy}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {busy ? "Публикуем…" : "Опубликовать"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  new: "Новый отклик",
  transferred: "Новый отклик",
  in_progress: "В переписке",
  responded: "В переписке",
  deal: "Сделка заключена",
  closed: "Отклонён",
  spam: "Отклонён",
};

function JobPostDetail({
  post,
  customerId,
  onClose,
  onChanged,
}: {
  post: JobPost;
  customerId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [responses, setResponses] = useState<JobPostResponse[] | null>(null);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [responseSubTab, setResponseSubTab] = useState<"active" | "declined">("active");

  const refreshResponses = useCallback(() => {
    return fetchJobPostResponses(pbClient, post.id).then(setResponses);
  }, [post.id]);

  useEffect(() => {
    refreshResponses();
  }, [refreshResponses]);

  // Новый отклик специалиста должен появиться в списке сразу, без
  // перезагрузки страницы — по просьбе пользователя.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    subscribeToJobPostResponses(pbClient, post.id, () => {
      refreshResponses();
      onChanged();
    }).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [post.id, refreshResponses, onChanged]);

  async function handleClosePost() {
    setBusy(true);
    try {
      await closeJobPost(pbClient, post.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline(leadId: string) {
    setBusy(true);
    try {
      await declineJobPostResponse(pbClient, leadId);
      await refreshResponses();
    } finally {
      setBusy(false);
    }
  }

  if (openLeadId) {
    const response = responses?.find((r) => r.leadId === openLeadId);
    if (!response) return null;
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenLeadId(null)}
          className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Все отклики на это объявление
        </button>
        <LeadChat
          leadId={response.leadId}
          currentUserId={customerId}
          currentUserRole="customer"
          customerId={customerId}
          specialistProfileId={response.specialistProfileId}
          otherPartyName={response.specialistName}
          leadStatus={response.status}
          onClose={() => setOpenLeadId(null)}
          onDealChanged={refreshResponses}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClose}
        className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
      >
        ← Все объявления
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-zinc-700">{post.description}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              post.status === "open"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {post.status === "open" ? "Открыто" : "Закрыто"}
          </span>
        </div>
        {post.status === "open" && (
          <button
            type="button"
            onClick={handleClosePost}
            disabled={busy}
            className="mt-3 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            Закрыть объявление
          </button>
        )}
      </div>

      {(() => {
        const activeResponses = responses?.filter((r) => r.status !== "closed" && r.status !== "spam") ?? [];
        const declinedResponses = responses?.filter((r) => r.status === "closed" || r.status === "spam") ?? [];
        const shown = responseSubTab === "active" ? activeResponses : declinedResponses;

        return (
          <>
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setResponseSubTab("active")}
                className={`text-sm font-semibold transition-colors ${
                  responseSubTab === "active" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Отклики {responses ? `(${activeResponses.length})` : ""}
              </button>
              {declinedResponses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setResponseSubTab("declined")}
                  className={`text-sm font-semibold transition-colors ${
                    responseSubTab === "declined" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  Отказы ({declinedResponses.length})
                </button>
              )}
            </div>

            {responses === null && <p className="mt-2 text-xs text-zinc-400">Загружаем…</p>}
            {responses !== null && shown.length === 0 && (
              <p className="mt-2 text-sm text-zinc-500">
                {responseSubTab === "active" ? "Пока никто не откликнулся." : "Отказанных откликов нет."}
              </p>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {shown.map((r) => (
                <div
                  key={r.leadId}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
                    responseSubTab === "declined"
                      ? "border-zinc-200 bg-zinc-50"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenLeadId(r.leadId)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-zinc-900">{r.specialistName}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{r.message}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                      {RESPONSE_STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    {responseSubTab === "active" && (
                      <button
                        type="button"
                        onClick={() => handleDecline(r.leadId)}
                        disabled={busy}
                        className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        Отказать
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default function CustomerJobPostsTab({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [posts, setPosts] = useState<JobPost[] | null>(null);
  const [counts, setCounts] = useState<Record<string, { total: number; active: number }>>({});
  const [showForm, setShowForm] = useState(false);
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return Promise.all([
      fetchCustomerJobPosts(pbClient, customerId),
      fetchJobPostResponseCounts(pbClient, customerId),
    ]).then(([p, c]) => {
      setPosts(p);
      setCounts(c);
    });
  }, [customerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (openPostId) {
    const post = posts?.find((p) => p.id === openPostId);
    if (!post) return null;
    return (
      <JobPostDetail
        post={post}
        customerId={customerId}
        onClose={() => setOpenPostId(null)}
        onChanged={refresh}
      />
    );
  }

  return (
    <div>
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
        >
          + Разместить объявление
        </button>
      )}

      {showForm && (
        <div className="mb-4">
          <JobPostForm
            customerId={customerId}
            customerName={customerName}
            onCreated={() => {
              setShowForm(false);
              refresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {posts === null && <p className="mt-6 text-sm text-zinc-500">Загружаем…</p>}
      {posts?.length === 0 && !showForm && (
        <p className="mt-6 text-sm text-zinc-500">
          Вы ещё не размещали объявлений — нажмите «Разместить объявление» выше,
          если не нашли подходящую услугу в каталоге.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {posts?.map((post) => {
          const style = getCategoryStyle(post.categorySlug || "other");
          const accent = getCategoryAccent(post.categorySlug || "other");
          const count = counts[post.id] ?? { total: 0, active: 0 };
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => setOpenPostId(post.id)}
              className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-shadow hover:shadow-md ${accent.border} ${accent.tint}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  {post.categorySlug && (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.hex }}
                    />
                  )}
                  <span className="truncate text-xs text-zinc-500">
                    {post.categorySlug
                      ? CATEGORIES.find((c) => c.slug === post.categorySlug)?.name ?? post.categorySlug
                      : "Без категории"}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    post.status === "open"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {post.status === "open" ? "Открыто" : "Закрыто"}
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-zinc-800">{post.description}</p>
              <p className="text-xs text-zinc-500">
                {count.total === 0
                  ? "Пока нет откликов"
                  : `${count.total} ${count.total === 1 ? "отклик" : "откликов"}${
                      count.active > 0 ? `, ${count.active} активных` : ""
                    }`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
