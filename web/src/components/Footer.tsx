import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/legal/agreement", label: "Договор со специалистом" },
  { href: "/legal/terms", label: "Условия использования" },
  { href: "/legal/rules", label: "Правила использования" },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-[#2e1065]">
      <span aria-hidden="true" className="neon-line neon-line-top" />
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-zinc-300 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-zinc-300 hover:text-white hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="mt-3">© {new Date().getFullYear()} НайдИИ — naidii.ru</p>
        <p className="mt-1 text-xs text-zinc-400">
          ООО «ЯрьТехноЛаб» · ИНН 7840128697 · ОГРН 1267800048592
        </p>
      </div>
    </footer>
  );
}
