import Link from "next/link";
import SpecialistCard from "./SpecialistCard";
import { mockTopSpecialists } from "@/data/mock-specialists";

export default function TopSpecialists() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Топ-специалисты НайдИИ
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Продвигаемые автоматизаторы, AI-интеграторы и разработчики.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {mockTopSpecialists.map((specialist) => (
          <SpecialistCard key={specialist.id} specialist={specialist} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/specialists"
          className="inline-block rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-white"
        >
          Смотреть всех специалистов
        </Link>
      </div>
    </section>
  );
}
