import { createPocketBase } from "./pocketbase";
import type { Specialist, SpecialistBadge, SpecialistService } from "@/types/specialist";

// Живые данные специалистов из PocketBase. Форма результата совпадает с
// Specialist (mock-specialists.ts), чтобы SpecialistCard/StandardSpecialistProfile
// не пришлось переписывать — только сменить источник (см.
// STATUS.md, переход с моков на живые данные, 2026-08-24).
//
// Упрощения относительно моков:
// - `skills` — пустой массив: в схему БД теги навыков ещё не занесены
//   (specialist_skills пока не наполнен сид-данными), а не отсутствуют
//   в принципе — см. TODO ниже.
// - `reviews` — пустой массив: коллекция reviews в БД пока не наполнена,
//   это честно, а не баг — вместо выдумывания демо-отзывов.
// - `category` — в specialist_profiles нет своего поля категории (это
//   известный пробел, см. STATUS.md), поэтому категория определяется по
//   первому активному предложению специалиста, а не хранится напрямую.
// - `premium` — всегда unset: премиум-лендинг профиля — визуальный
//   мокап тарифа, для живых специалистов пока не подключён (нет
//   реальных тарифов/оплаты).
// TODO: занести specialist_skills, реальные отзывы, поле категории на
// профиле — по мере появления соответствующих данных.

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatLocation(city: string, remote: boolean): string {
  if (city && remote) return `${city} · Удалённо`;
  if (city) return city;
  return "Удалённо";
}

function formatResponseTime(code: string): string {
  switch (code) {
    case "within_hour":
      return "Отвечает в течение часа";
    case "within_3days":
      return "Отвечает в течение 3 дней";
    case "within_week":
      return "Отвечает в течение недели";
    default:
      return "Отвечает в течение дня";
  }
}

function formatPriceFrom(amount: number): string {
  return amount > 0 ? `От ${amount.toLocaleString("ru-RU")} ₽ за проект` : "По запросу";
}

function formatOfferPrice(priceType: string, price: number): string {
  const amount = price.toLocaleString("ru-RU");
  return priceType === "fixed" ? `${amount} ₽` : `От ${amount} ₽`;
}

export async function fetchSpecialists(): Promise<Specialist[]> {
  const pb = createPocketBase();
  pb.autoCancellation(false);

  const [profiles, offerRecords, promotionRecords] = await Promise.all([
    pb.collection("specialist_profiles").getFullList({
      filter: "profile_status = \"published\"",
    }),
    pb.collection("services").getFullList({
      filter: "active = true",
      expand: "result_type_id.category_id",
    }),
    pb.collection("promotions").getFullList({ filter: "status = \"active\"" }),
  ]);

  const promotedProfileIds = new Set(promotionRecords.map((p) => p.specialist_profile_id));

  return profiles.map((p) => {
    const myOffers = offerRecords.filter((o) => o.specialist_profile_id === p.id);
    const firstResultType = myOffers[0]?.expand?.result_type_id;
    const category = firstResultType?.expand?.category_id?.slug ?? "other";
    // Все направления специалиста (не только первое) — для цветных точек на
    // карточке в каталоге, см. SpecialistCard.tsx.
    const categories = Array.from(
      new Set(
        myOffers.map((o) => o.expand?.result_type_id?.expand?.category_id?.slug ?? "other")
      )
    );

    const services: SpecialistService[] = myOffers.map((o) => ({
      title: o.expand?.result_type_id?.title ?? "Услуга",
      priceFrom: formatOfferPrice(o.price_type, o.price_from),
      durationFrom: o.duration_from,
    }));

    const badges: SpecialistBadge[] = promotedProfileIds.has(p.id) ? ["promoted"] : [];

    return {
      id: p.id,
      slug: p.slug,
      name: p.public_name,
      title: p.title,
      shortDescription: p.short_description,
      fullDescription: p.full_description,
      category,
      categories,
      skills: [],
      priceFrom: formatPriceFrom(p.project_rate_from),
      experienceYears: p.experience_years,
      responseTime: formatResponseTime(p.response_time),
      rating: p.rating,
      reviewsCount: p.reviews_count,
      location: formatLocation(p.city, p.remote_work),
      badges,
      avatarInitials: computeInitials(p.public_name),
      services,
      reviews: [],
    };
  });
}

export async function fetchSpecialistBySlug(slug: string): Promise<Specialist | null> {
  const all = await fetchSpecialists();
  return all.find((s) => s.slug === slug) ?? null;
}
