import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

// 3D-кнопка на направление: тот же градиент, что и на обложках карточек
// услуг (category-style.ts), плюс более тёмный оттенок снизу — классический
// приём "бевела" (border-b + смещение при hover/active), чтобы кнопка
// выглядела объёмной, и цветная тень под цвет направления.
const BUTTON_STYLE: Record<string, string> = {
  "ai-agents": "from-blue-600 to-cyan-500 border-blue-800 shadow-blue-500/40",
  rag: "from-emerald-600 to-teal-500 border-emerald-800 shadow-emerald-500/40",
  orchestration: "from-indigo-600 to-blue-500 border-indigo-800 shadow-indigo-500/40",
  chatbots: "from-sky-600 to-blue-500 border-sky-800 shadow-sky-500/40",
  "voice-ai": "from-rose-600 to-orange-500 border-rose-800 shadow-rose-500/40",
  "ai-video": "from-fuchsia-600 to-pink-500 border-fuchsia-800 shadow-fuchsia-500/40",
  "crm-ai": "from-amber-600 to-yellow-500 border-amber-800 shadow-amber-500/40",
  "prompt-engineering": "from-purple-600 to-violet-500 border-purple-800 shadow-purple-500/40",
  "ai-analytics": "from-teal-600 to-emerald-500 border-teal-800 shadow-teal-500/40",
  other: "from-zinc-600 to-zinc-500 border-zinc-800 shadow-zinc-500/40",
};

export default function DirectionsStrip() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-zinc-500">
          Выберите направление
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => {
            const classes = BUTTON_STYLE[category.slug] ?? BUTTON_STYLE.other;
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={`rounded-2xl border-b-4 bg-gradient-to-br px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:border-b-2 ${classes}`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
