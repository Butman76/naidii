"use client";

import { BASIC_PROMO_MONTHS, isBasicPromoActive } from "@/data/plans";

// Заглушка раздела кабинета, который открывается только после оплаты тарифа
// (заявки, доска объявлений, заказы). Закрытие настоящее, на уровне базы
// (миграция 1755000071_paid_visibility.js), здесь только понятное объяснение.
export function promoPriceText(): string {
  return isBasicPromoActive() ? `500 ₽ за ${BASIC_PROMO_MONTHS} месяца` : "500 ₽ в месяц";
}

export default function PaidLock({
  title,
  text,
  onOpenPlan,
}: {
  title: string;
  text: string;
  onOpenPlan: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 p-6 text-center sm:p-10">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-indigo-500" aria-hidden="true">
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      <p className="mt-3 text-lg font-bold text-zinc-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">{text}</p>
      <button
        type="button"
        onClick={onOpenPlan}
        className="mt-5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/30"
      >
        Выбрать тариф: Базовый {promoPriceText()}
      </button>
    </div>
  );
}
