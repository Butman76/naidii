"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AiEvent } from "@/lib/events";
import { EVENT_TYPE_LABELS, FORMAT_LABELS, isPast, sortUpcoming } from "@/lib/events";
import { CATEGORIES } from "@/data/categories";
import EventCard from "./EventCard";
import { CalendarIcon, ChevronDownIcon, SearchIcon, SparkIcon } from "./icons";

type When = "upcoming" | "week" | "month" | "archive";

const WHEN_LABELS: Record<When, string> = { upcoming: "Ближайшие", week: "Эта неделя", month: "Этот месяц", archive: "Архив" };

function addDays(key: string, n: number): string {
  return new Date(Date.parse(key + "T00:00:00Z") + n * 86400000).toISOString().slice(0, 10);
}

// Редизайн 2026-09-28 («AI Event Signal», бриф пользователя) — панель
// фильтров переоформлена в самостоятельную premium-панель, добавлена кнопка
// сброса (чистый client-state, без нового API) и переоформлён empty state.
// Логика фильтрации/сортировки/поиска — тот же код, что был, не менялась.
const selectClass =
  "w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm text-zinc-800 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

// Фильтры работают на клиенте по уже загруженному списку: событий десятки,
// а сама страница остаётся серверной и индексируется целиком.
export default function EventsCatalog({ events, today }: { events: AiEvent[]; today: string }) {
  const [when, setWhen] = useState<When>("upcoming");
  const [format, setFormat] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");

  const cities = useMemo(() => Array.from(new Set(events.map((e) => e.city).filter(Boolean))).sort(), [events]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const weekEnd = addDays(today, 7);
    const monthEnd = addDays(today, 31);
    const filtered = events.filter((e) => {
      const past = isPast(e, today);
      if (when === "archive" ? !past : past) return false;
      if (when === "week" && e.startDate > weekEnd) return false;
      if (when === "month" && e.startDate > monthEnd) return false;
      if (format && e.format !== format) return false;
      if (type && e.eventType !== type) return false;
      if (category && !e.categories.includes(category)) return false;
      if (price === "free" && e.priceType !== "free") return false;
      if (price === "paid" && e.priceType !== "paid") return false;
      if (city === "__online") {
        if (e.format !== "online") return false;
      } else if (city && e.city !== city) return false;
      if (q && !`${e.title} ${e.shortDescription} ${e.organizer} ${e.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return when === "archive" ? [...filtered].sort((a, b) => b.startDate.localeCompare(a.startDate)) : sortUpcoming(filtered);
  }, [events, today, when, format, type, category, price, city, query]);

  const filtersActive = Boolean(format || type || category || price || city || query) || when !== "upcoming";

  function resetFilters() {
    setWhen("upcoming");
    setFormat("");
    setType("");
    setCategory("");
    setPrice("");
    setCity("");
    setQuery("");
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Найдите событие</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Найдено: {list.length}</p>
          </div>
          <div className="flex flex-wrap gap-1 overflow-x-auto rounded-full bg-zinc-100 p-1">
            {(Object.keys(WHEN_LABELS) as When[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWhen(w)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 motion-reduce:transition-none sm:text-sm ${
                  when === w
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-white hover:text-zinc-900"
                }`}
              >
                {WHEN_LABELS[w]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию, организатору, городу"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-800 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <Select value={category} onChange={setCategory}>
              <option value="">Все направления</option>
              {CATEGORIES.filter((c) => c.slug !== "other").map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={city} onChange={setCity}>
              <option value="">Все города</option>
              <option value="__online">Онлайн</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select value={format} onChange={setFormat}>
              <option value="">Любой формат</option>
              {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select value={type} onChange={setType}>
              <option value="">Любой тип</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select value={price} onChange={setPrice}>
              <option value="">Любая цена</option>
              <option value="free">Бесплатно</option>
              <option value="paid">Платно</option>
            </Select>
          </div>
          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-start text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {list.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <EventCard key={e.id} event={e} today={today} />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <CalendarIcon className="h-6 w-6" />
            <SparkIcon className="absolute -right-1 -top-1 h-4 w-4 text-violet-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-900">Событий по этим фильтрам пока нет</p>
          <p className="max-w-sm text-sm text-zinc-500">
            Попробуйте изменить период, формат или направление. Либо добавьте своё AI-событие в календарь.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-500"
              >
                Сбросить фильтры
              </button>
            )}
            <Link href="/events/add" className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700">
              Добавить событие
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
