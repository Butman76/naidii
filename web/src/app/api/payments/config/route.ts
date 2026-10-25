import { NextResponse } from "next/server";
import { isYooKassaConfigured } from "@/lib/yookassa";

// Кабинет (PlanPaymentPanel.tsx) спрашивает, подключена ли онлайн-оплата:
// пока ключей ЮKassa в окружении сервера нет, вместо кнопок "Оплатить"
// показывается заметка. POST, а не GET — как и остальные api/*: GET-роут
// без параметров Next.js вычислил бы один раз на сборке (при статическом
// экспорте), а флаг должен читаться из окружения в момент запроса.
export async function POST() {
  return NextResponse.json({ enabled: isYooKassaConfigured() });
}
