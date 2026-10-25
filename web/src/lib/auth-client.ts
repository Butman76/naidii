"use client";

import PocketBase from "pocketbase";
import { PB_URL } from "./pocketbase";

// Единственный клиент на вкладку браузера — в отличие от createPocketBase()
// в pocketbase.ts (новый инстанс на каждый серверный запрос, без сессии),
// этот один переживает переходы между страницами и хранит токен в
// localStorage сам (стандартное поведение SDK в браузере).
export const pbClient = new PocketBase(PB_URL);

// Токен живёт 7 дней (users.authToken.duration). После этого PocketBase
// воспринимает запросы с ним как анонимные: списки по правилам доступа
// возвращают 200 и ПУСТЫЕ данные, а в localStorage при этом остаётся старая
// запись пользователя — страница продолжала показывать «роль: admin», но
// с нулями во всех счётчиках (2026-10-16, админка). Протухший токен сразу
// сбрасываем: пользователь считается вышедшим, защита страниц отправит на
// вход, и вместо тихих нулей видно, что нужно войти заново.
if (typeof window !== "undefined" && pbClient.authStore.token && !pbClient.authStore.isValid) {
  pbClient.authStore.clear();
}

// Отмечает вход в журнале /admin (см. api/log-login/route.ts) — вызывается
// сразу после authWithPassword на страницах логина и регистрации. Не
// блокирует и не ломает сам вход, если запрос не удался (нет сети и т.п.).
export function logLogin(): void {
  fetch("/api/log-login", {
    method: "POST",
    headers: { Authorization: pbClient.authStore.token },
  }).catch(() => {});
}
