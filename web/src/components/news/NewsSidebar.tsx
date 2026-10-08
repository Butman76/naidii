import Link from "next/link";
import { KIND_LABELS, fetchPublishedNews, formatNewsDate } from "@/lib/news";

// Колонка «Новости» на главной — под блоком ближайших AI-событий. Только
// свежие публикации (5 штук), без пустой рамки, если новостей ещё нет.
export default async function NewsSidebar() {
  const posts = await fetchPublishedNews(5);
  if (posts.length === 0) return null;

  return (
    <aside className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Новости и статьи</h3>
        <Link href="/news" className="text-xs font-medium text-blue-700 hover:underline">
          все →
        </Link>
      </div>

      <ul className="mt-1">
        {posts.map((p) => (
          <li key={p.id} className="border-t border-zinc-100 first:border-t-0">
            <Link href={`/news/${p.slug}`} className="group flex gap-2.5 py-2.5">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
                {p.thumbUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs font-medium leading-snug text-zinc-900 group-hover:underline">{p.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                  {KIND_LABELS[p.kind]} · {formatNewsDate(p.publishedAt)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
