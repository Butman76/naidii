import type PocketBase from "pocketbase";
import { mapPost, slugify, type NewsPost } from "./news";

// Блог специалиста (миграция 1755000070, хук pb_hooks/news_blog.pb.js).
// Здесь — то, что нужно кабинету: частота публикаций по тарифу (подсказка
// автору; настоящая проверка — на сервере, в хуке, числа там дублируются:
// pb_hooks/news_blog_lib.js), чтение своих статей и отправка/правка.

export const BLOG_MIN_BODY = 600;
export const BLOG_MIN_EXCERPT = 40;
export const BLOG_MIN_TITLE = 10;

const HOUR = 3600 * 1000;

/** Минимальный интервал между статьями, часы: enterprise — 24, pro — 72, остальные — 168. */
export function blogIntervalHours(planCode: string, activeUntil: string): number {
  let code = planCode;
  if (activeUntil) {
    const t = new Date(activeUntil.replace(" ", "T")).getTime();
    if (!Number.isNaN(t) && t <= Date.now()) code = "";
  }
  if (code === "enterprise") return 24;
  if (code === "pro") return 72;
  return 168;
}

export function blogLimitLabel(hours: number): string {
  if (hours <= 24) return "1 статья в сутки";
  if (hours <= 72) return "1 статья в 3 дня";
  return "1 статья в неделю";
}

/** Когда автор сможет отправить следующую статью (null — уже можно). Отклонённые не считаются. */
export function nextBlogPostAt(posts: NewsPost[], hours: number): Date | null {
  const times = posts
    .filter((p) => p.status !== "rejected")
    .map((p) => new Date(p.created.replace(" ", "T")).getTime())
    .filter((t) => !Number.isNaN(t));
  if (times.length === 0) return null;
  const next = Math.max(...times) + hours * HOUR;
  return next > Date.now() ? new Date(next) : null;
}

export async function fetchOwnBlogPosts(pb: PocketBase, profileId: string): Promise<NewsPost[]> {
  const records = await pb.collection("news_posts").getFullList({
    filter: pb.filter("author_profile_id = {:id}", { id: profileId }),
    sort: "-created",
    requestKey: null,
  });
  return records.map((r) => mapPost(pb, r));
}

export interface BlogDraft {
  title: string;
  excerpt: string;
  body: string;
  thumbnail: File | null;
  removeThumbnail: boolean;
}

// Создание (id = null) и правка/повторная отправка. Статус всегда pending —
// выпускает админ после проверки.
export async function submitBlogPost(
  pb: PocketBase,
  params: { id: string | null; profileId: string; draft: BlogDraft }
): Promise<void> {
  const { id, profileId, draft } = params;
  const form = new FormData();
  form.set("title", draft.title.trim());
  form.set("excerpt", draft.excerpt.trim());
  form.set("body", draft.body);
  form.set("status", "pending");
  if (draft.thumbnail) form.set("thumbnail", draft.thumbnail);
  else if (draft.removeThumbnail) form.set("thumbnail", "");
  if (id) {
    await pb.collection("news_posts").update(id, form);
    return;
  }
  form.set("kind", "article");
  form.set("author_profile_id", profileId);
  form.set("slug", `${slugify(draft.title).slice(0, 80)}-${Math.random().toString(36).slice(2, 7)}`);
  await pb.collection("news_posts").create(form);
}

export async function deleteBlogPost(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("news_posts").delete(id);
}

// Сообщение для автора: понятные тексты проверок хука приходят как есть, а
// общие ответы PocketBase ("Failed to create record.") заменяем своим.
export function blogErrorMessage(err: unknown): string {
  const message = (err as { response?: { message?: string } } | null)?.response?.message ?? "";
  if (message && !/^Failed to (create|update)/i.test(message)) return message;
  return "Не получилось отправить статью. Проверьте, что профиль опубликован и лимит по тарифу не исчерпан, и попробуйте снова.";
}
