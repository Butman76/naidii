import Link from "next/link";
import type { ServiceCard } from "@/types/service-card";
import { formatServicePrice, SERVICE_TAG_LABELS } from "@/types/service-card";
import { getCategoryStyle } from "@/data/category-style";
import { CATEGORIES } from "@/data/categories";

// Порядок блоков — по разделу 2 правки ТЗ:
// [Обложка] [Метка категории] [Срок] Название УТП Цена Рейтинг/заказы Исполнитель
export default function ServiceCardTile({ service }: { service: ServiceCard }) {
  const style = getCategoryStyle(service.categorySlug);
  const categoryName =
    CATEGORIES.find((c) => c.slug === service.categorySlug)?.name ??
    "Другое";

  return (
    <Link
      href={`/specialist/${service.specialistSlug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      <div
        className={`relative flex h-32 flex-col justify-between bg-gradient-to-br p-3 text-white ${style.gradient}`}
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
            {categoryName}
          </span>
          {service.promoted && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-zinc-900">
              Продвигается
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-4xl leading-none drop-shadow-sm">
            {style.icon}
          </span>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
            {service.durationFrom}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-semibold leading-snug text-zinc-900">
          {service.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
          {service.tagline}
        </p>

        {service.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-200"
              >
                {SERVICE_TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-zinc-900">
            {formatServicePrice(service)}
          </span>
          <span className="text-[11px] text-zinc-500">
            {service.scopeLabel}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
            {service.specialistAvatarInitials}
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-zinc-600">
            {service.specialistName}
          </p>
          <p className="shrink-0 text-[11px] text-zinc-500">
            ★ {service.specialistRating.toFixed(1)} ·{" "}
            {service.specialistCompletedOrders} заказов
          </p>
        </div>
      </div>
    </Link>
  );
}
