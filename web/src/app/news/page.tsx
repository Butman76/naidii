import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCatalog from "@/components/news/NewsCatalog";
import { fetchPublishedNews } from "@/lib/news";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Новости и статьи об AI и автоматизации | НайдИИ",
  description:
    "Свежие новости рынка и экспертные статьи об искусственном интеллекте, AI-агентах, автоматизации бизнеса и интеграциях — редакция НайдИИ.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const posts = await fetchPublishedNews();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Новости и статьи</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Что происходит на рынке AI и автоматизации — коротко в новостях и подробно в статьях редакции.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <NewsCatalog posts={posts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
