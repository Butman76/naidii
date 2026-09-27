import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard, { CategoryTag } from "@/components/events/EventCard";
import SpecialistCard from "@/components/SpecialistCard";
import {
  EVENT_TYPE_LABELS, FORMAT_LABELS, fetchEventBySlug, fetchPublishedEvents, formatDateRange, formatPrice,
  googleCalendarUrl, isPast, placeLabel, relatedEvents, todayKey, type AiEvent,
} from "@/lib/events";
import { fetchSpecialists } from "@/lib/specialists";

export const revalidate = 60;

export async function generateStaticParams() {
  const events = await fetchPublishedEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} — дата, программа, регистрация | НайдИИ`,
    description: `${event.title}: ${formatDateRange(event)}, ${placeLabel(event)}. ${event.shortDescription}`.slice(0, 300),
    alternates: { canonical: `/events/${event.slug}` },
  };
}

function jsonLd(event: AiEvent, today: string) {
  const online = event.format === "online";
  const past = isPast(event, today);
  const location = online
    ? { "@type": "VirtualLocation", url: event.officialUrl || `https://naidii.ru/events/${event.slug}` }
    : {
        "@type": "Place",
        name: event.venue || event.city,
        address: { "@type": "PostalAddress", addressLocality: event.city || undefined, streetAddress: event.address || undefined, addressCountry: "RU" },
      };
  const offers =
    event.priceType === "free"
      ? { "@type": "Offer", price: 0, priceCurrency: "RUB", url: event.registrationUrl || event.officialUrl }
      : event.priceType === "paid" && event.priceFrom > 0
        ? { "@type": "Offer", price: event.priceFrom, priceCurrency: "RUB", url: event.registrationUrl || event.officialUrl }
        : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: past ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.format === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.format === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location,
    organizer: event.organizer ? { "@type": "Organization", name: event.organizer, url: event.officialUrl || undefined } : undefined,
    offers,
    url: `https://naidii.ru/events/${event.slug}`,
  };
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-800">{value}</dd>
    </div>
  );
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const today = todayKey();
  const past = isPast(event, today);
  const [all, specialists] = await Promise.all([fetchPublishedEvents(), fetchSpecialists().catch(() => [])]);
  const related = relatedEvents(event, all, today);

  // Подбор по направлениям события: сначала продвигаемые (они помечены на
  // карточке как «Продвигается»), затем остальные. Только чтение каталога.
  const matched = specialists
    .filter((s) => (s.categories ?? [s.category]).some((c) => event.categories.includes(c)))
    .sort((a, b) => (b.promotionRank ?? 0) - (a.promotionRank ?? 0))
    .slice(0, 6);

  const regUrl = event.registrationUrl || event.officialUrl;

  return (
    <>
      <Header />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(event, today)) }} />
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm text-zinc-500">
              <Link href="/" className="hover:text-zinc-900">Главная</Link> /{" "}
              <Link href="/events" className="hover:text-zinc-900">AI-события</Link> / {event.title}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">{EVENT_TYPE_LABELS[event.eventType]}</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">{FORMAT_LABELS[event.format]}</span>
              {past && <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">Завершено</span>}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl">{event.title}</h1>
            <p className="mt-2 text-base text-zinc-700">
              {formatDateRange(event)}
              {event.timeNote ? `, ${event.timeNote}` : ""} · {placeLabel(event)}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{formatPrice(event)}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {!past && regUrl && (
                <form action="/api/events/click" method="POST">
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">
                    Зарегистрироваться
                  </button>
                </form>
              )}
              {!past && (
                <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-500">
                  Добавить в календарь
                </a>
              )}
              {event.officialUrl && (
                <a href={event.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-500">
                  Сайт события
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">О событии</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{event.description || event.shortDescription}</p>
            <dl className="mt-5 space-y-2 border-t border-zinc-100 pt-4">
              <Row label="Организатор" value={event.organizer} />
              <Row label="Место" value={[event.venue, event.address, event.city].filter(Boolean).join(", ")} />
              <Row label="Онлайн" value={event.onlinePlatform} />
              <Row label="Промокод" value={event.promoCode} />
              <Row label="Идёт набор" value={[event.speakersWanted ? "спикеров" : "", event.exhibitorsWanted ? "экспонентов" : ""].filter(Boolean).join(" и ")} />
            </dl>
            {event.programUrl && (
              <a href={event.programUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-block text-sm text-blue-700 underline">
                Программа
              </a>
            )}
            {event.sourceNote && <p className="mt-4 text-xs text-zinc-400">{event.sourceNote} Актуальные условия уточняйте на сайте организатора.</p>}
          </section>

          {event.categories.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900">Темы события</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.categories.map((c) => (
                  <Link key={c} href={`/category/${c}`}><CategoryTag slug={c} /></Link>
                ))}
              </div>
            </section>
          )}

          {matched.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900">Подходящие специалисты НайдИИ</h2>
              <p className="mt-1 text-sm text-zinc-500">Исполнители по темам события. Карточки с меткой «Продвигается» размещены на платной основе.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 lg:grid-cols-3">
                {matched.map((s) => <SpecialistCard key={s.id} specialist={s} />)}
              </div>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold text-zinc-900">Ищете исполнителя до мероприятия?</h2>
              <p className="mt-2 text-sm text-zinc-600">Подберите специалиста по AI и автоматизации для своей задачи ещё до форума.</p>
              <Link href="/specialists" className="mt-3 inline-block text-sm font-medium text-blue-700 underline">Найти специалиста</Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold text-zinc-900">Спикер, партнёр или экспонент?</h2>
              <p className="mt-2 text-sm text-zinc-600">Добавьте карточку в НайдИИ, чтобы заказчики нашли вас до и после мероприятия.</p>
              <Link href="/register" className="mt-3 inline-block text-sm font-medium text-blue-700 underline">Разместить карточку</Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold text-zinc-900">Вы организатор?</h2>
              <p className="mt-2 text-sm text-zinc-600">Добавьте мероприятие бесплатно после модерации.</p>
              <Link href="/events/add" className="mt-3 inline-block text-sm font-medium text-blue-700 underline">Добавить событие</Link>
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900">Похожие события</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {related.map((e) => <EventCard key={e.id} event={e} today={today} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
