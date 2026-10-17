"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

// Кнопка под заголовком /orders зависит от роли: специалисту — в доску для
// отклика, заказчику — разместить свой заказ, гостю — регистрация. Только
// навигация; никаких чужих данных здесь не загружается.
export default function OrdersCta() {
  const { user } = useAuth();
  const primary =
    "inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-zinc-700";

  if (user?.role === "specialist") {
    return (
      <Link href="/dashboard?tab=jobboard" className={primary}>
        Открыть доску и откликнуться
      </Link>
    );
  }
  if (user?.role === "customer") {
    return (
      <Link href="/dashboard/customer" className={primary}>
        Разместить свой заказ
      </Link>
    );
  }
  if (user) return null;
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/register" className={primary}>
        Зарегистрироваться как специалист
      </Link>
      <Link href="/login" className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
        Войти
      </Link>
    </div>
  );
}
