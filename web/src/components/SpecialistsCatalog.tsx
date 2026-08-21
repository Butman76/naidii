"use client";

import { useMemo, useState } from "react";
import SpecialistCard from "./SpecialistCard";
import { mockSpecialists } from "@/data/mock-specialists";

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

const ALL_SKILLS = Array.from(
  new Set(mockSpecialists.flatMap((s) => s.skills))
).sort();

export default function SpecialistsCatalog() {
  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = mockSpecialists.filter((s) => {
      if (remoteOnly && !s.location.includes("Удалённо")) return false;
      if (
        selectedSkills.length > 0 &&
        !selectedSkills.every((skill) => s.skills.includes(skill))
      )
        return false;
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
  }, [query, selectedSkills, remoteOnly, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени, навыку или описанию"
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

      <div className="mt-4 flex flex-wrap gap-2">
        {ALL_SKILLS.map((skill) => {
          const active = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {skill}
            </button>
          );
        })}
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
