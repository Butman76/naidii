import Link from "next/link";
import type { ResultTypeSummary } from "@/data/mock-services";
import { formatPrice } from "@/types/service-card";
import { getCategoryStyle } from "@/data/category-style";
import { CATEGORIES } from "@/data/categories";
import { withBasePath } from "@/lib/base-path";

// Плашка типа результата — главный объект каталога (см.
// PIVOT_SERVICE_CARDS.md, раздел 6). Одна плашка на всех специалистов,
// которые предлагают именно этот тип результата ("Telegram Звёзды" у
// Playerok, а не карточка отдельного продавца). Ведёт на /services/{slug},
// где уже сравниваются конкретные предложения.
export default function ResultTypePlate({ type }: { type: ResultTypeSummary }) {
  const style = getCategoryStyle(type.categorySlug);
  const categoryName =
    CATEGORIES.find((c) => c.slug === type.categorySlug)?.name ?? "Другое";
  const hasCover = Boolean(type.coverImageUrl);

  return (
    <Link
      href={`/services/${type.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center gap-1.5 px-3 pt-3 text-[11px] font-medium text-zinc-500">
        <span>{style.icon}</span>
        <span className="truncate">{categoryName}</span>
      </div>

      <div className="px-3 pt-2">
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-xl text-white ${
            hasCover ? "bg-zinc-900" : `bg-gradient-to-br ${style.gradient}`
          }`}
        >
          {hasCover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
              <img
                src={withBasePath(type.coverImageUrl!)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-black/20 blur-2xl" />
            </>
          )}

          <div className="relative flex h-full flex-col justify-between p-3">
            <div className="flex items-start justify-between gap-2">
              {type.hasPromoted ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-900 shadow-sm">
                  Продвигается
                </span>
              ) : (
                <span />
              )}
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                {type.subcategory}
              </span>
            </div>

            {!hasCover && (
              <span className="self-center text-6xl leading-none drop-shadow-md">
                {style.icon}
              </span>
            )}

            <span className="self-start rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
              {type.scopeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-base font-bold text-zinc-900">
          {formatPrice("from", type.minPrice)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-zinc-800">
          {type.title}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-zinc-500">
          <span>
            {type.offersCount === 1
              ? "1 исполнитель"
              : `${type.offersCount} исполнителя сравнить`}
          </span>
          <span>★ {type.bestRating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
