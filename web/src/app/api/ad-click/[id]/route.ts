import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import { getSuperuserClient } from "@/lib/pb-superuser";

// Баннеры (PartnerAdsCarousel.tsx) ссылаются сюда, а не прямо на
// link_url — чтобы посчитать переход (click_count, см.
// 1755000048_partner_ads.js) перед тем, как увести посетителя на сайт
// рекламодателя. Считаем и уводим анонимного посетителя, поэтому нужен
// суперпользователь — обычный public updateRule на partner_ads только
// для admin.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const pb = createPocketBase();
  let linkUrl: string;
  try {
    const ad = await pb.collection("partner_ads").getOne(id);
    linkUrl = ad.link_url;
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const superuser = await getSuperuserClient();
    await superuser.collection("partner_ads").update(id, { "click_count+": 1 });
  } catch {
    // Счётчик — не критичный путь, переход не должен из-за него не удаться.
  }

  return NextResponse.redirect(linkUrl);
}
