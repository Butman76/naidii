import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";

// Спокойные, приглушённые версии палитры направлений (в отличие от ярких
// насыщенных градиентов на обложках карточек услуг — там нужна была
// "кричащая" картинка, здесь — просто узнаваемый, некрикливый акцент для
// маленького UI-элемента). Оттенок у каждого направления тот же, что и на
// обложке (см. category-style.ts), просто взят светлый/приглушённый тон.
const SOFT_STYLE: Record<string, string> = {
  "ai-agents": "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100",
  rag: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100",
  orchestration: "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100",
  chatbots: "bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100",
  "voice-ai": "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100",
  "ai-video": "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 hover:bg-fuchsia-100",
  "crm-ai": "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100",
  "prompt-engineering": "bg-purple-50 text-purple-700 ring-purple-200 hover:bg-purple-100",
  "ai-analytics": "bg-teal-50 text-teal-700 ring-teal-200 hover:bg-teal-100",
  other: "bg-zinc-100 text-zinc-700 ring-zinc-200 hover:bg-zinc-200",
};

export default function DirectionsStrip() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-zinc-500">
          Выберите направление
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((category) => {
            const style = getCategoryStyle(category.slug);
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition-colors ${SOFT_STYLE[category.slug] ?? SOFT_STYLE.other}`}
              >
                <span>{style.icon}</span>
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
