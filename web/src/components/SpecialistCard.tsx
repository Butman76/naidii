import Link from "next/link";
import type { Specialist } from "@/types/specialist";

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
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
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

      {specialist.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
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
