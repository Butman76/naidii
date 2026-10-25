import Link from "next/link";
import ResultTypePlate from "./ResultTypePlate";
import EventsSidebar from "./events/EventsSidebar";
import NewsSidebar from "./news/NewsSidebar";
import { fetchCatalogData, summarizeResultTypes, sortByPromotedThenRating } from "@/lib/catalog";
import { fetchActiveUnclaimedListings, unclaimedForType } from "@/lib/unclaimed";

// Главный объект первого экрана каталога — плашка типа результата, а не
// профиль специалиста (см. PIVOT_SERVICE_CARDS.md). Живые данные из
// PocketBase с 2026-08-24 — раньше был mockTopResultTypes.
export default async function TopServices() {
  const [{ resultTypes, offers }, unclaimed] = await Promise.all([fetchCatalogData(), fetchActiveUnclaimedListings()]);
  const top = sortByPromotedThenRating(
    summarizeResultTypes(resultTypes, offers, { includeEmpty: true })
      .map((s) => ({ ...s, companiesCount: unclaimedForType(unclaimed, s).length }))
      .filter((s) => s.offersCount > 0 || s.companiesCount > 0)
  ).slice(0, 20);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Популярные услуги НайдИИ
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Конкретный результат, срок и цена — выбирайте услугу, а не
          выбирайте среди профилей.
        </p>
      </div>

      {/* События слева, новости справа, услуги посередине (2026-10-21). На телефоне и планшете
          порядок такой: услуги, события, новости. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)_250px]">
        <div className="order-2 self-start lg:order-1">
          <EventsSidebar />
        </div>
        <div className="order-1 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:order-2 lg:grid-cols-2 xl:grid-cols-3">
          {top.map((type) => (
            <ResultTypePlate key={type.id} type={type} />
          ))}
        </div>
        <div className="order-3 self-start">
          <NewsSidebar />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/services"
          className="inline-block rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-white"
        >
          Смотреть все услуги
        </Link>
      </div>
    </section>
  );
}
