"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle, getCategoryAccent } from "@/data/category-style";
import {
  fetchOpenJobPosts,
  fetchOwnJobPostResponses,
  respondToJobPost,
  type JobPost,
} from "@/lib/jobPosts";
import LeadChat from "./LeadChat";

// Доска открытых объявлений заказчиков (2026-08-29) — зеркало
// CustomerJobPostsTab с другой стороны: специалист листает объявления,
// которые заказчики разместили без привязки к конкретной карточке услуги,
// и откликается. Отклик создаёт обычный lead (см. lib/jobPosts.ts,
// respondToJobPost) — дальше это тот же чат/сделка, что и у заказа с
// карточки услуги.
function RespondForm({
  post,
  specialistProfileId,
  onResponded,
  onCancel,
}: {
  post: JobPost;
  specialistProfileId: string;
  onResponded: (leadId: string) => void;
  onCancel: () => void;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5 || busy) return;
    setBusy(true);
    try {
      const leadId = await respondToJobPost(pbClient, {
        jobPost: post,
        specialistProfileId,
        message: message.trim(),
      });
      onResponded(leadId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Коротко: чем можете помочь и почему стоит выбрать вас"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={message.trim().length < 5 || busy}
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {busy ? "Отправляем…" : "Откликнуться"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export default function SpecialistJobBoard({
  specialistProfileId,
  currentUserId,
}: {
  specialistProfileId: string;
  currentUserId: string;
}) {
  const [posts, setPosts] = useState<JobPost[] | null>(null);
  const [ownResponses, setOwnResponses] = useState<Record<string, { leadId: string; status: string }>>({});
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [openLead, setOpenLead] = useState<{ leadId: string; status: string; post: JobPost } | null>(null);

  const refresh = useCallback(() => {
    return Promise.all([
      fetchOpenJobPosts(pbClient),
      fetchOwnJobPostResponses(pbClient, specialistProfileId),
    ]).then(([openPosts, responses]) => {
      setPosts(openPosts);
      const map: Record<string, { leadId: string; status: string }> = {};
      for (const r of responses) map[r.jobPostId] = { leadId: r.leadId, status: r.status };
      setOwnResponses(map);
    });
  }, [specialistProfileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (openLead) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenLead(null)}
          className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Все открытые заявки
        </button>
        <LeadChat
          leadId={openLead.leadId}
          currentUserId={currentUserId}
          currentUserRole="specialist"
          customerId={openLead.post.customerId}
          specialistProfileId={specialistProfileId}
          otherPartyName={openLead.post.customerName}
          leadStatus={openLead.status}
          onClose={() => setOpenLead(null)}
        />
      </div>
    );
  }

  if (posts === null) {
    return <p className="text-sm text-zinc-500">Загружаем…</p>;
  }

  if (posts.length === 0) {
    return <p className="text-sm text-zinc-500">Сейчас нет открытых заявок от заказчиков.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => {
        const accent = getCategoryAccent(post.categorySlug || "other");
        const style = getCategoryStyle(post.categorySlug || "other");
        const existingResponse = ownResponses[post.id];
        return (
          <div key={post.id} className={`rounded-2xl border p-4 ${accent.border} ${accent.tint}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                {post.categorySlug && (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: style.hex }} />
                )}
                <span className="truncate text-xs text-zinc-500">
                  {post.categorySlug
                    ? (CATEGORIES.find((c) => c.slug === post.categorySlug)?.name ?? post.categorySlug) +
                      (post.subcategory ? ` · ${post.subcategory}` : "")
                    : "Без категории"}
                </span>
              </div>
              <span className="shrink-0 text-[11px] text-zinc-400">{post.customerName}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-800">{post.description}</p>

            {existingResponse ? (
              <button
                type="button"
                onClick={() => setOpenLead({ leadId: existingResponse.leadId, status: existingResponse.status, post })}
                className="mt-3 rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Открыть чат
              </button>
            ) : respondingTo === post.id ? (
              <RespondForm
                post={post}
                specialistProfileId={specialistProfileId}
                onResponded={(leadId) => {
                  setOwnResponses((prev) => ({ ...prev, [post.id]: { leadId, status: "new" } }));
                  setRespondingTo(null);
                  setOpenLead({ leadId, status: "new", post });
                }}
                onCancel={() => setRespondingTo(null)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setRespondingTo(post.id)}
                className="mt-3 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
              >
                Откликнуться
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
