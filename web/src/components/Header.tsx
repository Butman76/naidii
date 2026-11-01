"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthStatus from "./AuthStatus";
import HeaderCta from "./HeaderCta";

const NAV_LINKS = [
  { href: "/services", label: "Услуги" },
  { href: "/specialists", label: "Специалисты" },
  { href: "/categories", label: "Категории" },
  { href: "/events", label: "AI-события" },
  { href: "/news", label: "Новости" },
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/tariffs", label: "Тарифы" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-zinc-900 shadow-[inset_0_-1px_0_theme(colors.zinc.800)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="НайдИИ"
          className="font-[family-name:var(--font-unbounded)] text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          <span className="neon-green">Найд</span>
          <span className="neon-red">ИИ</span>
        </Link>

        <nav className="hidden items-center gap-6 font-[family-name:var(--font-golos)] text-sm font-medium lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative pb-1 transition-colors ${
                  active ? "text-white" : "text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-gradient-to-r from-blue-400 to-cyan-300 transition-transform duration-200 group-hover:scale-x-100 ${
                    active ? "scale-x-100" : ""
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <AuthStatus />
          <HeaderCta />
        </div>
      </div>
    </header>
  );
}
