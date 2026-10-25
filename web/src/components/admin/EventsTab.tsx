"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { pbClient } from "@/lib/auth-client";
import {
  EVENT_TYPE_LABELS, FORMAT_LABELS, PLACEMENT_LABELS, STATUS_LABELS, deleteEvent, eventsToCsv, fetchAdminEvents,
  formatDateRange, setSubmissionComment, updateEvent, type AdminEvent, type EventPlacement, type EventStatus,
} from "@/lib/events";
import { CATEGORIES } from "@/data/categories";

// Вкладка «AI-события» в /admin (только admin): модерация заявок из
// /events/add, публикация, закрепление, метки размещения. Контакты
// организатора хранятся в отдельной коллекции и видны только здесь.

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "border-zinc-300 bg-white text-zinc-600",
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  published: "border-emerald-300 bg-emerald-50 text-emerald-800",
  rejected: "border-red-300 bg-red-50 text-red-700",
  archived: "border-zinc-300 bg-zinc-100 text-zinc-600",
};

const STATUS_ORDER: EventStatus[] = ["pending", "published", "draft", "rejected", "archived"];

function EventRow({ event, onPatch, onDelete, onComment }: {
  event: AdminEvent;
  onPatch: (e: AdminEvent, patch: Record<string, string | number | boolean | string[]>) => void;
  onDelete: (e: AdminEvent) => void;
  onComment: (e: AdminEvent, comment: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(event.submission?.adminComment ?? "");
  const sub = event.submission;

  return (
    <>
      <tr className="border-b border-zinc-100 align-top">
        <td className="px-3 py-2">
          <Link href={`/events/${event.slug}`} target="_blank" className="font-medium text-zinc-900 underline">{event.title}</Link>
          <p className="text-[11px] text-zinc-400">
            {EVENT_TYPE_LABELS[event.eventType]} · {FORMAT_LABELS[event.format]}{event.city ? ` · ${event.city}` : ""}
          </p>
          <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[11px] text-zinc-500 underline">
            {open ? "свернуть" : "подробнее"}
          </button>
        </td>
        <td className="px-3 py-2 text-xs text-zinc-700">{formatDateRange(event)}</td>
        <td className="px-3 py-2 text-xs text-zinc-700">
          {event.categories.map((c) => CATEGORIES.find((x) => x.slug === c)?.name ?? c).join(", ") || "—"}
        </td>
        <td className="px-3 py-2">
          <select
            value={event.status}
            onChange={(e) => onPatch(event, { status: e.target.value })}
            className={`rounded-full border px-2 py-1 text-xs ${STATUS_STYLES[event.status]}`}
          >
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </td>
        <td className="px-3 py-2">
          <select
            value={event.placement}
            onChange={(e) => onPatch(event, { placement: e.target.value as EventPlacement })}
            className="rounded border border-zinc-300 px-2 py-1 text-xs"
          >
            {(Object.keys(PLACEMENT_LABELS) as EventPlacement[]).map((p) => <option key={p} value={p}>{PLACEMENT_LABELS[p]}</option>)}
          </select>
        </td>
        <td className="px-3 py-2 text-xs tabular-nums text-zinc-500">{event.regClicks}</td>
        <td className="px-3 py-2">
          <button type="button" onClick={() => onDelete(event)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">удалить</button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <td colSpan={7} className="space-y-2 px-3 py-3 text-xs text-zinc-600">
            <p>{event.shortDescription}</p>
            <p>Сайт: {event.officialUrl ? <a href={event.officialUrl} target="_blank" rel="noopener noreferrer" className="underline">{event.officialUrl}</a> : "—"}</p>
            <p>Регистрация: {event.registrationUrl ? <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="underline">{event.registrationUrl}</a> : "—"}</p>
            <p>Организатор: {event.organizer || "—"} · Источник: {event.sourceNote || "—"}</p>
            {sub ? (
              <div className="rounded border border-zinc-200 bg-white p-2">
                <p>Контакт организатора: {sub.contactName}, {sub.organizerEmail}{sub.contactPhone ? `, ${sub.contactPhone}` : ""}</p>
                {sub.organizerNote && <p className="mt-1">Комментарий организатора: {sub.organizerNote}</p>}
                <div className="mt-2 flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Комментарий модератора (например, причина отказа)"
                    className="flex-1 rounded border border-zinc-300 px-2 py-1"
                  />
                  <button type="button" onClick={() => onComment(event, comment)} className="rounded bg-zinc-900 px-3 py-1 text-white">Сохранить</button>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400">Добавлено администратором, заявки организатора нет.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function EventsTab() {
  const [list, setList] = useState<AdminEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | EventStatus>("all");

  const refresh = useCallback(async () => {
    try {
      setList(await fetchAdminEvents(pbClient));
      setError(null);
    } catch {
      setError("Не удалось загрузить события.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of list ?? []) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [list]);

  const shown = useMemo(() => (list ?? []).filter((e) => filter === "all" || e.status === filter), [list, filter]);

  async function patch(e: AdminEvent, data: Record<string, string | number | boolean | string[]>) {
    try {
      await updateEvent(pbClient, e.id, data);
      await refresh();
    } catch {
      setError("Не удалось сохранить изменение.");
    }
  }

  async function remove(e: AdminEvent) {
    if (!window.confirm(`Удалить событие «${e.title}»? Это необратимо.`)) return;
    try {
      await deleteEvent(pbClient, e.id);
      await refresh();
    } catch {
      setError("Не удалось удалить событие.");
    }
  }

  async function comment(e: AdminEvent, text: string) {
    if (!e.submission) return;
    try {
      await setSubmissionComment(pbClient, e.submission.id, text);
      await refresh();
    } catch {
      setError("Не удалось сохранить комментарий.");
    }
  }

  function download() {
    const blob = new Blob([eventsToCsv(shown)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `naidii_events_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs text-zinc-400">
        Афиша /events. Новые заявки из формы приходят со статусом «На модерации»: проверьте сайт организатора и переведите в «Опубликовано».
        Публичная страница показывает только опубликованные. Заявка организатора с контактами видна в раскрытой строке.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setFilter("all")} className={`rounded-full border px-3 py-1 text-sm ${filter === "all" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300"}`}>
          Все · {list?.length ?? 0}
        </button>
        {STATUS_ORDER.map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1 text-sm ${filter === s ? "border-zinc-900 bg-zinc-900 text-white" : STATUS_STYLES[s]}`}>
            {STATUS_LABELS[s]} · {counts[s] ?? 0}
          </button>
        ))}
        <button type="button" onClick={download} className="ml-auto rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50">
          Экспорт CSV ({shown.length})
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-400">
              <th className="px-3 py-2 font-medium">Событие</th>
              <th className="px-3 py-2 font-medium">Дата</th>
              <th className="px-3 py-2 font-medium">Направления</th>
              <th className="px-3 py-2 font-medium">Статус</th>
              <th className="px-3 py-2 font-medium">Размещение</th>
              <th className="px-3 py-2 font-medium">Клики</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {shown.map((e) => <EventRow key={e.id} event={e} onPatch={patch} onDelete={remove} onComment={comment} />)}
            {list === null && !error && <tr><td colSpan={7} className="px-3 py-3 text-zinc-400">Загружаем…</td></tr>}
            {list !== null && shown.length === 0 && <tr><td colSpan={7} className="px-3 py-3 text-zinc-400">Событий нет.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
