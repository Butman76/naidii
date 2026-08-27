import Link from "next/link";
import type { Specialist } from "@/types/specialist";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";

const BADGE_LABELS: Record<Specialist["badges"][number], string> = {
  top: "Топ",
  promoted: "Продвигается",
  popular: "Популярный",
  founder: "Первые участники",
};

const BADGE_STYLES: Record<Specialist["badges"][number], string> = {
  top: "bg-amber-100 text-amber-800",
  promoted: "bg-violet-100 text-violet-800",
  popular: "bg-zinc-100 text-zinc-700",
  founder: "bg-emerald-100 text-emerald-800",
};

export default function SpecialistCard({
  specialist,
}: {
  specialist: Specialist;
}) {
  const isPremium = Boolean(specialist.premium);

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-4 transition-shadow hover:shadow-md ${
        isPremium
          ? "border-amber-200 ring-1 ring-amber-200"
          : "border-zinc-200"
      }`}
    >
      {isPremium && (
        <div className="-mx-4 -mt-4 mb-3 h-1.5 rounded-t-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500" />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
            {specialist.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {specialist.name}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {specialist.title}
            </p>
          </div>
        </div>
      </div>

      {/* Точки-направления: своя строка на всю ширину карточки, а не угол
          рядом с именем — при 8-9 категориях у одного специалиста туда бы
          просто не влезло. flex-wrap разводит их на столько рядов, сколько
          нужно. */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(specialist.categories ?? [specialist.category]).map((slug) => {
          const style = getCategoryStyle(slug);
          const name = CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
          return (
            <div key={slug} className="group/dot relative flex">
              <span
                className="block h-4 w-4 rounded-full ring-2 ring-white"
                style={{
                  background: `radial-gradient(circle at 32% 28%, ${style.hexLight}, ${style.hex} 65%)`,
                  boxShadow:
                    "inset -1.5px -1.5px 3px rgba(0,0,0,0.30), inset 1px 1px 1.5px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.20)",
                }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/dot:opacity-100">
                {name}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
              </div>
            </div>
          );
        })}
      </div>

      {(isPremium || specialist.badges.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1">
          {isPremium && (
            <span className="rounded-full bg-gradient-to-r from-violet-600 to-amber-500 px-2 py-0.5 text-[11px] font-medium text-white">
              ★ Премиум
            </span>
          )}
          {specialist.badges.map((badge) => (
            <span
              key={badge}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE_STYLES[badge]}`}
            >
              {BADGE_LABELS[badge]}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
        {specialist.shortDescription}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {specialist.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500 ring-1 ring-inset ring-zinc-200"
          >
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm font-medium text-zinc-900">
        {specialist.priceFrom}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        ★ {specialist.rating.toFixed(1)} · {specialist.reviewsCount} отзывов
      </p>
      <p className="text-xs text-zinc-500">{specialist.location}</p>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/specialist/${specialist.slug}`}
          className="flex-1 rounded-full bg-zinc-900 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Открыть профиль
        </Link>
        <button className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
          Написать
        </button>
      </div>
    </div>
  );
}
