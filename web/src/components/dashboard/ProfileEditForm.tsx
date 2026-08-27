"use client";

import { useState } from "react";
import { pbClient } from "@/lib/auth-client";
import type { Specialist } from "@/types/specialist";

// Раньше "Редактировать" в профиле кабинета ничего не делал (кнопка без
// обработчика) — публичный профиль нельзя было заполнить иначе, чем через
// суперпользователя PocketBase. Пишет напрямую в specialist_profiles,
// доступные поля ограничены тем, что уже показывается в самом профиле
// (title/short_description/full_description) — навыки сюда сознательно не
// входят: specialist_skills ещё не наполнена ни у кого, редактор для неё —
// отдельная задача (см. STATUS.md).
export default function ProfileEditForm({
  specialist,
  onSaved,
  onCancel,
}: {
  specialist: Specialist;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(specialist.title);
  const [shortDescription, setShortDescription] = useState(specialist.shortDescription);
  const [fullDescription, setFullDescription] = useState(specialist.fullDescription);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await pbClient.collection("specialist_profiles").update(specialist.id, {
        title: title.trim(),
        short_description: shortDescription.trim(),
        full_description: fullDescription.trim(),
      });
      onSaved();
      onCancel();
    } catch {
      setError("Не получилось сохранить — попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-zinc-500">
          Заголовок профиля
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Например: AI-агенты и автоматизация продаж"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">
          Краткое описание (видно в карточке каталога)
        </label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={300}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">
          Полное описание (в профиле)
        </label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={6}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
