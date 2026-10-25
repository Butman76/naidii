import PocketBase from "pocketbase";

// Публичный домен, а не localhost/внутренний адрес — так один и тот же код
// работает одинаково и на VPS в проде, и на любом компьютере разработки
// (запрос идёт через интернет в обоих случаях, разница в задержке
// незначительна на фоне остального рендеринга страницы).
// NEXT_PUBLIC_PB_URL — только для локальной проверки против песочницы
// PocketBase (например, http://127.0.0.1:8092): без переменной всегда прод.
export const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "https://pb.naidii.ru";

export function createPocketBase() {
  return new PocketBase(PB_URL);
}
