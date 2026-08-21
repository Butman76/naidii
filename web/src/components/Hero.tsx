const EXAMPLE_QUERIES = [
  "AI-бот для обработки заявок",
  "Интеграция Битрикс24 и Telegram",
  "Настроить n8n",
  "AI-агент для отдела продаж",
  "Автоматизировать складскую отчётность",
  "Связать 1С и CRM",
  "Создать базу знаний с RAG",
];

export default function Hero() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          НайдИИ специалиста для автоматизации бизнеса
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          AI-агенты, нейрокодинг, Telegram-боты, CRM-интеграции, n8n, Make,
          API, 1С, RPA и автоматизация процессов.
        </p>

        <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder="Что нужно автоматизировать?"
            className="w-full rounded-full border border-zinc-300 px-5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Найти специалиста
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
          {EXAMPLE_QUERIES.map((query) => (
            <span
              key={query}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500"
            >
              {query}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
