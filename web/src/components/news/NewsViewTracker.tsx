"use client";

import { useEffect } from "react";
import { pbClient } from "@/lib/auth-client";

// Невидимый счётчик просмотров страницы новости (api/news-view). Один запрос
// на вкладку и публикацию; кто и сколько раз — решает сервер (аккаунт/IP).
export default function NewsViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const seenKey = `naidii_news_seen_${slug}`;
      if (sessionStorage.getItem(seenKey)) return;
      sessionStorage.setItem(seenKey, "1");
    } catch {
      return;
    }
    fetch("/api/news-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(pbClient.authStore.token ? { Authorization: pbClient.authStore.token } : {}),
      },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
