import Link from "next/link";
import ResultTypePlate from "./ResultTypePlate";
import { fetchCatalogData, summarizeResultTypes, sortByPromotedThenRating } from "@/lib/catalog";

// Главный объект первого экрана каталога — плашка типа результата, а не
// профиль специалиста (см. PIVOT_SERVICE_CARDS.md). Живые данные из
// PocketBase с 2026-08-24 — раньше был mockTopResultTypes.
export default async function TopServices() {
  const { resultTypes, offers } = await fetchCatalogData();
  const top = sortByPromotedThenRating(summarizeResultTypes(resultTypes, offers)).slice(0, 20);

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

      <div className="mt-8 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {top.map((type) => (
          <ResultTypePlate key={type.id} type={type} />
        ))}
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
