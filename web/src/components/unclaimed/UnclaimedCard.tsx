import Link from "next/link";
import type { UnclaimedListing } from "@/lib/unclaimed";
import CategoryDots from "@/components/CategoryDots";

// Карточка компании, которую нашли и добавили мы сами по открытым данным —
// не сама компания (см. STATUS.md, «claim your business», 2026-09-28).
// Живёт вперемешку с обычными карточками специалистов в общей сетке, той же
// формы (точки-направления, а не цветные плашки — см. CategoryDots.tsx).
// По просьбе пользователя 2026-09-28: никаких кнопок и внешней ссылки на
// сайт компании прямо в карточке — это было бы прямой переадресацией мимо
// площадки. Вся карточка ведёт на профиль (/unclaimed/[domain]), там —
// подробности и форма «это моя компания».
export default function UnclaimedCard({ listing }: { listing: UnclaimedListing }) {
  return (
    <Link
      href={`/unclaimed/${listing.domain}`}
      className="flex flex-col rounded-2xl border border-dashed border-zinc-300 bg-white p-4 transition-shadow hover:shadow-md"
    >
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
    </Link>
  );
}
