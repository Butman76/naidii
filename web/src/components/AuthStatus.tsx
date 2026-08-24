"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

const ROLE_LABELS: Record<string, string> = {
  specialist: "Кабинет",
  customer: "Кабинет",
  moderator: "Модерация",
  admin: "Админка",
};

const ROLE_HREF: Record<string, string> = {
  specialist: "/dashboard",
  customer: "/dashboard/customer",
  moderator: "/admin",
  admin: "/admin",
};

export default function AuthStatus() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:block"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link
        href={ROLE_HREF[user.role] ?? "/"}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        {ROLE_LABELS[user.role] ?? "Кабинет"} ({user.name || user.email})
      </Link>
      <button
        type="button"
        onClick={logout}
        className="text-sm font-medium text-zinc-400 hover:text-zinc-900"
      >
        Выйти
      </button>
    </div>
  );
}
