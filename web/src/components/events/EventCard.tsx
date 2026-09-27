import Link from "next/link";
import type { AiEvent } from "@/lib/events";
import { EVENT_TYPE_LABELS, FORMAT_LABELS, PLACEMENT_LABELS, dayBadge, formatDateRange, formatPrice, placeLabel, timeLabel } from "@/lib/events";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";

const PLACEMENT_STYLES: Record<string, string> = {
  pinned: "bg-amber-100 text-amber-800",
  partner: "bg-violet-100 text-violet-800",
  featured: "bg-emerald-100 text-emerald-800",
};

export function CategoryTag({ slug }: { slug: string }) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  const style = getCategoryStyle(slug);
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: style.hexLight, color: "#27272a" }}>
      {cat.name}
    </span>
  );
}

export default function EventCard({ event, today }: { event: AiEvent; today: string }) {
  const style = getCategoryStyle(event.categories[0] ?? "other");
  const badge = dayBadge(event);
  const label = timeLabel(event, today);
  const past = label === "Завершено";

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md ${past ? "opacity-80" : ""}`}>
      <div className={`flex items-center gap-4 bg-gradient-to-r ${style.gradient} px-4 py-3 text-white`}>
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/20 leading-none">
          <span className="text-2xl font-bold">{badge.day}</span>
          <span className="mt-1 text-[10px] font-semibold tracking-wide">{badge.month}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-90">{formatDateRange(event)}</p>
          <p className="truncate text-xs opacity-90">
            {EVENT_TYPE_LABELS[event.eventType]} · {FORMAT_LABELS[event.format]}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-1.5">
          {label && <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">{label}</span>}
          {event.placement !== "basic" && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PLACEMENT_STYLES[event.placement]}`}>{PLACEMENT_LABELS[event.placement]}</span>
          )}
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-zinc-900">
          <Link href={`/events/${event.slug}`} className="hover:underline">{event.title}</Link>
        </h3>
        <p className="mt-1 text-xs text-zinc-500">{placeLabel(event)}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">{event.shortDescription}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.categories.map((c) => <CategoryTag key={c} slug={c} />)}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-semibold text-zinc-900">{formatPrice(event)}</span>
          <Link href={`/events/${event.slug}`} className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700">
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}
