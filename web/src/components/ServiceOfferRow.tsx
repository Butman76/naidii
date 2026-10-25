import Link from "next/link";
import type { ServiceOffer } from "@/types/service-card";
import { formatPrice, SERVICE_TAG_LABELS } from "@/types/service-card";
import OrderButton from "./OrderButton";

// Предложение специалиста внутри страницы одного типа результата
// (/services/{slug}). Оформление зависит от уровня продвижения
// (ServiceOffer.promotionRank, lib/promotion.ts): 2+ (Enterprise и ручное
// продвижение админом) — «премиум»: градиентная рамка, лента «★ Премиум»,
// мягкое свечение; 1 (Pro) — синяя рамка и метка «Продвигается»; 0 — обычная
// карточка. Раньше все выглядели одинаково мелко и плоско, а премиум-тариф
// отличался только крошечной фиолетовой меткой (2026-10-16, замечание
// владельца). Две зоны (профиль и кнопка «Заказать») разделены явно: карточка
// не оборачивается одной ссылкой.
export default function ServiceOfferRow({
  offer,
  categorySlug,
  contextLabel,
}: {
  offer: ServiceOffer;
  categorySlug: string;
  contextLabel: string;
}) {
  const rank = offer.promotionRank ?? (offer.promoted ? 1 : 0);
  const premium = rank >= 2;
  const promoted = rank === 1;

  const shell = premium
    ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 p-[2px] shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:shadow-fuchsia-500/30"
    : promoted
      ? "bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px] shadow-md shadow-blue-500/15 hover:shadow-lg"
      : "border border-zinc-200 bg-white shadow-sm hover:shadow-md";

  return (
    <div className={`group relative flex flex-col rounded-3xl transition-all duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${shell}`}>
      <div
        className={`flex flex-1 flex-col justify-between rounded-[22px] bg-white p-4 sm:p-5 ${
          premium ? "bg-gradient-to-b from-fuchsia-50/60 to-white" : ""
        }`}
      >
        <div>
          {premium && (
            <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
              ★ Премиум
            </span>
          )}
          {promoted && (
            <span className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              Продвигается
            </span>
          )}

          <p
            className={`text-2xl font-extrabold leading-none ${
              premium ? "bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent" : "text-zinc-900"
            }`}
          >
            {formatPrice(offer.priceType, offer.priceValue)}
          </p>
          <p className="mt-1.5 text-sm font-medium text-zinc-500">
            ⏱ {offer.durationFrom}
            {offer.scopeLabel ? ` · ${offer.scopeLabel}` : ""}
          </p>

          {offer.tagline && (
            <p className="mt-3 line-clamp-4 text-base font-medium leading-snug text-zinc-800">{offer.tagline}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {offer.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200"
              >
                {SERVICE_TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-100 pt-3">
          <Link
            href={`/specialist/${offer.specialistSlug}`}
            className="-mx-1 flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-zinc-50"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                premium ? "bg-gradient-to-br from-violet-600 to-fuchsia-500" : "bg-zinc-900"
              }`}
            >
              {offer.specialistAvatarInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-zinc-900">{offer.specialistName}</p>
              <p className="text-sm text-zinc-500">
                ★ {offer.specialistRating.toFixed(1)} · {offer.specialistCompletedOrders} заказов
              </p>
            </div>
          </Link>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-start gap-2">
            <OrderButton
              specialistProfileId={offer.specialistProfileId}
              categorySlug={categorySlug}
              contextLabel={contextLabel}
            />
            <Link
              href={`/specialist/${offer.specialistSlug}`}
              className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-[11px] font-medium text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-50"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
