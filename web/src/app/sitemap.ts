import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { fetchPublishedEvents } from "@/lib/events";
import { fetchPublishedNews } from "@/lib/news";
import { fetchCatalogData } from "@/lib/catalog";
import { fetchSpecialists } from "@/lib/specialists";

export const revalidate = 3600;

const SITE = "https://naidii.ru";

// Карта сайта: основные разделы, направления, страницы услуг (/services/{slug}
// — самые «покупательские» страницы), профили специалистов, заказы, события и
// новости. Прошедшие события остаются в карте: их страницы живые, со статусом
// «Завершено». Услуги и специалистов читаем с защитой от сбоя базы: если
// PocketBase не ответил, карта всё равно отдаётся без этих блоков, а не
// падает целиком. Адреса неподтверждённых компаний (/unclaimed/...) в карту
// не входят — у них noindex.
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news, catalog, specialists] = await Promise.all([
    fetchPublishedEvents(),
    fetchPublishedNews(),
    safe(fetchCatalogData(), null),
    safe(fetchSpecialists(), []),
  ]);
  const staticPages = ["", "/services", "/specialists", "/categories", "/orders", "/events", "/news", "/how-it-works", "/tariffs"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE}${p}` })),
    ...CATEGORIES.map((c) => ({ url: `${SITE}/category/${c.slug}` })),
    ...(catalog?.resultTypes ?? []).map((t) => ({ url: `${SITE}/services/${t.slug}` })),
    ...specialists.map((s) => ({ url: `${SITE}/specialist/${s.slug}` })),
    ...events.map((e) => ({ url: `${SITE}/events/${e.slug}` })),
    ...news.map((n) => ({ url: `${SITE}/news/${n.slug}`, lastModified: n.publishedAt })),
  ];
}
