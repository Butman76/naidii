// Единый визуальный стиль обложки карточки услуги по направлению — см.
// PIVOT_SERVICE_CARDS.md, раздел 4 («Рекомендация»): вместо генератора
// изображений на каждое направление — фирменный цветной дуотон-градиент +
// иконка поверх превью, которое грузит сам специалист (или просто градиент,
// если превью ещё нет). Держит визуальное единообразие каталога без
// генерации картинок.
export const CATEGORY_STYLE: Record<
  string,
  { gradient: string; icon: string; dot: string }
> = {
  "ai-agents": { gradient: "from-blue-600 to-cyan-500", icon: "🤖", dot: "bg-blue-500" },
  rag: { gradient: "from-emerald-600 to-teal-500", icon: "📚", dot: "bg-emerald-500" },
  orchestration: { gradient: "from-indigo-600 to-blue-500", icon: "🔗", dot: "bg-indigo-500" },
  chatbots: { gradient: "from-sky-600 to-blue-500", icon: "💬", dot: "bg-sky-500" },
  "voice-ai": { gradient: "from-rose-600 to-orange-500", icon: "🎙️", dot: "bg-rose-500" },
  "ai-video": { gradient: "from-fuchsia-600 to-pink-500", icon: "🎬", dot: "bg-fuchsia-500" },
  "crm-ai": { gradient: "from-amber-600 to-yellow-500", icon: "🧩", dot: "bg-amber-500" },
  "prompt-engineering": { gradient: "from-purple-600 to-violet-500", icon: "🧠", dot: "bg-purple-500" },
  "ai-analytics": { gradient: "from-teal-600 to-emerald-500", icon: "📈", dot: "bg-teal-500" },
  other: { gradient: "from-zinc-600 to-zinc-500", icon: "✨", dot: "bg-zinc-400" },
};

export function getCategoryStyle(slug: string) {
  return CATEGORY_STYLE[slug] ?? CATEGORY_STYLE.other;
}
