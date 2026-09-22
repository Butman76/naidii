"use client";

import PocketBase from "pocketbase";
import { PB_URL } from "./pocketbase";

// Единственный клиент на вкладку браузера — в отличие от createPocketBase()
// в pocketbase.ts (новый инстанс на каждый серверный запрос, без сессии),
// этот один переживает переходы между страницами и хранит токен в
// localStorage сам (стандартное поведение SDK в браузере).
export const pbClient = new PocketBase(PB_URL);

// Отмечает вход в журнале /admin (см. api/log-login/route.ts) — вызывается
// сразу после authWithPassword на страницах логина и регистрации. Не
// блокирует и не ломает сам вход, если запрос не удался (нет сети и т.п.).
export function logLogin(): void {
  fetch("/api/log-login", {
    method: "POST",
    headers: { Authorization: pbClient.authStore.token },
  }).catch(() => {});
}
