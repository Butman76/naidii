"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ServiceCardTag,
  ServicePriceType,
} from "@/types/service-card";
import { SERVICE_TAG_LABELS } from "@/types/service-card";
import { CATEGORIES } from "@/data/categories";
import { getCategory3D, getCategoryStyle } from "@/data/category-style";
import { pbClient } from "@/lib/auth-client";
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
  id: string;
  slug: string;
  title: string;
  scopeLabel: string;
  categorySlug: string;
  categoryId: string;
  subcategory: string;
}

// Слаги в базе (в т.ч. остальные 42 типа) — латиница/цифры, для URL
// /services/{slug}. Название почти всегда вводят на русском — оставляем
// только то, что уже латиница/цифры (обычно ничего), и полагаемся на
// временной суффикс для уникальности и человекочитаемости не ждём.
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `custom-${base || "tip"}-${Date.now().toString(36)}`;
}

// Шаг формы — на уровне модуля, не внутри компонента: иначе при каждом нажатии клавиши
// создавался бы новый тип компонента, и поля ввода пересоздавались бы и теряли фокус.
function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border-2 border-zinc-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-base font-extrabold text-white shadow-md shadow-indigo-500/30">
          {n}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold leading-tight text-zinc-900">{title}</h3>
          {hint && <p className="mt-0.5 text-sm text-zinc-500">{hint}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ServiceCreationForm({
  specialist,
  onCreated,
  onCancel,
}: {
  specialist: Specialist;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [liveTypes, setLiveTypes] = useState<FormResultType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    pbClient
      .collection("result_types")
      .getFullList({ expand: "category_id", sort: "subcategory", requestKey: null })
      .then((records) => {
        if (cancelled) return;
        setLiveTypes(
          records.map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            scopeLabel: r.scope_label ?? "",
            categorySlug: r.expand?.category_id?.slug ?? "",
            categoryId: r.category_id,
            subcategory: r.subcategory,
          }))
        );
      })
      .catch(() => {
        // сеть/сбой — список типов останется пустым, форма не должна падать
      })
      .finally(() => {
        if (!cancelled) setTypesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // category_id (реальный id записи в categories, не слаг) нужен, чтобы
  // отправить заявку на свой тип результата — берём его из уже загруженных
  // типов той же категории вместо отдельного похода за categories.
  const categoryIdBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of liveTypes) {
      if (t.categorySlug && t.categoryId) map.set(t.categorySlug, t.categoryId);
    }
    return map;
  }, [liveTypes]);

  const [categorySlug, setCategorySlug] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [resultTypeSlug, setResultTypeSlug] = useState("");
  const [customType, setCustomType] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [useCustomType, setUseCustomType] = useState(false);

  const [priceType, setPriceType] = useState<ServicePriceType>("from");
  const [priceValue, setPriceValue] = useState("");
  const [durationFrom, setDurationFrom] = useState("");
  const [revisionsMode, setRevisionsMode] = useState<"count" | "none" | "">("");
  const [revisionsCount, setRevisionsCount] = useState("2");
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState<ServiceCardTag[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<"published" | "type_pending" | null>(null);

  const subcategories = useMemo(() => {
    if (!categorySlug) return [];
    return Array.from(
      new Set(
        liveTypes
          .filter((t) => t.categorySlug === categorySlug)
          .map((t) => t.subcategory)
      )
    );
  }, [categorySlug, liveTypes]);

  const resultTypes: FormResultType[] = useMemo(() => {
    if (!categorySlug || !subcategory) return [];
    return liveTypes.filter(
      (t) => t.categorySlug === categorySlug && t.subcategory === subcategory
    );
  }, [categorySlug, subcategory, liveTypes]);

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
    setPreviewImageFile(file);
  }

  const hasResultName = useCustomType ? customType.trim().length > 3 : Boolean(selectedType);
  const hasCustomDescription =
    !useCustomType || customDescription.trim().length >= 20;
  const hasPrice = Number(priceValue) > 0;
  const hasDuration = durationFrom.trim().length > 0;
  const hasScope = Boolean(selectedType) || useCustomType; // унаследован от типа результата
  const hasRevisions = revisionsMode !== "";
  const hasExample = Boolean(previewImage);
  const hasOffPlatformContact = OFF_PLATFORM_CONTACT_RE.test(tagline);
  const hasTagline = tagline.trim().length > 0 && !hasOffPlatformContact;

  const checklist = [
    { label: "Понятное название результата выбрано", ok: hasResultName },
    ...(useCustomType
      ? [{ label: "Добавлено подробное описание услуги (от 20 символов)", ok: hasCustomDescription }]
      : []),
    { label: "Указана цена", ok: hasPrice },
    { label: "Указан срок выполнения", ok: hasDuration },
    { label: "Объём работы задан", ok: hasScope },
    { label: "Указано число правок (или «без правок»)", ok: hasRevisions },
    { label: "Загружен хотя бы один пример результата", ok: hasExample },
    { label: "В тексте нет контактов для ухода со сделки", ok: !hasOffPlatformContact },
    { label: "Заполнено краткое УТП", ok: hasTagline },
  ];

  const canSubmit = checklist.every((c) => c.ok) && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      let resultTypeId: string;
      let typePending = false;

      if (useCustomType) {
        const categoryId = categoryIdBySlug.get(categorySlug);
        const userId = pbClient.authStore.record?.id;
        if (!categoryId || !userId) {
          throw new Error("Не удалось определить категорию — выберите направление заново.");
        }
        const created = await pbClient.collection("result_types").create({
          category_id: categoryId,
          subcategory: customType.trim(),
          title: customType.trim(),
          slug: slugify(customType),
          description: customDescription.trim(),
          status: "pending",
          created_by: userId,
        });
        resultTypeId = created.id;
        typePending = true;
      } else {
        resultTypeId = selectedType!.id;
      }

      await pbClient.collection("services").create({
        specialist_profile_id: specialist.id,
        result_type_id: resultTypeId,
        tagline: tagline.trim(),
        price_type: priceType,
        price_from: Number(priceValue),
        duration_from: durationFrom.trim(),
        scope_label: selectedType?.scopeLabel ?? "",
        revisions_included: revisionsMode === "count" ? Number(revisionsCount) : 0,
        tags,
        active: true,
        // PocketBase JS SDK сам собирает multipart/form-data, когда в
        // значении поля лежит File — было (см. checklist выше) уже
        // обязательным полем формы, только не долетало до базы: до сих
        // пор превью жило только как blob:-URL в состоянии React.
        ...(previewImageFile ? { preview_images: previewImageFile } : {}),
      });

      setResult(typePending ? "type_pending" : "published");
      onCreated();
    } catch {
      setSubmitError("Не получилось сохранить услугу — попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-sm font-semibold text-emerald-900">
          {result === "type_pending" ? "Отправлено на модерацию" : "Услуга опубликована"}
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          {result === "type_pending"
            ? "Новый тип результата проверит команда площадки — обычно это занимает до 24 часов, после чего карточка появится в каталоге."
            : "Карточка уже видна в каталоге (если ваш профиль прошёл модерацию)."}
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

  // «Доработки» (в ТЗ §8 — «число правок либо отметка, что правки не
  // предусмотрены»): сколько раундов бесплатных исправлений по замечаниям
  // заказчика вы включаете в цену. Данные те же (revisionsMode/revisionsCount),
  // поменялась подача: быстрые кнопки вместо радио + поля.
  const revisionKey =
    revisionsMode === "none"
      ? "none"
      : revisionsMode === "count"
        ? ["1", "2", "3"].includes(revisionsCount)
          ? revisionsCount
          : "other"
        : "";
  function pickRevisions(key: string) {
    if (key === "none") {
      setRevisionsMode("none");
    } else if (key === "other") {
      setRevisionsMode("count");
      if (["1", "2", "3"].includes(revisionsCount)) setRevisionsCount("4");
    } else {
      setRevisionsMode("count");
      setRevisionsCount(key);
    }
  }

  const doneCount = checklist.filter((c) => c.ok).length;
  const accent = style.hex;
  const field =
    "w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100";
  const choice = (on: boolean) =>
    `min-h-[48px] rounded-xl border-2 px-4 py-2.5 text-base font-semibold transition-all ${
      on
        ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
        : "border-zinc-300 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50"
    }`;

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-zinc-200 bg-zinc-50 p-3 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-extrabold text-zinc-900 sm:text-2xl">Новая карточка услуги</h2>
        <button type="button" onClick={onCancel} className="min-h-[44px] shrink-0 rounded-full border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 hover:border-zinc-500">
          Отмена
        </button>
      </div>
      <p className="mt-1 text-sm text-zinc-500 sm:text-base">
        Пройдите 5 шагов. Обложка и оформление карточки формируются автоматически по единому шаблону площадки.
      </p>

      {/* Шаг 1: направление */}
      <Step n={1} title="Направление" hint="Выберите, в какой области ваша услуга.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.filter((c) => c.slug !== "other").map((c) => {
            const on = categorySlug === c.slug;
            const st = getCategoryStyle(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  setCategorySlug(c.slug);
                  setSubcategory("");
                  setResultTypeSlug("");
                  setUseCustomType(false);
                }}
                aria-pressed={on}
                className={`relative flex min-h-[72px] flex-col items-start justify-center gap-1 rounded-2xl border-b-4 bg-gradient-to-br px-3.5 py-3 text-left text-white transition-all duration-200 ${getCategory3D(c.slug)} ${
                  on
                    ? "-translate-y-1 scale-[1.03] shadow-xl ring-4 ring-white outline outline-2 outline-zinc-900/10"
                    : "opacity-60 saturate-50 hover:opacity-90 hover:saturate-100"
                }`}
              >
                <span className="text-2xl leading-none drop-shadow">{st.icon}</span>
                <span className="text-sm font-extrabold leading-snug sm:text-base">{c.name}</span>
                {on && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-zinc-900">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Step>

      {/* Шаг 2: подкатегория — отдельная область цвета выбранного направления */}
      {categorySlug && (
        <section
          className="mt-5 rounded-2xl border-2 border-dashed p-4 sm:p-5"
          style={{ borderColor: accent, backgroundColor: `${accent}12` }}
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white shadow-md"
              style={{ backgroundColor: accent }}
            >
              2
            </span>
            <div>
              <h3 className="text-lg font-extrabold leading-tight text-zinc-900">Что именно вы делаете</h3>
              <p className="mt-0.5 text-sm text-zinc-600">
                Подкатегория внутри направления «{CATEGORIES.find((c) => c.slug === categorySlug)?.name}».
              </p>
            </div>
          </div>
          {typesLoading && <p className="mt-3 text-sm text-zinc-500">Загружаем варианты…</p>}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {subcategories.map((sub) => {
              const on = subcategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setSubcategory(sub);
                    setResultTypeSlug("");
                  }}
                  aria-pressed={on}
                  className="min-h-[48px] rounded-xl border-2 px-4 py-2.5 text-base font-bold transition-all"
                  style={
                    on
                      ? { backgroundColor: accent, borderColor: accent, color: "#fff", boxShadow: `0 8px 18px -8px ${accent}` }
                      : { backgroundColor: "#fff", borderColor: `${accent}66`, color: "#27272a" }
                  }
                >
                  {on ? "✓ " : ""}
                  {sub}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Шаг 3: тип результата */}
      {categorySlug && subcategory && (
        <Step n={3} title="Тип результата" hint="Что именно получит заказчик. Выберите из списка или предложите свой.">
          {!useCustomType && (
            <div className="flex flex-col gap-2.5">
              {resultTypes.map((t) => {
                const on = resultTypeSlug === t.slug;
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setResultTypeSlug(t.slug)}
                    aria-pressed={on}
                    className={`flex min-h-[56px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      on ? "border-indigo-600 bg-indigo-50 shadow-md" : "border-zinc-300 bg-white hover:border-indigo-300"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                        on ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span>
                      <span className="block text-base font-bold text-zinc-900">{t.title}</span>
                      {t.scopeLabel && <span className="block text-sm text-zinc-500">{t.scopeLabel}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setUseCustomType((v) => !v);
              setResultTypeSlug("");
            }}
            className="mt-3 min-h-[48px] w-full rounded-xl border-2 border-dashed border-zinc-400 px-4 py-2.5 text-base font-semibold text-zinc-700 hover:border-indigo-500 hover:text-indigo-700"
          >
            {useCustomType ? "← Выбрать из списка" : "＋ Нет нужного? Предложить свой тип (на модерацию)"}
          </button>

          {useCustomType && (
            <div className="mt-3 flex flex-col gap-3">
              <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Название услуги" className={field} />
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Подробное описание — что входит в результат, для кого он (от 20 знаков)"
                rows={3}
                className={field}
              />
              <p className="text-sm text-zinc-500">Новый тип проверит команда площадки, обычно до 24 часов.</p>
            </div>
          )}
        </Step>
      )}

      {/* Шаг 4: условия */}
      <Step n={4} title="Цена и условия">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-base font-bold text-zinc-800">Цена, ₽</p>
            <div className="mb-2 grid grid-cols-2 gap-2">
              {([["from", "от"], ["fixed", "фиксированная"]] as const).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setPriceType(k)} aria-pressed={priceType === k} className={choice(priceType === k)}>
                  {label}
                </button>
              ))}
            </div>
            <input type="number" min={0} inputMode="numeric" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} placeholder="например, 60000" className={field} />
            <p className="mt-1.5 text-sm text-zinc-500">Цену назначаете вы сами — площадка её не диктует.</p>
          </div>

          <div>
            <p className="mb-1.5 text-base font-bold text-zinc-800">Срок выполнения</p>
            <input type="text" value={durationFrom} onChange={(e) => setDurationFrom(e.target.value)} placeholder="например, от 10 дней" className={field} />
            <p className="mt-1.5 text-sm text-zinc-500">Через сколько заказчик получит результат.</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-amber-50 p-3 sm:p-4">
          <p className="text-base font-bold text-zinc-900">Доработки после сдачи</p>
          <p className="mt-0.5 text-sm text-zinc-600">
            Сколько раз вы <b>бесплатно</b> поправите результат по замечаниям заказчика уже после того, как сдали работу.
            Заказчик видит это на карточке — так он заранее знает, на что рассчитывать. Если доработки платные — выберите «Без доработок».
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {([["none", "Без доработок"], ["1", "1 раз"], ["2", "2 раза"], ["3", "3 раза"], ["other", "Другое число"]] as const).map(([k, label]) => (
              <button key={k} type="button" onClick={() => pickRevisions(k)} aria-pressed={revisionKey === k} className={choice(revisionKey === k)}>
                {label}
              </button>
            ))}
          </div>
          {revisionKey === "other" && (
            <input type="number" min={1} inputMode="numeric" value={revisionsCount} onChange={(e) => setRevisionsCount(e.target.value)} className={`${field} mt-3 max-w-[140px]`} />
          )}
        </div>

        <div className="mt-5">
          <p className="text-base font-bold text-zinc-800">Метки</p>
          <p className="text-sm text-zinc-500">Отметьте всё, что про вас верно.</p>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {SELF_DECLARABLE_TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={tags.includes(tag)} className={choice(tags.includes(tag))}>
                {tags.includes(tag) ? "✓ " : ""}
                {SERVICE_TAG_LABELS[tag]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-zinc-500">«Проверенный исполнитель» и «Топ-исполнитель» присваивает площадка сама.</p>
        </div>

        <div className="mt-5">
          <p className="text-base font-bold text-zinc-800">Краткое УТП — одна строка</p>
          <p className="mb-1.5 text-sm text-zinc-500">Чем вы лучше других, одной фразой.</p>
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={120} placeholder="Доводит клиента до сделки или передаёт менеджеру" className={field} />
          {hasOffPlatformContact && (
            <p className="mt-1.5 text-sm font-semibold text-red-600">
              Похоже на контакт для ухода со сделки (телефон, почта, телеграм) — уберите его из текста.
            </p>
          )}
        </div>
      </Step>

      {/* Шаг 5: пример результата */}
      <Step n={5} title="Пример результата" hint="Фото или скриншот вашей работы — система сама подрежет и наложит цвет направления.">
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-4 text-center transition hover:bg-indigo-50 sm:flex-row sm:text-left">
          <div
            className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-4xl text-white ${
              previewImage ? "" : `bg-gradient-to-br ${style.gradient}`
            }`}
          >
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- локальный object URL
              <img src={previewImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              style.icon
            )}
          </div>
          <div>
            <span className="inline-block rounded-full bg-indigo-600 px-5 py-2.5 text-base font-bold text-white shadow-md shadow-indigo-500/30">
              {previewImage ? "Заменить файл" : "Выбрать файл"}
            </span>
            <p className="mt-1.5 text-sm text-zinc-500">{previewImageFile ? previewImageFile.name : "Файл не выбран"}</p>
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
        </label>
      </Step>

      {/* Автопроверка */}
      <section className="mt-5 rounded-2xl border-2 border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold text-zinc-900">Автопроверка</h3>
          <span className="text-base font-bold text-zinc-600">
            {doneCount} из {checklist.length}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(doneCount / checklist.length) * 100}%` }}
          />
        </div>
        <ul className="mt-3 flex flex-col gap-1.5">
          {checklist.map((item) => (
            <li key={item.label} className={`flex items-start gap-2 text-sm sm:text-base ${item.ok ? "font-semibold text-emerald-700" : "text-zinc-500"}`}>
              <span className="mt-0.5">{item.ok ? "✅" : "⬜"}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      {submitError && <p className="mt-3 text-base font-semibold text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-5 min-h-[56px] w-full rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-r from-emerald-500 to-lime-500 py-3 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:border-zinc-400 disabled:from-zinc-300 disabled:to-zinc-300 disabled:shadow-none"
      >
        {submitting ? "Сохраняем…" : useCustomType ? "🚀 Отправить на модерацию" : "🚀 Опубликовать"}
      </button>
    </form>
  );
}
