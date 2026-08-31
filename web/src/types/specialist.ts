export type SpecialistBadge = "top" | "promoted" | "popular" | "founder";

export interface SpecialistService {
  title: string;
  priceFrom: string;
  durationFrom: string;
  // Первая картинка-пример из ServiceCreationForm.tsx (services.preview_images
  // в PocketBase) — необязательное, у услуг без загруженного примера просто
  // нет превью, а не сломанная картинка.
  imageUrl?: string;
}

export interface SpecialistReview {
  author: string;
  rating: number;
  text: string;
}

export interface SpecialistTeamMember {
  name: string;
  role: string;
  initials: string;
}

// Расширенное содержимое профиля для максимального тарифа — фактически
// рекламный лендинг вместо обычной карточки (обложка, галерея, команда,
// сертификаты). Блоки одинаковые у всех, оформление (coverGradient)
// отличается. Присутствует только у специалистов на максимальном плане —
// пока платежей и тарифов нет, отмечено вручную в моках.
export interface SpecialistPremiumContent {
  tagline: string;
  coverGradient: string;
  // Реальные загруженные изображения (когда есть) перекрывают coverGradient
  // и инициалы — на максимальном тарифе студия может залить свою обложку
  // и логотип вместо дефолтного оформления.
  coverImageUrl?: string;
  logoImageUrl?: string;
  // imageUrl необязателен: без реальной загруженной картинки постер рисует
  // старое оформление (градиент + подпись) вместо сломанной картинки.
  gallery: { imageUrl?: string; caption: string }[];
  // videoUrl — настоящий ролик (YouTube/RuTube), см. embedVideoUrl() в
  // PremiumSpecialistProfile.tsx. videoPitchLabel без videoUrl — старое
  // поведение (статичная заглушка с подписью, как в моках).
  videoUrl?: string;
  videoPitchLabel: string;
  team: SpecialistTeamMember[];
  certificates: string[];
}

export interface Specialist {
  id: string;
  slug: string;
  name: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  // Все направления, в которых у специалиста есть хотя бы одно активное
  // предложение (для цветных точек-меток на карточке в каталоге) —
  // необязательное, т.к. в мок-данных специалист привязан только к одной
  // категории; там, где его нет, карточка просто рисует одну точку по
  // `category`. Реальные (не мок) специалисты всегда получают его из
  // web/src/lib/specialists.ts.
  categories?: string[];
  skills: string[];
  priceFrom: string;
  experienceYears: number;
  responseTime: string;
  rating: number;
  reviewsCount: number;
  location: string;
  badges: SpecialistBadge[];
  avatarInitials: string;
  services: SpecialistService[];
  reviews: SpecialistReview[];
  premium?: SpecialistPremiumContent;
}
