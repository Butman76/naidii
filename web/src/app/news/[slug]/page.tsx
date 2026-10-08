import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsBody from "@/components/news/NewsBody";
import NewsCard from "@/components/news/NewsCard";
import { KIND_LABELS, fetchNewsBySlug, fetchPublishedNews, formatNewsDate, readingMinutes } from "@/lib/news";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await fetchPublishedNews();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchNewsBySlug(slug);
  if (!post) return {};
  const description = (post.excerpt || post.body.replace(/[#*>_`!\[\]()]/g, " ").replace(/\s+/g, " ")).trim().slice(0, 200);
  return {
    title: `${post.title} | НайдИИ`,
    description,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.publishedAt,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchNewsBySlug(slug);
  if (!post) notFound();

  const all = await fetchPublishedNews();
  const more = [...all.filter((p) => p.id !== post.id && p.kind === post.kind), ...all.filter((p) => p.id !== post.id && p.kind !== post.kind)].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": post.kind === "article" ? "Article" : "NewsArticle",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.publishedAt,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    author: { "@type": "Organization", name: "Редакция НайдИИ" },
    publisher: { "@type": "Organization", name: "НайдИИ", url: "https://naidii.ru" },
    mainEntityOfPage: `https://naidii.ru/news/${post.slug}`,
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-400 hover:text-zinc-900"
          >
            <span aria-hidden="true">←</span> Все новости и статьи
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${post.kind === "article" ? "bg-violet-600" : "bg-blue-600"}`}
            >
              {KIND_LABELS[post.kind]}
            </span>
            <span>{formatNewsDate(post.publishedAt)}</span>
            {post.kind === "article" && <span>· {readingMinutes(post.body)} мин чтения</span>}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-zinc-600">{post.excerpt}</p>}

          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt="" className="mt-6 h-auto w-full rounded-2xl border border-zinc-200" />
          )}

          <div className="mt-8">
            <NewsBody body={post.body} />
          </div>

          <div className="mt-12 border-t border-zinc-200 pt-6">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
            >
              <span aria-hidden="true">←</span> Вернуться к списку новостей
            </Link>
          </div>
        </article>

        {more.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-zinc-900">Читайте также</h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
