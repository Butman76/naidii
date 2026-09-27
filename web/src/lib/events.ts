import type PocketBase from "pocketbase";
import { createPocketBase } from "./pocketbase";

// Раздел «AI-события» (/events). Коллекции ai_events и ai_event_submissions
// (миграция 1755000057) не связаны с остальной схемой: ничего из
// существующих коллекций тут не читается, кроме каталога специалистов на
// странице события (через уже готовый fetchSpecialists).

export type EventType =
  | "forum" | "conference" | "expo" | "conference_expo" | "meetup" | "webinar" | "hackathon"
  | "masterclass" | "workshop" | "intensive" | "roundtable" | "demo_day" | "award" | "contest" | "training";
export type EventFormat = "offline" | "online" | "hybrid";
export type PriceType = "free" | "paid" | "on_request";
export type EventStatus = "draft" | "pending" | "published" | "rejected" | "archived";
export type EventPlacement = "basic" | "featured" | "partner" | "pinned";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  forum: "Форум",
  conference: "Конференция",
  expo: "Выставка",
  conference_expo: "Конференция + выставка",
  meetup: "Митап",
  webinar: "Вебинар",
  hackathon: "Хакатон",
  masterclass: "Мастер-класс",
  workshop: "Воркшоп",
  intensive: "Онлайн-интенсив",
  roundtable: "Круглый стол",
  demo_day: "Демо-день",
  award: "Премия",
  contest: "Конкурс",
  training: "Обучающее мероприятие",
};

export const FORMAT_LABELS: Record<EventFormat, string> = { offline: "Офлайн", online: "Онлайн", hybrid: "Гибрид" };
export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликовано",
  rejected: "Отклонено",
  archived: "Архив",
};
export const PLACEMENT_LABELS: Record<EventPlacement, string> = {
  basic: "Базовое",
  featured: "Рекомендуем",
  partner: "Партнёрское",
  pinned: "Закреплённое",
};

export interface AiEvent {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  eventType: EventType;
  format: EventFormat;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  timeNote: string;
  city: string;
  venue: string;
  address: string;
  onlinePlatform: string;
  officialUrl: string;
  registrationUrl: string;
  programUrl: string;
  priceType: PriceType | "";
  priceFrom: number;
  promoCode: string;
  organizer: string;
  categories: string[];
  speakersWanted: boolean;
  exhibitorsWanted: boolean;
  status: EventStatus;
  placement: EventPlacement;
  sourceNote: string;
  regClicks: number;
  created: string;
}

const dateKey = (v: unknown): string => (typeof v === "string" ? v.slice(0, 10) : "");

function mapEvent(r: Record<string, unknown>): AiEvent {
  const s = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  return {
    id: s("id"),
    slug: s("slug"),
    title: s("title"),
    shortDescription: s("short_description"),
    description: s("description"),
    eventType: (s("event_type") || "conference") as EventType,
    format: (s("format") || "offline") as EventFormat,
    startDate: dateKey(r.start_date),
    endDate: dateKey(r.end_date),
    timeNote: s("time_note"),
    city: s("city"),
    venue: s("venue"),
    address: s("address"),
    onlinePlatform: s("online_platform"),
    officialUrl: s("official_url"),
    registrationUrl: s("registration_url"),
    programUrl: s("program_url"),
    priceType: s("price_type") as PriceType | "",
    priceFrom: typeof r.price_from === "number" ? r.price_from : 0,
    promoCode: s("promo_code"),
    organizer: s("organizer"),
    categories: Array.isArray(r.categories) ? (r.categories as string[]) : [],
    speakersWanted: Boolean(r.speakers_wanted),
    exhibitorsWanted: Boolean(r.exhibitors_wanted),
    status: (s("status") || "draft") as EventStatus,
    placement: (s("placement") || "basic") as EventPlacement,
    sourceNote: s("source_note"),
    regClicks: typeof r.reg_clicks === "number" ? r.reg_clicks : 0,
    created: s("created"),
  };
}

// Сегодняшняя дата по Москве в виде YYYY-MM-DD: события считаем по
// московскому календарю, а не по часовому поясу сервера.
export function todayKey(now: Date = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Europe/Moscow" });
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86400000);
}

export function lastDay(ev: AiEvent): string {
  return ev.endDate && ev.endDate >= ev.startDate ? ev.endDate : ev.startDate;
}

export function isPast(ev: AiEvent, today: string): boolean {
  return lastDay(ev) < today;
}

const PLACEMENT_WEIGHT: Record<EventPlacement, number> = { pinned: 3, partner: 2, featured: 1, basic: 0 };

// Ближайшие сверху; закреплённые, партнёрские и рекомендованные поднимаются
// выше обычных с тем же горизонтом.
export function sortUpcoming(list: AiEvent[]): AiEvent[] {
  return [...list].sort(
    (a, b) => PLACEMENT_WEIGHT[b.placement] - PLACEMENT_WEIGHT[a.placement] || a.startDate.localeCompare(b.startDate)
  );
}

export function timeLabel(ev: AiEvent, today: string): string {
  if (isPast(ev, today)) return "Завершено";
  if (ev.startDate <= today) return "Идёт сейчас";
  const d = dayDiff(today, ev.startDate);
  if (d === 1) return "Завтра";
  if (d <= 14) return "Скоро";
  return "";
}

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export function formatDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatDateRange(ev: AiEvent): string {
  if (!ev.endDate || ev.endDate === ev.startDate) return formatDay(ev.startDate);
  const [y1, m1, d1] = ev.startDate.split("-").map(Number);
  const [y2, m2, d2] = ev.endDate.split("-").map(Number);
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MONTHS[m1 - 1]} ${y1}`;
  return `${formatDay(ev.startDate)} – ${formatDay(ev.endDate)}`;
}

export function dayBadge(ev: AiEvent): { day: string; month: string } {
  const [, m, d] = ev.startDate.split("-").map(Number);
  return { day: String(d), month: MONTHS[m - 1].slice(0, 3).toUpperCase() };
}

export function formatPrice(ev: AiEvent): string {
  if (ev.priceType === "free") return "Бесплатно";
  if (ev.priceType === "paid") return ev.priceFrom > 0 ? `от ${ev.priceFrom.toLocaleString("ru-RU")} ₽` : "Платно";
  return "По запросу";
}

export function placeLabel(ev: AiEvent): string {
  if (ev.format === "online") return "Онлайн";
  const place = [ev.city, ev.venue].filter(Boolean).join(", ");
  return ev.format === "hybrid" ? `${place || "Гибрид"} · онлайн` : place || "Офлайн";
}

export function googleCalendarUrl(ev: AiEvent): string {
  const compact = (k: string) => k.replaceAll("-", "");
  const end = new Date(Date.parse(lastDay(ev) + "T00:00:00Z") + 86400000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${compact(ev.startDate)}/${compact(end)}`,
    details: `${ev.shortDescription}\n${ev.officialUrl}`.trim(),
    location: [ev.venue, ev.address, ev.city].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Публичные данные: без коллекции (миграция не применена) или при сбое
// PocketBase страница просто покажет пустой список, а не упадёт.
export async function fetchPublishedEvents(): Promise<AiEvent[]> {
  try {
    const pb = createPocketBase();
    const records = await pb.collection("ai_events").getFullList({ filter: 'status = "published"', sort: "start_date", batch: 500 });
    return records.map((r) => mapEvent(r as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchEventBySlug(slug: string): Promise<AiEvent | null> {
  try {
    const pb = createPocketBase();
    const r = await pb.collection("ai_events").getFirstListItem(pb.filter('slug = {:slug} && status = "published"', { slug }));
    return mapEvent(r as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function relatedEvents(current: AiEvent, all: AiEvent[], today: string, limit = 3): AiEvent[] {
  return all
    .filter((e) => e.id !== current.id && !isPast(e, today))
    .map((e) => ({
      e,
      score:
        e.categories.filter((c) => current.categories.includes(c)).length * 2 +
        (e.city && e.city === current.city ? 1 : 0) +
        (e.format === "online" ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.e.startDate.localeCompare(b.e.startDate))
    .slice(0, limit)
    .map((x) => x.e);
}

// ---------- админка (клиентский pb с правами admin) ----------

export interface AdminEvent extends AiEvent {
  submission: { id: string; organizerEmail: string; contactName: string; contactPhone: string; organizerNote: string; adminComment: string } | null;
}

export async function fetchAdminEvents(pb: PocketBase): Promise<AdminEvent[]> {
  const [events, subs] = await Promise.all([
    pb.collection("ai_events").getFullList({ sort: "-created", batch: 500 }),
    pb.collection("ai_event_submissions").getFullList({ batch: 500 }),
  ]);
  const byEvent = new Map(subs.map((s) => [String(s.event), s]));
  return events.map((r) => {
    const sub = byEvent.get(r.id);
    return {
      ...mapEvent(r as unknown as Record<string, unknown>),
      submission: sub
        ? {
            id: sub.id,
            organizerEmail: String(sub.organizer_email ?? ""),
            contactName: String(sub.contact_name ?? ""),
            contactPhone: String(sub.contact_phone ?? ""),
            organizerNote: String(sub.organizer_note ?? ""),
            adminComment: String(sub.admin_comment ?? ""),
          }
        : null,
    };
  });
}

export async function updateEvent(pb: PocketBase, id: string, patch: Record<string, string | number | boolean | string[]>): Promise<void> {
  await pb.collection("ai_events").update(id, patch);
}

export async function deleteEvent(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("ai_events").delete(id);
}

export async function setSubmissionComment(pb: PocketBase, submissionId: string, comment: string): Promise<void> {
  await pb.collection("ai_event_submissions").update(submissionId, { admin_comment: comment });
}

export function eventsToCsv(list: AdminEvent[]): string {
  const cols: Array<[string, (e: AdminEvent) => string]> = [
    ["title", (e) => e.title], ["start_date", (e) => e.startDate], ["end_date", (e) => e.endDate], ["city", (e) => e.city],
    ["type", (e) => EVENT_TYPE_LABELS[e.eventType]], ["format", (e) => FORMAT_LABELS[e.format]], ["status", (e) => STATUS_LABELS[e.status]],
    ["placement", (e) => PLACEMENT_LABELS[e.placement]], ["categories", (e) => e.categories.join("; ")], ["official_url", (e) => e.officialUrl],
    ["organizer", (e) => e.organizer], ["contact_name", (e) => e.submission?.contactName ?? ""], ["contact_email", (e) => e.submission?.organizerEmail ?? ""],
    ["reg_clicks", (e) => String(e.regClicks)], ["created", (e) => e.created],
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return "﻿" + [cols.map((c) => c[0]).join(";"), ...list.map((e) => cols.map((c) => esc(c[1](e))).join(";"))].join("\r\n");
}
