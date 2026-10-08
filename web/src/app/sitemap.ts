import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { fetchPublishedEvents } from "@/lib/events";
import { fetchPublishedNews } from "@/lib/news";

export const revalidate = 3600;

const SITE = "https://naidii.ru";

// Карта сайта: основные разделы, направления и опубликованные события.
// Прошедшие события остаются в карте: их страницы живые, со статусом
// «Завершено».
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news] = await Promise.all([fetchPublishedEvents(), fetchPublishedNews()]);
  const staticPages = ["", "/services", "/specialists", "/categories", "/events", "/news", "/how-it-works", "/tariffs"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE}${p}` })),
    ...CATEGORIES.map((c) => ({ url: `${SITE}/category/${c.slug}` })),
    ...events.map((e) => ({ url: `${SITE}/events/${e.slug}` })),
    ...news.map((n) => ({ url: `${SITE}/news/${n.slug}`, lastModified: n.publishedAt })),
    ...news.map((n) => ({ url: `${SITE}/news/${n.slug}`, lastModified: n.publishedAt })),
  ];
}
