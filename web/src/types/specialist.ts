export type SpecialistBadge = "top" | "promoted" | "popular" | "founder";

export interface Specialist {
  id: string;
  slug: string;
  name: string;
  title: string;
  shortDescription: string;
  category: string;
  skills: string[];
  priceFrom: string;
  rating: number;
  reviewsCount: number;
  location: string;
  badges: SpecialistBadge[];
  avatarInitials: string;
}
