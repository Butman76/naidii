import Link from "next/link";
import { dayBadge, fetchPublishedEvents, isPast, placeLabel, sortUpcoming, todayKey } from "@/lib/events";
import { getCategoryStyle } from "@/data/category-style";

// Правая колонка на главной вместо пятой плашки услуг (см. STATUS.md,
// раздел «AI-события», 2026-09-28). Список, а не мини-календарь: с
// небольшим числом событий в месяце календарная сетка выглядела бы пустой,
// а список одинаково честно смотрится и с тремя событиями, и с тридцатью.
export default async function EventsSidebar() {
  const events = await fetchPublishedEvents();
  const today = todayKey();
  const upcoming = sortUpcoming(events.filter((e) => !isPast(e, today))).slice(0, 6);

  return (
    <aside className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">AI-события</h3>
        <Link href="/events" className="text-xs font-medium text-blue-700 hover:underline">
          все →
        </Link>
      </div>

      {upcoming.length > 0 ? (
        <ul className="mt-1">
          {upcoming.map((ev) => {
            const style = getCategoryStyle(ev.categories[0] ?? "other");
            const badge = dayBadge(ev);
            return (
              <li key={ev.id} className="flex gap-2.5 border-t border-zinc-100 py-2.5 first:border-t-0">
                <div
                  className={`flex w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br py-1 leading-none text-white ${style.gradient}`}
                >
                  <span className="text-sm font-bold">{badge.day}</span>
                  <span className="mt-0.5 text-[8px] font-semibold tracking-wide">{badge.month}</span>
                </div>
                <div className="min-w-0">
                  <Link href={`/events/${ev.slug}`} className="line-clamp-2 text-xs font-medium leading-snug text-zinc-900 hover:underline">
                    {ev.title}
                  </Link>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">{placeLabel(ev)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-zinc-500">Пока нет ближайших событий.</p>
      )}

      <Link
        href="/events/add"
        className="mt-3 block rounded-full border border-zinc-200 py-2 text-center text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
      >
        + добавить событие
      </Link>
    </aside>
  );
}
