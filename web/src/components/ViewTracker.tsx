"use client";

import { useEffect } from "react";
import { pbClient } from "@/lib/auth-client";

// Считает просмотр страницы профиля специалиста (api/track/route.ts →
// вкладка "Аналитика" в кабинете). Невидимый компонент. Посетителя
// различаем случайным идентификатором из localStorage — никаких IP или
// иных персональных данных не отправляется. Если посетитель вошёл в
// аккаунт, токен уходит вместе с запросом: сервер по нему не считает
// просмотры владельца профиля и модераторов.
const VISITOR_KEY = "naidii_visitor";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    let visitor = "";
    try {
      visitor = localStorage.getItem(VISITOR_KEY) ?? "";
      if (!visitor) {
        visitor = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitor);
      }
      // Один просмотр на вкладку и профиль, а не на каждый рендер.
      const seenKey = `naidii_seen_${slug}`;
      if (sessionStorage.getItem(seenKey)) return;
      sessionStorage.setItem(seenKey, "1");
    } catch {
      // Хранилище недоступно (приватный режим и т.п.) — просмотр не считаем.
      return;
    }

    fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(pbClient.authStore.token ? { Authorization: pbClient.authStore.token } : {}),
      },
      body: JSON.stringify({ slug, visitor }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
