import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { createPocketBase } from "./pocketbase";

// Раздел «Новости и статьи» (/news, миграция 1755000063). Публикует только
// админ — из вкладки «Новости» в /admin. Текст — Markdown (см. NewsBody.tsx).

export type NewsKind = "news" | "article";
export type NewsStatus = "draft" | "published";

export const KIND_LABELS: Record<NewsKind, string> = { news: "Новость", article: "Статья" };
export const KIND_LABELS_PLURAL: Record<NewsKind, string> = { news: "Новости", article: "Статьи" };
export const STATUS_LABELS: Record<NewsStatus, string> = { draft: "Черновик", published: "Опубликовано" };

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  kind: NewsKind;
  excerpt: string;
  body: string;
  thumbUrl: string | null;
  imageUrl: string | null;
  status: NewsStatus;
  publishedAt: string;
  created: string;
}

function mapPost(pb: PocketBase, r: RecordModel): NewsPost {
  const thumb = typeof r.thumbnail === "string" && r.thumbnail ? (r.thumbnail as string) : "";
  return {
    id: r.id,
    slug: String(r.slug ?? ""),
    title: String(r.title ?? ""),
    kind: (r.kind === "article" ? "article" : "news") as NewsKind,
    excerpt: String(r.excerpt ?? ""),
    body: String(r.body ?? ""),
    thumbUrl: thumb ? pb.files.getURL(r, thumb, { thumb: "600x0" }) : null,
    imageUrl: thumb ? pb.files.getURL(r, thumb, { thumb: "1200x0" }) : null,
    status: (r.status === "published" ? "published" : "draft") as NewsStatus,
    publishedAt: String(r.published_at ?? "") || String(r.created ?? ""),
    created: String(r.created ?? ""),
  };
}

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// Дата по Москве, "8 октября 2026" — тот же календарь, что у событий.
export function formatNewsDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const key = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Moscow" });
  const [y, m, day] = key.split("-").map(Number);
  return `${day} ${MONTHS[m - 1]} ${y}`;
}

// Короткий текст-превью для колонок и плиток: анонс, а если его нет — начало
// самого текста без Markdown-разметки.
export function newsSnippet(post: NewsPost, max = 160): string {
  const source =
    post.excerpt.trim() ||
    post.body
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^[#>\-\s*\d.]+/gm, " ")
      .replace(/[*_`~|]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  if (source.length <= max) return source;
  return source.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function readingMinutes(body: string): number {
  const words = body.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

// Публичные данные: при сбое PocketBase (или если миграция ещё не применена)
// раздел просто покажет пустой список, а не уронит страницу — как у событий.
export async function fetchPublishedNews(limit?: number): Promise<NewsPost[]> {
  try {
    const pb = createPocketBase();
    const filter = pb.filter('status = "published" && published_at <= {:now}', { now: new Date().toISOString().replace("T", " ") });
    const records = limit
      ? (await pb.collection("news_posts").getList(1, limit, { filter, sort: "-published_at" })).items
      : await pb.collection("news_posts").getFullList({ filter, sort: "-published_at", batch: 500 });
    return records.map((r) => mapPost(pb, r));
  } catch {
    return [];
  }
}

export async function fetchNewsBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const pb = createPocketBase();
    const r = await pb.collection("news_posts").getFirstListItem(
      pb.filter('slug = {:slug} && status = "published" && published_at <= {:now}', {
        slug,
        now: new Date().toISOString().replace("T", " "),
      })
    );
    return mapPost(pb, r);
  } catch {
    return null;
  }
}

// ---------- админка (клиентский pb с правами admin) ----------

export async function fetchAdminNews(pb: PocketBase): Promise<NewsPost[]> {
  // requestKey: null — без автоотмены: в dev React монтирует эффект дважды, и
  // первый запрос иначе отменялся бы вторым с ложной ошибкой «не удалось загрузить».
  const records = await pb.collection("news_posts").getFullList({ sort: "-created", batch: 500, requestKey: null });
  return records.map((r) => mapPost(pb, r));
}

export interface NewsDraft {
  title: string;
  slug: string;
  kind: NewsKind;
  excerpt: string;
  body: string;
  status: NewsStatus;
  /** datetime-local ("YYYY-MM-DDTHH:mm") в московском времени пользователя браузера; пусто — «сейчас» */
  publishedAt: string;
  thumbnail: File | null;
  removeThumbnail: boolean;
}

export async function saveNews(pb: PocketBase, id: string | null, draft: NewsDraft): Promise<NewsPost> {
  const form = new FormData();
  form.set("title", draft.title.trim());
  form.set("slug", draft.slug.trim() || slugify(draft.title));
  form.set("kind", draft.kind);
  form.set("excerpt", draft.excerpt.trim());
  form.set("body", draft.body);
  form.set("status", draft.status);
  const when = draft.publishedAt ? new Date(draft.publishedAt) : new Date();
  form.set("published_at", when.toISOString().replace("T", " "));
  if (draft.thumbnail) form.set("thumbnail", draft.thumbnail);
  else if (draft.removeThumbnail) form.set("thumbnail", "");
  const record = id ? await pb.collection("news_posts").update(id, form) : await pb.collection("news_posts").create(form);
  return mapPost(pb, record);
}

export async function deleteNews(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("news_posts").delete(id);
}

// Картинка внутрь текста: грузим в news_images и возвращаем прямую ссылку.
export async function uploadNewsImage(pb: PocketBase, file: File): Promise<string> {
  const form = new FormData();
  form.set("image", file);
  const r = await pb.collection("news_images").create(form);
  return pb.files.getURL(r, String(r.image), { thumb: "1200x0" });
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(title: string): string {
  const s = title
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return s || `post-${Date.now().toString(36)}`;
}
