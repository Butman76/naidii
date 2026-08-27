import Link from "next/link";
import type { ServiceOffer } from "@/types/service-card";
import { formatPrice, SERVICE_TAG_LABELS } from "@/types/service-card";
import OrderButton from "./OrderButton";

// Квадратная плашка предложения специалиста внутри страницы одного типа
// результата (/services/{slug}) — раньше была вытянутой строкой на всю
// ширину, теперь компактнее, влезает больше в сетку (см. STATUS.md
// 2026-08-27). Карточка больше не целиком кликабельна одной ссылкой —
// внутри теперь и ссылка на профиль, и настоящая кнопка "Заказать"
// (OrderButton), поэтому две зоны разделены явно, а не через
// stopPropagation внутри вложенного <a>.
export default function ServiceOfferRow({
  offer,
  contextLabel,
}: {
  offer: ServiceOffer;
  contextLabel: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-md">
      <div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <p className="text-base font-bold text-zinc-900">
            {formatPrice(offer.priceType, offer.priceValue)}
          </p>
          {offer.promoted && (
            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-800">
              Продвигается
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500">{offer.durationFrom}</p>

        <p className="mt-2 line-clamp-3 text-xs text-zinc-600">{offer.tagline}</p>

        {offer.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {offer.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-inset ring-zinc-200"
              >
                {SERVICE_TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        <Link
          href={`/specialist/${offer.specialistSlug}`}
          className="flex items-center gap-2 rounded-lg p-1 -mx-1 transition-colors hover:bg-zinc-50"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
            {offer.specialistAvatarInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-zinc-800">
              {offer.specialistName}
            </p>
            <p className="text-[10px] text-zinc-500">
              ★ {offer.specialistRating.toFixed(1)} · {offer.specialistCompletedOrders} заказов
            </p>
          </div>
        </Link>

        <div className="mt-2">
          <OrderButton
            specialistProfileId={offer.specialistProfileId}
            contextLabel={contextLabel}
          />
        </div>
      </div>
    </div>
  );
}
