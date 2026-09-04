"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    smartCaptcha?: {
      render: (
        container: HTMLElement,
        params: { sitekey: string; callback: (token: string) => void; hl?: string }
      ) => number;
      subscribe: (widgetId: number, event: string, callback: () => void) => void;
      reset: (widgetId: number) => void;
    };
  }
}

const SCRIPT_SRC = "https://smartcaptcha.yandexcloud.net/captcha.js";

// Виджет Яндекс SmartCaptcha (регистрация специалиста/заказчика, см.
// RegisterPage.tsx) — бесплатная альтернатива Google reCAPTCHA без
// проблем с доступностью из РФ. Токен из onToken уходит на сервер
// (api/verify-captcha/route.ts), сам виджет ничего не проверяет.
export default function YandexCaptcha({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.smartCaptcha || widgetIdRef.current !== null) {
        return;
      }
      const widgetId = window.smartCaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
      });
      widgetIdRef.current = widgetId;
      window.smartCaptcha.subscribe(widgetId, "token-expired", () => onToken(null));
    }

    if (window.smartCaptcha) {
      renderWidget();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", renderWidget);
      } else {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.addEventListener("load", renderWidget);
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [siteKey, onToken]);

  return <div ref={containerRef} className="mt-3" />;
}
