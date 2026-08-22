"use client";

import { useMemo, useState } from "react";
import ServiceCardTile from "./ServiceCardTile";
import { mockServices } from "@/data/mock-services";
import { CATEGORIES } from "@/data/categories";
import { SERVICE_TAG_LABELS, type ServiceCardTag } from "@/types/service-card";

type SortOption = "relevance" | "priceAsc" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "По релевантности",
  priceAsc: "Сначала дешевле",
  rating: "По рейтингу исполнителя",
};

const ALL_TAGS = Object.keys(SERVICE_TAG_LABELS) as ServiceCardTag[];

export default function ServicesCatalog() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<ServiceCardTag[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  function toggleTag(tag: ServiceCardTag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = mockServices.filter((s) => {
      if (activeCategory && s.categorySlug !== activeCategory) return false;
      if (activeTags.length > 0 && !activeTags.every((t) => s.tags.includes(t)))
        return false;
      if (!q) return true;
      const haystack = [s.title, s.tagline, s.specialistName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortBy === "priceAsc") return a.priceValue - b.priceValue;
      if (sortBy === "rating")
        return b.specialistRating - a.specialistRating;
      // relevance: продвигаемые сначала, дальше по рейтингу исполнителя —
      // упрощённая версия формулы ранжирования из раздела 6 правки ТЗ
      // (полнота карточки, конверсия и т.д. пока не считаем на моках).
      if (Boolean(b.promoted) !== Boolean(a.promoted)) {
        return Number(Boolean(b.promoted)) - Number(Boolean(a.promoted));
      }
      return b.specialistRating - a.specialistRating;
    });
  }, [query, activeCategory, activeTags, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Что нужно сделать? Например «Telegram-бот»"
          className="w-full rounded-full border border-zinc-300 px-5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none sm:max-w-sm"
        />

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
        {CATEGORIES.filter((c) => c.slug !== "other").map((category) => (
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

      <div className="mt-3 flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {SERVICE_TAG_LABELS[tag]}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        Найдено услуг: {filtered.length}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((service) => (
            <ServiceCardTile key={service.id} service={service} />
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
