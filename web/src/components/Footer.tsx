export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-zinc-500 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} НайдИИ — naidii.ru</p>
        <p className="mt-1 text-xs text-zinc-400">
          ООО «ЯрьТехноЛаб» · ИНН 7840128697 · ОГРН 1267800048592
        </p>
      </div>
    </footer>
  );
}
