import Link from "next/link";
import type { UnclaimedListing } from "@/lib/unclaimed";
import CategoryDots from "@/components/CategoryDots";
import { getCategoryStyle } from "@/data/category-style";

// Карточка компании, которую нашли и добавили мы сами по открытым данным —
// не сама компания (см. STATUS.md, «claim your business», 2026-09-28).
// Живёт вперемешку с обычными карточками специалистов в общей сетке, той же
// формы (точки-направления, а не цветные плашки — см. CategoryDots.tsx) и
// той же ховер-анимации, что у SpecialistCard.tsx и events/EventCard.tsx
// (2026-09-28, по просьбе пользователя — иначе половина карточек в сетке
// вела бы себя иначе просто потому, что технически это другой компонент).
// Пунктирная рамка — единственное, что осталось отличать «неподтверждённую»
// карточку от обычной. По просьбе пользователя 2026-09-28: никаких кнопок и
// внешней ссылки на сайт компании прямо в карточке — это было бы прямой
// переадресацией мимо площадки. Вся карточка ведёт на профиль
// (/unclaimed/[domain]), там — подробности и форма «это моя компания».
export default function UnclaimedCard({ listing }: { listing: UnclaimedListing }) {
  const style = getCategoryStyle(listing.categories[0] ?? "other");

  return (
    <Link
      href={`/unclaimed/${listing.domain}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.gradient}`} aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-8 right-0 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-30 motion-reduce:transition-none"
        style={{ background: style.hex }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
              {listing.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">{listing.name}</p>
              <p className="truncate text-xs text-zinc-500">{listing.domain}{listing.city ? ` · ${listing.city}` : ""}</p>
            </div>
          </div>
        </div>

        <CategoryDots categories={listing.categories} />

        <div className="mt-3">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            Добавлено редакцией
          </span>
        </div>

        {listing.blurb && <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{listing.blurb}</p>}

        <p className="mt-auto pt-4 text-xs font-medium text-blue-700">Открыть профиль →</p>
      </div>
    </Link>
  );
}
