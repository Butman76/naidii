"use client";

import { useEffect, useRef, useState } from "react";
import type { PartnerAd } from "@/lib/partner-ads";

// Скорость ленты в пикселях/сек — длительность анимации считается из
// реально измеренной ширины дорожки (см. useEffect ниже), а не задаётся
// фиксированным числом секунд: при фиксированной длительности лента с
// малым числом баннеров "ползла" бы неестественно медленно (короткая
// дорожка, то же время на проход), а с большим — бежала бы слишком быстро.
const PIXELS_PER_SECOND = 55;

// Высота карточки фиксирована, ширина каждой карточки — под реальную
// пропорцию её картинки (портрет уже, альбом шире), чтобы показывать любой
// формат целиком, без обрезки (см. PartnerAdsTab.tsx — там больше не
// требуют конкретную пропорцию). min/max — подстраховка от экстремальных
// пропорций (панорама/узкая полоса): на этот случай object-contain в
// AdCard добавляет серые поля, а не обрезает.
const CARD_HEIGHT_PX = 192;
const MIN_WIDTH_PX = 120;
const MAX_WIDTH_PX = 340;
const FALLBACK_ASPECT = 3 / 4;

function clampWidth(aspect: number): number {
  return Math.round(Math.max(MIN_WIDTH_PX, Math.min(MAX_WIDTH_PX, CARD_HEIGHT_PX * aspect)));
}

function AdCard({ ad, width }: { ad: PartnerAd; width: number }) {
  // Обычная HTML-форма (POST), не <a href>: см. api/ad-click/route.ts —
  // GET-роут с редиректом на основе id не может статически собраться под
  // STATIC_EXPORT (GitHub Pages), а форма с POST работает как обычная
  // ссылка (открывается в новой вкладке через target на форме) и не
  // требует JS.
  //
  // Ширина карточки приходит готовым числом сверху (см. usePreloadedWidths
  // ниже), а не считается тут же из натуральных размеров <img> — если бы
  // ширина менялась в момент, когда картинка сама догружается, это было бы
  // видно как рывок посреди уже идущей CSS-анимации (translateX(-50%)
  // пересчитывается от текущей ширины дорожки на каждом кадре).
  return (
    <form action="/api/ad-click" method="POST" target="_blank" className="shrink-0" style={{ width }}>
      <input type="hidden" name="id" value={ad.id} />
      <button
        type="submit"
        className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 text-left transition-shadow hover:shadow-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.companyName}
          style={{ height: CARD_HEIGHT_PX, width }}
          className="bg-zinc-100 object-contain"
        />
        <p className="truncate bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700">
          {ad.companyName}
        </p>
      </button>
    </form>
  );
}

// Заранее (до отрисовки дорожки) измеряет реальные пропорции каждой
// картинки через отдельный Image(), не полагаясь на layout уже
// отрендеренных <img>. Пока размеры не известны — используется запасной
// портретный aspect ratio, тот же, что и раньше был жёстко зашит.
function usePreloadedWidths(ads: PartnerAd[]): { widths: Record<string, number>; ready: boolean } {
  const [widths, setWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      ads.map(
        (ad) =>
          new Promise<[string, number]>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const aspect =
                img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : FALLBACK_ASPECT;
              resolve([ad.id, clampWidth(aspect)]);
            };
            img.onerror = () => resolve([ad.id, clampWidth(FALLBACK_ASPECT)]);
            img.src = ad.imageUrl;
          })
      )
    ).then((pairs) => {
      if (!cancelled) setWidths(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [ads]);

  return { widths, ready: ads.length > 0 && ads.every((ad) => widths[ad.id] != null) };
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
  const { widths, ready } = usePreloadedWidths(ads);

  const doubled = ads.length > 1 ? [...ads, ...ads] : ads;

  // Длительность пересчитывается только когда все ширины уже известны
  // (ready) — иначе дорожка меряется по ещё не готовому layout'у и
  // анимация запускается с заниженной длительностью под будущую, более
  // широкую дорожку: лента "долетает" до конца раньше, чем прошла реальную
  // половину пути, и с виду обрывается/дёргается посередине экрана.
  useEffect(() => {
    if (!trackRef.current || ads.length <= 1 || !ready) return;
    const distance = trackRef.current.scrollWidth / 2;
    setDuration(Math.max(8, distance / PIXELS_PER_SECOND));
  }, [ads, ready]);

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
            style={{ animationDuration: `${duration}s`, visibility: ready ? "visible" : "hidden" }}
          >
            {doubled.map((ad, i) => (
              <AdCard key={`${ad.id}-${i}`} ad={ad} width={widths[ad.id] ?? clampWidth(FALLBACK_ASPECT)} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">
            <AdCard ad={ads[0]} width={widths[ads[0].id] ?? clampWidth(FALLBACK_ASPECT)} />
          </div>
        )}
      </div>
    </div>
  );
}
