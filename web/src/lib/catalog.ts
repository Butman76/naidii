import { createPocketBase } from "./pocketbase";
import { getCoverImagePath } from "@/data/cover-manifest";
import type { ResultType, ServiceOffer } from "@/types/service-card";
import type { ResultTypeSummary } from "@/data/mock-services";
import { MANUAL_PROMOTION_RANK, compareByPromotion, planPromotionRank } from "./promotion";

// Живые данные из PocketBase — форма результата совпадает с mock-services.ts
// специально (ResultType/ServiceOffer/ResultTypeSummary), чтобы компоненты
// каталога (ResultTypePlate, ServiceOfferRow, ServicesCatalog, TopServices)
// не пришлось переписывать, только сменить источник данных. См.
// STATUS.md/PIVOT_SERVICE_CARDS.md — переход с моков на живые данные,
// 2026-08-24.

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface CatalogData {
  resultTypes: ResultType[];
  offers: ServiceOffer[];
}

// Один запрос за весь каталог сразу (типы результата + офферы + активные
// продвижения) — используется и для сетки каталога, и для главной, и для
// генерации статических путей /services/{slug} на этапе сборки.
export async function fetchCatalogData(): Promise<CatalogData> {
  const pb = createPocketBase();
  pb.autoCancellation(false);

  const [resultTypeRecords, offerRecords, promotionRecords] = await Promise.all([
    pb.collection("result_types").getFullList({ expand: "category_id" }),
    pb.collection("services").getFullList({
      filter: "active = true",
      expand: "specialist_profile_id,result_type_id",
    }),
    pb.collection("promotions").getFullList({ filter: "status = \"active\"" }),
  ]);

  // Ручное продвижение админом (коллекция promotions) привязано к профилю,
  // а не к услуге — раньше здесь читался несуществующий service_id, и метка
  // "Продвигается" не срабатывала ни у кого. Продвижение по тарифу (Pro и
  // Enterprise) — см. promotion.ts.
  const manuallyPromotedProfileIds = new Set(promotionRecords.map((p) => p.specialist_profile_id));
  const now = new Date();

  const resultTypes: ResultType[] = resultTypeRecords.map((r) => ({
    id: r.id,
    slug: r.slug,
    categorySlug: r.expand?.category_id?.slug ?? "",
    subcategory: r.subcategory,
    title: r.title,
    scopeLabel: r.scope_label,
    coverImageUrl: getCoverImagePath(r.slug),
  }));

  const offers: ServiceOffer[] = offerRecords
    .filter((o) => o.expand?.specialist_profile_id && o.expand?.result_type_id)
    .map((o) => {
      const specialist = o.expand!.specialist_profile_id;
      const resultType = o.expand!.result_type_id;
      const promotionRank = manuallyPromotedProfileIds.has(specialist.id)
        ? MANUAL_PROMOTION_RANK
        : planPromotionRank(specialist, now);
      return {
        id: o.id,
        resultTypeSlug: resultType.slug,
        tagline: o.tagline,
        priceType: o.price_type,
        priceValue: o.price_from,
        durationFrom: o.duration_from,
        scopeLabel: o.scope_label,
        revisionsIncluded: o.revisions_included || undefined,
        tags: o.tags ?? [],
        promoted: promotionRank > 0,
        promotionRank,
        specialistProfileId: specialist.id,
        specialistSlug: specialist.slug,
        specialistName: specialist.public_name,
        specialistAvatarInitials: computeInitials(specialist.public_name),
        specialistRating: specialist.rating,
        specialistCompletedOrders: specialist.completed_orders_count,
      };
    });

  return { resultTypes, offers };
}

export function getOffersForType(offers: ServiceOffer[], resultTypeSlug: string): ServiceOffer[] {
  return offers
    .filter((o) => o.resultTypeSlug === resultTypeSlug)
    .sort((a, b) =>
      compareByPromotion(
        { id: a.id, rank: a.promotionRank ?? 0, rating: a.specialistRating },
        { id: b.id, rank: b.promotionRank ?? 0, rating: b.specialistRating }
      )
    );
}

export function summarizeResultTypes(
  resultTypes: ResultType[],
  offers: ServiceOffer[]
): ResultTypeSummary[] {
  return resultTypes
    .map((type): ResultTypeSummary | null => {
      const typeOffers = getOffersForType(offers, type.slug);
      if (typeOffers.length === 0) return null;
      return {
        ...type,
        offersCount: typeOffers.length,
        minPrice: Math.min(...typeOffers.map((o) => o.priceValue)),
        bestRating: Math.max(...typeOffers.map((o) => o.specialistRating)),
        hasPromoted: typeOffers.some((o) => o.promoted),
        promotionRank: Math.max(...typeOffers.map((o) => o.promotionRank ?? 0)),
      };
    })
    .filter((s): s is ResultTypeSummary => s !== null);
}

export function sortByPromotedThenRating(summaries: ResultTypeSummary[]): ResultTypeSummary[] {
  // Сетка "Топ-20": сначала типы результата, где есть продвигаемая услуга
  // (Enterprise выше Pro, ручное продвижение выше обоих), между ними —
  // суточная рулетка, чтобы верхние места доставались не одним и тем же;
  // остальные — по рейтингу.
  return [...summaries].sort((a, b) =>
    compareByPromotion(
      { id: a.slug, rank: a.promotionRank ?? Number(a.hasPromoted), rating: a.bestRating },
      { id: b.slug, rank: b.promotionRank ?? Number(b.hasPromoted), rating: b.bestRating }
    )
  );
}
