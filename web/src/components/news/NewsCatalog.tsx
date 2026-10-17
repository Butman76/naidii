"use client";

import { useEffect, useMemo, useState } from "react";
import NewsTile, { type TileSize } from "./NewsTile";
import type { NewsKind, NewsPost } from "@/lib/news";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

type Filter = "all" | NewsKind;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "news", label: "Новости" },
  { id: "article", label: "Статьи" },
];

// Мозаика: размеры плиток идут по кругу так, чтобы на сетке из 4 колонок
// ячейки закрывались без дыр (цикл из 10 плиток = 16 ячеек), а лента
// перемежала крупные, широкие, высокие и малые плитки. Для 1–3 публикаций —
// отдельные раскладки, иначе половина ряда осталась бы пустой.
const CYCLE: TileSize[] = ["xl", "sm", "sm", "wide", "tall", "sm", "sm", "sm", "wide", "sm"];
const SHORT: Record<number, TileSize[]> = {
  1: ["full"],
  2: ["xl", "xl"],
  3: ["xl", "tall", "tall"],
};

function sizesFor(count: number): TileSize[] {
  return SHORT[count] ?? Array.from({ length: count }, (_, i) => CYCLE[i % CYCLE.length]);
}

// Фильтр по рубрике — на клиенте по уже загруженному списку (как у событий).
export default function NewsCatalog({ posts }: { posts: NewsPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  // Счётчики просмотров видят только админы: правило news_view_counts
  // (миграция 1755000067) отдаёт их только им, остальные ничего не запрашивают.
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [views, setViews] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    pbClient
      .collection("news_view_counts")
      .getFullList({ requestKey: null })
      .then((rows) => {
        if (!cancelled) setViews(Object.fromEntries(rows.map((r) => [r.id, Number(r.views) || 0])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);
  const list = useMemo(() => (filter === "all" ? posts : posts.filter((p) => p.kind === filter)), [posts, filter]);
  const sizes = sizesFor(list.length);

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

      {list.length > 0 ? (
        <div className="mt-6 grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-[210px] lg:grid-cols-4">
          {list.map((p, i) => (
            <NewsTile key={p.id} post={p} size={sizes[i]} views={isAdmin && views ? views[p.id] ?? 0 : undefined} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          {filter === "all" ? "Пока публикаций нет — загляните позже." : "В этой рубрике пока ничего нет."}
        </p>
      )}
    </div>
  );
}
