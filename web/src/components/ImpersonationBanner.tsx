"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  useEffect(() => {
    function read() {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      setSaved(raw ? JSON.parse(raw) : null);
    }
    read();
    window.addEventListener("naidii-impersonation", read);
    return () => window.removeEventListener("naidii-impersonation", read);
  }, []);

  if (!saved) return null;

  function restore() {
    if (!saved) return;
    pbClient.authStore.save(saved.token, saved.record);
    sessionStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("naidii-impersonation"));
    router.push("/admin");
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md">
      <span>
        Вы вошли как {pbClient.authStore.record?.name || pbClient.authStore.record?.email || "другой пользователь"}
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
