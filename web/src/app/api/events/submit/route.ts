import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { EVENT_TYPE_LABELS, FORMAT_LABELS } from "@/lib/events";
import { CATEGORIES } from "@/data/categories";

// Заявка на событие из /events/add. Создаём запись суперпользователем со
// статусом pending (публичного createRule у коллекций нет) и отдельно
// заявку с контактами организатора. Публикует админ вручную.

const CATEGORY_SLUGS = CATEGORIES.filter((c) => c.slug !== "other").map((c) => c.slug);
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const RU: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(title: string, date: string): string {
  const base = title
    .toLowerCase()
    .split("")
    .map((ch) => RU[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "event"}-${date.slice(0, 4)}-${Math.random().toString(36).slice(2, 6)}`;
}

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isHttp = (v: string) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function captchaOk(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.YANDEX_CAPTCHA_SERVER_KEY;
  if (!secret) return true; // как на регистрации: без ключа капча не включена
  if (typeof token !== "string" || !token) return false;
  try {
    const params = new URLSearchParams({ secret, token });
    if (ip) params.set("ip", ip);
    const res = await fetch("https://smartcaptcha.yandexcloud.net/validate", { method: "POST", body: params });
    return (await res.json())?.status === "ok";
  } catch {
    return false;
  }
}

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
  if (!(await captchaOk(body.captchaToken, ip))) return fail("Не пройдена проверка от роботов.");

  const title = str(body.title, 200);
  const eventType = str(body.event_type, 40);
  const format = str(body.format, 20);
  const startDate = str(body.start_date, 10);
  const endDate = str(body.end_date, 10);
  const shortDescription = str(body.short_description, 220);
  const description = str(body.description, 8000);
  const officialUrl = str(body.official_url, 500);
  const registrationUrl = str(body.registration_url, 500);
  const city = str(body.city, 80);
  const email = str(body.organizer_email, 200);
  const contactName = str(body.contact_name, 100);
  const categories = Array.isArray(body.categories) ? (body.categories as unknown[]).filter((c): c is string => typeof c === "string" && CATEGORY_SLUGS.includes(c)) : [];

  if (title.length < 5) return fail("Укажите название события.");
  if (!(eventType in EVENT_TYPE_LABELS)) return fail("Выберите тип события.");
  if (!(format in FORMAT_LABELS)) return fail("Выберите формат события.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(Date.parse(startDate))) return fail("Укажите дату начала.");
  if (endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < startDate)) return fail("Дата окончания не может быть раньше даты начала.");
  if (format !== "online" && !city) return fail("Укажите город.");
  if (shortDescription.length < 20) return fail("Добавьте краткое описание (от 20 символов).");
  if (description.length < 50) return fail("Добавьте полное описание (от 50 символов).");
  if (!isHttp(officialUrl)) return fail("Укажите ссылку на официальный сайт (с https://).");
  if (registrationUrl && !isHttp(registrationUrl)) return fail("Ссылка на регистрацию должна начинаться с https://.");
  if (!isEmail(email)) return fail("Укажите email организатора.");
  if (contactName.length < 2) return fail("Укажите контактное лицо.");
  if (categories.length === 0) return fail("Выберите хотя бы одно направление.");
  if (body.consent !== true) return fail("Нужно согласие с правилами публикации.");

  const priceType = ["free", "paid", "on_request"].includes(str(body.price_type, 20)) ? str(body.price_type, 20) : "on_request";
  const priceFromRaw = Number(body.price_from);
  const priceFrom = Number.isFinite(priceFromRaw) && priceFromRaw > 0 ? Math.round(priceFromRaw) : 0;

  let pb;
  try {
    pb = await getSuperuserClient();
  } catch {
    return fail("Сервис временно недоступен.", 503);
  }

  try {
    // Без дублей: тот же официальный сайт или то же название с той же датой.
    const dup = await pb.collection("ai_events").getList(1, 1, {
      filter: pb.filter("official_url = {:url} || (title = {:title} && start_date >= {:d0} && start_date < {:d1})", {
        url: officialUrl,
        title,
        d0: `${startDate} 00:00:00.000Z`,
        d1: `${startDate} 23:59:59.999Z`,
      }),
      fields: "id",
    });
    if (dup.totalItems > 0) return fail("Такое событие уже есть в календаре или ожидает проверки.", 409);

    const event = await pb.collection("ai_events").create({
      title,
      slug: slugify(title, startDate),
      short_description: shortDescription,
      description,
      event_type: eventType,
      format,
      start_date: `${startDate} 00:00:00.000Z`,
      end_date: endDate ? `${endDate} 00:00:00.000Z` : "",
      time_note: str(body.time_note, 80),
      city: format === "online" ? "" : city,
      venue: str(body.venue, 200),
      address: str(body.address, 300),
      online_platform: str(body.online_platform, 100),
      official_url: officialUrl,
      registration_url: registrationUrl,
      program_url: isHttp(str(body.program_url, 500)) ? str(body.program_url, 500) : "",
      price_type: priceType,
      price_from: priceType === "paid" ? priceFrom : 0,
      promo_code: str(body.promo_code, 60),
      organizer: str(body.organizer, 150),
      categories,
      speakers_wanted: body.speakers_wanted === true,
      exhibitors_wanted: body.exhibitors_wanted === true,
      status: "pending",
      placement: "basic",
      source_note: "Заявка организатора через форму на сайте.",
      reg_clicks: 0,
    });

    await pb.collection("ai_event_submissions").create({
      event: event.id,
      organizer_email: email,
      contact_name: contactName,
      contact_phone: str(body.contact_phone, 40),
      organizer_note: str(body.organizer_note, 2000),
    });
  } catch {
    return fail("Не удалось сохранить заявку, попробуйте позже.", 500);
  }

  return NextResponse.json({ ok: true });
}
