"use client";

import { useEffect, useRef, useState } from "react";
import type { PartnerAd } from "@/lib/partner-ads";

// Скорость ленты в пикселях/сек — длительность анимации считается из
// реально измеренной ширины дорожки (см. useEffect ниже), а не задаётся
// фиксированным числом секунд: при фиксированной длительности лента с
// малым числом баннеров "ползла" бы неестественно медленно (короткая
// дорожка, то же время на проход), а с большим — бежала бы слишком быстро.
const PIXELS_PER_SECOND = 55;

// Высота карточки фиксирована, ширина — нет: рекламодатели присылают и
// портретные, и альбомные креативы (см. PartnerAdsTab.tsx — там больше не
// требуют конкретную пропорцию), а раньше жёсткая рамка aspect-[3/4] с
// object-cover обрезала у альбомного баннера верх и низ. Вместо этого
// высота блока под картинку задана константой ниже (192px), ширина у
// <img> — auto: браузер сам считает её из реальных пропорций файла, поэтому и портрет, и
// альбом, и любой другой формат в будущем показываются целиком, без обрезки.
// max-width/min-width — только подстраховка от совсем экстремальных
// пропорций (панорама или узкая полоса), на этот случай object-contain с
// серым полем — компромисс "лучше поля по бокам, чем обрезанный логотип".
const CARD_HEIGHT_PX = 192;

function AdCard({ ad }: { ad: PartnerAd }) {
  // Обычная HTML-форма (POST), не <a href>: см. api/ad-click/route.ts —
  // GET-роут с редиректом на основе id не может статически собраться под
  // STATIC_EXPORT (GitHub Pages), а форма с POST работает как обычная
  // ссылка (открывается в новой вкладке через target на форме) и не
  // требует JS.
  return (
    <form action="/api/ad-click" method="POST" target="_blank" className="shrink-0">
      <input type="hidden" name="id" value={ad.id} />
      <button
        type="submit"
        className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 text-left transition-shadow hover:shadow-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.companyName}
          style={{ height: CARD_HEIGHT_PX }}
          className="w-auto min-w-[120px] max-w-[340px] bg-zinc-100 object-contain"
          loading="lazy"
        />
        <p className="max-w-[340px] truncate bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700">
          {ad.companyName}
        </p>
      </button>
    </form>
  );
}

// Бегущая лента рекламы сторонних контор (курсы по ИИ, агентства
// автоматизации) — не наши специалисты, отдельная монетизация вдобавок к
// тарифам (см. STATUS.md). Ничего не рендерит, если баннеров нет — рекламы
// пока нет ни на одной странице (площадка молодая), пустая лента выглядела
// бы как баг, а не как "здесь могла быть ваша реклама".
//
// С одним баннером бежать нечему (дублировать один и тот же ради петли —
// только путает: "я разместил один, а вижу два одинаковых") — тогда просто
// показываем статичную карточку без анимации.
export default function PartnerAdsCarousel({ ads }: { ads: PartnerAd[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);

  const doubled = ads.length > 1 ? [...ads, ...ads] : ads;

  useEffect(() => {
    if (!trackRef.current || ads.length <= 1) return;
    const distance = trackRef.current.scrollWidth / 2;
    setDuration(Math.max(8, distance / PIXELS_PER_SECOND));
  }, [ads]);

  if (ads.length === 0) return null;

  return (
    <div className="border-y border-zinc-200 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          Реклама
        </p>
      </div>
      <div className="overflow-hidden">
        {ads.length > 1 ? (
          <div
            ref={trackRef}
            className="partner-ads-track flex w-max gap-4"
            style={{ animationDuration: `${duration}s` }}
          >
            {doubled.map((ad, i) => (
              <AdCard key={`${ad.id}-${i}`} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">
            <AdCard ad={ads[0]} />
          </div>
        )}
      </div>
    </div>
  );
}
