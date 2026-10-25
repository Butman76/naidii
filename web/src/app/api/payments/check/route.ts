import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { authenticateCaller } from "@/lib/server-auth";
import { syncOrder } from "@/lib/payments";

// Страница возврата из ЮKassa (?order=<id> на вкладке "Тариф") спрашивает
// сюда, прошла ли оплата. Сервер сам сверяется с API ЮKassa — работает и
// если вебхук ещё не дошёл (или не настроен в кабинете).
export async function POST(request: NextRequest) {
  const caller = await authenticateCaller(request);
  if (!caller) return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });

  let orderId: unknown;
  try {
    orderId = (await request.json()).orderId;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }
  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ error: "Не указан заказ." }, { status: 400 });
  }

  try {
    const su = await getSuperuserClient();
    const order = await su.collection("orders").getOne(orderId).catch(() => null);
    // Чужой заказ — тот же ответ, что и "не найден".
    if (!order || order.user_id !== caller.id) {
      return NextResponse.json({ error: "Заказ не найден." }, { status: 404 });
    }
    return NextResponse.json(await syncOrder(su, orderId));
  } catch (err) {
    console.error("payments/check:", err);
    return NextResponse.json({ error: "Не удалось проверить оплату." }, { status: 502 });
  }
}
