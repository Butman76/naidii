import { NextRequest, NextResponse } from "next/server";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { authenticateCaller } from "@/lib/server-auth";
import { aggregateAnalytics, hasAnalyticsAccess } from "@/lib/analytics";

// Данные для вкладки "Аналитика" кабинета специалиста. Доступ по тарифу
// проверяется здесь, на сервере (plans.ts, analyticsEnabled) — то, что
// вкладка в интерфейсе скрыта на Базовом, само по себе ничего не защищает.
// Статистика — только по профилю самого вызывающего.
const ALLOWED_PERIODS = new Set([7, 30, 90]);
const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const caller = await authenticateCaller(request);
  if (!caller) return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  if (caller.role !== "specialist") {
    return NextResponse.json({ error: "Аналитика доступна специалистам." }, { status: 403 });
  }

  let periodDays = 30;
  try {
    const body = await request.json();
    if (typeof body.days === "number" && ALLOWED_PERIODS.has(body.days)) periodDays = body.days;
  } catch {
    // тело необязательное — период по умолчанию
  }

  try {
    const su = await getSuperuserClient();
    const profile = await su
      .collection("specialist_profiles")
      .getFirstListItem(su.filter("user_id = {:id}", { id: caller.id }))
      .catch(() => null);
    if (!profile) return NextResponse.json({ error: "Профиль специалиста не найден." }, { status: 404 });

    const now = new Date();
    if (!hasAnalyticsAccess(profile, now)) {
      return NextResponse.json({ error: "plan" }, { status: 403 });
    }

    // Текущий период и предыдущий такой же длины — для сравнения. Запас в
    // сутки на границу дня по московскому времени.
    const since = new Date(now.getTime() - (2 * periodDays + 1) * DAY_MS).toISOString().replace("T", " ");
    const [events, leads] = await Promise.all([
      su.collection("profile_events").getFullList({
        filter: su.filter('specialist_profile_id = {:p} && kind = "profile_view" && created >= {:since}', {
          p: profile.id,
          since,
        }),
        fields: "created,visitor",
        batch: 1000,
      }),
      su.collection("leads").getFullList({
        filter: su.filter("specialist_profile_id = {:p} && created >= {:since}", { p: profile.id, since }),
        fields: "created,category_slug",
        batch: 1000,
      }),
    ]);

    return NextResponse.json(
      aggregateAnalytics({
        now,
        periodDays,
        events: events.map((e) => ({ created: e.created, visitor: e.visitor })),
        leads: leads.map((l) => ({ created: l.created, category_slug: l.category_slug })),
      })
    );
  } catch (err) {
    console.error("analytics:", err);
    return NextResponse.json({ error: "Не удалось загрузить аналитику." }, { status: 502 });
  }
}
