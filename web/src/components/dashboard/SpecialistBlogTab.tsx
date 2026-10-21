"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { pbClient } from "@/lib/auth-client";
import MarkdownEditor from "@/components/MarkdownEditor";
import { STATUS_LABELS, formatNewsDate, type NewsPost, type NewsStatus } from "@/lib/news";
import {
  BLOG_MIN_BODY,
  BLOG_MIN_EXCERPT,
  BLOG_MIN_TITLE,
  blogErrorMessage,
  blogIntervalHours,
  blogLimitLabel,
  deleteBlogPost,
  fetchOwnBlogPosts,
  nextBlogPostAt,
  submitBlogPost,
} from "@/lib/blog";

// Вкладка «Блог» в кабинете специалиста. Статья уходит на модерацию, после
// одобрения выходит в общей ленте /news (с пометкой «От компании») и в блоке
// «Блог» на странице профиля. Правила — /blog-rules; проверки (частота по
// тарифу, контакты, ссылки, длина) выполняет сервер, здесь они только
// подсказываются.

const STATUS_STYLE: Record<NewsStatus, string> = {
  draft: "border-zinc-300 bg-zinc-50 text-zinc-600",
  published: "border-emerald-300 bg-emerald-50 text-emerald-800",
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  rejected: "border-red-300 bg-red-50 text-red-700",
};

function formatDateTime(d: Date): string {
  return d.toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" });
}

function EditorModal({
  post,
  profileId,
  onClose,
  onSaved,
}: {
  post: NewsPost | null;
  profileId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | null>(post?.thumbUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const problems = [
    ...(title.trim().length < BLOG_MIN_TITLE ? [`Заголовок — от ${BLOG_MIN_TITLE} знаков`] : []),
    ...(excerpt.trim().length < BLOG_MIN_EXCERPT ? [`Подводка — от ${BLOG_MIN_EXCERPT} знаков`] : []),
    ...(body.trim().length < BLOG_MIN_BODY ? [`Текст — от ${BLOG_MIN_BODY} знаков (сейчас ${body.trim().length})`] : []),
  ];

  async function handleSubmit() {
    if (problems.length > 0 || busy) return;
    setBusy(true);
    setError("");
    try {
      await submitBlogPost(pbClient, { id: post?.id ?? null, profileId, draft: { title, excerpt, body, thumbnail, removeThumbnail } });
      onSaved();
      onClose();
    } catch (err) {
      setError(blogErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-900/70 p-2 sm:p-6" role="dialog" aria-modal="true" aria-label="Статья блога">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 px-4 py-3 sm:px-6">
          <div>
            <p className="text-base font-bold text-zinc-900">{post ? "Правка статьи" : "Новая статья"}</p>
            <p className="text-xs text-zinc-500">После отправки статью проверяет редакция. Правила — на странице «Правила блога».</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border-2 border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-500">
            Закрыть
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {post?.status === "rejected" && (
            <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-bold">Статья отклонена</p>
              <p className="mt-0.5">{post.moderationNote || "Причина не указана."}</p>
              <p className="mt-1">Исправьте и отправьте снова: ожидание по лимиту при этом не нужно.</p>
            </div>
          )}

          <details className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-sm text-indigo-900">
            <summary className="cursor-pointer font-semibold">Коротко о правилах</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Блог о пользе: разборы, кейсы, объяснения, обзоры инструментов. Откровенная реклама не публикуется.</li>
              <li>Нужна подводка: о чём статья и чем она полезна читателю. Начинайте с темы и проблемы читателя, о компании расскажите в конце.</li>
              <li>Без телефонов, e-mail, @-ников и ссылок на сторонние сайты и мессенджеры, без картинок внутри текста. Читатель переходит в ваш профиль на НайдИИ.</li>
              <li>Только свои тексты, без обещаний гарантированного результата без подтверждений.</li>
            </ul>
          </details>

          <label className="block">
            <span className="text-sm font-bold text-zinc-800">Заголовок</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={field} placeholder="Например: Как AI-агент квалифицирует заявки в отделе продаж" />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-zinc-800">Подводка</span>
            <span className="ml-2 text-xs text-zinc-500">1–2 предложения: о чём статья и чем она полезна читателю (до 400 знаков)</span>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={400} className={field} />
          </label>

          <div className="mt-4">
            <span className="text-sm font-bold text-zinc-800">Обложка (по желанию)</span>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-[11px] text-indigo-300">
                {thumbPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  "нет"
                )}
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setThumbnail(f);
                    setRemoveThumbnail(false);
                    setThumbPreview(f ? URL.createObjectURL(f) : post?.thumbUrl ?? null);
                  }}
                />
                {thumbPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setRemoveThumbnail(true);
                      setThumbPreview(null);
                    }}
                    className="self-start text-red-600 underline"
                  >
                    убрать обложку
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <MarkdownEditor value={body} onChange={setBody} label="Текст статьи" rows={18} />
          </div>

          {problems.length > 0 && (
            <ul className="mt-4 list-disc space-y-0.5 pl-5 text-sm text-amber-800">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={problems.length > 0 || busy}
              className="min-h-[52px] rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 px-8 text-base font-extrabold text-white shadow-lg shadow-fuchsia-500/30 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Отправляем…" : "Отправить на модерацию"}
            </button>
            <button type="button" onClick={onClose} className="min-h-[52px] rounded-full border-2 border-zinc-300 bg-white px-6 text-base font-semibold text-zinc-700 hover:border-zinc-500">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpecialistBlogTab({
  profileId,
  profileStatus,
  planCode,
  activeUntil,
}: {
  profileId: string;
  profileStatus: string;
  planCode: string;
  activeUntil: string;
}) {
  const [posts, setPosts] = useState<NewsPost[] | null>(null);
  const [editing, setEditing] = useState<NewsPost | "new" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setPosts(await fetchOwnBlogPosts(pbClient, profileId));
      setError("");
    } catch {
      setError("Не удалось загрузить статьи. Попробуйте обновить страницу.");
      setPosts([]);
    }
  }, [profileId]);

  useEffect(() => {
    void load();
  }, [load]);

  const hours = blogIntervalHours(planCode, activeUntil);
  const wait = posts ? nextBlogPostAt(posts, hours) : null;
  const published = profileStatus === "published";

  async function remove(p: NewsPost) {
    if (!window.confirm(`Удалить статью «${p.title}»?`)) return;
    try {
      await deleteBlogPost(pbClient, p.id);
      await load();
    } catch {
      setError("Не получилось удалить статью.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-zinc-900">Блог компании</p>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Пишите о пользе автоматизации и ИИ: разборы, кейсы, обзоры инструментов. Статья после проверки выходит в разделе «Новости и статьи» и в вашем профиле.{" "}
              <Link href="/blog-rules" className="font-medium text-indigo-700 underline">Правила блога</Link>
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Ваш лимит: <span className="font-semibold">{blogLimitLabel(hours)}</span>.{" "}
              {!published
                ? "Блог откроется после публикации вашего профиля в каталоге."
                : wait
                  ? `Следующую статью можно отправить после ${formatDateTime(wait)} (МСК).`
                  : "Можно отправить статью сейчас."}
            </p>
          </div>
          <button
            type="button"
            disabled={!published || Boolean(wait)}
            onClick={() => setEditing("new")}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Написать статью
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {posts === null && <p className="text-sm text-zinc-500">Загружаем…</p>}
      {posts?.length === 0 && <p className="text-sm text-zinc-500">Статей пока нет.</p>}

      {posts?.map((p) => {
        const editable = p.status === "pending" || p.status === "rejected";
        return (
          <article key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${STATUS_STYLE[p.status]}`}>{STATUS_LABELS[p.status]}</span>
              <span className="text-zinc-500">{formatNewsDate(p.created)}</span>
            </div>
            <p className="mt-2 text-base font-bold text-zinc-900">{p.title}</p>
            {p.excerpt && <p className="mt-1 text-sm text-zinc-600">{p.excerpt}</p>}
            {p.status === "rejected" && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Причина отказа: {p.moderationNote || "не указана"}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {p.status === "published" && (
                <Link href={`/news/${p.slug}`} className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
                  Открыть на сайте
                </Link>
              )}
              {editable && (
                <>
                  <button type="button" onClick={() => setEditing(p)} className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">
                    {p.status === "rejected" ? "Исправить и отправить заново" : "Править"}
                  </button>
                  <button type="button" onClick={() => void remove(p)} className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Удалить
                  </button>
                </>
              )}
            </div>
          </article>
        );
      })}

      {editing && (
        <EditorModal
          post={editing === "new" ? null : editing}
          profileId={profileId}
          onClose={() => setEditing(null)}
          onSaved={() => void load()}
        />
      )}
    </div>
  );
}
