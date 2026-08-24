"use client";

import { useMemo, useState } from "react";
import SpecialistCard from "./SpecialistCard";
import { CATEGORIES } from "@/data/categories";
import type { Specialist } from "@/types/specialist";

type SortOption = "rating" | "priceAsc" | "reviews";

const SORT_LABELS: Record<SortOption, string> = {
  rating: "По рейтингу",
  priceAsc: "Сначала дешевле",
  reviews: "По числу отзывов",
};

function parsePriceFrom(priceFrom: string): number {
  const digits = priceFrom.replace(/[^\d]/g, "");
  return digits ? Number(digits) : Infinity;
}

export default function SpecialistsCatalog({
  specialists,
}: {
  specialists: Specialist[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = specialists.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;
      if (remoteOnly && !s.location.includes("Удалённо")) return false;
      if (!q) return true;
      const haystack = [s.name, s.title, s.shortDescription, ...s.skills]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortBy === "priceAsc")
        return parsePriceFrom(a.priceFrom) - parsePriceFrom(b.priceFrom);
      if (sortBy === "reviews") return b.reviewsCount - a.reviewsCount;
      return b.rating - a.rating;
    });
  }, [query, activeCategory, remoteOnly, sortBy, specialists]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени или описанию"
          className="w-full rounded-full border border-zinc-300 px-5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none sm:max-w-sm"
        />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            Только удалённо
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 focus:border-zinc-900 focus:outline-none"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
          }`}
        >
          Все направления
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setActiveCategory(category.slug)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === category.slug
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        Найдено специалистов: {filtered.length}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-zinc-500">
          Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
        </p>
      )}
    </div>
  );
}
