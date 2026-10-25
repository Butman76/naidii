import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { syncOrder } from "@/lib/payments";

// HTTP-уведомления ЮKassa (в кабинете: Интеграция -> HTTP-уведомления,
// адрес https://naidii.ru/api/payments/yookassa-webhook, события
// payment.succeeded и payment.canceled). Тело уведомления не подписано, ему
// нельзя доверять: из него берём только id платежа, а реальный статус
// syncOrder() запрашивает у API ЮKassa. Отвечаем 200 на всё, что не
// требует повторной доставки; 500 — если сбой на нашей стороне, тогда
// ЮKassa повторит уведомление.
export async function POST(request: NextRequest) {
  let paymentId: string | undefined;
  try {
    const body = await request.json();
    paymentId = body?.object?.id;
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (typeof paymentId !== "string" || !paymentId) return NextResponse.json({ ok: true });

  try {
    const su = await getSuperuserClient();
    const order = await su
      .collection("orders")
      .getFirstListItem(su.filter("external_payment_id = {:id}", { id: paymentId }))
      .catch(() => null);
    if (order) await syncOrder(su, order.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("payments/yookassa-webhook:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
