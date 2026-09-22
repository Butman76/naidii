import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import { getSuperuserClient } from "@/lib/pb-superuser";

// Баннеры (PartnerAdsCarousel.tsx) шлют сюда обычную HTML-форму (POST), а
// не ссылаются на link_url напрямую — чтобы посчитать переход (click_count,
// см. 1755000048_partner_ads.js) перед тем, как увести посетителя на сайт
// рекламодателя. Считаем и уводим анонимного посетителя, поэтому нужен
// суперпользователь — обычный public updateRule на partner_ads только
// для admin.
//
// Именно POST + form, не GET + ссылка: GET route handler под STATIC_EXPORT
// (GitHub Pages, нет сервера) обязан статически рендериться на билде — для
// заведомо динамического (redirect на основе id, посчитанного на лету)
// это невозможно, билд падает. POST-роуты в этом проекте под STATIC_EXPORT
// просто молча не попадают в статический вывод, как остальные api/* —
// вот почему у соседних роутов (impersonate, log-login) этой проблемы нет.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = form.get("id");
  // 303 ("See Other"), не дефолтный 307/308 — те сохраняют метод запроса
  // при переходе, а браузер, следуя редиректу с POST, тогда попытался бы
  // ЗАПОСТИТЬ на сайт рекламодателя вместо обычного GET-перехода. 303
  // явно говорит браузеру переключиться на GET — классический паттерн
  // Post/Redirect/Get.
  if (typeof id !== "string" || !id) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const pb = createPocketBase();
  let linkUrl: string;
  try {
    const ad = await pb.collection("partner_ads").getOne(id);
    linkUrl = ad.link_url;
  } catch {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  try {
    const superuser = await getSuperuserClient();
    await superuser.collection("partner_ads").update(id, { "click_count+": 1 });
  } catch {
    // Счётчик — не критичный путь, переход не должен из-за него не удаться.
  }

  return NextResponse.redirect(linkUrl, 303);
}
