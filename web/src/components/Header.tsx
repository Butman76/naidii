import Link from "next/link";
import AuthStatus from "./AuthStatus";

const NAV_LINKS = [
  { href: "/services", label: "Услуги" },
  { href: "/specialists", label: "Специалисты" },
  { href: "/categories", label: "Категории" },
  { href: "/cases", label: "Кейсы" },
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/tariffs", label: "Тарифы" },
  { href: "/for-specialists", label: "Для исполнителей" },
];

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            НайдИИ
          </span>
          <span className="text-sm text-zinc-400">naidii.ru</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AuthStatus />
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Разместить карточку
          </Link>
        </div>
      </div>
    </header>
  );
}
