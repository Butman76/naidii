import type PocketBase from "pocketbase";
import type { Specialist, SpecialistReview } from "@/types/specialist";
import type { ServiceCardTag, ServiceOffer, ServicePriceType } from "@/types/service-card";
import type { LeadStatus, DashboardCase } from "@/data/dashboard-mock";
import type { CustomerLead, CustomerReview } from "@/data/customer-dashboard-mock";

// Живые данные для личных кабинетов — раньше оба кабинета показывали
// одни и те же мок-данные («Алексей Морозов») всем подряд, кто бы ни
// вошёл, хотя вход уже был настоящим (RequireAuth). Здесь — реальные
// запросы к PocketBase от имени вошедшего пользователя, honest-empty
// вместо выдуманных чисел там, где данных ещё нет (заявки/отзывы/кейсы —
// коллекции существуют, но пока пустые для реальных пользователей).

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface SpecialistDashboardLead {
  id: string;
  clientName: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

// ServiceOffer не хранит заголовок типа результата (его отдаёт ResultType
// в публичном каталоге) — для кабинета берём заголовок сразу из expand,
// чтобы не тянуть отдельный mock-каталог типов и не рисковать рассинхроном.
export type SpecialistDashboardOffer = ServiceOffer & { resultTypeTitle: string };

export interface SpecialistDashboardData {
  specialist: Specialist;
  profileStatus: string;
  viewsCount: number;
  leadsCount: number;
  offers: SpecialistDashboardOffer[];
  leads: SpecialistDashboardLead[];
  cases: DashboardCase[];
}

export async function fetchOwnSpecialistDashboard(
  pb: PocketBase,
  userId: string
): Promise<SpecialistDashboardData> {
  const profile = await pb
    .collection("specialist_profiles")
    .getFirstListItem(pb.filter("user_id = {:id}", { id: userId }));

  const [offerRecords, leadRecords, reviewRecords, caseRecords] = await Promise.all([
    pb.collection("services").getFullList({
      filter: pb.filter("specialist_profile_id = {:id}", { id: profile.id }),
      expand: "result_type_id",
      sort: "-created",
    }),
    pb.collection("leads").getFullList({
      filter: pb.filter("specialist_profile_id = {:id}", { id: profile.id }),
      sort: "-created",
    }),
    pb.collection("reviews").getFullList({
      filter: pb.filter('specialist_profile_id = {:id} && status = "approved"', { id: profile.id }),
      sort: "-created",
    }),
    pb.collection("cases").getFullList({
      filter: pb.filter("specialist_profile_id = {:id}", { id: profile.id }),
      sort: "-created",
    }),
  ]);

  const offers: SpecialistDashboardOffer[] = offerRecords.map((o) => ({
    id: o.id,
    resultTypeSlug: o.expand?.result_type_id?.slug ?? "",
    resultTypeTitle: o.expand?.result_type_id?.title ?? "Своё направление (на модерации)",
    tagline: o.tagline ?? "",
    priceType: (o.price_type || "from") as ServicePriceType,
    priceValue: o.price_from ?? 0,
    durationFrom: o.duration_from ?? "",
    scopeLabel: o.scope_label ?? "",
    revisionsIncluded: o.revisions_included ?? undefined,
    tags: (o.tags ?? []) as ServiceCardTag[],
    specialistSlug: profile.slug,
    specialistName: profile.public_name,
    specialistAvatarInitials: computeInitials(profile.public_name || "?"),
    specialistRating: profile.rating ?? 0,
    specialistCompletedOrders: profile.completed_orders_count ?? 0,
  }));

  const reviews: SpecialistReview[] = reviewRecords.map((r) => ({
    author: "Клиент",
    rating: r.rating,
    text: r.text,
  }));

  const specialist: Specialist = {
    id: profile.id,
    slug: profile.slug,
    name: profile.public_name,
    title: profile.title ?? "",
    shortDescription: profile.short_description ?? "",
    fullDescription: profile.full_description ?? "",
    category: "",
    skills: [],
    priceFrom: "",
    experienceYears: profile.experience_years ?? 0,
    responseTime: "",
    rating: profile.rating ?? 0,
    reviewsCount: profile.reviews_count ?? 0,
    location: "",
    badges: [],
    avatarInitials: computeInitials(profile.public_name || "?"),
    services: [],
    reviews,
  };

  const leads: SpecialistDashboardLead[] = leadRecords.map((l) => ({
    id: l.id,
    clientName: l.customer_name,
    message: l.request_text,
    status: (l.status || "new") as LeadStatus,
    createdAt: l.created,
  }));

  const cases: DashboardCase[] = caseRecords.map((c) => ({
    id: c.id,
    title: c.title,
    industry: c.industry ?? "",
    result: c.result ?? "",
  }));

  return {
    specialist,
    profileStatus: profile.profile_status,
    viewsCount: profile.views_count ?? 0,
    leadsCount: profile.leads_count ?? 0,
    offers,
    leads,
    cases,
  };
}

export interface CustomerDashboardData {
  leads: CustomerLead[];
  reviews: CustomerReview[];
}

export async function fetchOwnCustomerDashboard(
  pb: PocketBase,
  userId: string
): Promise<CustomerDashboardData> {
  const [leadRecords, reviewRecords] = await Promise.all([
    pb.collection("leads").getFullList({
      filter: pb.filter("customer_id = {:id}", { id: userId }),
      expand: "specialist_profile_id",
      sort: "-created",
    }),
    pb.collection("reviews").getFullList({
      filter: pb.filter("customer_id = {:id}", { id: userId }),
      expand: "specialist_profile_id",
      sort: "-created",
    }),
  ]);

  const leads: CustomerLead[] = leadRecords.map((l) => ({
    id: l.id,
    specialistName: l.expand?.specialist_profile_id?.public_name ?? "Специалист",
    specialistSlug: l.expand?.specialist_profile_id?.slug ?? "",
    message: l.request_text,
    status: (l.status || "new") as CustomerLead["status"],
    createdAt: l.created,
  }));

  const reviews: CustomerReview[] = reviewRecords.map((r) => ({
    id: r.id,
    specialistName: r.expand?.specialist_profile_id?.public_name ?? "Специалист",
    specialistSlug: r.expand?.specialist_profile_id?.slug ?? "",
    rating: r.rating,
    text: r.text,
    createdAt: r.created,
  }));

  return { leads, reviews };
}
