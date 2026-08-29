"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthStatus from "./AuthStatus";
import HeaderCta from "./HeaderCta";

const NAV_LINKS = [
  { href: "/services", label: "Услуги" },
  { href: "/specialists", label: "Специалисты" },
  { href: "/categories", label: "Категории" },
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/tariffs", label: "Тарифы" },
  { href: "/for-specialists", label: "Для исполнителей" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-[inset_0_-1px_0_theme(colors.zinc.200)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-golos)] text-xl font-extrabold tracking-tight text-zinc-900"
        >
          НайдИИ
        </Link>

        <nav className="hidden items-center gap-6 font-[family-name:var(--font-golos)] text-sm font-medium lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative pb-1 transition-colors ${
                  active ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform duration-200 group-hover:scale-x-100 ${
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
