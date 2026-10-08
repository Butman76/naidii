import Link from "next/link";
import { KIND_LABELS, formatNewsDate, readingMinutes, type NewsPost } from "@/lib/news";

// Карточка-«квадратик» новости: обложка, рубрика (Новость/Статья), дата,
// заголовок, анонс. Без обложки — фирменный градиент по рубрике, чтобы сетка
// не рваная. Обе рубрики в одной цветовой системе: новость синяя, статья
// фиолетовая.

const KIND_GRADIENT: Record<NewsPost["kind"], string> = {
  news: "from-blue-600 to-cyan-500",
  article: "from-violet-600 to-fuchsia-500",
};

const KIND_BADGE: Record<NewsPost["kind"], string> = {
  news: "bg-blue-600 text-white",
  article: "bg-violet-600 text-white",
};

export function NewsCover({ post, className = "" }: { post: NewsPost; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      {post.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${KIND_GRADIENT[post.kind]}`}>
          <span className="select-none text-3xl font-extrabold tracking-tight text-white/25">НайдИИ</span>
        </div>
      )}
      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${KIND_BADGE[post.kind]}`}>
        {KIND_LABELS[post.kind]}
      </span>
    </div>
  );
}

export default function NewsCard({ post }: { post: NewsPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <NewsCover post={post} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-zinc-400">
          {formatNewsDate(post.publishedAt)}
          {post.kind === "article" && ` · ${readingMinutes(post.body)} мин чтения`}
        </p>
        <h3 className="mt-1.5 line-clamp-3 text-[17px] font-semibold leading-snug text-zinc-900 group-hover:text-blue-700">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>}
        <p className="mt-auto pt-4 text-xs font-medium text-blue-700">Читать →</p>
      </div>
    </Link>
  );
}
