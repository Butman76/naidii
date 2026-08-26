import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesCatalog from "@/components/ServicesCatalog";
import { fetchCatalogData, summarizeResultTypes } from "@/lib/catalog";

// Без этого страница была полностью статической (собранной один раз при
// билде) и не видела изменений в PocketBase (публикацию профиля/карточки
// админом) до следующего git-деплоя. См. STATUS.md.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Каталог услуг по автоматизации и AI — НайдИИ",
  description:
    "Готовые услуги от специалистов по автоматизации и AI: конкретный результат, срок и цена — от AI-агентов до RAG-баз знаний. Закажите без долгого выбора исполнителя.",
};

export default async function ServicesPage() {
  const { resultTypes, offers } = await fetchCatalogData();
  const summaries = summarizeResultTypes(resultTypes, offers);

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Каталог услуг
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Конкретный результат, срок и цена — а не просто список
              специалистов. Профиль исполнителя доступен по ссылке с
              карточки.
            </p>
          </div>
        </div>
        <ServicesCatalog resultTypes={summaries} offers={offers} />
      </main>
      <Footer />
    </>
  );
}
