import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesCatalog from "@/components/ServicesCatalog";

export const metadata: Metadata = {
  title: "Каталог услуг по автоматизации и AI — НайдИИ",
  description:
    "Готовые услуги от специалистов по автоматизации и AI: конкретный результат, срок и цена — от AI-агентов до RAG-баз знаний. Закажите без долгого выбора исполнителя.",
};

export default function ServicesPage() {
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
              Цена, срок и результат — прямо на карточке услуги. Профиль
              исполнителя открывается по ссылке с неё.
            </p>
          </div>
        </div>
        <ServicesCatalog />
      </main>
      <Footer />
    </>
  );
}
