"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import {
  deleteUnclaimedListing, fetchAdminUnclaimedClaims, fetchAdminUnclaimedListings, updateUnclaimedClaim, updateUnclaimedListing,
  type AdminUnclaimedListing, type UnclaimedClaim,
} from "@/lib/unclaimed";
import { CATEGORIES } from "@/data/categories";

// Вкладка "Неподтверждённые карточки" в /admin (только admin): карточки
// компаний, добавленные редакцией по открытым данным (unclaimed_specialists,
// см. STATUS.md 2026-09-28), и заявки по ним ("это моя компания" / "уберите",
// unclaimed_claims) — их контакты видны только здесь.

const STATUS_LABELS: Record<AdminUnclaimedListing["status"], string> = {
  active: "Активна",
  claimed: "Подтверждена",
  removed: "Снята",
};
const STATUS_STYLES: Record<AdminUnclaimedListing["status"], string> = {
  active: "border-zinc-300 bg-white text-zinc-600",
  claimed: "border-emerald-300 bg-emerald-50 text-emerald-800",
  removed: "border-red-300 bg-red-50 text-red-700",
};

function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export default function UnclaimedTab() {
  const [listings, setListings] = useState<AdminUnclaimedListing[] | null>(null);
  const [claims, setClaims] = useState<UnclaimedClaim[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AdminUnclaimedListing["status"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [l, c] = await Promise.all([fetchAdminUnclaimedListings(pbClient), fetchAdminUnclaimedClaims(pbClient)]);
      setListings(l);
      setClaims(c);
      setError(null);
    } catch {
      setError("Не удалось загрузить карточки.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const claimsByListing = useMemo(() => {
    const map = new Map<string, UnclaimedClaim[]>();
    for (const c of claims ?? []) {
      const list = map.get(c.listingId) ?? [];
      list.push(c);
      map.set(c.listingId, list);
    }
    return map;
  }, [claims]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of listings ?? []) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [listings]);

  const newClaimsCount = (claims ?? []).filter((c) => c.status === "new").length;

  const shown = useMemo(() => (listings ?? []).filter((l) => filter === "all" || l.status === filter), [listings, filter]);

  async function setStatus(l: AdminUnclaimedListing, status: AdminUnclaimedListing["status"]) {
    try {
      await updateUnclaimedListing(pbClient, l.id, { status });
      await refresh();
    } catch {
      setError("Не удалось изменить статус.");
    }
  }

  async function remove(l: AdminUnclaimedListing) {
    if (!window.confirm(`Удалить карточку «${l.name}» насовсем? Это необратимо — если нужно просто скрыть, используйте статус «Снята».`)) return;
    try {
      await deleteUnclaimedListing(pbClient, l.id);
      await refresh();
    } catch {
      setError("Не удалось удалить карточку.");
    }
  }

  async function markHandled(claim: UnclaimedClaim) {
    try {
      await updateUnclaimedClaim(pbClient, claim.id, { status: "handled" });
      await refresh();
    } catch {
      setError("Не удалось отметить заявку.");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs text-zinc-400">
        Карточки компаний, которых мы сами добавили по открытым данным (без их запроса) — заполнены миграцией
        <code className="mx-1 rounded bg-zinc-100 px-1">1755000061</code>
        из базы prospects. Публично видны только «Активна». Заявка «это моя компания» или «уберите» — раскройте карточку, там контакты и заявки.
        {newClaimsCount > 0 && <span className="ml-1 font-medium text-amber-700">Новых заявок: {newClaimsCount}.</span>}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setFilter("all")} className={`rounded-full border px-3 py-1 text-sm ${filter === "all" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300"}`}>
          Все · {listings?.length ?? 0}
        </button>
        {(Object.keys(STATUS_LABELS) as AdminUnclaimedListing["status"][]).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1 text-sm ${filter === s ? "border-zinc-900 bg-zinc-900 text-white" : STATUS_STYLES[s]}`}>
            {STATUS_LABELS[s]} · {counts[s] ?? 0}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {shown.map((l) => {
          const myClaims = claimsByListing.get(l.id) ?? [];
          const open = openId === l.id;
          return (
            <div key={l.id} className="rounded-lg border border-zinc-200 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <a href={l.website} target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-900 underline">{l.name}</a>
                  <p className="text-[11px] text-zinc-400">
                    {l.domain} · {l.city || "город не указан"} · {l.categories.map(categoryName).join(", ") || "—"}
                    {myClaims.some((c) => c.status === "new") && <span className="ml-1 font-medium text-amber-700">· новая заявка</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => setStatus(l, e.target.value as AdminUnclaimedListing["status"])}
                    className={`rounded-full border px-2 py-1 text-xs ${STATUS_STYLES[l.status]}`}
                  >
                    {(Object.keys(STATUS_LABELS) as AdminUnclaimedListing["status"][]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <button type="button" onClick={() => setOpenId(open ? null : l.id)} className="text-xs text-zinc-500 underline">
                    {open ? "свернуть" : "подробнее"}
                  </button>
                  <button type="button" onClick={() => remove(l)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">удалить</button>
                </div>
              </div>

              {open && (
                <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                  <p>{l.blurb || "Без описания."}</p>
                  <p>ИНН {l.inn || "—"} · Наш источник: {l.sourceEmail || "—"}{l.sourcePhone ? `, ${l.sourcePhone}` : ""}</p>
                  {myClaims.length === 0 ? (
                    <p className="text-zinc-400">Заявок по этой карточке ещё нет.</p>
                  ) : (
                    myClaims.map((c) => (
                      <div key={c.id} className="rounded border border-zinc-200 bg-zinc-50 p-2">
                        <p>
                          <span className="font-medium">{c.kind === "claim" ? "Это моя компания" : "Просят убрать"}</span>
                          {c.status === "new" ? <span className="ml-1 text-amber-700">· новая</span> : <span className="ml-1 text-emerald-700">· обработана</span>}
                        </p>
                        <p>{c.contactName}, {c.contactEmail}{c.contactPhone ? `, ${c.contactPhone}` : ""}</p>
                        {c.message && <p className="mt-1">{c.message}</p>}
                        {c.status === "new" && (
                          <button type="button" onClick={() => markHandled(c)} className="mt-1 rounded border border-zinc-300 bg-white px-2 py-1 text-[11px] hover:bg-zinc-100">
                            Отметить обработанной
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        {listings === null && !error && <p className="text-sm text-zinc-400">Загружаем…</p>}
        {listings !== null && shown.length === 0 && <p className="text-sm text-zinc-400">Карточек нет.</p>}
      </div>
    </div>
  );
}
