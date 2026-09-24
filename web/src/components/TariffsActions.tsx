"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

// Клиентские части страницы /tariffs (сама страница — серверный
// компонент): кнопка выбора тарифа и плашка про оплату. Оплата
// происходит не здесь, а в кабинете специалиста на вкладке "Тариф"
// (dashboard/PlanPaymentPanel.tsx) — эти элементы только ведут туда.

const BASE_CLASS = "mt-5 block rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors";

export function PlanChooseButton({ recommended }: { recommended?: boolean }) {
  const { user } = useAuth();
  const style = recommended
    ? "bg-zinc-900 text-white hover:bg-zinc-700"
    : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50";

  if (user && user.role !== "specialist") {
    return (
      <p className="mt-5 rounded-full border border-zinc-200 px-4 py-2.5 text-center text-xs text-zinc-400">
        Тарифы оплачивают специалисты
      </p>
    );
  }

  return (
    <Link
      href={user ? "/dashboard?tab=plan" : "/register"}
      className={`${BASE_CLASS} ${style}`}
    >
      {user ? "Оплатить в кабинете" : "Зарегистрироваться и выбрать"}
    </Link>
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
