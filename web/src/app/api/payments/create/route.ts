import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { authenticateCaller, siteUrl } from "@/lib/server-auth";
import { checkPurchase, startPlanPayment } from "@/lib/payments";
import { isYooKassaConfigured } from "@/lib/yookassa";

// Специалист нажимает "Оплатить" на вкладке "Тариф" (PlanPaymentPanel.tsx):
// создаём заказ и платёж в ЮKassa и отдаём ссылку на страницу оплаты.
// Тариф берём из тела, цену — только из web/src/data/plans.ts на сервере.
export async function POST(request: NextRequest) {
  const caller = await authenticateCaller(request);
  if (!caller) return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  if (caller.role !== "specialist") {
    return NextResponse.json({ error: "Тариф оплачивают специалисты." }, { status: 403 });
  }
  if (!isYooKassaConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let planCode: unknown;
  try {
    planCode = (await request.json()).planCode;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }
  if (typeof planCode !== "string") {
    return NextResponse.json({ error: "Не указан тариф." }, { status: 400 });
  }

  try {
    const su = await getSuperuserClient();
    const profile = await su
      .collection("specialist_profiles")
      .getFirstListItem(su.filter("user_id = {:id}", { id: caller.id }))
      .catch(() => null);
    if (!profile) {
      return NextResponse.json({ error: "Профиль специалиста не найден." }, { status: 404 });
    }

    const check = checkPurchase(profile, planCode);
    if (!check.ok) return NextResponse.json({ error: check.reason }, { status: check.status });

    const started = await startPlanPayment(su, {
      user: caller,
      profile,
      plan: check.plan,
      amountRub: check.amountRub,
      siteUrl: siteUrl(),
    });
    return NextResponse.json(started);
  } catch (err) {
    console.error("payments/create:", err);
    return NextResponse.json({ error: "Не удалось создать платёж. Попробуйте позже." }, { status: 502 });
  }
}
