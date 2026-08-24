"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthUser } from "@/lib/use-auth";

// Реальная защита кабинетов через PocketBase-сессию в браузере — раньше
// /dashboard открывался вообще без проверки. Содержимое кабинетов пока
// всё ещё на моках (см. STATUS.md) — этот компонент только решает,
// пускать ли на страницу и правильная ли роль у вошедшего.
export default function RequireAuth({
  role,
  children,
}: {
  role: AuthUser["role"];
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && user.role !== role) {
      router.replace("/");
    }
  }, [isAuthenticated, user, role, router]);

  if (!isAuthenticated || !user || user.role !== role) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">
        Проверяем авторизацию…
      </div>
    );
  }

  return <>{children}</>;
}
