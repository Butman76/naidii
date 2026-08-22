import Link from "next/link";
import type { ServiceCard } from "@/types/service-card";
import { formatServicePrice, SERVICE_TAG_LABELS } from "@/types/service-card";
import { getCategoryStyle } from "@/data/category-style";
import { CATEGORIES } from "@/data/categories";

// Плашка в духе Playerok: крупная яркая обложка-доминанта (не тонкая
// полоска), цена и рейтинг сразу под ней, продавец — мелким блоком внизу
// (заказчик сначала видит услугу, продавца — последним). Пока обложка —
// градиент направления + декоративные акценты + иконка, а не
// сгенерированная иллюстрация на каждый "Тип результата" — см.
// PIVOT_SERVICE_CARDS.md, раздел про промпты для плашек (следующий шаг).
export default function ServiceCardTile({ service }: { service: ServiceCard }) {
  const style = getCategoryStyle(service.categorySlug);
  const categoryName =
    CATEGORIES.find((c) => c.slug === service.categorySlug)?.name ??
    "Другое";

  return (
    <Link
      href={`/specialist/${service.specialistSlug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center gap-1.5 px-3 pt-3 text-[11px] font-medium text-zinc-500">
        <span>{style.icon}</span>
        <span className="truncate">{categoryName}</span>
      </div>

      <div className="px-3 pt-2">
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br text-white ${style.gradient}`}
        >
          {/* декоративные световые пятна для глубины вместо плоской заливки */}
          <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-black/20 blur-2xl" />

          <div className="relative flex h-full flex-col justify-between p-3">
            <div className="flex items-start justify-between gap-2">
              {service.promoted ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-900 shadow-sm">
                  Продвигается
                </span>
              ) : (
                <span />
              )}
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                {service.durationFrom}
              </span>
            </div>

            <span className="self-center text-6xl leading-none drop-shadow-md">
              {style.icon}
            </span>

            <span className="self-start rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
              {service.scopeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-base font-bold text-zinc-900">
          {formatServicePrice(service)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-zinc-800">
          {service.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
          {service.tagline}
        </p>

        {service.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-200"
              >
                {SERVICE_TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-semibold text-white">
            {service.specialistAvatarInitials}
          </div>
          <p className="min-w-0 flex-1 truncate text-[11px] text-zinc-500">
            {service.specialistName}
          </p>
          <p className="shrink-0 text-[11px] text-zinc-500">
            ★ {service.specialistRating.toFixed(1)}
          </p>
        </div>
      </div>
    </Link>
  );
}
