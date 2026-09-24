// Продвижение в каталоге по тарифу. Раньше "Продвигается" зависело только
// от записей коллекции promotions (их ставит вручную admin), и в
// lib/catalog.ts там ещё сравнивалось несуществующее поле service_id, так
// что метка не срабатывала ни у кого. Теперь по правилам тарифов
// (web/src/data/plans.ts, promotionAccess):
//   - Pro и Enterprise автоматически показываются выше остальных в
//     каталоге услуг и в сетке "Топ-20" на главной, с меткой "Продвигается";
//   - Enterprise выше Pro; запись в promotions (ручное продвижение админом)
//     выше обоих;
//   - срок вышел (active_until в прошлом) — продвижение пропадает, даже
//     если plan_code ещё не успел вернуться на basic (cron plan_expiry.pb.js
//     работает раз в сутки).
// Внутри одного уровня порядок не по рейтингу, а по "суточной рулетке":
// платящие получают одинаковую долю верхних мест, а не один и тот же
// специалист сидит первым; порядок стабилен в течение суток (UTC).

import { PLANS } from "../data/plans";

export const MANUAL_PROMOTION_RANK = 3;

// Индексная сигнатура — чтобы принимать целую запись PocketBase
// (RecordModel), а не только объект с этими двумя полями.
interface PlanFields {
  plan_code?: string;
  active_until?: string;
  [key: string]: unknown;
}

export function parseDate(value: string): Date {
  // PocketBase отдаёт "2026-10-23 21:59:39.041Z" — с пробелом вместо T.
  return new Date(value.replace(" ", "T"));
}

export function planPromotionRank(profile: PlanFields, now: Date = new Date()): number {
  const code = profile.plan_code ?? "";
  // Возможность "Продвижение в топ-20" берём из описания тарифа (plans.ts),
  // а не из списка кодов — так правило тарифов остаётся в одном месте.
  if (!PLANS.find((p) => p.code === code)?.promotionAccess) return 0;
  if (profile.active_until && parseDate(profile.active_until) <= now) return 0;
  return code === "enterprise" ? 2 : 1;
}

// Стабильное в пределах суток псевдослучайное число для id (FNV-1a).
export function dailyShuffleKey(id: string, now: Date = new Date()): number {
  const day = Math.floor(now.getTime() / 86_400_000);
  let hash = 2166136261 ^ day;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export interface Rankable {
  id: string;
  rank: number;
  rating: number;
}

// Больший rank выше; среди продвигаемых — суточная рулетка; среди
// непродвигаемых — по рейтингу.
export function compareByPromotion(a: Rankable, b: Rankable, now: Date = new Date()): number {
  if (a.rank !== b.rank) return b.rank - a.rank;
  if (a.rank > 0) return dailyShuffleKey(a.id, now) - dailyShuffleKey(b.id, now);
  return b.rating - a.rating;
}
