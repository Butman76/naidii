"use client";

import type { ReactNode } from "react";

// Меню кабинета исполнителя: на десктопе — боковая панель с группами, на
// телефоне — нижняя лента с иконками (прокручивается пальцем). Раньше были
// плоские вкладки с подчёркиванием (2026-10-17, замечание владельца
// «пиздец скучный», выбран вариант А из трёх предложенных).

export type NavItem = { id: string; label: string };

const ICONS: Record<string, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  services: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  leads: (
    <>
      <path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M3 13h5l1 3h6l1-3h5" />
    </>
  ),
  orders: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
    </>
  ),
  jobboard: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1z" />
      <path d="M18 9a4 4 0 0 1 0 6" />
    </>
  ),
  reviews: (
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  ),
  analytics: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 18.5a6.5 6.5 0 0 1 11.6 0" />
    </>
  ),
  landing: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  plan: (
    <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />
  ),
};

function NavIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[id] ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}

const GROUPS: Array<{ title: string | null; ids: string[] }> = [
  { title: null, ids: ["overview"] },
  { title: "Работа", ids: ["services", "leads", "orders", "jobboard", "archive"] },
  { title: "Репутация", ids: ["reviews", "analytics"] },
  { title: "Витрина", ids: ["profile", "landing", "plan"] },
];

export default function SpecialistNav({
  items,
  active,
  onSelect,
  badges,
  name,
  initials,
  planLabel,
}: {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
  badges?: Record<string, number>;
  name: string;
  initials: string;
  planLabel: string;
}) {
  const byId = new Map(items.map((i) => [i.id, i]));

  return (
    <>
      <nav aria-label="Разделы кабинета" className="hidden lg:block">
        <div className="sticky top-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 px-2 pb-3 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-zinc-900">{name}</p>
              <p className="text-xs text-zinc-500">{planLabel}</p>
            </div>
          </div>
          {GROUPS.map((g) => {
            const list = g.ids.map((id) => byId.get(id)).filter((x): x is NavItem => Boolean(x));
            if (list.length === 0) return null;
            return (
              <div key={g.title ?? "top"} className="mt-1">
                {g.title && (
                  <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {g.title}
                  </p>
                )}
                {list.map((it) => {
                  const isActive = active === it.id;
                  const badge = badges?.[it.id] ?? 0;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => onSelect(it.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-all duration-150 motion-reduce:transition-none ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white shadow-md shadow-indigo-500/25"
                          : "font-medium text-zinc-600 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-700 motion-reduce:hover:translate-x-0"
                      }`}
                    >
                      <NavIcon id={it.id} className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      {badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            isActive ? "bg-white text-indigo-700" : "bg-rose-500 text-white"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Разделы кабинета"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur lg:hidden"
      >
        <div className="flex overflow-x-auto px-1 pb-[env(safe-area-inset-bottom)]">
          {GROUPS.flatMap((g) => g.ids)
            .map((id) => byId.get(id))
            .filter((x): x is NavItem => Boolean(x))
            .map((it) => {
              const isActive = active === it.id;
              const badge = badges?.[it.id] ?? 0;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onSelect(it.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex min-w-[76px] shrink-0 flex-col items-center gap-1 px-2 pb-2 pt-2.5 text-[11px] font-semibold transition-colors ${
                    isActive ? "text-indigo-700" : "text-zinc-500"
                  }`}
                >
                  <span
                    className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-indigo-100" : ""
                    }`}
                  >
                    <NavIcon id={it.id} className="h-5 w-5" />
                    {badge > 0 && (
                      <span className="absolute -right-0.5 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-4 text-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="max-w-[72px] truncate">{it.label.replace("Доска объявлений", "Доска").replace("Настройка профиля", "Настройки")}</span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
}
