import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecialistsCatalog from "@/components/SpecialistsCatalog";

export const metadata: Metadata = {
  title: "Специалисты по автоматизации и AI — НайдИИ",
  description:
    "Каталог AI-интеграторов, нейрокодировщиков и специалистов по автоматизации бизнеса. Фильтры по навыкам, удалённой работе и сортировка по рейтингу и цене.",
};

export default function SpecialistsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Каталог специалистов
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              AI-агенты, нейрокодинг, Telegram-боты, CRM-интеграции, n8n,
              Make, API, 1С и другая автоматизация.
            </p>
          </div>
        </div>
        <SpecialistsCatalog />
      </main>
      <Footer />
    </>
  );
}
