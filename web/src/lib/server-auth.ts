import PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { PB_URL } from "./pocketbase";

// Кто вызывает серверный роут — определяем не по тому, что прислал клиент
// в теле запроса, а свежим authRefresh() по его токену (тот же приём, что
// в api/impersonate и api/log-login). Возвращает null, если токена нет или
// он недействителен.
export async function authenticateCaller(request: Request): Promise<RecordModel | null> {
  const token = request.headers.get("authorization");
  if (!token) return null;
  const caller = new PocketBase(PB_URL);
  caller.authStore.save(token, null);
  try {
    const auth = await caller.collection("users").authRefresh();
    return auth.record;
  } catch {
    return null;
  }
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? "https://naidii.ru").replace(/\/$/, "");
}
