"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { fetchOwnSpecialistDashboard, type SpecialistDashboardData } from "@/lib/dashboard";
import SpecialistDashboard from "./SpecialistDashboard";

// Тонкая обёртка: RequireAuth уже гарантирует, что сюда попадает только
// вошедший специалист — здесь только подгружаем его собственный профиль и
// офферы из PocketBase, чтобы кабинет показывал того, кто реально вошёл, а
// не одного и того же мок-специалиста для всех подряд. refresh() отдельно
// вынесен наружу — после реального сохранения новой услуги
// (ServiceCreationForm, Фаза 1) кабинет перечитывает данные с нуля вместо
// того, чтобы держать отдельный локальный список "черновиков".
export default function SpecialistDashboardClient() {
  const { user } = useAuth();
  const [data, setData] = useState<SpecialistDashboardData | null>(null);
  const [error, setError] = useState(false);

  const userId = user?.id;

  const refresh = useCallback(() => {
    if (!userId) return;
    return fetchOwnSpecialistDashboard(pbClient, userId)
      .then((result) => setData(result))
      .catch((err) => {
        // useAuth() эмитит новый объект user (та же личность, новая
        // ссылка) сразу после монтирования — эффект ниже перезапускается,
        // и PocketBase-клиент сам отменяет первый, устаревший запрос. Это
        // ожидаемая отмена, а не настоящая ошибка загрузки — раньше это
        // тихо игнорировалось через локальный cancelled-флаг, при
        // переписывании на переиспользуемый refresh() эта защита
        // потерялась, из-за чего кабинет ошибочно показывал "Не удалось
        // загрузить профиль" почти всегда.
        if (err?.isAbort) return;
        setError(true);
      });
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  return <SpecialistDashboard data={data} refresh={refresh} />;
}
