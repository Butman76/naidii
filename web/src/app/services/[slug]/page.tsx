import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceOfferRow from "@/components/ServiceOfferRow";
import { getCategoryStyle } from "@/data/category-style";
import { CATEGORIES } from "@/data/categories";
import { mockResultTypes, getOffersForType } from "@/data/mock-services";

function getResultType(slug: string) {
  return mockResultTypes.find((t) => t.slug === slug);
}

export function generateStaticParams() {
  return mockResultTypes.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const type = getResultType(slug);
  if (!type) return {};
  return {
    title: `${type.title} — специалисты | НайдИИ`,
    description: `Сравните предложения специалистов: ${type.title.toLowerCase()}. Цена, срок и рейтинг исполнителя — на одной странице.`,
  };
}

export default async function ResultTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const type = getResultType(slug);
  if (!type) notFound();

  const offers = getOffersForType(slug);
  const style = getCategoryStyle(type.categorySlug);
  const categoryName =
    CATEGORIES.find((c) => c.slug === type.categorySlug)?.name ?? "Другое";

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div
          className={`relative overflow-hidden bg-gradient-to-br text-white ${style.gradient}`}
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm">
              <Link href="/services" className="hover:underline">
                Услуги
              </Link>{" "}
              / {categoryName} / {type.subcategory}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-5xl drop-shadow-md">{style.icon}</span>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{type.title}</h1>
                <p className="mt-1 text-sm text-white/80">{type.scopeLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Предложения специалистов
            </h2>
            <p className="text-sm text-zinc-500">
              {offers.length === 1 ? "1 исполнитель" : `${offers.length} исполнителя`}
            </p>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Один и тот же результат — сравните цену, срок и рейтинг, прежде
            чем смотреть, кто именно исполнитель.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {offers.map((offer) => (
              <ServiceOfferRow key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
