"use client";

import { useState } from "react";
import type { ServicePriceType } from "@/types/service-card";
import { pbClient } from "@/lib/auth-client";
import type { SpecialistDashboardOffer } from "@/lib/dashboard";

// Правка существующего предложения. Если тип результата свой (создан этим
// исполнителем) и ещё не одобрен — можно поправить и сам тип (название,
// описание); сохранение возвращает тип на модерацию, так отклонённую услугу
// можно переделать и отправить заново (правила result_types:
// миграция 1755000066). У одобренного общего типа правятся только цена, срок
// и УТП самого предложения.

const OFF_PLATFORM_CONTACT_RE =
  /(\+?\d[\d\s\-()]{7,}\d)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(@[a-zA-Z0-9_]{4,})|(t\.me\/)/i;

export default function ServiceEditForm({
  offer,
  onSaved,
  onCancel,
}: {
  offer: SpecialistDashboardOffer;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const editType = offer.typeIsMine && offer.typeStatus !== "approved";
  const [typeTitle, setTypeTitle] = useState(offer.resultTypeTitle);
  const [typeDescription, setTypeDescription] = useState(offer.typeDescription);
  const [priceType, setPriceType] = useState<ServicePriceType>(offer.priceType);
  const [priceValue, setPriceValue] = useState(String(offer.priceValue || ""));
  const [durationFrom, setDurationFrom] = useState(offer.durationFrom);
  const [tagline, setTagline] = useState(offer.tagline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContact = OFF_PLATFORM_CONTACT_RE.test(tagline);
  const problems = [
    ...(editType && typeTitle.trim().length <= 3 ? ["Название типа результата — от 4 символов"] : []),
    ...(editType && typeDescription.trim().length < 20 ? ["Описание услуги — от 20 символов"] : []),
    ...(!(Number(priceValue) > 0) ? ["Укажите цену"] : []),
    ...(!durationFrom.trim() ? ["Укажите срок выполнения"] : []),
    ...(!tagline.trim() ? ["Заполните краткое УТП"] : []),
    ...(hasContact ? ["В тексте УТП не должно быть контактов для ухода со сделки"] : []),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (problems.length > 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (editType) {
        await pbClient.collection("result_types").update(offer.resultTypeId, {
          title: typeTitle.trim(),
          subcategory: typeTitle.trim(),
          description: typeDescription.trim(),
          status: "pending",
        });
      }
      await pbClient.collection("services").update(offer.id, {
        tagline: tagline.trim(),
        price_type: priceType,
        price_from: Number(priceValue),
        duration_from: durationFrom.trim(),
      });
      onSaved();
      onCancel();
    } catch {
      setError("Не получилось сохранить — попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100";
  const label = "text-sm font-bold text-zinc-800";
  const choice = (on: boolean) =>
    `min-h-[48px] rounded-xl border-2 px-4 py-2.5 text-base font-semibold transition-all ${
      on ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "border-zinc-300 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50"
    }`;

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-zinc-200 bg-zinc-50 p-4 sm:p-6">
      <h2 className="pr-10 text-xl font-extrabold text-zinc-900 sm:text-2xl">
        {offer.typeStatus === "rejected" ? "Исправить и отправить заново" : "Изменить услугу"}
      </h2>

      {offer.typeStatus === "rejected" && (
        <div className="mt-3 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-bold">Тип услуги отклонён модератором</p>
          <p className="mt-0.5">{offer.typeNote || "Причина не указана."}</p>
          <p className="mt-1 text-red-700">После правок нажмите «Отправить на модерацию» — услуга снова попадёт в очередь.</p>
        </div>
      )}
      {offer.typeStatus === "pending" && editType && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Услуга на модерации. Если сохранить правки, проверка начнётся заново.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {editType && (
          <>
            <label className="block">
              <span className={label}>Название результата</span>
              <input value={typeTitle} onChange={(e) => setTypeTitle(e.target.value)} maxLength={120} className={field} />
            </label>
            <label className="block">
              <span className={label}>Подробное описание услуги</span>
              <textarea value={typeDescription} onChange={(e) => setTypeDescription(e.target.value)} rows={4} className={field} />
            </label>
          </>
        )}

        <div>
          <span className={label}>Цена, ₽</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPriceType("from")} className={choice(priceType === "from")}>от</button>
            <button type="button" onClick={() => setPriceType("fixed")} className={choice(priceType === "fixed")}>фиксированная</button>
          </div>
          <input type="number" min={1} value={priceValue} onChange={(e) => setPriceValue(e.target.value)} placeholder="например, 60000" className={field} />
        </div>

        <label className="block">
          <span className={label}>Срок выполнения</span>
          <input value={durationFrom} onChange={(e) => setDurationFrom(e.target.value)} placeholder="например, от 10 дней" className={field} />
        </label>

        <label className="block">
          <span className={label}>Краткое УТП</span>
          <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={3} maxLength={300} className={field} />
        </label>
      </div>

      {problems.length > 0 && (
        <ul className="mt-4 list-disc space-y-0.5 pl-5 text-sm text-amber-800">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={problems.length > 0 || saving}
          className="min-h-[52px] rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 px-8 text-base font-extrabold text-white shadow-lg shadow-fuchsia-500/30 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Сохраняем…" : editType ? "Отправить на модерацию" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[52px] rounded-full border-2 border-zinc-300 bg-white px-6 text-base font-semibold text-zinc-700 hover:border-zinc-500"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
