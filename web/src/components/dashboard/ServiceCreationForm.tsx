"use client";

import { useMemo, useState } from "react";
import type {
  ServiceCardTag,
  ServiceOffer,
  ServicePriceType,
} from "@/types/service-card";
import { SERVICE_TAG_LABELS } from "@/types/service-card";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";
import { mockResultTypes } from "@/data/mock-services";
import type { Specialist } from "@/types/specialist";

// Метки, которые специалист вправе проставить себе сам. "verified" и "top"
// — знаки доверия от площадки (модерация/статистика), их нельзя выбрать в
// форме — иначе исполнитель мог бы сам себе присвоить "Проверенный
// исполнитель".
const SELF_DECLARABLE_TAGS: ServiceCardTag[] = [
  "urgent",
  "online",
  "guaranteed",
  "has_examples",
];

// Простая проверка на контакты для ухода со сделки вне площадки — ТЗ §8
// ("отсутствуют контакты для ухода со сделки вне платформы"). Не
// исчерпывающая, но ловит самые частые случаи: телефон, email, @telegram,
// t.me-ссылку.
const OFF_PLATFORM_CONTACT_RE =
  /(\+?\d[\d\s\-()]{7,}\d)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(@[a-zA-Z0-9_]{4,})|(t\.me\/)/i;

interface FormResultType {
  slug: string;
  title: string;
  scopeLabel: string;
  categorySlug: string;
  subcategory: string;
}

export default function ServiceCreationForm({
  specialist,
  onCreated,
  onCancel,
}: {
  specialist: Specialist;
  onCreated: (offer: ServiceOffer) => void;
  onCancel: () => void;
}) {
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [resultTypeSlug, setResultTypeSlug] = useState("");
  const [customType, setCustomType] = useState("");
  const [useCustomType, setUseCustomType] = useState(false);

  const [priceType, setPriceType] = useState<ServicePriceType>("from");
  const [priceValue, setPriceValue] = useState("");
  const [durationFrom, setDurationFrom] = useState("");
  const [revisionsMode, setRevisionsMode] = useState<"count" | "none" | "">("");
  const [revisionsCount, setRevisionsCount] = useState("2");
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState<ServiceCardTag[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const subcategories = useMemo(() => {
    if (!categorySlug) return [];
    return Array.from(
      new Set(
        mockResultTypes
          .filter((t) => t.categorySlug === categorySlug)
          .map((t) => t.subcategory)
      )
    );
  }, [categorySlug]);

  const resultTypes: FormResultType[] = useMemo(() => {
    if (!categorySlug || !subcategory) return [];
    return mockResultTypes.filter(
      (t) => t.categorySlug === categorySlug && t.subcategory === subcategory
    );
  }, [categorySlug, subcategory]);

  const selectedType = resultTypes.find((t) => t.slug === resultTypeSlug);
  const style = getCategoryStyle(categorySlug || "other");

  function toggleTag(tag: ServiceCardTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  }

  const hasResultName = useCustomType ? customType.trim().length > 3 : Boolean(selectedType);
  const hasPrice = Number(priceValue) > 0;
  const hasDuration = durationFrom.trim().length > 0;
  const hasScope = Boolean(selectedType) || useCustomType; // унаследован от типа результата
  const hasRevisions = revisionsMode !== "";
  const hasExample = Boolean(previewImage);
  const hasOffPlatformContact = OFF_PLATFORM_CONTACT_RE.test(tagline);
  const hasTagline = tagline.trim().length > 0 && !hasOffPlatformContact;

  const checklist = [
    { label: "Понятное название результата выбрано", ok: hasResultName },
    { label: "Указана цена", ok: hasPrice },
    { label: "Указан срок выполнения", ok: hasDuration },
    { label: "Объём работы задан", ok: hasScope },
    { label: "Указано число правок (или «без правок»)", ok: hasRevisions },
    { label: "Загружен хотя бы один пример результата", ok: hasExample },
    { label: "В тексте нет контактов для ухода со сделки", ok: !hasOffPlatformContact },
    { label: "Заполнено краткое УТП", ok: hasTagline },
  ];

  const canSubmit = checklist.every((c) => c.ok);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const offer: ServiceOffer = {
      id: `pending-${Date.now()}`,
      resultTypeSlug: useCustomType ? "" : resultTypeSlug,
      tagline: tagline.trim(),
      priceType,
      priceValue: Number(priceValue),
      durationFrom: durationFrom.trim(),
      scopeLabel: selectedType?.scopeLabel ?? "По согласованию",
      revisionsIncluded:
        revisionsMode === "count" ? Number(revisionsCount) : undefined,
      tags,
      specialistSlug: specialist.slug,
      specialistName: specialist.name,
      specialistAvatarInitials: specialist.avatarInitials,
      specialistRating: specialist.rating,
      specialistCompletedOrders: 0,
    };

    onCreated(offer);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-sm font-semibold text-emerald-900">
          Отправлено на модерацию
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          Карточка появится в каталоге после проверки. Обычно это занимает
          до 24 часов.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 rounded-full border border-emerald-300 px-4 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          Закрыть
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">
          Новая карточка услуги
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          Отмена
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Заполните ограниченный набор полей — обложка и оформление карточки
        формируются автоматически по единому шаблону площадки.
      </p>

      {/* Шаг 1: тип результата */}
      <div className="mt-5">
        <p className="text-xs font-medium text-zinc-500">1. Тип результата</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {CATEGORIES.filter((c) => c.slug !== "other").map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setCategorySlug(c.slug);
                setSubcategory("");
                setResultTypeSlug("");
                setUseCustomType(false);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                categorySlug === c.slug
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {categorySlug && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setSubcategory(sub);
                  setResultTypeSlug("");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  subcategory === sub
                    ? "border-zinc-700 bg-zinc-700 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {categorySlug && subcategory && !useCustomType && (
          <div className="mt-2 flex flex-col gap-1.5">
            {resultTypes.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setResultTypeSlug(t.slug)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  resultTypeSlug === t.slug
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <span className="font-medium text-zinc-900">{t.title}</span>
                <span className="ml-2 text-xs text-zinc-500">
                  {t.scopeLabel}
                </span>
              </button>
            ))}
            {resultTypes.length === 0 && (
              <p className="text-xs text-zinc-400">
                Выберите подкатегорию выше
              </p>
            )}
          </div>
        )}

        {categorySlug && subcategory && (
          <button
            type="button"
            onClick={() => {
              setUseCustomType((v) => !v);
              setResultTypeSlug("");
            }}
            className="mt-2 text-xs font-medium text-zinc-500 underline hover:text-zinc-900"
          >
            {useCustomType
              ? "Выбрать из списка вместо своего типа"
              : "Не нашли нужный тип? Предложить свой (на модерацию)"}
          </button>
        )}

        {useCustomType && (
          <input
            type="text"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="Название нового типа результата"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        )}
      </div>

      {/* Шаг 2: условия предложения */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-zinc-500">2. Цена</p>
          <div className="mt-2 flex gap-2">
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as ServicePriceType)}
              className="rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-zinc-900 focus:outline-none"
            >
              <option value="from">от</option>
              <option value="fixed">фикс.</option>
            </select>
            <input
              type="number"
              min={0}
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="60000"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Срок выполнения</p>
          <input
            type="text"
            value={durationFrom}
            onChange={(e) => setDurationFrom(e.target.value)}
            placeholder="от 10 дней"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-zinc-500">Правки</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm text-zinc-700">
              <input
                type="radio"
                name="revisions"
                checked={revisionsMode === "count"}
                onChange={() => setRevisionsMode("count")}
              />
              включено
              <input
                type="number"
                min={1}
                value={revisionsCount}
                onChange={(e) => setRevisionsCount(e.target.value)}
                onFocus={() => setRevisionsMode("count")}
                className="w-16 rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-700">
              <input
                type="radio"
                name="revisions"
                checked={revisionsMode === "none"}
                onChange={() => setRevisionsMode("none")}
              />
              без правок
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-zinc-500">Метки</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SELF_DECLARABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  tags.includes(tag)
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {SERVICE_TAG_LABELS[tag]}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            «Проверенный исполнитель» и «Топ-исполнитель» присваивает
            площадка сама — их нельзя выбрать здесь.
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-zinc-500">
            Краткое УТП (одна строка)
          </p>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={120}
            placeholder="Доводит клиента до сделки или передаёт менеджеру"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
          {hasOffPlatformContact && (
            <p className="mt-1 text-xs text-red-600">
              Похоже на контакт для ухода со сделки (телефон/почта/телеграм)
              — уберите его из текста.
            </p>
          )}
        </div>
      </div>

      {/* Шаг 3: пример результата */}
      <div className="mt-5">
        <p className="text-xs font-medium text-zinc-500">
          3. Пример результата
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl text-white ${
              previewImage ? "" : `bg-gradient-to-br ${style.gradient}`
            }`}
          >
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- локальный object URL, не для продакшена
              <img
                src={previewImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              style.icon
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Система сама кадрирует под нужную пропорцию и наложит фирменный
              цветной слой направления — как здесь.
            </p>
          </div>
        </div>
      </div>

      {/* Автопроверка */}
      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-semibold text-zinc-700">
          Автопроверка перед публикацией
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {checklist.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-2 text-xs ${
                item.ok ? "text-emerald-700" : "text-zinc-400"
              }`}
            >
              <span>{item.ok ? "✓" : "○"}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        Отправить на модерацию
      </button>
    </form>
  );
}
