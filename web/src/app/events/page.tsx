import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsCatalog from "@/components/events/EventsCatalog";
import { fetchPublishedEvents, todayKey } from "@/lib/events";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI-события 2026 — конференции, выставки и форумы по ИИ | НайдИИ",
  description:
    "Календарь конференций, форумов, выставок, вебинаров и митапов по искусственному интеллекту, AI-агентам, RAG, n8n, чат-ботам, автоматизации и аналитике.",
};

export default async function EventsPage() {
  const events = await fetchPublishedEvents();
  const today = todayKey();

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">AI-события и форумы</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">
              Конференции, выставки, вебинары и митапы по искусственному интеллекту, AI-агентам и автоматизации бизнеса.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/events/add" className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">
                Добавить событие
              </Link>
              <a href="#events" className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-500">
                Посмотреть ближайшие
              </a>
            </div>
          </div>
        </div>

        <div id="events" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <EventsCatalog events={events} today={today} />

          <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Организуете AI-событие?</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Разместите конференцию, форум, выставку, вебинар или хакатон в календаре НайдИИ. Публикация бесплатная, после проверки модератором.
            </p>
            <Link href="/events/add" className="mt-4 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">
              Добавить событие бесплатно
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
