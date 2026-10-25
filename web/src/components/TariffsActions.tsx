"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { pbClient } from "@/lib/auth-client";
import { BASIC_PROMO_END_ISO, BASIC_PROMO_MONTHS } from "@/data/plans";

// Клиентские части страницы /tariffs (сама страница — серверный
// компонент): кнопка выбора тарифа и баннер акции.
//
// Редизайн 2026-09-28 (премиальный вид по брифу пользователя) менял только
// разметку/классы, ничего в механике оплаты и роутинге не трогал. Отдельная
// правка 2026-09-28 (по фидбэку "не хочу проваливаться в кабинет, хочу сразу
// на оплату") — специалист теперь создаёт платёж прямо с этой кнопки, тем же
// запросом (`POST /api/payments/create`), что и `pay()` в
// dashboard/PlanPaymentPanel.tsx: тот же эндпоинт, тот же заголовок
// Authorization, тот же ответ {url} от ЮKassa. Ничего на сервере не
// дублировали и не меняли — только вызвали существующий API из нового места.

const BASE_CLASS =
  "mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

// inverted — карточка тарифа сама тёмная (Pro), поэтому кнопку красим
// наоборот: светлая кнопка на тёмном фоне.
//
// Не-специалист (аноним, заказчик) уходит на регистрацию — обычная ссылка.
// Специалист жмёт и сразу создаёт платёж по этому тарифу; если что-то
// пошло не так (оплата ещё не подключена, сбой сети, тариф недоступен —
// например попытка понизиться, её блокирует сервер) — уходим в кабинет на
// вкладку "Тариф", там та же оплата плюс понятные сообщения об ошибках и
// история платежей.
export function PlanChooseButton({
  planCode,
  recommended,
  inverted,
  label = "Оплатить",
}: {
  planCode: string;
  recommended?: boolean;
  inverted?: boolean;
  label?: string;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const style = inverted
    ? "bg-white text-zinc-900 shadow-lg shadow-black/30 hover:bg-zinc-100 hover:shadow-xl focus-visible:ring-white"
    : recommended
      ? "bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-zinc-900"
      : "border border-zinc-300 text-zinc-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-500";

  const isSpecialist = user?.role === "specialist";

  if (!isSpecialist) {
    return (
      <Link href="/register" className={`${BASE_CLASS} ${style}`}>
        {label}
        <span aria-hidden="true">→</span>
      </Link>
    );
  }

  async function handleClick() {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: pbClient.authStore.token },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }
    } catch {
      // сеть недоступна — уходим в кабинет ниже, как и при любой другой ошибке
    }
    window.location.href = "/dashboard?tab=plan";
  }

  return (
    <button type="button" onClick={handleClick} disabled={busy} className={`${BASE_CLASS} ${style}`}>
      {busy ? "Переходим к оплате…" : label}
      {!busy && <span aria-hidden="true">→</span>}
    </button>
  );
}

function remaining(): number {
  return new Date(BASIC_PROMO_END_ISO).getTime() - Date.now();
}

// Баннер акции на Базовый (500 ₽ сразу за BASIC_PROMO_MONTHS месяцев) с
// обратным отсчётом до BASIC_PROMO_END_ISO (см. data/plans.ts — та же
// дата, что реально считает lib/payments.ts при оплате). Часы и минуты, не
// дни — так просил пользователь. Дальше рендера на сервере: без этого при
// заходе ровно в момент истечения акции секундная гонка клиент/сервер дала
// бы на миг несовпадающий HTML; проще посчитать всё в браузере при
// монтировании. Как только время вышло — компонент перестаёт рисовать
// баннер сам, без правки кода/деплоя.
export function PromoCountdown() {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    setMs(remaining());
    const id = setInterval(() => setMs(remaining()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (ms === null || ms <= 0) return null;

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 px-5 py-5 text-white shadow-lg shadow-zinc-900/20 sm:px-7 sm:py-5">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="shrink-0 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            Стартовая цена
          </span>
          <p className="text-sm sm:text-base">
            <span className="font-semibold text-white">Базовый — 500 ₽</span>{" "}
            <span className="text-zinc-400">за {BASIC_PROMO_MONTHS} месяца</span>{" "}
            <span className="text-zinc-500 line-through">1 500 ₽</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs text-zinc-400">Осталось</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-sm font-semibold tabular-nums">{hours} ч</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-sm font-semibold tabular-nums">
            {String(minutes).padStart(2, "0")} мин
          </span>
        </div>
      </div>
    </div>
  );
}
