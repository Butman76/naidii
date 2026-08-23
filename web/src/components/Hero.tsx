"use client";

const EXAMPLE_QUERIES = [
  "AI-бот для обработки заявок",
  "Интеграция Битрикс24 и Telegram",
  "Настроить n8n",
  "AI-агент для отдела продаж",
  "Автоматизировать складскую отчётность",
  "Связать 1С и CRM",
  "Создать базу знаний с RAG",
];

const HEADLINE = "Найдите результат, а не профиль";

function AnimatedHeadline({ text }: { text: string }) {
  // Сквозной индекс буквы (для равномерной задержки анимации по всему
  // заголовку) считаем через reduce — без mutable-переменной, которую не
  // любит react-hooks/immutability.
  const wordsWithOffsets = text.split(" ").reduce<
    Array<{ word: string; startIndex: number }>
  >((acc, word) => {
    const startIndex = acc.length === 0 ? 0 : acc[acc.length - 1].startIndex + acc[acc.length - 1].word.length;
    return [...acc, { word, startIndex }];
  }, []);

  return (
    <>
      {wordsWithOffsets.map(({ word, startIndex }, wordIndex) => (
        <span key={wordIndex} className="mr-[0.28em] inline-block last:mr-0">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="letter-in"
              style={{ animationDelay: `${(startIndex + charIndex) * 0.035}s` }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          <span className="sr-only">{HEADLINE}</span>
          <span aria-hidden="true">
            <AnimatedHeadline text={HEADLINE} />
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Конкретный результат, цена и срок — сразу на карточке. AI-агенты,
          нейрокодинг, Telegram-боты, CRM-интеграции, n8n, Make, RAG и
          автоматизация процессов.
        </p>

        <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder="Что нужно автоматизировать?"
            className="w-full rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Найти результат
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
          {EXAMPLE_QUERIES.map((query) => (
            <span
              key={query}
              className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs text-zinc-600 backdrop-blur-sm"
            >
              {query}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
