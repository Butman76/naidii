import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import { getSuperuserClient } from "@/lib/pb-superuser";

// Кнопка «Зарегистрироваться» на странице события шлёт сюда POST-форму:
// считаем переход (reg_clicks, цифра для будущего разговора с
// организатором) и уводим на регистрацию. POST + form, а не GET-ссылка, по
// той же причине, что у api/ad-click: GET-роут не собирается под
// STATIC_EXPORT. 303, чтобы браузер перешёл по ссылке методом GET.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = form.get("id");
  const home = () => NextResponse.redirect(new URL("/events", request.url), 303);
  if (typeof id !== "string" || !id) return home();

  let target: string;
  try {
    const ev = await createPocketBase().collection("ai_events").getOne(id, { fields: "registration_url,official_url" });
    target = ev.registration_url || ev.official_url;
  } catch {
    return home();
  }
  if (!target) return home();

  try {
    const pb = await getSuperuserClient();
    await pb.collection("ai_events").update(id, { "reg_clicks+": 1 });
  } catch {
    // Счётчик не критичен: переход не должен зависеть от него.
  }
  return NextResponse.redirect(target, 303);
}
