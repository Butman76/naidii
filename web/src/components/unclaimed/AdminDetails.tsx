"use client";

import { useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

// Юрлицо/ИНН/сайт на публичной странице карточки (/unclaimed/[domain]) не
// приходят с сервера вообще — страница читает view-коллекцию, где этих
// полей физически нет (см. lib/unclaimed.ts, миграция 1755000062). Админу
// они всё равно нужны под рукой, не только во вкладке /admin, поэтому
// здесь: если вошедший — admin, браузер сам донагружает полную запись из
// базовой таблицы своей сессией. Это не обход защиты — PocketBase отдаст
// её, только если токен в pbClient.authStore реально принадлежит admin
// (проверяется на его стороне); роль из useAuth() здесь только чтобы не
// дёргать запрос зря для всех остальных, а не как охрана сама по себе.
export default function AdminDetails({ id }: { id: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<{ website: string; legalName: string; inn: string } | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      setData(null);
      return;
    }
    let cancelled = false;
    pbClient
      .collection("unclaimed_specialists")
      .getOne(id, { fields: "website,legal_name,inn" })
      .then((r) => {
        if (!cancelled) setData({ website: String(r.website ?? ""), legalName: String(r.legal_name ?? ""), inn: String(r.inn ?? "") });
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.role]);

  if (!data) return null;

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-xs font-medium text-amber-800">Видно только вам как админу</p>
      <dl className="mt-2 space-y-2 text-sm">
        {data.legalName && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-xs text-zinc-500">Юрлицо</dt>
            <dd className="text-zinc-800">{data.legalName}{data.inn ? `, ИНН ${data.inn}` : ""}</dd>
          </div>
        )}
        {data.website && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-xs text-zinc-500">Сайт</dt>
            <dd>
              <a href={data.website} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-700 underline">
                {data.website}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
