import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryDots from "@/components/CategoryDots";
import ClaimSection from "@/components/unclaimed/ClaimSection";
import { CATEGORIES } from "@/data/categories";
import { fetchActiveUnclaimedListings, fetchUnclaimedListingByDomain } from "@/lib/unclaimed";

export async function generateStaticParams() {
  const listings = await fetchActiveUnclaimedListings();
  return listings.map((l) => ({ domain: l.domain }));
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const listing = await fetchUnclaimedListingByDomain(domain);
  if (!listing) return {};
  return {
    title: `${listing.name} — НайдИИ`,
    description: listing.blurb || `${listing.name}: карточка добавлена редакцией НайдИИ по открытым данным.`,
    robots: { index: false },
  };
}

// Профиль неподтверждённой карточки (см. STATUS.md, «claim your business»,
// 2026-09-28) — по просьбе пользователя карточка в каталоге больше не несёт
// прямых кнопок и внешней ссылки на сайт компании, а ведёт сюда: тут видно
// ровно то, что мы нашли в открытых источниках (без выдумок), и тут же —
// форма "это моя компания". noindex в метаданных: страниц много, данных на
// них мало, размножать в поиске такие карточки незачем.
export default async function UnclaimedProfilePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const listing = await fetchUnclaimedListingByDomain(domain);
  if (!listing) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500">
            <Link href="/specialists" className="hover:text-zinc-900">Специалисты</Link> / {listing.name}
          </p>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{listing.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">{listing.domain}{listing.city ? ` · ${listing.city}` : ""}</p>
            </div>
            <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              Добавлено редакцией
            </span>
          </div>

          <CategoryDots categories={listing.categories} />

          <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-5">
            <p className="text-xs font-medium text-amber-700">
              Карточка не подтверждена: компания ещё не регистрировалась на НайдИИ. Ниже — только то, что нашлось в открытых источниках.
            </p>

            {listing.blurb && <p className="mt-3 text-sm leading-relaxed text-zinc-700">{listing.blurb}</p>}

            <dl className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
              {listing.legalName && (
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-xs text-zinc-400">Юрлицо</dt>
                  <dd className="text-zinc-700">{listing.legalName}{listing.inn ? `, ИНН ${listing.inn}` : ""}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-xs text-zinc-400">Направления</dt>
                <dd className="text-zinc-700">{listing.categories.map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug).join(", ") || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-xs text-zinc-400">Сайт</dt>
                <dd>
                  <a href={listing.website} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-700 underline">
                    {listing.domain}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6">
            <ClaimSection listing={listing} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
