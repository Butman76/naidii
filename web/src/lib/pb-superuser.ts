import PocketBase from "pocketbase";
import { PB_URL } from "./pocketbase";

// Только для серверного кода (Route Handlers) — обычная роль admin не может
// вызвать impersonate через API PocketBase (это операция суперпользователя),
// поэтому держим отдельную суперпользовательскую сессию на сервере.
// Реквизиты — в переменных окружения на самой VPS, не в репозитории.
let cachedClient: PocketBase | null = null;

export async function getSuperuserClient(): Promise<PocketBase> {
  const email = process.env.PB_SUPERUSER_EMAIL;
  const password = process.env.PB_SUPERUSER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "PB_SUPERUSER_EMAIL/PB_SUPERUSER_PASSWORD не заданы в окружении сервера"
    );
  }

  if (cachedClient?.authStore.isValid) {
    return cachedClient;
  }

  const pb = new PocketBase(PB_URL);
  await pb.collection("_superusers").authWithPassword(email, password);
  cachedClient = pb;
  return pb;
}
