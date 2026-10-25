"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { logAdminAction } from "@/lib/admin";
import { embedVideoUrl } from "@/lib/video-embed";
import {
  fetchPendingLandingItems,
  fetchRecentLandingDecisions,
  moderateLandingItem,
  type LandingDecision,
  type LandingItem,
  type PendingLandingItem,
} from "@/lib/landing";

// Вкладка "Лендинги" в /admin: очередь всего, что специалисты на тарифе
// enterprise загрузили или изменили на своём лендинге (обложка, логотип,
// видео, карточки услуг, фото портфолио, презентации), и список последних
// решений. Публично элемент виден только после "Одобрить" (см.
// pocketbase/pb_migrations/1755000046_landing_items.js). Для правки
// одобренного специалистом — "Было / Стало" рядом: старая версия остаётся
// на сайте, пока не одобрена новая. Каждое решение пишется и в admin_logs.

const KIND_LABELS: Record<string, string> = {
  cover: "Обложка",
  logo: "Логотип",
  video: "Видео",
  service_card: "Карточка услуги",
  photo: "Фото портфолио",
  presentation: "Презентация",
};

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ItemPreview({ item, heading }: { item: LandingItem; heading: string }) {
  const embed = item.kind === "video" && item.videoUrl ? embedVideoUrl(item.videoUrl) : null;
  return (
    <div className="min-w-0 flex-1 rounded border border-zinc-200 bg-zinc-50 p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">{heading}</p>

      {item.thumbUrl && (
        <a href={item.imageUrl ?? item.thumbUrl} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbUrl}
            alt=""
            className={`rounded border border-zinc-200 bg-white object-cover ${
              item.kind === "logo" ? "h-24 w-24" : item.kind === "cover" ? "h-28 w-full" : "aspect-[4/3] w-full max-w-xs"
            }`}
          />
        </a>
      )}

      {item.kind === "video" && (
        <div className="space-y-2">
          <p className="break-all text-xs text-zinc-700">{item.videoUrl}</p>
          {embed ? (
            <div className="aspect-video max-w-sm overflow-hidden rounded bg-zinc-900">
              <iframe src={embed} className="h-full w-full" allowFullScreen />
            </div>
          ) : (
            <p className="text-xs text-amber-700">Ссылка не распознана как YouTube/RuTube.</p>
          )}
        </div>
      )}

      {item.documentUrl && (
        <a
          href={item.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-blue-700 underline"
        >
          Открыть файл презентации ({item.documentUrl.split(".").pop()?.toUpperCase()})
        </a>
      )}

      {item.title && <p className="mt-2 text-xs font-medium text-zinc-900">{item.title}</p>}
      {item.description && <p className="mt-1 whitespace-pre-line text-xs text-zinc-600">{item.description}</p>}
      {(item.priceText || item.durationText) && (
        <p className="mt-1 text-xs text-zinc-700">
          {item.priceText}
          {item.priceText && item.durationText ? " · " : ""}
          {item.durationText && `срок: ${item.durationText}`}
        </p>
      )}
    </div>
  );
}

export default function LandingModerationTab({ onChanged }: { onChanged: () => void }) {
  const [pending, setPending] = useState<PendingLandingItem[] | null>(null);
  const [decisions, setDecisions] = useState<LandingDecision[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const refresh = useCallback(async () => {
    const [p, d] = await Promise.all([
      fetchPendingLandingItems(pbClient),
      fetchRecentLandingDecisions(pbClient),
    ]);
    setPending(p);
    setDecisions(d);
  }, []);

  useEffect(() => {
    refresh().catch((err) => {
      if (err?.isAbort) return;
      setError("Не удалось загрузить очередь лендингов.");
    });
  }, [refresh]);

  async function decide(entry: PendingLandingItem, decision: "approved" | "rejected", rejectReason = "") {
    setBusyId(entry.item.id);
    setError(null);
    try {
      await moderateLandingItem(pbClient, entry.item.id, decision, rejectReason);
      await logAdminAction(pbClient, {
        action: `${decision === "approved" ? "Одобрил" : "Отклонил"} элемент лендинга «${KIND_LABELS[entry.item.kind] ?? entry.item.kind}»`,
        entityType: "landing_item",
        entityId: entry.item.id,
        oldData: { moderation_status: "pending" },
        newData: {
          moderation_status: decision,
          reject_reason: rejectReason || undefined,
          kind: entry.item.kind,
          specialist: entry.profileName,
          title: entry.item.title || undefined,
          replaces: entry.replaces?.id,
        },
      });
      setRejectingId(null);
      setReason("");
      await refresh();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить действие.");
    } finally {
      setBusyId(null);
    }
  }

  if (!pending) {
    return <p className="p-4 text-xs text-zinc-500">{error ?? "Загружаем…"}</p>;
  }

  return (
    <div className="p-4">
      {error && (
        <p className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      <p className="text-xs font-medium text-zinc-900">На модерации ({pending.length})</p>
      {pending.length === 0 && (
        <p className="mt-2 text-xs text-zinc-500">Очередь пуста — всё проверено.</p>
      )}

      <div className="mt-3 flex flex-col gap-4">
        {pending.map((entry) => {
          const { item } = entry;
          const busy = busyId === item.id;
          return (
            <div key={item.id} className="rounded border border-zinc-300 bg-white p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs text-zinc-900">
                  <span className="font-semibold">{KIND_LABELS[item.kind] ?? item.kind}</span>
                  <span className="text-zinc-500">
                    {" "}
                    · {entry.profileName}
                    {entry.ownerEmail ? ` (${entry.ownerEmail})` : ""}
                  </span>
                </p>
                <p className="text-[11px] text-zinc-400">
                  {entry.replaces ? "правка одобренного · " : "новое · "}
                  {formatDateTime(item.createdAt)}
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                {entry.replaces && <ItemPreview item={entry.replaces} heading="Сейчас на сайте" />}
                <ItemPreview item={item} heading={entry.replaces ? "Предлагается" : "Предлагается к публикации"} />
              </div>

              {rejectingId === item.id ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    placeholder="Причина отказа — увидит специалист"
                    className="flex-1 rounded border border-zinc-300 px-2 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={busy || reason.trim().length < 3}
                    onClick={() => decide(entry, "rejected", reason.trim())}
                    className="rounded border border-red-300 px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Подтвердить отказ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(null);
                      setReason("");
                    }}
                    className="rounded border border-zinc-300 px-3 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-50"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => decide(entry, "approved")}
                    className="rounded border border-emerald-300 px-3 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Одобрить
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setRejectingId(item.id);
                      setReason("");
                    }}
                    className="rounded border border-red-300 px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs font-medium text-zinc-900">Последние решения</p>
      <p className="mt-1 text-[11px] text-zinc-400">
        Показаны действующие решения. Если специалист исправил отклонённое и отправил снова, оно возвращается
        в очередь выше; полная история каждого решения (кто, когда, причина) — во вкладке «Журнал».
      </p>
      {decisions && decisions.length === 0 && (
        <p className="mt-2 text-xs text-zinc-500">Решений пока не было.</p>
      )}
      <div className="mt-2 divide-y divide-zinc-100 rounded border border-zinc-200 text-xs">
        {(decisions ?? []).map(({ item, profileName }) => (
          <div key={item.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
            <span className="w-32 shrink-0 text-zinc-400">{formatDateTime(item.reviewedAt)}</span>
            <span className={item.status === "approved" ? "text-emerald-700" : "text-red-700"}>
              {item.status === "approved" ? "одобрено" : "отклонено"}
            </span>
            <span className="text-zinc-900">
              {KIND_LABELS[item.kind] ?? item.kind}
              {item.title ? ` «${item.title}»` : ""}
            </span>
            <span className="text-zinc-500">· {profileName}</span>
            {item.status === "rejected" && item.rejectReason && (
              <span className="text-zinc-500">— {item.rejectReason}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
