import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { fetchPublishedEvents } from "@/lib/events";

export const revalidate = 3600;

const SITE = "https://naidii.ru";

// Карта сайта: основные разделы, направления и опубликованные события.
// Прошедшие события остаются в карте: их страницы живые, со статусом
// «Завершено».
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await fetchPublishedEvents();
  const staticPages = ["", "/services", "/specialists", "/categories", "/events", "/how-it-works", "/tariffs"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE}${p}` })),
    ...CATEGORIES.map((c) => ({ url: `${SITE}/category/${c.slug}` })),
    ...events.map((e) => ({ url: `${SITE}/events/${e.slug}` })),
  ];
}
