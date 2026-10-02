"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Счётчик Яндекс Метрики (id 113331917). Сам скрипт и первичный init лежат в
// app/layout.tsx (обычный inline-скрипт в <head> — как можно раньше, чтобы сработать
// даже при быстром закрытии страницы). Здесь — только
// догонка для SPA: Next.js переходит между страницами без перезагрузки, и
// Метрика сама этого не видит, поэтому на каждую смену пути шлём хит вручную.
// Первый рендер пропускаем: просмотр первой страницы уже отправил init.
import { METRIKA_ID } from "@/lib/metrika";

type Ym = (id: number, method: string, ...args: unknown[]) => void;

export default function YandexMetrika() {
  const pathname = usePathname();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = window.location.href;
    const referer = previousUrl.current;
    previousUrl.current = url;
    if (referer === null) return;
    const ym = (window as unknown as { ym?: Ym }).ym;
    if (typeof ym === "function") {
      ym(METRIKA_ID, "hit", url, { referer });
    }
  }, [pathname]);

  return null;
}
