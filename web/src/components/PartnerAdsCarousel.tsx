import type { PartnerAd } from "@/lib/partner-ads";

// Бегущая лента рекламы сторонних контор (курсы по ИИ, агентства
// автоматизации) — не наши специалисты, отдельная монетизация вдобавок к
// тарифам (см. STATUS.md). Ничего не рендерит, если баннеров нет — рекламы
// пока нет ни на одной странице (площадка молодая), пустая лента выглядела
// бы как баг, а не как "здесь могла быть ваша реклама".
export default function PartnerAdsCarousel({ ads }: { ads: PartnerAd[] }) {
  if (ads.length === 0) return null;

  // Дублируем ленту — анимация в globals.css (.partner-ads-track) сдвигает
  // ровно на -50%, так что конец первой копии бесшовно стыкуется с началом
  // второй, и цикл выглядит бесконечным.
  const doubled = [...ads, ...ads];

  return (
    <div className="border-y border-zinc-200 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          Реклама
        </p>
      </div>
      <div className="overflow-hidden">
        <div className="partner-ads-track flex w-max gap-4">
          {doubled.map((ad, i) => (
            <a
              key={`${ad.id}-${i}`}
              href={`/api/ad-click/${ad.id}`}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="flex w-48 shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200 transition-shadow hover:shadow-md"
            >
              {/* Портретный формат ~3:4 — под него и просим готовые
                  креативы у рекламодателей (см. PartnerAdsTab.tsx), не
                  тянем произвольные пропорции под альбомную рамку. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.imageUrl}
                alt={ad.companyName}
                className="aspect-[3/4] w-full object-cover"
                loading="lazy"
              />
              <p className="truncate bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700">
                {ad.companyName}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
