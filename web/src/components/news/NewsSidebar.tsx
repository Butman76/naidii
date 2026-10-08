import Link from "next/link";
import { KIND_LABELS, fetchPublishedNews, formatNewsDate, newsSnippet, type NewsPost } from "@/lib/news";

// Колонка «Новости и статьи» на главной — под блоком ближайших AI-событий, на
// всю его ширину. Первая публикация — с крупной обложкой и началом текста,
// следующие — с заметной миниатюрой (88 px) и тоже с выдержкой из текста:
// по колонке должно быть понятно, о чём новость, не заходя в неё. Пока
// публикаций нет — блок не рисуется (без пустой рамки).
function Cover({ post, className }: { post: NewsPost; className: string }) {
  return (
    <div className={`overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 ${className}`}>
      {post.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-extrabold text-white/30">НайдИИ</div>
      )}
    </div>
  );
}

export function NewsColumn({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;

  return (
    <aside className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Новости и статьи</h3>
        <Link href="/news" className="text-xs font-medium text-blue-700 hover:underline">
          все →
        </Link>
      </div>

      <Link href={`/news/${lead.slug}`} className="group mt-3 block">
        <Cover post={lead} className="aspect-[16/10] rounded-xl" />
        <p className="mt-2 text-[11px] text-zinc-500">
          {KIND_LABELS[lead.kind]} · {formatNewsDate(lead.publishedAt)}
        </p>
        <p className="mt-0.5 line-clamp-3 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-blue-700">{lead.title}</p>
        <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-zinc-600">{newsSnippet(lead, 220)}</p>
      </Link>

      <ul className="mt-2">
        {rest.map((p) => (
          <li key={p.id} className="border-t border-zinc-100">
            <Link href={`/news/${p.slug}`} className="group flex gap-3 py-3">
              <Cover post={p} className="h-[88px] w-[88px] shrink-0 rounded-lg" />
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-500">
                  {KIND_LABELS[p.kind]} · {formatNewsDate(p.publishedAt)}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-zinc-900 group-hover:text-blue-700">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-600">{newsSnippet(p, 110)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function NewsSidebar() {
  return <NewsColumn posts={await fetchPublishedNews(4)} />;
}
