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
}
