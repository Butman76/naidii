"use client";

import { useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { fetchOwnSpecialistDashboard, type SpecialistDashboardData } from "@/lib/dashboard";
import SpecialistDashboard from "./SpecialistDashboard";

// Тонкая обёртка: RequireAuth уже гарантирует, что сюда попадает только
// вошедший специалист — здесь только подгружаем его собственный профиль и
// офферы из PocketBase, чтобы кабинет показывал того, кто реально вошёл, а
// не одного и того же мок-специалиста для всех подряд.
export default function SpecialistDashboardClient() {
  const { user } = useAuth();
  const [data, setData] = useState<SpecialistDashboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchOwnSpecialistDashboard(pbClient, user.id)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">
        Не удалось загрузить профиль. Попробуйте обновить страницу.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">
        Загружаем ваш кабинет…
      </div>
    );
  }

  return <SpecialistDashboard data={data} />;
}
