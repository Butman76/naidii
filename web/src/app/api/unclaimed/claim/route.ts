import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";

// "Это моя компания" / "уберите" на неподтверждённой карточке
// (UnclaimedCard.tsx) — создаёт запись в unclaimed_claims суперпользователем
// (публичного createRule у коллекции нет, см. 1755000060). Тот же
// анти-спам паттерн, что у api/events/submit: honeypot + rate limit по IP,
// без капчи — риск ниже, чем у публикации события, сравнимо с
// suggestions.pb.js (там капчи тоже нет).

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(request: NextRequest) {
  const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Некорректный запрос.");
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (body.website_url_confirm) return NextResponse.json({ ok: true }); // приманка для ботов
  if (rateLimited(ip || "unknown")) return fail("Слишком много заявок, попробуйте позже.", 429);

  const listingId = str(body.listing, 30);
  const kind = str(body.kind, 10);
  const contactName = str(body.contact_name, 100);
  const contactEmail = str(body.contact_email, 200);
  const contactPhone = str(body.contact_phone, 40);
  const message = str(body.message, 2000);

  if (!listingId) return fail("Не указана карточка.");
  if (kind !== "claim" && kind !== "remove") return fail("Некорректный тип заявки.");
  if (contactName.length < 2) return fail("Укажите имя.");
  if (!isEmail(contactEmail)) return fail("Укажите email.");

  let pb;
  try {
    pb = await getSuperuserClient();
  } catch {
    return fail("Сервис временно недоступен.", 503);
  }

  try {
    await pb.collection("unclaimed_specialists").getOne(listingId, { fields: "id" });
  } catch {
    return fail("Карточка не найдена.", 404);
  }

  try {
    await pb.collection("unclaimed_claims").create({
      listing: listingId,
      kind,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      message,
      status: "new",
    });
  } catch {
    return fail("Не удалось отправить заявку, попробуйте позже.", 500);
  }

  return NextResponse.json({ ok: true });
}
