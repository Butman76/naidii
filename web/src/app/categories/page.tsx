import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES } from "@/data/categories";
import { mockSpecialists } from "@/data/mock-specialists";

export const metadata: Metadata = {
  title: "Категории специалистов по AI и автоматизации — НайдИИ",
  description:
    "Все направления площадки: AI-агенты, RAG, no-code оркестрация, чат-боты, голосовые агенты, AI-видео, CRM-AI, промпт-инжиниринг, аналитика и другое.",
};

export default function CategoriesPage() {
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
              const count = mockSpecialists.filter(
                (s) => s.category === category.slug
              ).length;
              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <p className="text-base font-semibold text-zinc-900">
                    {category.name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                    {category.description}
                  </p>
                  <p className="mt-3 text-xs text-zinc-500">
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
