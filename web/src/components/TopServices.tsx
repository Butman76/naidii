import Link from "next/link";
import ResultTypePlate from "./ResultTypePlate";
import { mockTopResultTypes } from "@/data/mock-services";

// Главный объект первого экрана каталога — теперь плашка типа результата,
// а не профиль специалиста (см. PIVOT_SERVICE_CARDS.md). Сетка и принцип
// добора (продвигаемые + органика) — тот же, что раньше был у Топ-20
// специалистов (ТЗ §4.4/§8.3), применён к другому объекту.
export default function TopServices() {
  const top = mockTopResultTypes.slice(0, 20);

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
