import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventSubmitForm from "@/components/events/EventSubmitForm";

export const metadata: Metadata = {
  title: "Добавить AI-событие | НайдИИ",
  description: "Бесплатно разместите конференцию, форум, выставку, вебинар или хакатон по ИИ в календаре НайдИИ. Публикация после модерации.",
  robots: { index: false },
};

export default function AddEventPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500">
            <Link href="/events" className="hover:text-zinc-900">AI-события</Link> / Добавить событие
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">Добавить событие</h1>
          <p className="mt-2 mb-6 text-sm text-zinc-600">
            Публикация бесплатная. Мы проверяем каждое событие вручную и публикуем его после модерации.
          </p>
          <EventSubmitForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
