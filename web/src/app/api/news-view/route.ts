import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { authenticateCaller } from "@/lib/server-auth";
import { withKeyedLock } from "@/lib/keyed-lock";

// Счётчик просмотров новостей (NewsViewTracker.tsx); число видят только
// админы (коллекция news_view_counts, миграция 1755000067). Читатель
// считается один раз: если уже есть просмотр с тем же аккаунтом ИЛИ с тем же
// IP — новый не создаётся. IP хранится только хэшем. Не считаем ботов,
// админов и модераторов. Всегда отвечаем 200 — как и /api/track.
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python-requests|facebookexternalhit|yandex/i;

function clientIp(request: NextRequest): string {
  // Caddy ставит реальный адрес клиента в X-Forwarded-For (чужое значение
  // он отбрасывает); берём первый адрес списка.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "";
}

export async function POST(request: NextRequest) {
  const done = () => NextResponse.json({ ok: true });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT_RE.test(userAgent)) return done();

  let slug: unknown;
  try {
    slug = (await request.json()).slug;
  } catch {
    return done();
  }
  if (typeof slug !== "string" || slug.length === 0 || slug.length > 120) return done();

  const ip = clientIp(request);
  const ipHash = ip ? createHash("sha256").update(`naidii-news:${ip}`).digest("hex") : "";

  try {
    const su = await getSuperuserClient();
    const post = await su
      .collection("news_posts")
      .getFirstListItem(su.filter('slug = {:slug} && status = "published" && published_at <= @now', { slug }), { fields: "id" })
      .catch(() => null);
    if (!post) return done();

    const caller = await authenticateCaller(request);
    if (caller && (caller.role === "admin" || caller.role === "moderator")) return done();
    const userId = caller?.id ?? "";
    if (!userId && !ipHash) return done();

    await withKeyedLock(`newsview:${post.id}`, async () => {
      const conditions: string[] = [];
      const params: Record<string, string> = { post: post.id };
      if (userId) {
        conditions.push("user_id = {:user}");
        params.user = userId;
      }
      if (ipHash) {
        conditions.push("ip_hash = {:ip}");
        params.ip = ipHash;
      }
      const existing = await su.collection("news_views").getList(1, 1, {
        filter: su.filter(`post = {:post} && (${conditions.join(" || ")})`, params),
        fields: "id,user_id,ip_hash",
      });
      const seen = existing.items[0];
      if (seen) {
        // Дополняем недостающий признак, чтобы тот же человек не посчитался
        // второй раз с другого устройства/после входа в аккаунт.
        const patch: Record<string, string> = {};
        if (userId && !seen.user_id) patch.user_id = userId;
        if (ipHash && !seen.ip_hash) patch.ip_hash = ipHash;
        if (Object.keys(patch).length > 0) await su.collection("news_views").update(seen.id, patch);
        return;
      }
      await su.collection("news_views").create({ post: post.id, user_id: userId, ip_hash: ipHash });
    });
  } catch (err) {
    console.error("news-view:", err);
  }
  return done();
}
