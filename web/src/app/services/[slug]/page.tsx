import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceOfferRow from "@/components/ServiceOfferRow";
import { getCategoryStyle } from "@/data/category-style";
import { CATEGORIES } from "@/data/categories";
import { fetchCatalogData, getOffersForType } from "@/lib/catalog";
import { withBasePath } from "@/lib/base-path";

// Живые данные из PocketBase. generateStaticParams всё ещё нужен для
// статической сборки GitHub Pages (STATIC_EXPORT=true) - он выполняется
// на этапе сборки, когда у GitHub Actions есть доступ в интернет, так что
// оба режима сборки (SSR на VPS и статический экспорт) используют один и
// тот же живой источник данных, просто в разное время (запрос/сборка).
export async function generateStaticParams() {
  const { resultTypes } = await fetchCatalogData();
  return resultTypes.map((t) => ({ slug: t.slug }));
}

// Без этого страница была полностью статической (собранной один раз при
// билде) и не видела изменений в PocketBase до следующего git-деплоя —
// см. STATUS.md. Не влияет на STATIC_EXPORT-сборку (там сервера нет,
// значение просто игнорируется).
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { resultTypes } = await fetchCatalogData();
  const type = resultTypes.find((t) => t.slug === slug);
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
  const { resultTypes, offers } = await fetchCatalogData();
  const type = resultTypes.find((t) => t.slug === slug);
  if (!type) notFound();

  const typeOffers = getOffersForType(offers, slug);
  const style = getCategoryStyle(type.categorySlug);
  const categoryName =
    CATEGORIES.find((c) => c.slug === type.categorySlug)?.name ?? "Другое";

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div
          className={`relative overflow-hidden text-white ${
            type.coverImageUrl ? "bg-zinc-900" : `bg-gradient-to-br ${style.gradient}`
          }`}
        >
          {type.coverImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- статический экспорт, без оптимизатора изображений */}
              <img
                src={withBasePath(type.coverImageUrl)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
            </>
          ) : (
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          )}
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm">
              <Link href="/services" className="hover:underline">
                Услуги
              </Link>{" "}
              / {categoryName} / {type.subcategory}
            </p>
            <div className="mt-3 flex items-center gap-3">
              {!type.coverImageUrl && (
                <span className="text-5xl drop-shadow-md">{style.icon}</span>
              )}
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{type.title}</h1>
                <p className="mt-1 text-sm text-white/80">{type.scopeLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Предложения специалистов
            </h2>
            <p className="text-sm text-zinc-500">
              {typeOffers.length === 1 ? "1 исполнитель" : `${typeOffers.length} исполнителя`}
            </p>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Один и тот же результат — сравните цену, срок и рейтинг, прежде
            чем смотреть, кто именно исполнитель.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {typeOffers.map((offer) => (
              <ServiceOfferRow key={offer.id} offer={offer} contextLabel={type.title} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
