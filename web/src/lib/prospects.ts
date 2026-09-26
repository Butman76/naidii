import type PocketBase from "pocketbase";

// База потенциальных исполнителей (вкладка "База исполнителей" в /admin,
// коллекция prospects — см. pocketbase/pb_migrations/1755000054_prospects.js).
// Ни с чем не связана, только картотека админа. Файл сознательно без
// относительных импортов — чтобы разбор и импорт можно было проверять
// отдельно от Next.js.

export type ProspectStatus = "new" | "contacted" | "replied" | "working" | "not_working";

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "Не связывались",
  contacted: "Написали",
  replied: "Ответили",
  working: "Работаем",
  not_working: "Не работаем",
};

export const STATUS_ORDER: ProspectStatus[] = ["new", "contacted", "replied", "working", "not_working"];

export interface Prospect {
  id: string;
  domain: string;
  name: string;
  direction: string;
  website: string;
  companyType: string;
  city: string;
  legalName: string;
  inn: string;
  ogrn: string;
  address: string;
  director: string;
  phones: string;
  emails: string;
  telegram: string;
  services: string;
  priceNote: string;
  caseUrl: string;
  confidence: string;
  dataNotes: string;
  status: ProspectStatus;
  notes: string;
  lastContactedAt: string;
  checkedAt: string;
}

// Поля, которые импорт CSV может создавать и обновлять (имена колонок файла
// = имена полей коллекции). status, notes и last_contacted_at — ручная
// работа админа: при повторном импорте существующей конторы они не
// перезаписываются.
const DATA_FIELDS = [
  "direction", "website", "company_type", "city", "legal_name", "inn", "ogrn", "address", "director",
  "phones", "emails", "telegram", "services", "price_note", "case_url", "confidence", "data_notes", "checked_at",
] as const;
type DataField = (typeof DATA_FIELDS)[number];

export interface ImportRow {
  domain: string;
  name: string;
  data: Partial<Record<DataField, string>>;
  status?: ProspectStatus;
  notes?: string;
}

// Домен без схемы, "www." и пути, в нижнем регистре — ключ конторы.
export function domainFromUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[/?#].*$/, "")
    .toLowerCase();
}

// Разбор CSV: BOM, кавычки с удвоением, переводы строк внутри полей,
// разделитель ";" или "," определяется по первой строке.
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) {
      row.push(cur);
      cur = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

export function csvToImportRows(text: string): { rows: ImportRow[]; problems: string[] } {
  const table = parseCsv(text);
  const problems: string[] = [];
  if (table.length < 2) return { rows: [], problems: ["В файле нет строк с данными."] };
  const header = table[0].map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  if (col("name") === -1 || (col("website") === -1 && col("domain") === -1)) {
    return { rows: [], problems: ['В первой строке нужны колонки "name" и "website" (или "domain").'] };
  }
  const rows: ImportRow[] = [];
  const seen = new Set<string>();
  table.slice(1).forEach((r, i) => {
    const get = (name: string) => (col(name) === -1 ? "" : (r[col(name)] ?? "").trim());
    const name = get("name");
    const domain = domainFromUrl(get("domain") || get("website"));
    if (!name || !domain) {
      problems.push(`Строка ${i + 2}: нет названия или сайта, пропущена.`);
      return;
    }
    if (seen.has(domain)) {
      problems.push(`Строка ${i + 2}: сайт ${domain} уже был выше в файле, пропущена.`);
      return;
    }
    seen.add(domain);
    const data: Partial<Record<DataField, string>> = {};
    for (const f of DATA_FIELDS) {
      const v = get(f);
      if (v) data[f] = v;
    }
    const status = get("status") as ProspectStatus;
    rows.push({
      domain,
      name,
      data,
      status: STATUS_ORDER.includes(status) ? status : undefined,
      notes: get("notes") || undefined,
    });
  });
  return { rows, problems };
}

export interface ImportResult {
  created: number;
  updated: number;
  failed: string[];
}

// Импорт без дублей: контора находится по домену. Существующая — обновляется
// только непустыми значениями из файла и никогда не теряет статус,
// примечание и дату контакта.
export async function importProspects(pb: PocketBase, rows: ImportRow[]): Promise<ImportResult> {
  const existing = await pb.collection("prospects").getFullList({ fields: "id,domain,notes", batch: 500 });
  const byDomain = new Map(existing.map((r) => [String(r.domain), r]));
  const result: ImportResult = { created: 0, updated: 0, failed: [] };
  for (const row of rows) {
    try {
      const found = byDomain.get(row.domain);
      if (found) {
        const patch: Record<string, string> = { name: row.name, ...(row.data as Record<string, string>) };
        if (row.notes && !String(found.notes ?? "").trim()) patch.notes = row.notes;
        await pb.collection("prospects").update(found.id, patch);
        result.updated++;
      } else {
        await pb.collection("prospects").create({
          domain: row.domain,
          name: row.name,
          website: `https://${row.domain}/`,
          ...row.data,
          status: row.status ?? "new",
          notes: row.notes ?? "",
        });
        result.created++;
      }
    } catch (err) {
      result.failed.push(`${row.name}: ${err instanceof Error ? err.message : "не удалось сохранить"}`);
    }
  }
  return result;
}

export async function fetchProspects(pb: PocketBase): Promise<Prospect[]> {
  const records = await pb.collection("prospects").getFullList({ sort: "name", batch: 500 });
  return records.map((r) => ({
    id: r.id,
    domain: r.domain ?? "",
    name: r.name ?? "",
    direction: r.direction ?? "",
    website: r.website ?? "",
    companyType: r.company_type ?? "",
    city: r.city ?? "",
    legalName: r.legal_name ?? "",
    inn: r.inn ?? "",
    ogrn: r.ogrn ?? "",
    address: r.address ?? "",
    director: r.director ?? "",
    phones: r.phones ?? "",
    emails: r.emails ?? "",
    telegram: r.telegram ?? "",
    services: r.services ?? "",
    priceNote: r.price_note ?? "",
    caseUrl: r.case_url ?? "",
    confidence: r.confidence ?? "",
    dataNotes: r.data_notes ?? "",
    status: (r.status || "new") as ProspectStatus,
    notes: r.notes ?? "",
    lastContactedAt: r.last_contacted_at ?? "",
    checkedAt: r.checked_at ?? "",
  }));
}

export async function updateProspect(pb: PocketBase, id: string, patch: Record<string, string>): Promise<void> {
  await pb.collection("prospects").update(id, patch);
}

export async function deleteProspect(pb: PocketBase, id: string): Promise<void> {
  await pb.collection("prospects").delete(id);
}

export async function createProspect(
  pb: PocketBase,
  params: { name: string; website: string; direction: string }
): Promise<void> {
  const domain = domainFromUrl(params.website);
  await pb.collection("prospects").create({
    domain,
    name: params.name.trim(),
    website: `https://${domain}/`,
    direction: params.direction,
    status: "new",
  });
}

// Экспорт в тот же формат, что и импорт (";" + BOM — открывается в Excel).
export function prospectsToCsv(list: Prospect[]): string {
  const columns: Array<[string, (p: Prospect) => string]> = [
    ["direction", (p) => p.direction],
    ["name", (p) => p.name],
    ["website", (p) => p.website],
    ["company_type", (p) => p.companyType],
    ["city", (p) => p.city],
    ["legal_name", (p) => p.legalName],
    ["inn", (p) => p.inn],
    ["ogrn", (p) => p.ogrn],
    ["address", (p) => p.address],
    ["director", (p) => p.director],
    ["phones", (p) => p.phones],
    ["emails", (p) => p.emails],
    ["telegram", (p) => p.telegram],
    ["services", (p) => p.services],
    ["price_note", (p) => p.priceNote],
    ["case_url", (p) => p.caseUrl],
    ["confidence", (p) => p.confidence],
    ["data_notes", (p) => p.dataNotes],
    ["status", (p) => p.status],
    ["notes", (p) => p.notes],
    ["checked_at", (p) => p.checkedAt.slice(0, 10)],
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return (
    "﻿" +
    [columns.map(([h]) => h).join(";"), ...list.map((p) => columns.map(([, f]) => esc(f(p))).join(";"))].join("\r\n")
  );
}
