import Link from "next/link";
import { KIND_LABELS, formatNewsDate, newsSnippet, type NewsPost } from "@/lib/news";

// Плитки мозаики на /news (см. NewsCatalog.tsx): разные размеры и разная
// раскладка внутри, чтобы лента не выглядела клеткой одинаковых квадратов.
//   full — на всю ширину (если публикация одна), xl — крупный квадрат 2×2,
//   wide — прямоугольник 2×1 (обложка слева, текст справа),
//   tall — вертикальный 1×2 (обложка сверху, текст снизу), sm — малая 1×1.
export type TileSize = "full" | "xl" | "wide" | "tall" | "sm";

// Занимаемые ячейки на сетке 1 → 2 → 4 колонки (родитель: auto-rows на md+).
export const TILE_SPAN: Record<TileSize, string> = {
  full: "min-h-[260px] md:min-h-0 md:col-span-2 lg:col-span-4",
  xl: "min-h-[300px] md:min-h-0 md:col-span-2 lg:row-span-2",
  wide: "min-h-[200px] md:min-h-0 md:col-span-2",
  tall: "min-h-[300px] md:min-h-0 md:row-span-2",
  sm: "min-h-[220px] md:min-h-0",
};

const KIND_BADGE: Record<NewsPost["kind"], string> = {
  news: "bg-blue-600 text-white",
  article: "bg-violet-600 text-white",
};

function Badge({ kind }: { kind: NewsPost["kind"] }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${KIND_BADGE[kind]}`}>{KIND_LABELS[kind]}</span>
  );
}

function Picture({ post, large }: { post: NewsPost; large?: boolean }) {
  const src = large ? post.imageUrl : post.thumbUrl;
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  ) : (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${
        post.kind === "article" ? "from-violet-600 to-fuchsia-500" : "from-blue-600 to-cyan-500"
      }`}
    >
      <span className="select-none text-2xl font-extrabold tracking-tight text-white/25">НайдИИ</span>
    </div>
  );
}

const frame =
  "group relative block overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export default function NewsTile({ post, size }: { post: NewsPost; size: TileSize }) {
  const href = `/news/${post.slug}`;
  const span = TILE_SPAN[size];

  if (size === "wide") {
    return (
      <Link href={href} className={`${frame} flex bg-white ${span}`}>
        <div className="relative w-2/5 shrink-0">
          <Picture post={post} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-center gap-2">
            <Badge kind={post.kind} />
            <span className="text-[11px] text-zinc-400">{formatNewsDate(post.publishedAt)}</span>
          </div>
          <h3 className="mt-2 line-clamp-3 text-base font-semibold leading-snug text-zinc-900 group-hover:text-blue-700">{post.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-600">{newsSnippet(post, 160)}</p>
          <p className="mt-auto pt-2 text-xs font-medium text-blue-700">Читать →</p>
        </div>
      </Link>
    );
  }

  if (size === "tall") {
    return (
      <Link href={href} className={`${frame} flex flex-col bg-white ${span}`}>
        <div className="relative min-h-[140px] flex-1">
          <Picture post={post} />
          <div className="absolute left-3 top-3">
            <Badge kind={post.kind} />
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] text-zinc-400">{formatNewsDate(post.publishedAt)}</p>
          <h3 className="mt-1 line-clamp-3 text-base font-semibold leading-snug text-zinc-900 group-hover:text-blue-700">{post.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-600">{newsSnippet(post, 130)}</p>
        </div>
      </Link>
    );
  }

  // full / xl / sm — обложка на всю плитку, текст поверх затемнения
  const big = size !== "sm";
  return (
    <Link href={href} className={`${frame} ${span} bg-zinc-900`}>
      <Picture post={post} large={big} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute left-3 top-3">
        <Badge kind={post.kind} />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-[11px] text-white/70">{formatNewsDate(post.publishedAt)}</p>
        <h3
          className={`mt-1 font-bold leading-snug group-hover:underline ${
            big ? "line-clamp-3 text-xl sm:text-2xl" : "line-clamp-3 text-[15px]"
          }`}
        >
          {post.title}
        </h3>
        {big && <p className="mt-1.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80">{newsSnippet(post, 150)}</p>}
      </div>
    </Link>
  );
}
