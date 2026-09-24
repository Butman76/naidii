import PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { PB_URL } from "./pocketbase";

// Кто вызывает серверный роут — определяем не по тому, что прислал клиент
// в теле запроса, а проверкой его токена самим PocketBase. Возвращает null,
// если токена нет или он недействителен.
//
// Именно getOne по id из токена, а не authRefresh(): токен, выданный
// через "войти как" (impersonate, /admin), PocketBase помечает как
// необновляемый, и authRefresh() на нём всегда падает — оплата под
// таким входом отвечала бы "Войдите в аккаунт". id из полезной нагрузки
// токена сам по себе ничему не доверяем: запрос уходит в PocketBase с
// этим токеном, а правило view для users ("id = @request.auth.id" или
// admin/moderator) отдаёт запись только если подпись токена настоящая.
// Подделанный токен PocketBase считает отсутствием авторизации, и запись
// не отдаётся.
export async function authenticateCaller(request: Request): Promise<RecordModel | null> {
  const token = request.headers.get("authorization");
  if (!token) return null;

  let id: unknown;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
    if (payload.type !== "auth") return null;
    id = payload.id;
  } catch {
    return null;
  }
  if (typeof id !== "string" || !id) return null;

  const caller = new PocketBase(PB_URL);
  caller.authStore.save(token, null);
  try {
    const record = await caller.collection("users").getOne(id);
    return record.id === id ? record : null;
  } catch {
    return null;
  }
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? "https://naidii.ru").replace(/\/$/, "");
}
