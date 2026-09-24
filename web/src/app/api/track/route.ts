import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { authenticateCaller } from "@/lib/server-auth";
import { withKeyedLock } from "@/lib/keyed-lock";

// Счётчик просмотров страницы профиля специалиста (ViewTracker.tsx) — сырьё
// для вкладки "Аналитика". Всегда отвечаем 200: трекинг не должен ни
// ломать страницу, ни подсказывать посторонним, что именно отфильтровано.
//
// Не считаем: ботов (по User-Agent), самого владельца профиля и
// admin/moderator (включая "войти как" — токен там принадлежит владельцу),
// профили не в статусе published, повторный заход того же посетителя в тот
// же профиль в течение 30 минут (перезагрузки страницы).
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python-requests|facebookexternalhit|yandex/i;
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

function pbDate(ms: number): string {
  return new Date(ms).toISOString().replace("T", " ");
}

export async function POST(request: NextRequest) {
  const done = () => NextResponse.json({ ok: true });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT_RE.test(userAgent)) return done();

  let slug: unknown;
  let visitor: unknown;
  try {
    const body = await request.json();
    slug = body.slug;
    visitor = body.visitor;
  } catch {
    return done();
  }
  if (typeof slug !== "string" || slug.length === 0 || slug.length > 120) return done();
  if (typeof visitor !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(visitor)) return done();

  try {
    const su = await getSuperuserClient();
    const profile = await su
      .collection("specialist_profiles")
      .getFirstListItem(su.filter('slug = {:slug} && profile_status = "published"', { slug }))
      .catch(() => null);
    if (!profile) return done();

    const caller = await authenticateCaller(request);
    if (caller && (caller.id === profile.user_id || caller.role === "admin" || caller.role === "moderator")) {
      return done();
    }

    const recent = await su.collection("profile_events").getList(1, 1, {
      filter: su.filter(
        'specialist_profile_id = {:profile} && kind = "profile_view" && visitor = {:visitor} && created >= {:since}',
        { profile: profile.id, visitor, since: pbDate(Date.now() - DEDUPE_WINDOW_MS) }
      ),
      fields: "id",
    });
    if (recent.items.length > 0) return done();

    await su.collection("profile_events").create({
      specialist_profile_id: profile.id,
      kind: "profile_view",
      visitor,
    });

    // Общий счётчик для "Обзора" кабинета (видят все тарифы). Чтение +
    // запись не атомарны, поэтому по очереди внутри процесса.
    await withKeyedLock(`views:${profile.id}`, async () => {
      const fresh = await su.collection("specialist_profiles").getOne(profile.id, { fields: "id,views_count" });
      await su.collection("specialist_profiles").update(profile.id, { views_count: (fresh.views_count ?? 0) + 1 });
    });
  } catch (err) {
    console.error("track:", err);
  }
  return done();
}
