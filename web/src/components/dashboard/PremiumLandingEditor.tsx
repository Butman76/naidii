"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { embedVideoUrl } from "@/lib/video-embed";
import {
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  buildSlots,
  deleteLandingSlot,
  fetchOwnLandingItems,
  saveLandingItem,
  type LandingItem,
  type LandingKind,
  type LandingSlot,
} from "@/lib/landing";

// Оформление лендинга для специалистов на тарифе enterprise (см.
// PremiumSpecialistProfile.tsx): обложка, логотип, видео, карточки услуг,
// портфолио (фото), презентации. ВСЁ проходит модерацию (2026-09-20):
// автор сохраняет -> элемент уходит на проверку -> публично появляется
// только после одобрения. Правка уже одобренного не убирает его с сайта на
// время проверки — пока на сайте прежняя версия (см. lib/landing.ts, слот
// live/draft). Серверная сторона (владелец не может сам себя одобрить):
// pocketbase/pb_hooks/landing_moderation.pb.js.

function explainError(err: unknown): string {
  const anyErr = err as { response?: { data?: Record<string, { message?: string }> }; message?: string };
  const data = anyErr?.response?.data;
  if (data) {
    const first = Object.values(data)[0];
    if (first?.message) return first.message;
  }
  return "Не получилось сохранить — попробуйте ещё раз.";
}

function slotStatus(slot: LandingSlot): { text: string; tone: "ok" | "wait" | "bad" } {
  const draft = slot.draft;
  if (draft?.status === "rejected") {
    return {
      text:
        "Отклонено модератором" +
        (draft.rejectReason ? `: ${draft.rejectReason}` : "") +
        ". Исправьте и отправьте снова." +
        (slot.live ? " На сайте пока прежняя версия." : ""),
      tone: "bad",
    };
  }
  if (draft?.status === "pending") {
    return {
      text: slot.live
        ? "Правки на проверке — на сайте пока прежняя версия"
        : "На проверке — на сайте появится после одобрения",
      tone: "wait",
    };
  }
  return { text: "Опубликовано на лендинге", tone: "ok" };
}

const TONE_CLASSES = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  wait: "bg-amber-50 text-amber-800 ring-amber-200",
  bad: "bg-red-50 text-red-700 ring-red-200",
} as const;

function StatusChip({ slot }: { slot: LandingSlot }) {
  const { text, tone } = slotStatus(slot);
  return (
    <p className={`mt-2 rounded-lg px-2.5 py-1.5 text-xs leading-snug ring-1 ring-inset ${TONE_CLASSES[tone]}`}>
      {text}
    </p>
  );
}

function checkFile(file: File, kind: "image" | "document"): string | null {
  const limit = kind === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (file.size > limit) {
    return `Файл слишком большой — максимум ${Math.round(limit / 1024 / 1024)} МБ.`;
  }
  return null;
}

const SECTION = "rounded-2xl border border-zinc-200 bg-white p-5";
const BTN_PRIMARY =
  "rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300";
const BTN_GHOST =
  "rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";
const INPUT =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none";

// ------------------------------------------------- обложка и логотип

function SingleImageSection({
  kind,
  title,
  help,
  previewClass,
  items,
  profileId,
  onChanged,
  onError,
}: {
  kind: "cover" | "logo";
  title: string;
  help: string;
  previewClass: string;
  items: LandingItem[];
  profileId: string;
  onChanged: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const slot = buildSlots(items, kind)[0] ?? null;
  const [busy, setBusy] = useState(false);
  const shown = slot?.draft ?? slot?.live ?? null;

  async function upload(file: File) {
    const problem = checkFile(file, "image");
    if (problem) return onError(problem);
    setBusy(true);
    onError(null);
    try {
      await saveLandingItem(pbClient, { profileId, kind, slot, input: { image: file } });
      await onChanged();
    } catch (err) {
      onError(explainError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!slot) return;
    setBusy(true);
    try {
      await deleteLandingSlot(pbClient, slot);
      await onChanged();
    } catch (err) {
      onError(explainError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={SECTION}>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{help}</p>
      {shown?.thumbUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown.thumbUrl} alt="" className={`mt-3 border border-zinc-200 object-cover ${previewClass}`} />
      )}
      {slot && <StatusChip slot={slot} />}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className={`${BTN_GHOST} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {slot ? "Загрузить другую" : "Загрузить"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload(file);
            }}
          />
        </label>
        {slot && (
          <button type="button" onClick={remove} disabled={busy} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40">
            {slot.live ? "Убрать с лендинга" : "Отменить"}
          </button>
        )}
        {busy && <span className="text-xs text-zinc-400">Сохраняем…</span>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ видео

function VideoSection({
  items,
  profileId,
  onChanged,
  onError,
}: {
  items: LandingItem[];
  profileId: string;
  onChanged: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const slot = buildSlots(items, "video")[0] ?? null;
  const current = slot?.draft ?? slot?.live ?? null;
  const [url, setUrl] = useState(current?.videoUrl ?? "");
  const [busy, setBusy] = useState(false);
  const embed = url ? embedVideoUrl(url) : null;
  const unchanged = url.trim() === (current?.videoUrl ?? "");

  async function save() {
    setBusy(true);
    onError(null);
    try {
      await saveLandingItem(pbClient, { profileId, kind: "video", slot, input: { videoUrl: url.trim() } });
      await onChanged();
    } catch (err) {
      onError(explainError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!slot) return;
    setBusy(true);
    try {
      await deleteLandingSlot(pbClient, slot);
      setUrl("");
      await onChanged();
    } catch (err) {
      onError(explainError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={SECTION}>
      <p className="text-sm font-semibold text-zinc-900">Видео-презентация</p>
      <p className="mt-1 text-xs text-zinc-500">Ссылка на YouTube или RuTube.</p>
      <div className="mt-3 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className={`${INPUT} flex-1`}
        />
        <button type="button" onClick={save} disabled={busy || !url.trim() || unchanged} className={BTN_PRIMARY}>
          Отправить на проверку
        </button>
      </div>
      {url && !embed && (
        <p className="mt-2 text-xs text-amber-600">Ссылка не похожа на YouTube или RuTube — на лендинге видео не покажется.</p>
      )}
      {embed && (
        <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-zinc-900">
          <iframe src={embed} className="h-full w-full" allowFullScreen />
        </div>
      )}
      {slot && <StatusChip slot={slot} />}
      {slot && (
        <button type="button" onClick={remove} disabled={busy} className="mt-2 text-xs font-medium text-red-600 hover:underline disabled:opacity-40">
          {slot.live ? "Убрать с лендинга" : "Отменить"}
        </button>
      )}
    </div>
  );
}

// ---------------- карточки услуг, портфолио, презентации (списки)

interface KindConfig {
  kind: Extract<LandingKind, "service_card" | "photo" | "presentation">;
  title: string;
  help: string;
  addLabel: string;
  titleLabel: string;
  titleRequired: boolean;
  showDescription: boolean;
  showPriceDuration: boolean;
  image: "required" | "optional";
  showDocument: boolean;
}

const CONFIGS: KindConfig[] = [
  {
    kind: "service_card",
    title: "Карточки услуг",
    help: "Прямоугольные карточки на лендинге: ваша картинка, под ней описание, цена и срок либо рекламный текст.",
    addLabel: "Добавить карточку",
    titleLabel: "Название услуги",
    titleRequired: true,
    showDescription: true,
    showPriceDuration: true,
    image: "required",
    showDocument: false,
  },
  {
    kind: "photo",
    title: "Портфолио — фотографии",
    help: "Скриншоты, фото работ и проектов. Показываются сеткой в разделе «Портфолио».",
    addLabel: "Добавить фото",
    titleLabel: "Подпись",
    titleRequired: false,
    showDescription: false,
    showPriceDuration: false,
    image: "required",
    showDocument: false,
  },
  {
    kind: "presentation",
    title: "Презентации",
    help: "PDF, PPT, PPTX или ODP до 25 МБ. Посетители открывают файл по кнопке; картинка-превью — по желанию.",
    addLabel: "Добавить презентацию",
    titleLabel: "Название презентации",
    titleRequired: true,
    showDescription: true,
    showPriceDuration: false,
    image: "optional",
    showDocument: true,
  },
];

function ItemForm({
  config,
  slot,
  profileId,
  nextSortOrder,
  onDone,
  onCancel,
  onError,
}: {
  config: KindConfig;
  slot: LandingSlot | null;
  profileId: string;
  nextSortOrder: number;
  onDone: () => Promise<void>;
  onCancel: () => void;
  onError: (message: string | null) => void;
}) {
  const base = slot?.draft ?? slot?.live ?? null;
  const [title, setTitle] = useState(base?.title ?? "");
  const [description, setDescription] = useState(base?.description ?? "");
  const [priceText, setPriceText] = useState(base?.priceText ?? "");
  const [durationText, setDurationText] = useState(base?.durationText ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const hasImage = Boolean(imageFile || base?.imageUrl);
  const hasDocument = Boolean(docFile || base?.documentUrl);

  function validate(): string | null {
    if (config.titleRequired && !title.trim()) return `Заполните поле «${config.titleLabel}».`;
    if (config.image === "required" && !hasImage) return "Добавьте картинку.";
    if (config.showDocument && !hasDocument) return "Добавьте файл презентации.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setFormError(problem);
    setBusy(true);
    setFormError(null);
    onError(null);
    try {
      await saveLandingItem(pbClient, {
        profileId,
        kind: config.kind,
        slot,
        sortOrder: nextSortOrder,
        input: {
          title: title.trim(),
          description: config.showDescription ? description.trim() : undefined,
          priceText: config.showPriceDuration ? priceText.trim() : undefined,
          durationText: config.showPriceDuration ? durationText.trim() : undefined,
          image: imageFile,
          document: docFile,
        },
      });
      await onDone();
    } catch (err) {
      setFormError(explainError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1 text-xs font-medium text-zinc-600">
            {config.image === "required" ? "Картинка" : "Картинка-превью (необязательно)"}
          </p>
          {(previewUrl ?? base?.thumbUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl ?? base!.thumbUrl!} alt="" className="mb-2 aspect-[4/3] w-48 rounded-lg border border-zinc-200 object-cover" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-xs text-zinc-600"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                const problem = checkFile(file, "image");
                if (problem) {
                  e.target.value = "";
                  return setFormError(problem);
                }
              }
              setFormError(null);
              setImageFile(file);
            }}
          />
        </div>

        {config.showDocument && (
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-600">Файл презентации</p>
            {base?.documentUrl && !docFile && (
              <p className="mb-1 text-xs text-zinc-500">Сейчас загружен файл — выберите другой, чтобы заменить.</p>
            )}
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.odp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.oasis.opendocument.presentation"
              className="text-xs text-zinc-600"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  const problem = checkFile(file, "document");
                  if (problem) {
                    e.target.value = "";
                    return setFormError(problem);
                  }
                }
                setFormError(null);
                setDocFile(file);
              }}
            />
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder={config.titleLabel}
          className={INPUT}
        />
        {config.showDescription && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={800}
            rows={3}
            placeholder="Описание или рекламный текст"
            className={INPUT}
          />
        )}
        {config.showPriceDuration && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              maxLength={100}
              placeholder="Цена, например: от 50 000 ₽"
              className={INPUT}
            />
            <input
              type="text"
              value={durationText}
              onChange={(e) => setDurationText(e.target.value)}
              maxLength={100}
              placeholder="Срок, например: 5–7 дней"
              className={INPUT}
            />
          </div>
        )}
      </div>

      {formError && <p className="mt-3 text-xs text-red-600">{formError}</p>}
      <p className="mt-3 text-[11px] text-zinc-500">После сохранения элемент уйдёт на проверку модератору.</p>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
          {busy ? "Сохраняем…" : "Отправить на проверку"}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={BTN_GHOST}>
          Отмена
        </button>
      </div>
    </form>
  );
}

function CollectionSection({
  config,
  items,
  profileId,
  onChanged,
  onError,
}: {
  config: KindConfig;
  items: LandingItem[];
  profileId: string;
  onChanged: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const slots = buildSlots(items, config.kind);
  // editing: id слота в работе ("new" — форма добавления)
  const [editing, setEditing] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const nextSortOrder = items.filter((i) => i.kind === config.kind).reduce((m, i) => Math.max(m, i.sortOrder), 0) + 1;
  const slotKey = (s: LandingSlot) => (s.live ?? s.draft)!.id;

  async function remove(slot: LandingSlot) {
    setBusyId(slotKey(slot));
    try {
      await deleteLandingSlot(pbClient, slot);
      await onChanged();
    } catch (err) {
      onError(explainError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={SECTION}>
      <p className="text-sm font-semibold text-zinc-900">{config.title}</p>
      <p className="mt-1 text-xs text-zinc-500">{config.help}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slots.map((slot) => {
          const shown = slot.draft ?? slot.live!;
          const key = slotKey(slot);
          return (
            <div key={key} className="flex flex-col overflow-hidden rounded-xl border border-zinc-200">
              {shown.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shown.thumbUrl} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-zinc-900 text-sm font-bold tracking-wide text-white">
                  {(shown.documentUrl?.split(".").pop() ?? "FILE").toUpperCase()}
                </div>
              )}
              <div className="flex flex-1 flex-col p-3">
                <p className="text-sm font-medium text-zinc-900">{shown.title || "Без названия"}</p>
                {shown.description && <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{shown.description}</p>}
                {(shown.priceText || shown.durationText) && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {shown.priceText}
                    {shown.priceText && shown.durationText ? " · " : ""}
                    {shown.durationText && `Срок: ${shown.durationText}`}
                  </p>
                )}
                <StatusChip slot={slot} />
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  <button type="button" onClick={() => setEditing(key)} disabled={busyId === key} className="text-zinc-700 hover:underline disabled:opacity-40">
                    Изменить
                  </button>
                  <button type="button" onClick={() => remove(slot)} disabled={busyId === key} className="text-red-600 hover:underline disabled:opacity-40">
                    {slot.live ? "Удалить" : "Отменить"}
                  </button>
                </div>
              </div>
              {editing === key && (
                <div className="border-t border-zinc-200 p-3">
                  <ItemForm
                    config={config}
                    slot={slot}
                    profileId={profileId}
                    nextSortOrder={nextSortOrder}
                    onDone={async () => {
                      setEditing(null);
                      await onChanged();
                    }}
                    onCancel={() => setEditing(null)}
                    onError={onError}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {slots.length === 0 && editing !== "new" && (
        <p className="mt-3 text-xs text-zinc-400">Пока ничего нет.</p>
      )}

      {editing === "new" ? (
        <ItemForm
          config={config}
          slot={null}
          profileId={profileId}
          nextSortOrder={nextSortOrder}
          onDone={async () => {
            setEditing(null);
            await onChanged();
          }}
          onCancel={() => setEditing(null)}
          onError={onError}
        />
      ) : (
        <button type="button" onClick={() => setEditing("new")} className={`${BTN_GHOST} mt-4`}>
          + {config.addLabel}
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------- редактор

export default function PremiumLandingEditor({ specialistId }: { specialistId: string }) {
  const [items, setItems] = useState<LandingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(await fetchOwnLandingItems(pbClient, specialistId));
  }, [specialistId]);

  useEffect(() => {
    load().catch(() => setError("Не удалось загрузить лендинг."));
  }, [load]);

  if (!items) {
    return <p className="text-sm text-zinc-500">{error ?? "Загружаем лендинг…"}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">
        Всё, что вы добавляете или меняете здесь, сначала проверяет модератор. Пока проверка идёт, на вашем
        лендинге остаётся прежняя версия; новое появится сразу после одобрения. Статус каждого элемента
        показан под ним.
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <SingleImageSection
        kind="cover"
        title="Обложка"
        help="Широкая картинка вверху лендинга. Рекомендуем горизонтальную, от 1600×500px."
        previewClass="h-32 w-full rounded-lg"
        items={items}
        profileId={specialistId}
        onChanged={load}
        onError={setError}
      />
      <SingleImageSection
        kind="logo"
        title="Логотип"
        help="Показывается поверх обложки вместо инициалов."
        previewClass="h-20 w-20 rounded-2xl"
        items={items}
        profileId={specialistId}
        onChanged={load}
        onError={setError}
      />
      <VideoSection items={items} profileId={specialistId} onChanged={load} onError={setError} />

      {CONFIGS.map((config) => (
        <CollectionSection
          key={config.kind}
          config={config}
          items={items}
          profileId={specialistId}
          onChanged={load}
          onError={setError}
        />
      ))}
    </div>
  );
}
