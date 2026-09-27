import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard, { CategoryTag } from "@/components/events/EventCard";
import { ArrowRightIcon, AwardIcon, CalendarIcon, MegaphoneIcon, UsersIcon } from "@/components/events/icons";
import SpecialistCard from "@/components/SpecialistCard";
import {
  EVENT_TYPE_LABELS, FORMAT_LABELS, dayBadge, fetchEventBySlug, fetchPublishedEvents, formatDateRange, formatPrice,
  googleCalendarUrl, isPast, placeLabel, relatedEvents, todayKey, type AiEvent,
} from "@/lib/events";
import { getCategoryStyle } from "@/data/category-style";
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

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-800">{value}</dd>
    </div>
  );
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const today = todayKey();
  const past = isPast(event, today);
  const style = getCategoryStyle(event.categories[0] ?? "other");
  const badge = dayBadge(event);
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

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.gradient}`} aria-hidden="true" />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
                style={{ background: style.hex }}
                aria-hidden="true"
              />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                <div
                  className="flex shrink-0 flex-col items-center justify-center rounded-2xl px-5 py-4 ring-1 ring-inset"
                  style={{ backgroundColor: `${style.hex}0f`, boxShadow: `inset 0 0 0 1px ${style.hex}40` }}
                >
                  <span className="text-3xl font-bold leading-none text-zinc-900">{badge.day}</span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: style.hex }}>
                    {badge.month}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
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
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                        >
                          Зарегистрироваться
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                    {!past && (
                      <a
                        href={googleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-500"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Добавить в календарь
                      </a>
                    )}
                    {event.officialUrl && (
                      <a
                        href={event.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
                      >
                        Сайт события
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-zinc-900">О событии</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{event.description || event.shortDescription}</p>
              {event.programUrl && (
                <a href={event.programUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-block text-sm text-blue-700 underline">
                  Программа
                </a>
              )}
              {event.sourceNote && <p className="mt-4 text-xs text-zinc-400">{event.sourceNote} Актуальные условия уточняйте на сайте организатора.</p>}
            </div>

            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold text-zinc-900">Детали события</h2>
              <dl className="mt-4 space-y-3">
                <DetailRow label="Организатор" value={event.organizer} />
                <DetailRow label="Место" value={[event.venue, event.address, event.city].filter(Boolean).join(", ")} />
                <DetailRow label="Онлайн" value={event.onlinePlatform} />
                <DetailRow label="Промокод" value={event.promoCode} />
                <DetailRow
                  label="Идёт набор"
                  value={[event.speakersWanted ? "спикеров" : "", event.exhibitorsWanted ? "экспонентов" : ""].filter(Boolean).join(" и ")}
                />
              </dl>
            </aside>
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
            <section className="rounded-2xl p-6" style={{ backgroundColor: `${style.hex}0a` }}>
              <h2 className="text-lg font-semibold text-zinc-900">Специалисты по теме события</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Найдите исполнителя по AI и автоматизации до или после мероприятия. Карточки с меткой «Продвигается» размещены
                на платной основе.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 lg:grid-cols-3">
                {matched.map((s) => <SpecialistCard key={s.id} specialist={s} />)}
              </div>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
              <UsersIcon className="h-6 w-6 text-blue-600" />
              <h2 className="mt-3 text-base font-semibold text-zinc-900">Ищете исполнителя?</h2>
              <p className="mt-2 text-sm text-zinc-600">Подберите специалиста по AI и автоматизации для своей задачи ещё до форума.</p>
              <Link href="/specialists" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                Найти специалиста
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
              <AwardIcon className="h-6 w-6 text-violet-600" />
              <h2 className="mt-3 text-base font-semibold text-zinc-900">Вы спикер или экспонент?</h2>
              <p className="mt-2 text-sm text-zinc-600">Покажите профиль и кейсы компаниям, которые изучают тему события.</p>
              <Link href="/register" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-700 hover:underline">
                Разместить карточку
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
              <MegaphoneIcon className="h-6 w-6 text-amber-600" />
              <h2 className="mt-3 text-base font-semibold text-zinc-900">Организуете событие?</h2>
              <p className="mt-2 text-sm text-zinc-600">Добавьте его в AI-календарь НайдИИ бесплатно после модерации.</p>
              <Link href="/events/add" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                Добавить событие
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900">Похожие AI-события</h2>
              <p className="mt-1 text-sm text-zinc-500">Другие мероприятия по близким темам.</p>
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
