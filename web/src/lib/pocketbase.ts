import PocketBase from "pocketbase";

// Публичный домен, а не localhost/внутренний адрес — так один и тот же код
// работает одинаково и на VPS в проде, и на любом компьютере разработки
// (запрос идёт через интернет в обоих случаях, разница в задержке
// незначительна на фоне остального рендеринга страницы).
export const PB_URL = "https://pb.naidii.ru";

export function createPocketBase() {
  return new PocketBase(PB_URL);
}
