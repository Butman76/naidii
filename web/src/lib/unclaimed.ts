import type PocketBase from "pocketbase";
import { createPocketBase } from "./pocketbase";

// Неподтверждённые карточки ("claim your business") — компании, которых мы
// сами нашли и добавили по открытым данным, без их запроса (см. STATUS.md,
// 2026-09-28). Отдельно от specialist_profiles: у них ещё нет владельца на
// сайте, и может не появиться никогда — см. 1755000060_unclaimed_specialists.js.

// Только то, что можно безопасно показать анонимному посетителю. Юрлицо,
// ИНН и сайт сюда сознательно не входят (см. AdminUnclaimedListing ниже) —
// иначе мы бы напрямую сводили заказчика с конторой мимо площадки. domain
// всё равно виден через URL страницы (/unclaimed/{domain}) — это не
// изменить без смены схемы адресов, но это не то же самое, что кликабельная
// ссылка на сайт или прямые контакты.
export interface UnclaimedListing {
  id: string;
  name: string;
  domain: string;
  city: string;
  blurb: string;
  categories: string[];
}

// Различает UnclaimedListing от Specialist в общей сетке карточек (у
// Specialist нет поля domain) — см. mixIn ниже.
export function isUnclaimedListing(v: unknown): v is UnclaimedListing {
  return typeof v === "object" && v !== null && "domain" in v;
}

// Вмешивает неподтверждённые карточки в уже отсортированный список
// специалистов, а не показывает отдельным блоком снизу (по просьбе
// пользователя, 2026-09-28) — каждая вставляется через `step` карточек,
// чтобы не столпились в конце и не перебивали первые (часто продвигаемые)
// позиции настоящих специалистов.
export function mixIn<A>(main: A[], extra: UnclaimedListing[], step = 4): Array<A | UnclaimedListing> {
  if (extra.length === 0) return main;
  const out: Array<A | UnclaimedListing> = [];
  let e = 0;
  main.forEach((item, i) => {
    out.push(item);
    if ((i + 1) % step === 0 && e < extra.length) out.push(extra[e++]);
  });
  while (e < extra.length) out.push(extra[e++]);
  return out;
}

// ---------- раскладка компаний по карточкам услуг (/services) ----------

// Ключевые слова по подкатегории карточки услуги (ResultType.subcategory) —
// ищем их в названии и описании компании. Совпадение значит «в описании
// заявлено именно это» и поднимает компанию в карточке выше; без совпадений
// компания всё равно попадает в карточки своего направления (направление она
// заявила сама), но ниже — см. unclaimedForType.
const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  "Продажи и заявки": ["продаж", "лид", "заявк", "воронк"],
  "Поддержка клиентов": ["поддержк", "клиент", "обращени", "саппорт"],
  "HR и рекрутинг": ["hr", "рекрут", "подбор", "кандидат", "персонал"],
  "Корпоративные базы знаний": ["баз знаний", "базы знаний", "документ", "корпоратив", "rag"],
  "RAG для ботов поддержки": ["поддержк", "бот", "rag"],
  "Юридический AI-анализ": ["юрид", "договор", "право"],
  "Автоматизация процессов": ["автоматизац", "процесс", "n8n", "workflow", "интеграц"],
  "Миграция между платформами": ["миграц", "zapier", "make", "n8n", "интеграц"],
  "Отчётность и таблицы": ["отчёт", "отчет", "таблиц", "sheets"],
  "Продающие боты": ["продаж", "бот", "telegram", "телеграм"],
  "Запись и бронирование": ["запис", "бронир"],
  "Поддержка в мессенджерах": ["мессенджер", "whatsapp", "telegram", "поддержк"],
  "Приём звонков": ["звонк", "голос", "ivr", "колл"],
  "Исходящий обзвон": ["обзвон", "звонк", "колл"],
  "IVR и ресепшн": ["ivr", "ресепшн", "голос", "звонк"],
  "Рекламные ролики": ["реклам", "ролик", "видео"],
  "Shorts/Reels": ["shorts", "reels", "монтаж", "контент", "видео"],
  "Озвучка и локализация": ["озвуч", "локализ", "дубляж", "перевод"],
  "Обучающее видео": ["обуч", "видео", "курс"],
  "Скоринг лидов": ["скоринг", "лид", "crm"],
  "Автозаполнение данных": ["автозаполн", "crm", "сделк", "данн"],
  "Напоминания и уведомления": ["напомин", "уведомл", "crm"],
  "Промпт-инжиниринг": ["промпт", "prompt"],
  "Файнтюнинг": ["файнтюн", "fine-tun", "обучение модел", "датасет"],
  "Оптимизация расходов на AI": ["стоимост", "расход", "оптимизац"],
  "AI-дашборды": ["дашборд", "bi", "аналитик", "визуализ"],
  "Отчёты на естественном языке": ["отчёт", "отчет", "аналитик", "sql"],
  "Мониторинг и алерты": ["мониторинг", "аномал", "алерт"],
};

export interface TypeRef {
  slug: string;
  categorySlug: string;
  subcategory: string;
}

export interface CompanyForType {
  listing: UnclaimedListing;
  /** true — в описании компании есть слова по теме именно этой карточки */
  matched: boolean;
}

function hashOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Какие компании показать в карточке услуги. Берём компании её направления
// (категорию компания заявила сама). Те, у кого в названии/описании есть слова
// по теме карточки, идут первыми (до `max`). Если таких мало, добираем до
// `min` остальными компаниями направления — со сдвигом по хэшу карточки, чтобы
// в соседних карточках одного направления были разные компании, а не одни и
// те же первые. Результат стабилен между сборками (без Math.random).
export function unclaimedForType(
  listings: UnclaimedListing[],
  type: TypeRef,
  opts: { min?: number; max?: number } = {}
): CompanyForType[] {
  const { min = 6, max = 12 } = opts;
  const words = SUBCATEGORY_KEYWORDS[type.subcategory] ?? [];
  const inCategory = listings.filter((l) => l.categories.includes(type.categorySlug));
  const isMatch = (l: UnclaimedListing) => {
    const hay = `${l.name} ${l.blurb}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  };
  const matched = inCategory.filter(isMatch);
  const rest = inCategory.filter((l) => !isMatch(l));

  const out: CompanyForType[] = matched.slice(0, max).map((listing) => ({ listing, matched: true }));
  if (out.length < min && rest.length > 0) {
    const offset = hashOf(type.slug) % rest.length;
    for (let i = 0; i < rest.length && out.length < min; i++) {
      out.push({ listing: rest[(offset + i) % rest.length], matched: false });
    }
  }
  return out;
}

function mapListing(r: Record<string, unknown>): UnclaimedListing {
  const s = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  return {
    id: s("id"),
    name: s("name"),
    domain: s("domain"),
    city: s("city"),
    blurb: s("blurb"),
    categories: Array.isArray(r.categories) ? (r.categories as string[]) : [],
  };
}

// Публичный список: читает unclaimed_specialists_public — view-коллекцию
// (миграция 1755000062), которая физически содержит только безопасные
// столбцы. Базовая таблица unclaimed_specialists с ИНН/юрлицом/сайтом и
// приватными source_email/source_phone анонимам больше не листается вообще
// (listRule = только admin) — раньше казалось, что достаточно не рисовать
// эти поля в интерфейсе, но параметр `fields` в запросе ограничивает только
// то, что просит наш код, а не то, что может запросить кто угодно, дёрнув
// API напрямую (см. обсуждение с пользователем 2026-09-28). Без
// коллекции/при сбое — пустой список, страница каталога не должна из-за
// этого падать (та же логика, что у fetchPublishedEvents).
export async function fetchActiveUnclaimedListings(): Promise<UnclaimedListing[]> {
  try {
    const pb = createPocketBase();
    const records = await pb.collection("unclaimed_specialists_public").getFullList({ filter: 'status = "active"', sort: "name", batch: 500 });
    return records.map((r) => mapListing(r as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchUnclaimedListingByDomain(domain: string): Promise<UnclaimedListing | null> {
  try {
    const pb = createPocketBase();
    const r = await pb.collection("unclaimed_specialists_public").getFirstListItem(
      pb.filter('domain = {:domain} && status = "active"', { domain })
    );
    return mapListing(r as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ---------- админка ----------

export interface AdminUnclaimedListing extends UnclaimedListing {
  website: string;
  legalName: string;
  inn: string;
  sourceEmail: string;
  sourcePhone: string;
  status: "active" | "claimed" | "removed";
  adminNote: string;
}

export interface UnclaimedClaim {
  id: string;
  listingId: string;
  kind: "claim" | "remove";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  status: "new" | "handled";
  adminComment: string;
  created: string;
}

// Только для админа: pb здесь — сессия самого вошедшего admin (pbClient из
// компонента), PocketBase проверяет роль по JWT на своей стороне — это
// настоящая граница доступа, а не просто "интерфейс не показывает".
export async function fetchAdminUnclaimedListings(pb: PocketBase): Promise<AdminUnclaimedListing[]> {
  const records = await pb.collection("unclaimed_specialists").getFullList({ sort: "-created", batch: 500 });
  return records.map((r) => ({
    ...mapListing(r as unknown as Record<string, unknown>),
    website: String(r.website ?? ""),
    legalName: String(r.legal_name ?? ""),
    inn: String(r.inn ?? ""),
    sourceEmail: String(r.source_email ?? ""),
    sourcePhone: String(r.source_phone ?? ""),
    status: (r.status as AdminUnclaimedListing["status"]) || "active",
    adminNote: String(r.admin_note ?? ""),
  }));
}

export async function fetchAdminUnclaimedClaims(pb: PocketBase): Promise<UnclaimedClaim[]> {
  const records = await pb.collection("unclaimed_claims").getFullList({ sort: "-created", batch: 500 });
  return records.map((r) => ({
    id: String(r.id),
    listingId: String(r.listing),
    kind: (r.kind as UnclaimedClaim["kind"]) || "claim",
    contactName: String(r.contact_name ?? ""),
    contactEmail: String(r.contact_email ?? ""),
    contactPhone: String(r.contact_phone ?? ""),
    message: String(r.message ?? ""),
    status: (r.status as UnclaimedClaim["status"]) || "new",
    adminComment: String(r.admin_comment ?? ""),
    created: String(r.created ?? ""),
  }));
}

export async function updateUnclaimedListing(
  pb: PocketBase,
  id: string,
  patch: Record<string, string>
): Promise<void> {
  await pb.collection("unclaimed_specialists").update(id, patch);
}

export async function deleteUnclaimedListing(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("unclaimed_specialists").delete(id);
}

export async function updateUnclaimedClaim(pb: PocketBase, id: string, patch: Record<string, string>): Promise<void> {
  await pb.collection("unclaimed_claims").update(id, patch);
}
