import type PocketBase from "pocketbase";
import { createPocketBase } from "./pocketbase";

// Неподтверждённые карточки ("claim your business") — компании, которых мы
// сами нашли и добавили по открытым данным, без их запроса (см. STATUS.md,
// 2026-09-28). Отдельно от specialist_profiles: у них ещё нет владельца на
// сайте, и может не появиться никогда — см. 1755000060_unclaimed_specialists.js.

// Только то, что можно безопасно показать анонимному посетителю. Юрлицо,
// ИНН и сайт сюда сознательно не входят (см. AdminUnclaimedListing ниже) —
// иначе мы бы напрямую сводили заказчика с конторой мимо площадки. domain
// всё равно виден через URL страницы (/unclaimed/{domain}) — это не
// изменить без смены схемы адресов, но это не то же самое, что кликабельная
// ссылка на сайт или прямые контакты.
export interface UnclaimedListing {
  id: string;
  name: string;
  domain: string;
  city: string;
  blurb: string;
  categories: string[];
}

const PUBLIC_FIELDS = "id,name,domain,city,blurb,categories";

// Различает UnclaimedListing от Specialist в общей сетке карточек (у
// Specialist нет поля domain) — см. mixIn ниже.
export function isUnclaimedListing(v: unknown): v is UnclaimedListing {
  return typeof v === "object" && v !== null && "domain" in v;
}

// Вмешивает неподтверждённые карточки в уже отсортированный список
// специалистов, а не показывает отдельным блоком снизу (по просьбе
// пользователя, 2026-09-28) — каждая вставляется через `step` карточек,
// чтобы не столпились в конце и не перебивали первые (часто продвигаемые)
// позиции настоящих специалистов.
export function mixIn<A>(main: A[], extra: UnclaimedListing[], step = 4): Array<A | UnclaimedListing> {
  if (extra.length === 0) return main;
  const out: Array<A | UnclaimedListing> = [];
  let e = 0;
  main.forEach((item, i) => {
    out.push(item);
    if ((i + 1) % step === 0 && e < extra.length) out.push(extra[e++]);
  });
  while (e < extra.length) out.push(extra[e++]);
  return out;
}

function mapListing(r: Record<string, unknown>): UnclaimedListing {
  const s = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  return {
    id: s("id"),
    name: s("name"),
    domain: s("domain"),
    city: s("city"),
    blurb: s("blurb"),
    categories: Array.isArray(r.categories) ? (r.categories as string[]) : [],
  };
}

// Публичный список: без коллекции/при сбое просто пустой список, страница
// каталога не должна из-за этого падать (та же логика, что у
// fetchPublishedEvents). fields — не просто экономия трафика: viewRule
// коллекции открывает анонимам всю строку целиком (status = "active"), а
// не отдельные поля — без явного fields PocketBase честно отдал бы в ответе
// и сайт, и ИНН, и приватные source_email/source_phone кому угодно, кто
// откроет вкладку "Сеть" или дёрнет API напрямую, даже если наш интерфейс
// их никогда не рисует.
export async function fetchActiveUnclaimedListings(): Promise<UnclaimedListing[]> {
  try {
    const pb = createPocketBase();
    const records = await pb.collection("unclaimed_specialists").getFullList({ filter: 'status = "active"', sort: "name", fields: PUBLIC_FIELDS, batch: 500 });
    return records.map((r) => mapListing(r as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchUnclaimedListingByDomain(domain: string): Promise<UnclaimedListing | null> {
  try {
    const pb = createPocketBase();
    const r = await pb.collection("unclaimed_specialists").getFirstListItem(
      pb.filter('domain = {:domain} && status = "active"', { domain }),
      { fields: PUBLIC_FIELDS }
    );
    return mapListing(r as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ---------- админка ----------

export interface AdminUnclaimedListing extends UnclaimedListing {
  website: string;
  legalName: string;
  inn: string;
  sourceEmail: string;
  sourcePhone: string;
  status: "active" | "claimed" | "removed";
  adminNote: string;
}

export interface UnclaimedClaim {
  id: string;
  listingId: string;
  kind: "claim" | "remove";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  status: "new" | "handled";
  adminComment: string;
  created: string;
}

// Только для админа: pb здесь — сессия самого вошедшего admin (pbClient из
// компонента), PocketBase проверяет роль по JWT на своей стороне — это
// настоящая граница доступа, а не просто "интерфейс не показывает".
export async function fetchAdminUnclaimedListings(pb: PocketBase): Promise<AdminUnclaimedListing[]> {
  const records = await pb.collection("unclaimed_specialists").getFullList({ sort: "-created", batch: 500 });
  return records.map((r) => ({
    ...mapListing(r as unknown as Record<string, unknown>),
    website: String(r.website ?? ""),
    legalName: String(r.legal_name ?? ""),
    inn: String(r.inn ?? ""),
    sourceEmail: String(r.source_email ?? ""),
    sourcePhone: String(r.source_phone ?? ""),
    status: (r.status as AdminUnclaimedListing["status"]) || "active",
    adminNote: String(r.admin_note ?? ""),
  }));
}

export async function fetchAdminUnclaimedClaims(pb: PocketBase): Promise<UnclaimedClaim[]> {
  const records = await pb.collection("unclaimed_claims").getFullList({ sort: "-created", batch: 500 });
  return records.map((r) => ({
    id: String(r.id),
    listingId: String(r.listing),
    kind: (r.kind as UnclaimedClaim["kind"]) || "claim",
    contactName: String(r.contact_name ?? ""),
    contactEmail: String(r.contact_email ?? ""),
    contactPhone: String(r.contact_phone ?? ""),
    message: String(r.message ?? ""),
    status: (r.status as UnclaimedClaim["status"]) || "new",
    adminComment: String(r.admin_comment ?? ""),
    created: String(r.created ?? ""),
  }));
}

export async function updateUnclaimedListing(
  pb: PocketBase,
  id: string,
  patch: Record<string, string>
): Promise<void> {
  await pb.collection("unclaimed_specialists").update(id, patch);
}

export async function deleteUnclaimedListing(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("unclaimed_specialists").delete(id);
}

export async function updateUnclaimedClaim(pb: PocketBase, id: string, patch: Record<string, string>): Promise<void> {
  await pb.collection("unclaimed_claims").update(id, patch);
}
