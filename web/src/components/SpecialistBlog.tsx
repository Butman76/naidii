import Link from "next/link";
import { formatNewsDate, newsSnippet, type NewsPost } from "@/lib/news";

// Блок «Блог» на странице профиля специалиста: его опубликованные статьи
// (те же записи, что выходят в общей ленте /news). Без статей блок не
// рисуется. Статьи ведут в общий раздел новостей.
export default function SpecialistBlog({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-zinc-900">Блог</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.slice(0, 6).map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <p className="text-xs text-zinc-400">{formatNewsDate(post.publishedAt)}</p>
            <p className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-zinc-900 group-hover:text-blue-700">{post.title}</p>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-600">{newsSnippet(post, 180)}</p>
            <p className="mt-auto pt-3 text-xs font-medium text-blue-700">Читать →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
