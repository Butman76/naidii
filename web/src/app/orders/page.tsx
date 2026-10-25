import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrdersCta from "@/components/orders/OrdersCta";
import { CATEGORIES } from "@/data/categories";
import { getCategoryAccent, getCategoryStyle } from "@/data/category-style";
import { fetchPublicJobPosts } from "@/lib/jobPosts";
import { formatNewsDate } from "@/lib/news";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Новые заказы | НайдИИ",
  description: "Открытые заказы на AI-автоматизацию, чат-ботов и интеграции. Откликнуться могут зарегистрированные специалисты.",
};

// Публичная страница «Тут новые заказы» (плашка на главной). Видят все, в том
// числе гости, но заказчиков здесь нет: данные идут из view job_posts_public
// (см. lib/jobPosts.ts), где нет ни имени, ни id заказчика, а контакты в
// тексте скрыты. Отклик и чат с заказчиком — только у специалистов, из
// «Доски объявлений» в кабинете.
export default async function OrdersPage() {
  const posts = await fetchPublicJobPosts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b border-zinc-200 bg-gradient-to-br from-amber-50 via-white to-rose-50">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <h1 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">Тут новые заказы</h1>
            <p className="mt-3 max-w-2xl text-base text-zinc-600">
              Заказчики описывают задачу, специалисты откликаются. Имена и контакты заказчиков видят только зарегистрированные специалисты.
            </p>
            <div className="mt-5">
              <OrdersCta />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
              Сейчас нет открытых заказов. Загляните позже.
            </p>
          ) : (
            <>
              <p className="text-sm text-zinc-500">Открытых заказов: {posts.length}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {posts.map((post) => {
                  const slug = post.categorySlug || "other";
                  const accent = getCategoryAccent(slug);
                  const style = getCategoryStyle(slug);
                  const categoryName = post.categorySlug
                    ? CATEGORIES.find((c) => c.slug === post.categorySlug)?.name ?? post.categorySlug
                    : "Без направления";
                  return (
                    <article key={post.id} className={`relative overflow-hidden rounded-2xl border p-5 ${accent.border} ${accent.tint}`}>
                      <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.gradient}`} aria-hidden="true" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-full bg-gradient-to-r ${style.gradient} px-3 py-1 text-xs font-semibold text-white`}
                        >
                          {categoryName}
                        </span>
                        <span className="text-xs text-zinc-500">{formatNewsDate(post.createdAt)}</span>
                      </div>
                      {post.subcategory && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{post.subcategory}</p>}
                      <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-zinc-900">{post.description}</p>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
