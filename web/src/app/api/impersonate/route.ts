import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { PB_URL } from "@/lib/pocketbase";
import { getSuperuserClient } from "@/lib/pb-superuser";

// Позволяет admin "войти как" другого пользователя без пароля — по клику
// в /admin, см. AdminPanel.tsx. Обычная роль admin (запись в коллекции
// users) не может дёрнуть impersonate напрямую — это операция
// суперпользователя PocketBase, поэтому она проксируется через этот
// серверный роут с отдельной суперпользовательской сессией
// (web/src/lib/pb-superuser.ts). Кто звонит — проверяем не по тому, что
// прислал клиент, а свежим authRefresh() его же токеном.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "no auth" }, { status: 401 });
  }

  let targetUserId: string | undefined;
  try {
    const body = await request.json();
    targetUserId = body.targetUserId;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }

  const caller = new PocketBase(PB_URL);
  caller.authStore.save(authHeader, null);
  let callerRecord;
  try {
    const auth = await caller.collection("users").authRefresh();
    callerRecord = auth.record;
  } catch {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }
  if (callerRecord.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const superuser = await getSuperuserClient();
    const impersonated = await superuser.collection("users").impersonate(targetUserId, 3600);

    await superuser.collection("admin_logs").create({
      admin_id: callerRecord.id,
      action: "Вошёл как пользователь",
      entity_type: "users",
      entity_id: targetUserId,
    });

    return NextResponse.json({
      token: impersonated.authStore.token,
      record: impersonated.authStore.record,
    });
  } catch {
    return NextResponse.json({ error: "impersonate failed" }, { status: 500 });
  }
}
