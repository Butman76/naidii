"use client";

import PocketBase from "pocketbase";
import { PB_URL } from "./pocketbase";

// Единственный клиент на вкладку браузера — в отличие от createPocketBase()
// в pocketbase.ts (новый инстанс на каждый серверный запрос, без сессии),
// этот один переживает переходы между страницами и хранит токен в
// localStorage сам (стандартное поведение SDK в браузере).
export const pbClient = new PocketBase(PB_URL);
