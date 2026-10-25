"use client";

import { useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import type { Specialist } from "@/types/specialist";
import { updateSpecialistSkills, type MySkill, type SkillOption } from "@/lib/dashboard";
import SpecialistCard from "@/components/SpecialistCard";
import PremiumSpecialistProfile from "@/components/PremiumSpecialistProfile";
import StandardSpecialistProfile from "@/components/StandardSpecialistProfile";
import MarkdownEditor from "@/components/MarkdownEditor";
import NewsBody from "@/components/news/NewsBody";
import { CATEGORIES } from "@/data/categories";
import { getCategory3D, getCategoryStyle } from "@/data/category-style";

// Раньше "Редактировать" в профиле кабинета ничего не делал (кнопка без
// обработчика) — публичный профиль нельзя было заполнить иначе, чем через
// суперпользователя PocketBase. Пишет напрямую в specialist_profiles,
// плюс (2026-09-28) в specialist_skills — связку с общим справочником
// skills (см. lib/dashboard.ts, updateSpecialistSkills). Секция "Описание
// и навыки" здесь называется точно так же, как строка в чек-листе
// "Заполненность профиля" на вкладке "Обзор" (SpecialistDashboard.tsx) —
// чтобы специалист сразу понимал, где заполнить то, на что там жалуются.
//
// 2026-10-17: «Полное описание» — редактор Markdown как у новостей
// (MarkdownEditor), навыки раскрашены в цвета направлений (справочник
// skills.category хранит название направления), карточка справа учитывает
// тариф (Enterprise — премиум-оформление), плюс кнопка «Предпросмотр
// лендинга» — публичная страница профиля из текущих, ещё не сохранённых
// данных.

// skills.category — свободный текст с названием направления; "Общие
// технологии" и всё незнакомое — серое «Другое».
function categorySlugByName(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.slug ?? "other";
}

// Блокирует прокрутку страницы под окном; Esc закрывает (если передан onEsc).
function useModalLock(onEsc?: () => void) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEsc?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onEsc]);
}

// Редактор описания — отдельное большое окно: в узкой колонке формы кабинета
// панель форматирования и два столбца (текст + предпросмотр) не помещались
// (2026-10-17, замечание владельца). Правки применяются к форме сразу, окно
// закрывается кнопкой «Готово»; в профиль они попадают после «Сохранить».
function DescriptionEditorModal({
  value,
  onChange,
  onClose,
  onLandingPreview,
}: {
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
  onLandingPreview: () => void;
}) {
  useModalLock();
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-900/70 p-2 sm:p-6" role="dialog" aria-modal="true" aria-label="Редактор описания">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 px-4 py-3 sm:px-6">
          <div>
            <p className="text-base font-bold text-zinc-900">Полное описание профиля</p>
            <p className="text-xs text-zinc-500">Правки применяются сразу. В профиль они попадут после кнопки «Сохранить» в форме.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLandingPreview}
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-fuchsia-500/30"
            >
              Предпросмотр лендинга
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Готово
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <MarkdownEditor value={value} onChange={onChange} label="Текст" rows={26} />
        </div>
      </div>
    </div>
  );
}

function LandingPreviewModal({ specialist, onClose }: { specialist: Specialist; onClose: () => void }) {
  useModalLock(onClose);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-zinc-900/70 p-2 sm:p-6" role="dialog" aria-modal="true" aria-label="Предпросмотр лендинга">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl bg-zinc-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-bold text-zinc-900">Предпросмотр лендинга</p>
            <p className="text-xs text-zinc-500">Так публичная страница выглядит с вашими текущими правками. Обложка и фото из вкладки «Лендинг» подтягиваются после сохранения.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Закрыть
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {specialist.premium ? <PremiumSpecialistProfile specialist={specialist} /> : <StandardSpecialistProfile specialist={specialist} />}
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditForm({
  specialist,
  allSkills,
  mySkills,
  planCode,
  categorySlugs,
  onSaved,
  onCancel,
}: {
  specialist: Specialist;
  allSkills: SkillOption[];
  mySkills: MySkill[];
  planCode: string;
  categorySlugs: string[];
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
  const [showLanding, setShowLanding] = useState(false);
  const [editingText, setEditingText] = useState(false);

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
  // редактируются только title/описания/навыки. Тариф и направления в
  // данных кабинета не лежат в самом specialist, поэтому достраиваем их тут:
  // Enterprise — премиум-оформление и контент лендинга, Pro/Enterprise —
  // метка «Продвигается» (как в публичном каталоге, lib/specialists.ts).
  const previewSkills = allSkills.filter((s) => selectedSkillIds.has(s.id)).map((s) => s.name);
  const mainCategory = categorySlugs[0] ?? "other";
  const isEnterprise = planCode === "enterprise";
  const preview: Specialist = {
    ...specialist,
    title: title.trim() || specialist.title,
    shortDescription: shortDescription.trim(),
    fullDescription,
    skills: previewSkills,
    category: mainCategory,
    categories: categorySlugs.length > 0 ? categorySlugs : undefined,
    badges: planCode === "pro" || isEnterprise ? ["promoted"] : [],
    premium: isEnterprise
      ? {
          tagline: title.trim() || shortDescription.trim(),
          coverGradient: `bg-gradient-to-br ${getCategoryStyle(mainCategory).gradient}`,
          gallery: [],
          serviceCards: [],
          presentations: [],
          videoPitchLabel: "",
          team: [],
          certificates: [],
        }
      : undefined,
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

  const landingButton = (
    <button
      type="button"
      onClick={() => setShowLanding(true)}
      className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-fuchsia-500/30 transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
    >
      Предпросмотр лендинга
    </button>
  );

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
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

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-medium text-zinc-500">Полное описание (в профиле)</label>
            <button
              type="button"
              onClick={() => setEditingText(true)}
              className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              {fullDescription.trim() ? "Открыть редактор" : "Написать описание"}
            </button>
          </div>
          <div className="relative mt-2 max-h-56 overflow-hidden rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 p-4">
            {fullDescription.trim() ? (
              <NewsBody body={fullDescription} />
            ) : (
              <p className="text-sm text-zinc-400">Описание пока пустое. Нажмите «Написать описание» — откроется большой редактор с форматированием.</p>
            )}
            {fullDescription.trim() && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium text-zinc-500">
            Навыки {selectedSkillIds.size > 0 ? `(выбрано ${selectedSkillIds.size})` : ""}
          </label>
          {allSkills.length > 0 ? (
            <div className="mt-2 flex flex-col gap-4">
              {[...skillsByCategory.entries()].map(([category, list]) => {
                const slug = categorySlugByName(category);
                const st = getCategoryStyle(slug);
                return (
                  <div key={category || "other"} className="rounded-xl p-3" style={{ backgroundColor: `${st.hex}12` }}>
                    <p className="flex items-center gap-2 text-sm font-bold brightness-75" style={{ color: st.hex }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: st.hex }} aria-hidden="true" />
                      {category || "Другое"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {list.map((skill) => {
                        const on = selectedSkillIds.has(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            aria-pressed={on}
                            style={on ? undefined : { borderColor: `${st.hex}66`, backgroundColor: `${st.hexLight}66` }}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 motion-reduce:transition-none ${
                              on
                                ? `-translate-y-0.5 border-b-2 bg-gradient-to-br text-white shadow-md ${getCategory3D(slug)}`
                                : "text-zinc-800 hover:-translate-y-0.5 hover:shadow-sm motion-reduce:hover:translate-y-0"
                            }`}
                          >
                            {on && <span aria-hidden="true">✓ </span>}
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-1 text-xs text-zinc-400">Справочник навыков пока пуст.</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Отмена
        </button>
        {landingButton}
      </div>
    </form>

    <div className="self-start xl:sticky xl:top-4">
      <p className="text-xs font-medium text-zinc-500">Так карточка выглядит в каталоге</p>
      <div className="pointer-events-none mt-2 max-w-sm">
        <SpecialistCard specialist={preview} />
      </div>
    </div>

    {editingText && (
      <DescriptionEditorModal
        value={fullDescription}
        onChange={setFullDescription}
        onClose={() => setEditingText(false)}
        onLandingPreview={() => setShowLanding(true)}
      />
    )}
    {showLanding && <LandingPreviewModal specialist={preview} onClose={() => setShowLanding(false)} />}
    </div>
  );
}
