import type { UnclaimedListing } from "@/lib/unclaimed";
import UnclaimedCard from "./UnclaimedCard";

export default function UnclaimedSection({ listings }: { listings: UnclaimedListing[] }) {
  if (listings.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-zinc-900">Ещё не зарегистрированы на НайдИИ</h2>
      <p className="mt-1 max-w-2xl text-sm text-zinc-500">
        Компании, которых мы нашли сами по открытым данным — они пока не подключились к площадке. Если это ваша компания, подтвердите карточку прямо на ней.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {listings.map((l) => (
          <UnclaimedCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
