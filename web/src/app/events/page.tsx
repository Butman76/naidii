import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsCatalog from "@/components/events/EventsCatalog";
import NearestEventBanner from "@/components/events/NearestEventBanner";
import { CheckIcon, MapPinIcon, MegaphoneIcon } from "@/components/events/icons";
import { fetchPublishedEvents, isPast, todayKey } from "@/lib/events";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI-события 2026 — конференции, выставки и форумы по ИИ | НайдИИ",
  description:
    "Календарь конференций, форумов, выставок, вебинаров и митапов по искусственному интеллекту, AI-агентам, RAG, n8n, чат-ботам, автоматизации и аналитике.",
};

// Три компактных сигнала под подзаголовком hero — без выдуманных цифр, чисто
// про формат раздела (бриф пользователя, редизайн 2026-09-28, «AI Event Signal»).
const HERO_HIGHLIGHTS = ["AI, автоматизация и данные", "Онлайн и офлайн", "Для бизнеса и специалистов"];

// Организаторская CTA внизу — три коротких пункта.
const ORGANIZER_POINTS = [
  "Бесплатная публикация после модерации",
  "Тематическое размещение для AI-аудитории",
  "Переходы на регистрацию и видимость для бизнеса",
];

export default async function EventsPage() {
  const events = await fetchPublishedEvents();
  const today = todayKey();

  // «Ближайшее событие» — из уже загруженного списка, без нового запроса:
  // самое близкое по дате непрошедшее опубликованное событие.
  const upcoming = events.filter((e) => !isPast(e, today));
  const nearestEvent = upcoming.length > 0 ? [...upcoming].sort((a, b) => a.startDate.localeCompare(b.startDate))[0] : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="relative overflow-hidden border-b border-zinc-200 bg-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle, #e4e4e7 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl lg:text-4xl">AI-события и форумы</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Конференции, выставки, вебинары и митапы по AI, автоматизации и цифровой трансформации бизнеса.
                </p>
                <p className="mt-2 max-w-xl text-sm text-zinc-500">
                  Следите за рынком, находите партнёров и открывайте новые точки роста.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {HERO_HIGHLIGHTS.map((text) => (
                    <span
                      key={text}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                    >
                      {text}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/events/add" className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">
                    Добавить событие
                  </Link>
                  <a
                    href="#events"
                    className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-500"
                  >
                    Посмотреть ближайшие
                  </a>
                </div>
              </div>

              <div className="relative hidden h-[280px] lg:block" aria-hidden="true">
                <div className="absolute left-4 top-2 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
                <div className="absolute right-6 top-14 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
                <div className="absolute bottom-0 left-24 h-32 w-32 rounded-full bg-teal-400/20 blur-3xl" />
                <svg viewBox="0 0 400 280" fill="none" className="absolute inset-0 h-full w-full">
                  <g stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3 5">
                    <path d="M70 70 L150 50 L230 95" />
                    <path d="M150 50 L190 150" />
                    <path d="M230 95 L310 70" />
                    <path d="M110 190 L190 150 L280 200" />
                  </g>
                  <g fill="#a1a1aa">
                    <circle cx="70" cy="70" r="3" />
                    <circle cx="150" cy="50" r="3" />
                    <circle cx="230" cy="95" r="3" />
                    <circle cx="310" cy="70" r="3" />
                    <circle cx="190" cy="150" r="3" />
                    <circle cx="110" cy="190" r="3" />
                    <circle cx="280" cy="200" r="3" />
                  </g>
                </svg>
                <div className="absolute left-8 top-8 flex w-16 flex-col items-center rounded-xl border border-zinc-200 bg-white/90 py-2 shadow-sm backdrop-blur">
                  <span className="text-lg font-bold leading-none text-zinc-900">16</span>
                  <span className="mt-1 text-[10px] font-semibold text-blue-600">ОКТ</span>
                </div>
                <div className="absolute right-16 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm ring-1 ring-inset ring-emerald-100 backdrop-blur">
                  Бесплатно
                </div>
                <div className="absolute bottom-6 right-8 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur">
                  <MapPinIcon className="h-3.5 w-3.5 text-violet-500" />
                  Москва
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="events" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {nearestEvent && <NearestEventBanner event={nearestEvent} today={today} />}

          <div className={nearestEvent ? "mt-6" : ""}>
            <EventsCatalog events={events} today={today} />
          </div>

          <div className="relative mt-12 overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MegaphoneIcon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Для организаторов</span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Организуете AI-событие?</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Добавьте конференцию, форум, выставку, вебинар или хакатон в календарь НайдИИ. Базовая публикация —
                  бесплатно после модерации.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Для партнёрских событий доступны выделение, тематические подборки, переходы на регистрацию и витрина
                  экспертов.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-300">
                  {ORGANIZER_POINTS.map((text) => (
                    <li key={text} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/events/add"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                Добавить событие бесплатно
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
