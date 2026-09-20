import { createPocketBase } from "./pocketbase";
import type {
  Specialist,
  SpecialistBadge,
  SpecialistPremiumContent,
  SpecialistService,
} from "@/types/specialist";
import { getCategoryStyle } from "@/data/category-style";

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
// - `premium` — заполняется, только если админ вручную поставил тариф
//   "enterprise" (specialist_profiles.plan_code — оплаты online ещё нет,
//   назначение целиком ручное через /admin, см. AdminPanel.tsx). Контент
//   лендинга собирается из landing_items — только ОДОБРЕННОГО модерацией
//   (обложка, логотип, видео, карточки услуг, портфолио, презентации) —
//   никаких выдуманных галерей/команды/сертификатов, соответствующие блоки
//   PremiumSpecialistProfile.tsx не показываются, пока их не заполнят.
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

  const [profiles, offerRecords, promotionRecords, landingRecords] = await Promise.all([
    pb.collection("specialist_profiles").getFullList({
      filter: "profile_status = \"published\"",
    }),
    pb.collection("services").getFullList({
      filter: "active = true",
      expand: "result_type_id.category_id",
    }),
    pb.collection("promotions").getFullList({ filter: "status = \"active\"" }),
    // Только ОДОБРЕННОЕ модерацией содержимое лендингов (landing_items,
    // см. web/src/lib/landing.ts) — обложка, логотип, видео, карточки
    // услуг, портфолио, презентации. Небольшая таблица (строки есть только
    // у enterprise-специалистов) — проще забрать всю и сгруппировать в
    // памяти, как offers/promotions выше, чем городить OR-фильтр по списку
    // id профилей. Публичное правило коллекции и так отдаёт анониму только
    // approved, фильтр — явная страховка. catch: пока миграция
    // 1755000046 не применена на сервере (или при сбое этого одного
    // запроса), лендинги показываются без доп. блоков, а не роняют
    // сборку/страницу всего каталога.
    pb
      .collection("landing_items")
      .getFullList({ filter: 'moderation_status = "approved"', sort: "sort_order,created" })
      .catch(() => []),
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
      imageUrl: o.preview_images?.[0] ? pb.files.getURL(o, o.preview_images[0]) : undefined,
    }));

    const badges: SpecialistBadge[] = promotedProfileIds.has(p.id) ? ["promoted"] : [];

    const myLanding = landingRecords.filter((i) => i.specialist_profile_id === p.id);
    // Обложка/логотип/видео — по одному экземпляру; после одобрения новой
    // версии хук переводит старую в superseded, но на случай гонки берём
    // самую свежую из одобренных.
    const newestOfKind = (kind: string) =>
      myLanding.filter((i) => i.kind === kind).sort((a, b) => b.created.localeCompare(a.created))[0];
    const cover = newestOfKind("cover");
    const logo = newestOfKind("logo");
    const video = newestOfKind("video");

    const premium: SpecialistPremiumContent | undefined =
      p.plan_code === "enterprise"
        ? {
            tagline: p.title || p.short_description || "",
            coverGradient: `bg-gradient-to-br ${getCategoryStyle(category).gradient}`,
            coverImageUrl: cover?.image ? pb.files.getURL(cover, cover.image) : undefined,
            logoImageUrl: logo?.image ? pb.files.getURL(logo, logo.image) : undefined,
            gallery: myLanding
              .filter((i) => i.kind === "photo" && i.image)
              .map((i) => ({
                imageUrl: pb.files.getURL(i, i.image),
                thumbUrl: pb.files.getURL(i, i.image, { thumb: "800x0" }),
                caption: i.title ?? "",
              })),
            serviceCards: myLanding
              .filter((i) => i.kind === "service_card")
              .map((i) => ({
                title: i.title ?? "",
                description: i.description ?? "",
                priceText: i.price_text ?? "",
                durationText: i.duration_text ?? "",
                imageUrl: i.image ? pb.files.getURL(i, i.image) : undefined,
                thumbUrl: i.image ? pb.files.getURL(i, i.image, { thumb: "800x0" }) : undefined,
              })),
            presentations: myLanding
              .filter((i) => i.kind === "presentation" && i.document)
              .map((i) => ({
                title: i.title ?? "",
                description: i.description ?? "",
                fileUrl: pb.files.getURL(i, i.document),
                format: (String(i.document).split(".").pop() ?? "").toUpperCase(),
                previewUrl: i.image ? pb.files.getURL(i, i.image, { thumb: "800x0" }) : undefined,
              })),
            videoUrl: video?.video_url || undefined,
            videoPitchLabel: "",
            team: [],
            certificates: [],
          }
        : undefined;

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
      premium,
    };
  });
}

export async function fetchSpecialistBySlug(slug: string): Promise<Specialist | null> {
  const all = await fetchSpecialists();
  return all.find((s) => s.slug === slug) ?? null;
}
