import Link from "next/link";
import type { ComponentType } from "react";
import type { AiEvent } from "@/lib/events";
import { EVENT_TYPE_LABELS, FORMAT_LABELS, dayBadge, formatDateRange, formatPrice, placeLabel, timeLabel } from "@/lib/events";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";
import { ArrowRightIcon, AwardIcon, MapPinIcon, PinIcon, SparkIcon } from "./icons";

// Редизайн 2026-09-28 («AI Event Signal», бриф пользователя): вместо
// огромной цветной шапки — тонкая градиентная линия сверху + мягкое
// свечение цвета направления в углу + акцентный date-card. Цвет остаётся
// сигналом направления, а не главным содержанием карточки. Вся логика
// (статусы/сортировка/данные) — не тронута, только разметка/классы.

const STATUS_BADGE_STYLE: Record<string, string> = {
  "Идёт сейчас": "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  "Завтра": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "Скоро": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  "Завершено": "bg-zinc-100 text-zinc-500 ring-1 ring-inset ring-zinc-200",
};

const PLACEMENT_STYLE: Record<string, string> = {
  pinned: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  partner: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  featured: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

const PLACEMENT_ICON: Record<string, ComponentType<{ className?: string }>> = {
  pinned: PinIcon,
  partner: AwardIcon,
  featured: SparkIcon,
};

const PLACEMENT_TEXT: Record<string, string> = {
  pinned: "Закреплено",
  partner: "Партнёр НайдИИ",
  featured: "Рекомендуем",
};

// inverted — тёмный фон (баннер «Ближайшее событие», Pro-стиль карточек
// тарифов): пастельная заливка на белом там не читается, нужна другая пара
// цветов поверх zinc-900.
export function CategoryTag({ slug, inverted }: { slug: string; inverted?: boolean }) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  const style = getCategoryStyle(slug);
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset"
      style={
        inverted
          ? { backgroundColor: `${style.hex}26`, color: "#fff", boxShadow: `inset 0 0 0 1px ${style.hex}66` }
          : { backgroundColor: `${style.hex}14`, color: style.hex, boxShadow: `inset 0 0 0 1px ${style.hex}33` }
      }
    >
      {cat.name}
    </span>
  );
}

export default function EventCard({ event, today }: { event: AiEvent; today: string }) {
  const style = getCategoryStyle(event.categories[0] ?? "other");
  const badge = dayBadge(event);
  const label = timeLabel(event, today);
  const past = label === "Завершено";
  const placementBadge = event.placement !== "basic" ? PLACEMENT_ICON[event.placement] : null;
  const free = event.priceType === "free";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        past ? "opacity-75" : ""
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.gradient}`} aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-8 right-0 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-30 motion-reduce:transition-none"
        style={{ background: style.hex }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl leading-none ring-1 ring-inset"
            style={{ backgroundColor: `${style.hex}0f`, boxShadow: `inset 0 0 0 1px ${style.hex}40` }}
          >
            <span className="text-xl font-bold text-zinc-900">{badge.day}</span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-wide" style={{ color: style.hex }}>
              {badge.month}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className="text-[11px] font-medium text-zinc-400">{formatDateRange(event)}</span>
            <span className="text-[11px] font-medium text-zinc-400">
              {EVENT_TYPE_LABELS[event.eventType]} · {FORMAT_LABELS[event.format]}
            </span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {label && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_STYLE[label] ?? "bg-zinc-100 text-zinc-600"}`}>
                  {label}
                </span>
              )}
              {placementBadge && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${PLACEMENT_STYLE[event.placement]}`}>
                  {(() => {
                    const Icon = placementBadge;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {PLACEMENT_TEXT[event.placement]}
                </span>
              )}
            </div>
          </div>
        </div>

        <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-snug text-zinc-900">
          <Link href={`/events/${event.slug}`} className="hover:text-blue-700">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          {placeLabel(event)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">{event.shortDescription}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.categories.map((c) => (
            <CategoryTag key={c} slug={c} />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={`text-sm font-semibold ${free ? "text-emerald-600" : "text-zinc-900"}`}>{formatPrice(event)}</span>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Подробнее
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
