import { CATEGORIES } from "@/data/categories";
import { fetchCatalogData } from "@/lib/catalog";
import { fetchSpecialists } from "@/lib/specialists";

// Живые цифры из PocketBase (см. STATUS.md, переход с моков, 2026-08-24) —
// не выдуманы отдельно, поэтому не расходятся с тем, что реально видно на
// сайте ниже.
export default async function TrustStats() {
  const [{ resultTypes, offers }, specialists] = await Promise.all([
    fetchCatalogData(),
    fetchSpecialists(),
  ]);

  const averageRating = specialists.length
    ? (specialists.reduce((acc, s) => acc + s.rating, 0) / specialists.length).toFixed(1)
    : "—";

  const stats = [
    { value: `${resultTypes.length}`, label: "типов результата" },
    { value: `${offers.length}`, label: "предложений специалистов" },
    { value: `${CATEGORIES.length - 1}`, label: "направлений AI-автоматизации" },
    { value: `★ ${averageRating}`, label: "средний рейтинг специалистов" },
  ];

  return (
    <section className="border-b border-zinc-200 bg-gradient-to-r from-amber-50 via-rose-50 to-violet-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-zinc-900 sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-zinc-600 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
