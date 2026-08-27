import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES } from "@/data/categories";
import { getCategory3D } from "@/data/category-style";
import { fetchSpecialists } from "@/lib/specialists";

// Без этого страница была полностью статической (собранной один раз при
// билде) и не видела изменений в PocketBase до следующего git-деплоя.
// См. STATUS.md.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Категории специалистов по AI и автоматизации — НайдИИ",
  description:
    "Все направления площадки: AI-агенты, RAG, no-code оркестрация, чат-боты, голосовые агенты, AI-видео, CRM-AI, промпт-инжиниринг, аналитика и другое.",
};

export default async function CategoriesPage() {
  const specialists = await fetchSpecialists();
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Категории специалистов
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Выберите направление, чтобы увидеть специалистов и частые
              вопросы по теме.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const count = specialists.filter(
                (s) => s.category === category.slug
              ).length;
              const classes = getCategory3D(category.slug);
              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className={`flex flex-col rounded-2xl border-b-4 bg-gradient-to-br p-5 text-white shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:border-b-2 ${classes}`}
                >
                  <p className="text-base font-semibold">{category.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-white/85">
                    {category.description}
                  </p>
                  <p className="mt-3 text-xs font-medium text-white/75">
                    Специалистов: {count}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
