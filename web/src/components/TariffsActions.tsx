"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { BASIC_PROMO_END_ISO, BASIC_PROMO_MONTHS } from "@/data/plans";

// Клиентские части страницы /tariffs (сама страница — серверный
// компонент): кнопка выбора тарифа и баннер акции. Оплата происходит не
// здесь, а в кабинете специалиста на вкладке "Тариф"
// (dashboard/PlanPaymentPanel.tsx) — кнопка только ведёт туда.
//
// Редизайн 2026-09-28 (премиальный вид по брифу пользователя) менял только
// разметку/классы: href, роль-проверка и таймер (state/effect) — те же, что
// были, ничего в механике оплаты и роутинге не тронуто.

const BASE_CLASS =
  "mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

// inverted — карточка тарифа сама тёмная (Pro), поэтому кнопку красим
// наоборот: светлая кнопка на тёмном фоне.
//
// Кнопка всегда активна, не серая заметка (по просьбе пользователя — раньше
// не-специалист видел неживой текст "Тарифы оплачивают специалисты", это
// выглядело как тупик). Специалист попадает на реальную оплату в кабинете;
// кто угодно ещё (аноним, заказчик) — на регистрацию, там путь и начинается.
export function PlanChooseButton({
  recommended,
  inverted,
  label = "Оплатить",
}: {
  recommended?: boolean;
  inverted?: boolean;
  label?: string;
}) {
  const { user } = useAuth();
  const style = inverted
    ? "bg-white text-zinc-900 shadow-lg shadow-black/30 hover:bg-zinc-100 hover:shadow-xl focus-visible:ring-white"
    : recommended
      ? "bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-zinc-900"
      : "border border-zinc-300 text-zinc-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-500";

  const isSpecialist = user?.role === "specialist";

  return (
    <Link href={isSpecialist ? "/dashboard?tab=plan" : "/register"} className={`${BASE_CLASS} ${style}`}>
      {label}
      <span aria-hidden="true">→</span>
    </Link>
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
