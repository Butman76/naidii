import Link from "next/link";
import type { AiEvent } from "@/lib/events";
import { EVENT_TYPE_LABELS, FORMAT_LABELS, dayBadge, formatDateRange, formatPrice, placeLabel, timeLabel } from "@/lib/events";
import { getCategoryStyle } from "@/data/category-style";
import { CategoryTag } from "./EventCard";
import { ArrowRightIcon } from "./icons";

// «Ближайшее событие» — новый блок между hero и панелью фильтров (бриф
// пользователя, 2026-09-28, «AI Event Signal»). Данные — из уже
// загруженного на сервере списка событий (app/events/page.tsx), нового
// запроса к PocketBase нет: страница сама находит ближайшее непрошедшее
// опубликованное событие по startDate. Регистрация — та же форма
// (POST /api/events/click с event.id), что и на детальной странице
// события: тот же эндпоинт и подсчёт кликов, просто ещё одно место, откуда
// его можно вызвать.
function daysUntil(startDate: string, today: string): number {
  return Math.round((Date.parse(startDate + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000);
}

export default function NearestEventBanner({ event, today }: { event: AiEvent; today: string }) {
  const style = getCategoryStyle(event.categories[0] ?? "other");
  const badge = dayBadge(event);
  const label = timeLabel(event, today) || `Через ${daysUntil(event.startDate, today)} дн.`;
  const regUrl = event.registrationUrl || event.officialUrl;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white shadow-lg sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full opacity-25 blur-3xl"
        style={{ background: style.hex }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${style.hex}, transparent)` }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-center sm:gap-0 sm:rounded-2xl sm:bg-white/10 sm:px-6 sm:py-5 sm:ring-1 sm:ring-inset sm:ring-white/10">
          <span className="text-4xl font-bold leading-none">{badge.day}</span>
          <span className="text-xs font-semibold uppercase tracking-wide sm:mt-1" style={{ color: style.hex }}>
            {badge.month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
              Ближайшее событие
            </span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: `${style.hex}40` }}>
              {label}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">
            <Link href={`/events/${event.slug}`} className="hover:underline">
              {event.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {formatDateRange(event)} · {placeLabel(event)} · {EVENT_TYPE_LABELS[event.eventType]} · {FORMAT_LABELS[event.format]}
          </p>
          {event.shortDescription && (
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{event.shortDescription}</p>
          )}
          {event.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {event.categories.map((c) => (
                <CategoryTag key={c} slug={c} inverted />
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-base font-semibold text-white">{formatPrice(event)}</span>
            {regUrl && (
              <form action="/api/events/click" method="POST">
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
                >
                  Зарегистрироваться
                </button>
              </form>
            )}
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              Подробнее
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
