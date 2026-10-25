import type { MetadataRoute } from "next";

// Что можно индексировать — всё публичное; служебные разделы (админка,
// кабинеты, API, вход и регистрация) закрыты. Карта сайта — app/sitemap.ts.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/", "/login", "/register", "/verify"],
      },
    ],
    sitemap: "https://naidii.ru/sitemap.xml",
    host: "https://naidii.ru",
  };
}
