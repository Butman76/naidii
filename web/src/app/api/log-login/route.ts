import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { PB_URL } from "@/lib/pocketbase";
import { getSuperuserClient } from "@/lib/pb-superuser";
import { lookupRegion } from "@/lib/geo-ip";

// Записывает "обычный" вход (логин/регистрация) в login_logs — вызывается
// клиентом (LoginPage/RegisterPage) сразу после успешного authWithPassword.
// Кто именно вошёл, берём не из тела запроса, а свежим authRefresh() по
// присланному токену (как в api/impersonate/route.ts) — иначе пользователь
// мог бы записать в журнал чужой user_id. "Войти как" логируется отдельно,
// прямо в api/impersonate/route.ts, сюда не попадает.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "no auth" }, { status: 401 });
  }

  const caller = new PocketBase(PB_URL);
  caller.authStore.save(authHeader, null);
  let callerId: string;
  try {
    const auth = await caller.collection("users").authRefresh();
    callerId = auth.record.id;
  } catch {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const superuser = await getSuperuserClient();
    await superuser.collection("login_logs").create({
      user_id: callerId,
      ip,
      region: await lookupRegion(ip),
      user_agent: request.headers.get("user-agent") ?? "",
    });
  } catch {
    // Журнал — не критичный путь: если запись не удалась, сам вход уже
    // состоялся раньше (authWithPassword до вызова этого роута) и не должен
    // из-за этого выглядеть неудавшимся для пользователя.
  }

  return NextResponse.json({ ok: true });
}
