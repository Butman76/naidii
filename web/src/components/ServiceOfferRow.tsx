import Link from "next/link";
import type { ServiceOffer } from "@/types/service-card";
import { formatPrice, SERVICE_TAG_LABELS } from "@/types/service-card";

function pluralizeRevisions(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "правка включена";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return "правки включены";
  }
  return "правок включено";
}

// Строка конкретного предложения специалиста внутри страницы одного типа
// результата (/services/{slug}) — сравнение цены/срока/исполнителя под
// одной и той же плашкой, как офферы разных продавцов под одним товаром
// на Playerok. Ведёт в профиль специалиста.
export default function ServiceOfferRow({ offer }: { offer: ServiceOffer }) {
  return (
    <Link
      href={`/specialist/${offer.specialistSlug}`}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold text-zinc-900">
            {formatPrice(offer.priceType, offer.priceValue)}
          </p>
          <span className="text-xs text-zinc-500">{offer.durationFrom}</span>
          {offer.promoted && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800">
              Продвигается
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-600">{offer.tagline}</p>
        {offer.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {offer.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-200"
              >
                {SERVICE_TAG_LABELS[tag]}
              </span>
            ))}
            {offer.revisionsIncluded !== undefined && (
              <span className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-200">
                {offer.revisionsIncluded} {pluralizeRevisions(offer.revisionsIncluded)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-zinc-100 pt-3 sm:border-t-0 sm:pt-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {offer.specialistAvatarInitials}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-800">
            {offer.specialistName}
          </p>
          <p className="text-xs text-zinc-500">
            ★ {offer.specialistRating.toFixed(1)} ·{" "}
            {offer.specialistCompletedOrders} заказов
          </p>
        </div>
      </div>
    </Link>
  );
}
