"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

// Раньше кнопка всегда вела на /register, даже если пользователь уже
// вошёл — попытка зарегистрироваться повторно просто падала с ошибкой
// "email уже занят". Теперь смотрит на реальное состояние авторизации:
// специалиста ведём в кабинет создавать карточку, у заказчика такого
// действия нет вовсе — кнопку прячем, не вошедших ведём на регистрацию
// как раньше.
export default function HeaderCta() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link
        href="/register"
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Разместить карточку
      </Link>
    );
  }

  if (user?.role === "specialist") {
    return (
      <Link
        href="/dashboard"
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Разместить карточку
      </Link>
    );
  }

  return null;
}
