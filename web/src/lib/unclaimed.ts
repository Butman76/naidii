import type PocketBase from "pocketbase";
import { createPocketBase } from "./pocketbase";

// Неподтверждённые карточки ("claim your business") — компании, которых мы
// сами нашли и добавили по открытым данным, без их запроса (см. STATUS.md,
// 2026-09-28). Отдельно от specialist_profiles: у них ещё нет владельца на
// сайте, и может не появиться никогда — см. 1755000060_unclaimed_specialists.js.

export interface UnclaimedListing {
  id: string;
  name: string;
  domain: string;
  website: string;
  legalName: string;
  city: string;
  blurb: string;
  categories: string[];
}

function mapListing(r: Record<string, unknown>): UnclaimedListing {
  const s = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  return {
    id: s("id"),
    name: s("name"),
    domain: s("domain"),
    website: s("website"),
    legalName: s("legal_name"),
    city: s("city"),
    blurb: s("blurb"),
    categories: Array.isArray(r.categories) ? (r.categories as string[]) : [],
  };
}

// Публичный список: без коллекции/при сбое просто пустой список, страница
// каталога не должна из-за этого падать (та же логика, что у fetchPublishedEvents).
export async function fetchActiveUnclaimedListings(): Promise<UnclaimedListing[]> {
  try {
    const pb = createPocketBase();
    const records = await pb.collection("unclaimed_specialists").getFullList({ filter: 'status = "active"', sort: "name", batch: 500 });
    return records.map((r) => mapListing(r as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

// ---------- админка ----------

export interface AdminUnclaimedListing extends UnclaimedListing {
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

export async function fetchAdminUnclaimedListings(pb: PocketBase): Promise<AdminUnclaimedListing[]> {
  const records = await pb.collection("unclaimed_specialists").getFullList({ sort: "-created", batch: 500 });
  return records.map((r) => ({
    ...mapListing(r as unknown as Record<string, unknown>),
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
