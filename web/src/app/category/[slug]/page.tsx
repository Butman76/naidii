import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecialistCard from "@/components/SpecialistCard";
import { CATEGORIES } from "@/data/categories";
import { fetchSpecialists } from "@/lib/specialists";

function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

// Без этого страница была полностью статической (собранной один раз при
// билде) и не видела изменений в PocketBase до следующего git-деплоя —
// см. STATUS.md. Не влияет на STATIC_EXPORT-сборку (там сервера нет,
// значение просто игнорируется).
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.seoTitle,
    description: category.seoDescription,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const allSpecialists = await fetchSpecialists();
  const specialists = allSpecialists.filter((s) => s.category === slug);

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm text-zinc-500">
              <Link href="/categories" className="hover:text-zinc-900">
                Категории
              </Link>{" "}
              / {category.name}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
              {category.h1}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">
              {category.description}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Специалисты в этом направлении
            </h2>
            <p className="text-sm text-zinc-500">
              Найдено: {specialists.length}
            </p>
          </div>

          {specialists.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {specialists.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">
              Пока нет опубликованных специалистов в этом направлении.
            </p>
          )}
        </div>

        {category.faq.length > 0 && (
          <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-zinc-900">
              Частые вопросы
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {category.faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <summary className="cursor-pointer list-none text-sm font-medium text-zinc-900 marker:content-none">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
