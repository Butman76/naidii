"use client";

import { useMemo, useState } from "react";
import type { AiEvent } from "@/lib/events";
import { EVENT_TYPE_LABELS, FORMAT_LABELS, isPast, sortUpcoming } from "@/lib/events";
import { CATEGORIES } from "@/data/categories";
import EventCard from "./EventCard";

type When = "upcoming" | "week" | "month" | "archive";

const WHEN_LABELS: Record<When, string> = { upcoming: "Ближайшие", week: "Эта неделя", month: "Этот месяц", archive: "Архив" };

function addDays(key: string, n: number): string {
  return new Date(Date.parse(key + "T00:00:00Z") + n * 86400000).toISOString().slice(0, 10);
}

const selectClass = "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800";

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

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(WHEN_LABELS) as When[]).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWhen(w)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${when === w ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"}`}
          >
            {WHEN_LABELS[w]}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск" className={`${selectClass} col-span-2 md:col-span-1`} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          <option value="">Все направления</option>
          {CATEGORIES.filter((c) => c.slug !== "other").map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
          <option value="">Все города</option>
          <option value="__online">Онлайн</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectClass}>
          <option value="">Любой формат</option>
          {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
          <option value="">Любой тип</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={price} onChange={(e) => setPrice(e.target.value)} className={selectClass}>
          <option value="">Любая цена</option>
          <option value="free">Бесплатно</option>
          <option value="paid">Платно</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-zinc-500">Найдено: {list.length}</p>
      {list.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <EventCard key={e.id} event={e} today={today} />)}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
          По этим условиям событий нет. Сбросьте часть фильтров или добавьте событие, которого не хватает.
        </p>
      )}
    </div>
  );
}
