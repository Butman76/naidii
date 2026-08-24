import { mockSpecialists } from "@/data/mock-specialists";
import { mockResultTypes, mockServiceOffers } from "@/data/mock-services";
import { CATEGORIES } from "@/data/categories";

// Цифры считаются из тех же моковых массивов, что рендерят каталог — не
// придуманы отдельно, поэтому не разойдутся с тем, что реально видно на
// сайте (см. STATUS.md про то, что весь фронтенд пока на моках).
function averageRating() {
  const sum = mockSpecialists.reduce((acc, s) => acc + s.rating, 0);
  return (sum / mockSpecialists.length).toFixed(1);
}

const STATS = [
  { value: `${mockResultTypes.length}`, label: "типов результата" },
  { value: `${mockServiceOffers.length}`, label: "предложений специалистов" },
  { value: `${CATEGORIES.length - 1}`, label: "направлений AI-автоматизации" },
  { value: `★ ${averageRating()}`, label: "средний рейтинг специалистов" },
];

export default function TrustStats() {
  return (
    <section className="border-b border-zinc-200 bg-gradient-to-r from-amber-50 via-rose-50 to-violet-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
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
