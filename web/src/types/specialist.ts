export type SpecialistBadge = "top" | "promoted" | "popular" | "founder";

export interface SpecialistService {
  title: string;
  priceFrom: string;
  durationFrom: string;
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
  gallery: string[];
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
