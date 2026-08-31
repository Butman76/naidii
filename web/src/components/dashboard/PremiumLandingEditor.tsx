"use client";

import { useEffect, useRef, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { embedVideoUrl } from "@/lib/video-embed";

interface Poster {
  id: string;
  imageUrl: string;
  caption: string;
}

// Самостоятельное оформление лендинга для специалистов на тарифе enterprise
// (см. PremiumSpecialistProfile.tsx) — обложка/лого/видео живут прямо на
// specialist_profiles, постеры — отдельная коллекция landing_posters
// (своя строка на каждую картинку+подпись). Никакого onSaved наружу не
// зовём: у вкладки "Лендинг" в SpecialistDashboard.tsx нет своего общего
// состояния, которое надо было бы обновлять, — компонент читает и пишет
// себе сам.
export default function PremiumLandingEditor({ specialistId }: { specialistId: string }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [posters, setPosters] = useState<Poster[] | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newCaption, setNewCaption] = useState("");
  const newPosterFileRef = useRef<HTMLInputElement>(null);

  async function loadProfile() {
    const record = await pbClient.collection("specialist_profiles").getOne(specialistId);
    setCoverUrl(record.premium_cover_image ? pbClient.files.getURL(record, record.premium_cover_image) : null);
    setLogoUrl(record.premium_logo_image ? pbClient.files.getURL(record, record.premium_logo_image) : null);
    setVideoUrl(record.premium_video_url || "");
  }

  async function loadPosters() {
    const records = await pbClient.collection("landing_posters").getFullList({
      filter: pbClient.filter("specialist_profile_id = {:id}", { id: specialistId }),
      sort: "sort_order",
    });
    setPosters(
      records.map((r) => ({
        id: r.id,
        imageUrl: pbClient.files.getURL(r, r.image),
        caption: r.caption ?? "",
      }))
    );
  }

  useEffect(() => {
    loadProfile().catch(() => setError("Не удалось загрузить лендинг."));
    loadPosters().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialistId]);

  async function uploadImage(field: "premium_cover_image" | "premium_logo_image", file: File) {
    setSavingField(field);
    setError(null);
    try {
      await pbClient.collection("specialist_profiles").update(specialistId, { [field]: file });
      await loadProfile();
    } catch {
      setError("Не получилось загрузить картинку — попробуйте ещё раз.");
    } finally {
      setSavingField(null);
    }
  }

  async function saveVideoUrl() {
    setSavingField("video");
    setError(null);
    try {
      await pbClient.collection("specialist_profiles").update(specialistId, {
        premium_video_url: videoUrl.trim(),
      });
    } catch {
      setError("Не получилось сохранить ссылку на видео.");
    } finally {
      setSavingField(null);
    }
  }

  async function addPoster() {
    const file = newPosterFileRef.current?.files?.[0];
    if (!file) return;
    setSavingField("poster");
    setError(null);
    try {
      await pbClient.collection("landing_posters").create({
        specialist_profile_id: specialistId,
        image: file,
        caption: newCaption.trim(),
        sort_order: (posters?.length ?? 0) + 1,
      });
      setNewCaption("");
      if (newPosterFileRef.current) newPosterFileRef.current.value = "";
      await loadPosters();
    } catch {
      setError("Не получилось добавить постер — попробуйте ещё раз.");
    } finally {
      setSavingField(null);
    }
  }

  async function deletePoster(id: string) {
    setSavingField(id);
    try {
      await pbClient.collection("landing_posters").delete(id);
      await loadPosters();
    } catch {
      setError("Не получилось удалить постер.");
    } finally {
      setSavingField(null);
    }
  }

  const videoEmbed = videoUrl ? embedVideoUrl(videoUrl) : null;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900">Обложка</p>
        <p className="mt-1 text-xs text-zinc-500">
          Широкая картинка вверху лендинга. Рекомендуем горизонтальную, от 1600×500px.
        </p>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="mt-3 h-32 w-full rounded-lg object-cover" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={savingField === "premium_cover_image"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage("premium_cover_image", file);
          }}
          className="mt-3 text-xs text-zinc-600"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900">Логотип</p>
        <p className="mt-1 text-xs text-zinc-500">
          Показывается поверх обложки вместо инициалов.
        </p>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="mt-3 h-20 w-20 rounded-2xl border border-zinc-200 object-cover" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={savingField === "premium_logo_image"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage("premium_logo_image", file);
          }}
          className="mt-3 text-xs text-zinc-600"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900">Видео-презентация</p>
        <p className="mt-1 text-xs text-zinc-500">Ссылка на YouTube или RuTube.</p>
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={saveVideoUrl}
            disabled={savingField === "video"}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            Сохранить
          </button>
        </div>
        {videoUrl && !videoEmbed && (
          <p className="mt-2 text-xs text-amber-600">
            Ссылка не похожа на YouTube или RuTube — на лендинге видео не покажется.
          </p>
        )}
        {videoEmbed && (
          <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-zinc-900">
            <iframe src={videoEmbed} className="h-full w-full" allowFullScreen />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900">Рекламные постеры</p>
        <p className="mt-1 text-xs text-zinc-500">
          Яркие картинки с подписью в разделе «Скриншоты и работы».
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(posters ?? []).map((poster) => (
            <div key={poster.id} className="overflow-hidden rounded-xl border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster.imageUrl} alt={poster.caption} className="aspect-video w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-xs text-zinc-600">{poster.caption || "Без подписи"}</p>
                <button
                  type="button"
                  onClick={() => deletePoster(poster.id)}
                  disabled={savingField === poster.id}
                  className="shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-40"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row">
          <input ref={newPosterFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="text-xs text-zinc-600" />
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Подпись к постеру"
            maxLength={150}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={addPoster}
            disabled={savingField === "poster"}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {savingField === "poster" ? "Добавляем…" : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
