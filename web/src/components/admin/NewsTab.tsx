"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pbClient } from "@/lib/auth-client";
import {
  KIND_LABELS, STATUS_LABELS, deleteNews, fetchAdminNews, formatNewsDate, saveNews, slugify, uploadNewsImage,
  type NewsDraft, type NewsKind, type NewsPost, type NewsStatus,
} from "@/lib/news";
import NewsBody from "@/components/news/NewsBody";

// Вкладка «Новости» в /admin (только admin): список публикаций и редактор.
// Текст — Markdown с кнопками форматирования над полем (заголовки трёх
// уровней, жирный, курсив, цитата, списки, ссылка, фото), рядом — живой
// предпросмотр тем же компонентом, что рисует страницу на сайте.

function toLocalInput(iso: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const emptyDraft = (): NewsDraft => ({
  title: "", slug: "", kind: "news", excerpt: "", body: "", status: "draft",
  publishedAt: toLocalInput(""), thumbnail: null, removeThumbnail: false,
});

const inputClass = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Editor({ post, onClose, onSaved }: { post: NewsPost | null; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<NewsDraft>(() =>
    post
      ? {
          title: post.title, slug: post.slug, kind: post.kind, excerpt: post.excerpt, body: post.body, status: post.status,
          publishedAt: toLocalInput(post.publishedAt), thumbnail: null, removeThumbnail: false,
        }
      : emptyDraft()
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [preview, setPreview] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thumbPreview, setThumbPreview] = useState<string | null>(post?.thumbUrl ?? null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function patch(p: Partial<NewsDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function setBody(next: string, selStart: number, selEnd: number) {
    patch({ body: next });
    requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      }
    });
  }

  // Обернуть выделение (или подставить заготовку): **жирный**, *курсив*
  function wrap(before: string, after: string, placeholder: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const chosen = draft.body.slice(s, e) || placeholder;
    const next = draft.body.slice(0, s) + before + chosen + after + draft.body.slice(e);
    setBody(next, s + before.length, s + before.length + chosen.length);
  }

  // Поставить префикс в начало каждой выбранной строки: "## ", "> ", "- "
  function prefixLines(prefix: string, placeholder: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = draft.body.lastIndexOf("\n", s - 1) + 1;
    const chosen = draft.body.slice(lineStart, e) || placeholder;
    const lines = chosen.split("\n").map((l) => (l.startsWith(prefix) ? l : prefix + l.replace(/^#{1,6}\s+/, ""))).join("\n");
    const lead = lineStart > 0 && draft.body[lineStart - 1] !== "\n" ? "\n" : "";
    const next = draft.body.slice(0, lineStart) + lead + lines + draft.body.slice(e);
    setBody(next, lineStart + lead.length, lineStart + lead.length + lines.length);
  }

  function insertText(text: string) {
    const el = bodyRef.current;
    const s = el ? el.selectionStart : draft.body.length;
    const e = el ? el.selectionEnd : draft.body.length;
    setBody(draft.body.slice(0, s) + text + draft.body.slice(e), s + text.length, s + text.length);
  }

  async function insertImage(file: File) {
    setBusy(true);
    setError("");
    try {
      const url = await uploadNewsImage(pbClient, file);
      const caption = window.prompt("Подпись под фото (можно оставить пустой):", "") ?? "";
      insertText(`\n\n![${caption.replace(/[\[\]]/g, "")}](${url})\n\n`);
    } catch (err) {
      setError(`Не удалось загрузить фото: ${err instanceof Error ? err.message : "ошибка"}`);
    } finally {
      setBusy(false);
    }
  }

  async function submit(status: NewsStatus) {
    if (!draft.title.trim()) return setError("Укажите заголовок.");
    if (!draft.body.trim()) return setError("Текст пустой.");
    setBusy(true);
    setError("");
    try {
      await saveNews(pbClient, post?.id ?? null, { ...draft, status });
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ошибка";
      setError(`Не удалось сохранить: ${msg}. Если ссылка (slug) уже занята другой публикацией — измените её.`);
      setBusy(false);
    }
  }

  const tool = "rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-900">{post ? "Редактирование" : "Новая публикация"}</h2>
        <button type="button" onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-900">← к списку</button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-zinc-500">Заголовок</span>
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
            className={inputClass}
            maxLength={200}
          />
        </label>
        <label>
          <span className="text-xs font-medium text-zinc-500">Ссылка (slug) — naidii.ru/news/…</span>
          <input value={draft.slug} onChange={(e) => { setSlugTouched(true); patch({ slug: e.target.value }); }} className={inputClass} maxLength={120} />
        </label>
        <div>
          <span className="text-xs font-medium text-zinc-500">Рубрика</span>
          <div className="mt-1 flex gap-2">
            {(["news", "article"] as NewsKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => patch({ kind: k })}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${draft.kind === k ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}
              >
                {KIND_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-zinc-500">Анонс (показывается на карточке и под заголовком, до 400 знаков)</span>
          <textarea value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} rows={2} maxLength={400} className={inputClass} />
        </label>

        <div>
          <span className="text-xs font-medium text-zinc-500">Миниатюра (обложка)</span>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-[11px] text-zinc-400">
              {thumbPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbPreview} alt="" className="h-full w-full object-cover" />
              ) : "нет"}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  patch({ thumbnail: f, removeThumbnail: false });
                  setThumbPreview(f ? URL.createObjectURL(f) : post?.thumbUrl ?? null);
                }}
              />
              {thumbPreview && (
                <button
                  type="button"
                  onClick={() => { patch({ thumbnail: null, removeThumbnail: true }); setThumbPreview(null); }}
                  className="self-start text-red-600 underline"
                >
                  убрать миниатюру
                </button>
              )}
            </div>
          </div>
        </div>
        <label>
          <span className="text-xs font-medium text-zinc-500">Дата и время публикации (можно в будущем — выйдет само)</span>
          <input type="datetime-local" value={draft.publishedAt} onChange={(e) => patch({ publishedAt: e.target.value })} className={inputClass} />
        </label>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-zinc-500">Текст</span>
          <button type="button" className={tool} onClick={() => prefixLines("## ", "Крупный заголовок")}>Заголовок</button>
          <button type="button" className={tool} onClick={() => prefixLines("### ", "Подзаголовок")}>Подзаголовок</button>
          <button type="button" className={tool} onClick={() => prefixLines("#### ", "Мелкий подзаголовок")}>Мелкий</button>
          <button type="button" className={`${tool} font-bold`} onClick={() => wrap("**", "**", "жирный текст")}>Ж</button>
          <button type="button" className={`${tool} italic`} onClick={() => wrap("*", "*", "курсив")}>К</button>
          <button type="button" className={tool} onClick={() => prefixLines("> ", "Цитата")}>Цитата</button>
          <button type="button" className={tool} onClick={() => prefixLines("- ", "Пункт списка")}>• Список</button>
          <button type="button" className={tool} onClick={() => prefixLines("1. ", "Пункт списка")}>1. Список</button>
          <button type="button" className={tool} onClick={() => {
            const url = window.prompt("Адрес ссылки (https://…):", "https://");
            if (url) wrap("[", `](${url})`, "текст ссылки");
          }}>Ссылка</button>
          <button type="button" className={tool} onClick={() => insertText("\n\n---\n\n")}>Разделитель</button>
          <button type="button" className={`${tool} border-blue-300 bg-blue-50 text-blue-800`} disabled={busy} onClick={() => imageInputRef.current?.click()}>🖼 Фото в текст</button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void insertImage(f);
            }}
          />
          <label className="ml-auto flex items-center gap-1.5 text-xs text-zinc-600">
            <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} /> предпросмотр
          </label>
        </div>

        <div className={`mt-2 grid gap-4 ${preview ? "lg:grid-cols-2" : ""}`}>
          <textarea
            ref={bodyRef}
            value={draft.body}
            onChange={(e) => patch({ body: e.target.value })}
            rows={22}
            className={`${inputClass} font-mono leading-relaxed`}
            placeholder={"## Заголовок раздела\n\nОбычный абзац. Можно **жирный**, *курсив*, [ссылку](https://…).\n\n### Подзаголовок\n\n> Цитата\n\n- пункт списка"}
          />
          {preview && (
            <div className="max-h-[560px] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-5">
              {draft.body.trim() ? <NewsBody body={draft.body} /> : <p className="text-sm text-zinc-400">Здесь появится предпросмотр.</p>}
            </div>
          )}
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">
          Заголовки: ## крупный, ### средний, #### мелкий. **жирный**, *курсив*, ***жирный курсив***. Подпись под фото — текст в квадратных
          скобках: ![подпись](ссылка). Пустая строка между абзацами.
        </p>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => submit("published")} className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
          {busy ? "Сохраняем…" : post?.status === "published" ? "Сохранить" : "Опубликовать"}
        </button>
        <button type="button" disabled={busy} onClick={() => submit("draft")} className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:border-zinc-500 disabled:opacity-50">
          Сохранить как черновик
        </button>
        <button type="button" onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-900">Отмена</button>
      </div>
    </div>
  );
}

export default function NewsTab() {
  const [posts, setPosts] = useState<NewsPost[] | null>(null);
  const [editing, setEditing] = useState<NewsPost | "new" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setPosts(await fetchAdminNews(pbClient));
      setError("");
    } catch {
      setError("Не удалось загрузить список. Если раздел только что добавлен — проверьте, что миграция news_posts применена.");
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(p: NewsPost) {
    if (!window.confirm(`Удалить «${p.title}» насовсем?`)) return;
    try {
      await deleteNews(pbClient, p.id);
      await load();
    } catch {
      setError("Не удалось удалить.");
    }
  }

  if (editing) {
    return (
      <Editor
        post={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); void load(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">Новости и статьи. Публикуют только админы.</p>
        <button type="button" onClick={() => setEditing("new")} className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">
          + Новая публикация
        </button>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs text-zinc-500">
              <th className="px-3 py-2 font-medium">Публикация</th>
              <th className="px-3 py-2 font-medium">Рубрика</th>
              <th className="px-3 py-2 font-medium">Статус</th>
              <th className="px-3 py-2 font-medium">Дата</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {posts === null && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-zinc-400">Загрузка…</td></tr>
            )}
            {posts?.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-zinc-400">Публикаций пока нет.</td></tr>
            )}
            {posts?.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 align-middle">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-zinc-100">
                      {p.thumbUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    {p.status === "published" ? (
                      <Link href={`/news/${p.slug}`} target="_blank" className="font-medium text-zinc-900 underline">{p.title}</Link>
                    ) : (
                      <span className="font-medium text-zinc-700">{p.title}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-700">{KIND_LABELS[p.kind]}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${p.status === "published" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-zinc-300 bg-white text-zinc-600"}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-500">{formatNewsDate(p.publishedAt)}</td>
                <td className="px-3 py-2 text-right text-xs">
                  <button type="button" onClick={() => setEditing(p)} className="mr-3 text-blue-700 underline">править</button>
                  <button type="button" onClick={() => remove(p)} className="text-red-600 underline">удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
