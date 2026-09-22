import type PocketBase from "pocketbase";
import { createPocketBase } from "./pocketbase";

export interface PartnerAd {
  id: string;
  companyName: string;
  imageUrl: string;
  linkUrl: string;
  clickCount: number;
}

export interface AdminPartnerAd extends PartnerAd {
  active: boolean;
  sortOrder: number;
}

// Публичная лента (главная, каталоги) — только активные, по sort_order.
// Используется на сервере (Server Component), поэтому свой инстанс клиента,
// как в specialists.ts/catalog.ts, а не общий pbClient из auth-client.ts.
export async function fetchActivePartnerAds(): Promise<PartnerAd[]> {
  const pb = createPocketBase();
  const records = await pb.collection("partner_ads").getFullList({
    filter: "active = true",
    sort: "sort_order",
  });
  return records.map((r) => ({
    id: r.id,
    companyName: r.company_name,
    imageUrl: pb.files.getURL(r, r.image),
    linkUrl: r.link_url,
    clickCount: r.click_count ?? 0,
  }));
}

// Для /admin — все баннеры, включая выключенные.
export async function fetchAllPartnerAds(pb: PocketBase): Promise<AdminPartnerAd[]> {
  const records = await pb.collection("partner_ads").getFullList({ sort: "sort_order" });
  return records.map((r) => ({
    id: r.id,
    companyName: r.company_name,
    imageUrl: pb.files.getURL(r, r.image),
    linkUrl: r.link_url,
    clickCount: r.click_count ?? 0,
    active: Boolean(r.active),
    sortOrder: r.sort_order ?? 0,
  }));
}

export async function createPartnerAd(
  pb: PocketBase,
  params: { companyName: string; linkUrl: string; image: File; sortOrder: number }
): Promise<void> {
  await pb.collection("partner_ads").create({
    company_name: params.companyName,
    link_url: params.linkUrl,
    image: params.image,
    sort_order: params.sortOrder,
    active: true,
    click_count: 0,
  });
}

export async function togglePartnerAdActive(pb: PocketBase, id: string, active: boolean): Promise<void> {
  await pb.collection("partner_ads").update(id, { active });
}

export async function deletePartnerAd(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("partner_ads").delete(id);
}
