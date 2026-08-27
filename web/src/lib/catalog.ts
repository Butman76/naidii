import { createPocketBase } from "./pocketbase";
import { getCoverImagePath } from "@/data/cover-manifest";
import type { ResultType, ServiceOffer } from "@/types/service-card";
import type { ResultTypeSummary } from "@/data/mock-services";

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

  const promotedServiceIds = new Set(promotionRecords.map((p) => p.service_id));

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
        promoted: promotedServiceIds.has(o.id),
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
    .sort((a, b) => {
      if (Boolean(b.promoted) !== Boolean(a.promoted)) {
        return Number(Boolean(b.promoted)) - Number(Boolean(a.promoted));
      }
      return b.specialistRating - a.specialistRating;
    });
}

export function summarizeResultTypes(
  resultTypes: ResultType[],
  offers: ServiceOffer[]
): ResultTypeSummary[] {
  return resultTypes
    .map((type) => {
      const typeOffers = getOffersForType(offers, type.slug);
      if (typeOffers.length === 0) return null;
      return {
        ...type,
        offersCount: typeOffers.length,
        minPrice: Math.min(...typeOffers.map((o) => o.priceValue)),
        bestRating: Math.max(...typeOffers.map((o) => o.specialistRating)),
        hasPromoted: typeOffers.some((o) => o.promoted),
      };
    })
    .filter((s): s is ResultTypeSummary => s !== null);
}

export function sortByPromotedThenRating(summaries: ResultTypeSummary[]): ResultTypeSummary[] {
  return [...summaries].sort((a, b) => {
    if (b.hasPromoted !== a.hasPromoted) return Number(b.hasPromoted) - Number(a.hasPromoted);
    return b.bestRating - a.bestRating;
  });
}
