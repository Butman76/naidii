// Единый визуал тарифов — общий для /tariffs (app/tariffs/page.tsx) и
// вкладки "Тариф" в кабинете специалиста (dashboard/PlanPaymentPanel.tsx,
// dashboard/SpecialistDashboard.tsx), чтобы премиальный редизайн 2026-09-28
// не разъезжался по двум разным местам с одинаковым смыслом. Как и
// data/category-style.ts — модель тарифов в data/plans.ts, здесь только
// оформление.

export const PLAN_SHELL: Record<string, string> = {
  basic: "bg-gradient-to-b from-blue-400 via-blue-100 to-transparent",
  pro: "bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400",
  enterprise: "bg-gradient-to-br from-violet-300 via-zinc-200 to-amber-300",
};

export const PLAN_TAGLINE: Record<string, { text: string; color: string }> = {
  basic: { text: "Чтобы начать и показать свою экспертизу", color: "text-blue-600" },
  pro: { text: "Для специалистов, которым нужна заметность", color: "text-zinc-400" },
  enterprise: { text: "Для студий, агентств и команд с объёмом", color: "text-violet-600" },
};
