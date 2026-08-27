// Единый визуальный стиль обложки карточки услуги по направлению — см.
// PIVOT_SERVICE_CARDS.md, раздел 4 («Рекомендация»): вместо генератора
// изображений на каждое направление — фирменный цветной дуотон-градиент +
// иконка поверх превью, которое грузит сам специалист (или просто градиент,
// если превью ещё нет). Держит визуальное единообразие каталога без
// генерации картинок.
export const CATEGORY_STYLE: Record<
  string,
  { gradient: string; icon: string; hex: string; hexLight: string }
> = {
  "ai-agents": { gradient: "from-blue-600 to-cyan-500", icon: "🤖", hex: "#3b82f6", hexLight: "#bfdbfe" },
  rag: { gradient: "from-emerald-600 to-teal-500", icon: "📚", hex: "#10b981", hexLight: "#a7f3d0" },
  orchestration: { gradient: "from-indigo-600 to-blue-500", icon: "🔗", hex: "#6366f1", hexLight: "#c7d2fe" },
  chatbots: { gradient: "from-sky-600 to-blue-500", icon: "💬", hex: "#0ea5e9", hexLight: "#bae6fd" },
  "voice-ai": { gradient: "from-rose-600 to-orange-500", icon: "🎙️", hex: "#f43f5e", hexLight: "#fecdd3" },
  "ai-video": { gradient: "from-fuchsia-600 to-pink-500", icon: "🎬", hex: "#d946ef", hexLight: "#f5d0fe" },
  "crm-ai": { gradient: "from-amber-600 to-yellow-500", icon: "🧩", hex: "#f59e0b", hexLight: "#fde68a" },
  "prompt-engineering": { gradient: "from-purple-600 to-violet-500", icon: "🧠", hex: "#a855f7", hexLight: "#e9d5ff" },
  "ai-analytics": { gradient: "from-teal-600 to-emerald-500", icon: "📈", hex: "#14b8a6", hexLight: "#99f6e4" },
  other: { gradient: "from-zinc-600 to-zinc-500", icon: "✨", hex: "#a1a1aa", hexLight: "#e4e4e7" },
};

export function getCategoryStyle(slug: string) {
  return CATEGORY_STYLE[slug] ?? CATEGORY_STYLE.other;
}

// Мягкий акцент того же семейства цвета, что и gradient выше — для мест,
// где нужна не яркая плашка, а просто "рамка в цвет направления" (карточки
// услуг в личном кабинете специалиста и т.п., см. STATUS.md 2026-08-25).
export const CATEGORY_ACCENT: Record<string, { border: string; tint: string }> = {
  "ai-agents": { border: "border-blue-200", tint: "bg-blue-50/60" },
  rag: { border: "border-emerald-200", tint: "bg-emerald-50/60" },
  orchestration: { border: "border-indigo-200", tint: "bg-indigo-50/60" },
  chatbots: { border: "border-sky-200", tint: "bg-sky-50/60" },
  "voice-ai": { border: "border-rose-200", tint: "bg-rose-50/60" },
  "ai-video": { border: "border-fuchsia-200", tint: "bg-fuchsia-50/60" },
  "crm-ai": { border: "border-amber-200", tint: "bg-amber-50/60" },
  "prompt-engineering": { border: "border-purple-200", tint: "bg-purple-50/60" },
  "ai-analytics": { border: "border-teal-200", tint: "bg-teal-50/60" },
  other: { border: "border-zinc-200", tint: "bg-white" },
};

export function getCategoryAccent(slug: string) {
  return CATEGORY_ACCENT[slug] ?? CATEGORY_ACCENT.other;
}
