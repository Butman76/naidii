"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import {
  createPartnerAd,
  deletePartnerAd,
  fetchAllPartnerAds,
  togglePartnerAdActive,
  type AdminPartnerAd,
} from "@/lib/partner-ads";

// Вкладка "Реклама" в /admin — ручное управление баннерами сторонних
// контор (курсы по ИИ, агентства автоматизации) в бегущей ленте на
// главной и в каталогах (см. PartnerAdsCarousel.tsx). Самообслуживания и
// онлайн-оплаты нет: рекламодатель договаривается напрямую, admin
// добавляет/выключает баннер сам. click_count — не платёжный механизм,
// просто цифра для будущих переговоров о цене размещения.
export default function PartnerAdsTab() {
  const [ads, setAds] = useState<AdminPartnerAd[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    return fetchAllPartnerAds(pbClient)
      .then(setAds)
      .catch((err) => {
        if (err?.isAbort) return;
        setError("Не удалось загрузить список баннеров.");
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!companyName.trim() || !linkUrl.trim() || !file) {
      setError("Заполните название, ссылку и выберите картинку.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createPartnerAd(pbClient, {
        companyName: companyName.trim(),
        linkUrl: linkUrl.trim(),
        image: file,
        sortOrder: (ads?.length ?? 0) + 1,
      });
      setCompanyName("");
      setLinkUrl("");
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } catch {
      setError("Не получилось добавить баннер — проверьте ссылку и размер картинки.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, next: boolean) {
    setBusyId(id);
    try {
      await togglePartnerAdActive(pbClient, id, next);
      await refresh();
    } catch {
      setError("Не удалось изменить статус баннера.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Удалить этот баннер безвозвратно?")) return;
    setBusyId(id);
    try {
      await deletePartnerAd(pbClient, id);
      await refresh();
    } catch {
      setError("Не удалось удалить баннер.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-end sm:flex-wrap"
      >
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Название конторы
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-56 rounded border border-zinc-300 px-2 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Ссылка (куда ведёт баннер)
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="w-64 rounded border border-zinc-300 px-2 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Картинка баннера
          </label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="text-xs" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {saving ? "Добавляем…" : "Добавить баннер"}
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <table className="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-zinc-300 bg-zinc-50">
            <th className="whitespace-nowrap px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Баннер
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Ссылка
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Клики
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Статус
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-500" />
          </tr>
        </thead>
        <tbody>
          {(ads ?? []).map((ad) => (
            <tr key={ad.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-3 py-2 align-top">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.imageUrl} alt="" className="h-10 w-16 rounded border border-zinc-200 object-cover" />
                  <span className="font-medium text-zinc-800">{ad.companyName}</span>
                </div>
              </td>
              <td className="max-w-[220px] truncate px-3 py-2 align-top text-zinc-500">
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {ad.linkUrl}
                </a>
              </td>
              <td className="px-3 py-2 align-top text-zinc-700">{ad.clickCount}</td>
              <td className="px-3 py-2 align-top">
                <span className={ad.active ? "text-emerald-700" : "text-zinc-400"}>
                  {ad.active ? "Активен" : "Выключен"}
                </span>
              </td>
              <td className="px-3 py-2 align-top">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(ad.id, !ad.active)}
                    disabled={busyId === ad.id}
                    className="rounded border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    {ad.active ? "выключить" : "включить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(ad.id)}
                    disabled={busyId === ad.id}
                    className="rounded border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {ads === null && (
            <tr>
              <td className="px-3 py-2 text-zinc-400">Загружаем…</td>
            </tr>
          )}
          {ads?.length === 0 && (
            <tr>
              <td className="px-3 py-2 text-zinc-400">Пока баннеров нет.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
