// Единый визуальный стиль обложки карточки услуги по направлению — см.
// PIVOT_SERVICE_CARDS.md, раздел 4 («Рекомендация»): вместо генератора
// изображений на каждое направление — фирменный цветной дуотон-градиент +
// иконка поверх превью, которое грузит сам специалист (или просто градиент,
// если превью ещё нет). Держит визуальное единообразие каталога без
// генерации картинок.
export const CATEGORY_STYLE: Record<
  string,
  { gradient: string; icon: string }
> = {
  "ai-agents": { gradient: "from-blue-600 to-cyan-500", icon: "🤖" },
  rag: { gradient: "from-emerald-600 to-teal-500", icon: "📚" },
  orchestration: { gradient: "from-indigo-600 to-blue-500", icon: "🔗" },
  chatbots: { gradient: "from-sky-600 to-blue-500", icon: "💬" },
  "voice-ai": { gradient: "from-rose-600 to-orange-500", icon: "🎙️" },
  "ai-video": { gradient: "from-fuchsia-600 to-pink-500", icon: "🎬" },
  "crm-ai": { gradient: "from-amber-600 to-yellow-500", icon: "🧩" },
  "prompt-engineering": { gradient: "from-purple-600 to-violet-500", icon: "🧠" },
  "ai-analytics": { gradient: "from-teal-600 to-emerald-500", icon: "📈" },
  other: { gradient: "from-zinc-600 to-zinc-500", icon: "✨" },
};

export function getCategoryStyle(slug: string) {
  return CATEGORY_STYLE[slug] ?? CATEGORY_STYLE.other;
}
