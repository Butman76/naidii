"use client";

import { useState } from "react";
import { pbClient } from "@/lib/auth-client";
import type { Specialist } from "@/types/specialist";
import { updateSpecialistSkills, type MySkill, type SkillOption } from "@/lib/dashboard";
import SpecialistCard from "@/components/SpecialistCard";

// Раньше "Редактировать" в профиле кабинета ничего не делал (кнопка без
// обработчика) — публичный профиль нельзя было заполнить иначе, чем через
// суперпользователя PocketBase. Пишет напрямую в specialist_profiles,
// плюс (2026-09-28) в specialist_skills — связку с общим справочником
// skills (см. lib/dashboard.ts, updateSpecialistSkills). Секция "Описание
// и навыки" здесь называется точно так же, как строка в чек-листе
// "Заполненность профиля" на вкладке "Обзор" (SpecialistDashboard.tsx) —
// чтобы специалист сразу понимал, где заполнить то, на что там жалуются.
export default function ProfileEditForm({
  specialist,
  allSkills,
  mySkills,
  onSaved,
  onCancel,
}: {
  specialist: Specialist;
  allSkills: SkillOption[];
  mySkills: MySkill[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(specialist.title);
  const [shortDescription, setShortDescription] = useState(specialist.shortDescription);
  const [fullDescription, setFullDescription] = useState(specialist.fullDescription);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    () => new Set(mySkills.map((s) => s.skillId))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSkill(id: string) {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const skillsByCategory = new Map<string, SkillOption[]>();
  for (const s of allSkills) {
    const list = skillsByCategory.get(s.category) ?? [];
    list.push(s);
    skillsByCategory.set(s.category, list);
  }

  // Живой превью карточки в каталоге (см. SpecialistCard.tsx) — остальные
  // поля (рейтинг, отзывы, услуги и т.п.) берём как есть у specialist, тут
  // редактируются только title/описания/навыки.
  const previewSkills = allSkills.filter((s) => selectedSkillIds.has(s.id)).map((s) => s.name);
  const preview: Specialist = {
    ...specialist,
    title: title.trim() || specialist.title,
    shortDescription: shortDescription.trim(),
    skills: previewSkills,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await Promise.all([
        pbClient.collection("specialist_profiles").update(specialist.id, {
          title: title.trim(),
          short_description: shortDescription.trim(),
          full_description: fullDescription.trim(),
        }),
        updateSpecialistSkills(pbClient, specialist.id, mySkills, [...selectedSkillIds]),
      ]);
      onSaved();
      onCancel();
    } catch {
      setError("Не получилось сохранить — попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <div className="rounded-xl border border-zinc-200 p-4">
        <p className="text-sm font-semibold text-zinc-900">Описание и навыки</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Это то, что заказчик видит в карточке и в профиле — и что считается в чек-листе заполненности на «Обзоре».
        </p>

        <div className="mt-3">
          <label className="text-xs font-medium text-zinc-500">
            Краткое описание — на карточку специалиста в каталоге
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={300}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>

        <div className="mt-3">
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

        <div className="mt-3">
          <label className="text-xs font-medium text-zinc-500">
            Навыки {selectedSkillIds.size > 0 ? `(выбрано ${selectedSkillIds.size})` : ""}
          </label>
          {allSkills.length > 0 ? (
            <div className="mt-2 flex flex-col gap-3">
              {[...skillsByCategory.entries()].map(([category, list]) => (
                <div key={category || "other"}>
                  <p className="text-[11px] font-medium text-zinc-400">{category || "Другое"}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {list.map((skill) => {
                      const on = selectedSkillIds.has(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            on
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-zinc-400">Справочник навыков пока пуст.</p>
          )}
        </div>
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

    <div className="self-start lg:sticky lg:top-4">
      <p className="text-xs font-medium text-zinc-500">Так карточка выглядит в каталоге</p>
      <div className="pointer-events-none mt-2">
        <SpecialistCard specialist={preview} />
      </div>
    </div>
    </div>
  );
}
