import { PLANS } from "../data/plans";
import { parseDate } from "./promotion";

// Аналитика профиля специалиста (вкладка "Аналитика" в кабинете, тарифы Pro
// и Enterprise — plans.ts, analyticsEnabled). Здесь только чистая логика
// доступа и подсчёта; события читает app/api/analytics/route.ts.

// Дни считаются по московскому времени (основная аудитория) — иначе "сегодня"
// у специалиста в кабинете обрывалось бы в 03:00 по Москве.
const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function hasAnalyticsAccess(
  profile: { plan_code?: string; active_until?: string; [key: string]: unknown },
  now: Date = new Date()
): boolean {
  const plan = PLANS.find((p) => p.code === (profile.plan_code ?? ""));
  if (!plan?.analyticsEnabled) return false;
  if (profile.active_until && parseDate(profile.active_until) <= now) return false;
  return true;
}

export interface DayStat {
  day: string;
  views: number;
  visitors: number;
  leads: number;
}

export interface PeriodTotals {
  views: number;
  visitors: number;
  leads: number;
  /** Заявки на уникального посетителя, 0..1 (0, если посетителей не было). */
  conversion: number;
}

export interface AnalyticsResult {
  days: DayStat[];
  totals: PeriodTotals;
  previous: PeriodTotals;
  byCategory: Array<{ slug: string; leads: number }>;
}

export interface RawEvent {
  created: string;
  visitor: string;
}

export interface RawLead {
  created: string;
  category_slug?: string;
}

function dayKey(createdIso: string): string {
  return new Date(parseDate(createdIso).getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

function lastDayKeys(now: Date, count: number, skip = 0): string[] {
  const todayShifted = now.getTime() + TZ_OFFSET_MS;
  const keys: string[] = [];
  for (let i = count - 1 + skip; i >= skip; i--) {
    keys.push(new Date(todayShifted - i * DAY_MS).toISOString().slice(0, 10));
  }
  return keys;
}

export function aggregateAnalytics(params: {
  now: Date;
  periodDays: number;
  events: RawEvent[];
  leads: RawLead[];
}): AnalyticsResult {
  const { now, periodDays, events, leads } = params;

  const eventsByDay = new Map<string, RawEvent[]>();
  for (const e of events) {
    const key = dayKey(e.created);
    const list = eventsByDay.get(key);
    if (list) list.push(e);
    else eventsByDay.set(key, [e]);
  }
  const leadsByDay = new Map<string, RawLead[]>();
  for (const l of leads) {
    const key = dayKey(l.created);
    const list = leadsByDay.get(key);
    if (list) list.push(l);
    else leadsByDay.set(key, [l]);
  }

  function totalsFor(keys: string[]): PeriodTotals {
    const visitors = new Set<string>();
    let views = 0;
    let leadCount = 0;
    for (const key of keys) {
      for (const e of eventsByDay.get(key) ?? []) {
        views++;
        visitors.add(e.visitor);
      }
      leadCount += leadsByDay.get(key)?.length ?? 0;
    }
    return {
      views,
      visitors: visitors.size,
      leads: leadCount,
      conversion: visitors.size > 0 ? leadCount / visitors.size : 0,
    };
  }

  const currentKeys = lastDayKeys(now, periodDays);
  const previousKeys = lastDayKeys(now, periodDays, periodDays);

  const days: DayStat[] = currentKeys.map((day) => {
    const dayEvents = eventsByDay.get(day) ?? [];
    return {
      day,
      views: dayEvents.length,
      visitors: new Set(dayEvents.map((e) => e.visitor)).size,
      leads: leadsByDay.get(day)?.length ?? 0,
    };
  });

  const categoryCounts = new Map<string, number>();
  for (const key of currentKeys) {
    for (const l of leadsByDay.get(key) ?? []) {
      const slug = l.category_slug || "other";
      categoryCounts.set(slug, (categoryCounts.get(slug) ?? 0) + 1);
    }
  }
  const byCategory = [...categoryCounts.entries()]
    .map(([slug, count]) => ({ slug, leads: count }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);

  return { days, totals: totalsFor(currentKeys), previous: totalsFor(previousKeys), byCategory };
}
