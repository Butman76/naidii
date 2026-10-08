"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NewsCard, { NewsCover } from "./NewsCard";
import { KIND_LABELS, formatNewsDate, readingMinutes, type NewsKind, type NewsPost } from "@/lib/news";

type Filter = "all" | NewsKind;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "news", label: "Новости" },
  { id: "article", label: "Статьи" },
];

// Фильтр по рубрике — на клиенте по уже загруженному списку (как у событий).
// Первая публикация — крупная «главная» карточка, остальные — сетка.
export default function NewsCatalog({ posts }: { posts: NewsPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const list = useMemo(() => (filter === "all" ? posts : posts.filter((p) => p.kind === filter)), [posts, filter]);
  const [lead, ...rest] = list;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 self-start rounded-full bg-zinc-100 p-1 sm:inline-flex">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 motion-reduce:transition-none ${
              filter === f.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-white hover:text-zinc-900"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {lead ? (
        <>
          <Link
            href={`/news/${lead.slug}`}
            className="group mt-6 grid overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:shadow-xl md:grid-cols-5"
          >
            <NewsCover post={lead} className="aspect-[16/10] md:col-span-3 md:aspect-auto md:min-h-[320px]" />
            <div className="flex flex-col justify-center p-6 md:col-span-2 md:p-8">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {KIND_LABELS[lead.kind]} · {formatNewsDate(lead.publishedAt)}
                {lead.kind === "article" && ` · ${readingMinutes(lead.body)} мин`}
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-zinc-900 group-hover:text-blue-700 sm:text-3xl">{lead.title}</h2>
              {lead.excerpt && <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-zinc-600">{lead.excerpt}</p>}
              <p className="mt-5 text-sm font-medium text-blue-700">Читать полностью →</p>
            </div>
          </Link>

          {rest.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          {filter === "all" ? "Пока публикаций нет — загляните позже." : "В этой рубрике пока ничего нет."}
        </p>
      )}
    </div>
  );
}
