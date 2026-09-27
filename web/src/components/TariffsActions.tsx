"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { BASIC_PROMO_END_ISO, BASIC_PROMO_MONTHS } from "@/data/plans";

// Клиентские части страницы /tariffs (сама страница — серверный
// компонент): кнопка выбора тарифа и плашка про оплату. Оплата
// происходит не здесь, а в кабинете специалиста на вкладке "Тариф"
// (dashboard/PlanPaymentPanel.tsx) — эти элементы только ведут туда.

const BASE_CLASS = "mt-5 block rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors";

// inverted — карточка тарифа сама тёмная (вариант В для Pro), поэтому кнопку
// красим наоборот: светлая кнопка на тёмном фоне.
//
// Кнопка всегда активна, не серая заметка (по просьбе пользователя — раньше
// не-специалист видел неживой текст "Тарифы оплачивают специалисты", это
// выглядело как тупик). Специалист попадает на реальную оплату в кабинете;
// кто угодно ещё (аноним, заказчик) — на регистрацию, там путь и начинается.
export function PlanChooseButton({ recommended, inverted }: { recommended?: boolean; inverted?: boolean }) {
  const { user } = useAuth();
  const style = inverted
    ? "bg-white text-zinc-900 hover:bg-zinc-200"
    : recommended
      ? "bg-zinc-900 text-white hover:bg-zinc-700"
      : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50";

  const isSpecialist = user?.role === "specialist";

  return (
    <Link
      href={isSpecialist ? "/dashboard?tab=plan" : "/register"}
      className={`${BASE_CLASS} ${style}`}
    >
      Оплатить
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
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span>
        Акция на тариф «Базовый»: 500 ₽ сразу за {BASIC_PROMO_MONTHS} месяца — 2 месяца в подарок.
      </span>
      <span className="font-medium tabular-nums">
        Осталось {hours} ч {String(minutes).padStart(2, "0")} мин
      </span>
    </div>
  );
}

// Пока в окружении сервера нет ключей ЮKassa (или страница отдана
// статическим экспортом без сервера), показываем прежнюю честную
// заметку; как только оплата включена, плашка про "не подключено"
// пропадает.
export function PaymentsNotice() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/payments/config", { method: "POST" })
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((data) => setEnabled(data.enabled === true))
      .catch(() => setEnabled(false));
  }, []);

  if (enabled === null) return null;

  return enabled ? (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      Оплата картой или через СБП на защищённой странице ЮKassa. Зарегистрируйтесь как специалист и
      подключите тариф во вкладке «Тариф» личного кабинета.
    </div>
  ) : (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Оплата на площадке ещё не подключена — это витрина тарифов, оформление заказа появится позже.
    </div>
  );
}
