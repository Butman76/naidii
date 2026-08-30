"use client";

import { useEffect, useState } from "react";
import type { RecordModel } from "pocketbase";
import { pbClient } from "@/lib/auth-client";

interface SavedAdminSession {
  token: string;
  record: RecordModel;
}

const STORAGE_KEY = "naidii_admin_return";

// Показывается на любой странице, пока admin "сидит внутри" чужого кабинета
// (AdminPanel.tsx -> impersonateUser). Без этого вернуться в админку можно
// было бы только повторным логином — то, чего просил избежать пользователь.
export default function ImpersonationBanner() {
  const [saved, setSaved] = useState<SavedAdminSession | null>(null);

  useEffect(() => {
    // Переходы туда/обратно всегда идут через window.location (полную
    // перезагрузку, см. restore() ниже и impersonateUser в AdminPanel.tsx),
    // так что достаточно читать sessionStorage один раз при монтировании —
    // отдельное событие для "живого" обновления в рамках одной страницы не
    // нужно.
    const raw = sessionStorage.getItem(STORAGE_KEY);
    setSaved(raw ? JSON.parse(raw) : null);
  }, []);

  if (!saved) return null;

  const ROLE_LABELS: Record<string, string> = {
    specialist: "Исполнитель",
    customer: "Заказчик",
    admin: "Админ",
    moderator: "Модератор",
  };
  const impersonatedRole = pbClient.authStore.record?.role as string | undefined;
  const roleLabel = (impersonatedRole && ROLE_LABELS[impersonatedRole]) || "Пользователь";
  const impersonatedName =
    pbClient.authStore.record?.name || pbClient.authStore.record?.email || "другой пользователь";

  function restore() {
    if (!saved) return;
    pbClient.authStore.save(saved.token, saved.record);
    sessionStorage.removeItem(STORAGE_KEY);
    // window.location, не router.push — та же гонка, что и при входе "как
    // пользователь": страница кабинета ещё смонтирована, и её RequireAuth
    // среагировал бы на подмену сессии раньше, чем успеет сработать переход
    // на /admin. Жёсткая навигация читает уже сохранённую сессию с нуля.
    window.location.href = "/admin";
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md">
      <span className="text-base font-extrabold uppercase tracking-wide">
        {roleLabel}: {impersonatedName}
      </span>
      <button
        onClick={restore}
        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
      >
        Вернуться в админку ({saved.record.name || saved.record.email})
      </button>
    </div>
  );
}
