import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryDots from "@/components/CategoryDots";
import ClaimModal from "@/components/unclaimed/ClaimModal";
import AdminDetails from "@/components/unclaimed/AdminDetails";
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
// 2026-09-28). По просьбе пользователя — ни здесь, ни в карточке в каталоге
// нет ни сайта компании, ни юрлица/ИНН: иначе мы бы напрямую сводили
// заказчика с конторой мимо площадки. Эти поля вообще не покидают сервер
// для анонимного посетителя (см. lib/unclaimed.ts) — видны только админу
// (AdminDetails.tsx). "Это моя компания" (ClaimModal.tsx) открывает
// модалку с инструкцией написать на claim@naidii.ru — без формы на сайте.
// noindex в метаданных: страниц много, данных на них мало, размножать в
// поиске такие карточки незачем.
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
            {listing.blurb && <p className="text-sm leading-relaxed text-zinc-700">{listing.blurb}</p>}

            <dl className={`space-y-2 text-sm ${listing.blurb ? "mt-4 border-t border-zinc-100 pt-4" : ""}`}>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-xs text-zinc-400">Направления</dt>
                <dd className="text-zinc-700">{listing.categories.map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug).join(", ") || "—"}</dd>
              </div>
            </dl>
          </div>

          <AdminDetails id={listing.id} />

          <div className="mt-6">
            <ClaimModal />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
