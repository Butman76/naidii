"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { CATEGORIES } from "@/data/categories";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  createProspect,
  csvToImportRows,
  deleteProspect,
  domainFromUrl,
  fetchProspects,
  importProspects,
  prospectsToCsv,
  updateProspect,
  type Prospect,
  type ProspectStatus,
} from "@/lib/prospects";

// Вкладка "База исполнителей" в /admin (только admin): картотека контор,
// которых приглашаем на площадку. Ни с чем на сайте не связана — просто
// контакты, реквизиты, примечание и статус "работаем / не работаем".
// Данные сюда попадают через "Импорт CSV" (файл готовится отдельно и в
// репозиторий не кладётся), формат импорта = формат экспорта.

const STATUS_STYLES: Record<ProspectStatus, string> = {
  new: "border-zinc-300 bg-white text-zinc-600",
  contacted: "border-sky-300 bg-sky-50 text-sky-800",
  replied: "border-amber-300 bg-amber-50 text-amber-800",
  working: "border-emerald-300 bg-emerald-50 text-emerald-800",
  not_working: "border-red-300 bg-red-50 text-red-700",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  высокая: "text-emerald-700",
  средняя: "text-amber-700",
  низкая: "text-red-600",
};

function directionName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? (slug || "—");
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso.replace(" ", "T")).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function ProspectRow({
  prospect,
  onStatus,
  onNotes,
  onDelete,
}: {
  prospect: Prospect;
  onStatus: (p: Prospect, status: ProspectStatus) => void;
  onNotes: (p: Prospect, notes: string) => void;
  onDelete: (p: Prospect) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(prospect.notes);
  const contactLines = [prospect.emails, prospect.phones, prospect.telegram].filter(Boolean);

  return (
    <>
      <tr className="border-b border-zinc-100 align-top">
        <td className="px-3 py-2">
          <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-900 underline">
            {prospect.name}
          </a>
          <p className="text-[11px] text-zinc-400">
            {prospect.domain}
            {prospect.city ? ` · ${prospect.city}` : ""}
          </p>
          <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[11px] text-zinc-500 underline">
            {open ? "скрыть" : "подробнее"}
          </button>
        </td>
        <td className="px-3 py-2 text-zinc-600">{directionName(prospect.direction)}</td>
        <td className="max-w-[260px] px-3 py-2 text-zinc-700">
          {contactLines.length === 0 ? (
            <span className="text-zinc-300">контактов нет</span>
          ) : (
            contactLines.map((line) => (
              <p key={line} className="break-words">
                {line}
              </p>
            ))
          )}
        </td>
        <td className="px-3 py-2 text-zinc-600">
          {prospect.legalName && <p>{prospect.legalName}</p>}
          {prospect.inn ? <p className="text-zinc-400">ИНН {prospect.inn}</p> : <p className="text-zinc-300">ИНН нет</p>}
          {prospect.confidence && (
            <p className={`text-[11px] ${CONFIDENCE_STYLES[prospect.confidence] ?? "text-zinc-400"}`}>
              достоверность: {prospect.confidence}
            </p>
          )}
        </td>
        <td className="px-3 py-2">
          <select
            value={prospect.status}
            onChange={(e) => onStatus(prospect, e.target.value as ProspectStatus)}
            className={`rounded border px-2 py-1 text-xs font-medium focus:outline-none ${STATUS_STYLES[prospect.status]}`}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {prospect.lastContactedAt && (
            <p className="mt-1 text-[11px] text-zinc-400">писали {formatDate(prospect.lastContactedAt)}</p>
          )}
        </td>
        <td className="min-w-[200px] px-3 py-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== prospect.notes && onNotes(prospect, notes)}
            rows={2}
            placeholder="Примечание"
            className="w-full rounded border border-zinc-200 px-2 py-1 text-xs focus:border-zinc-900 focus:outline-none"
          />
        </td>
        <td className="px-3 py-2">
          <button
            type="button"
            onClick={() => onDelete(prospect)}
            className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50"
          >
            удалить
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <td colSpan={7} className="px-3 py-3 text-xs text-zinc-600">
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {prospect.services && <p><span className="text-zinc-400">Чем занимается: </span>{prospect.services}</p>}
              {prospect.priceNote && <p><span className="text-zinc-400">Цены: </span>{prospect.priceNote}</p>}
              {prospect.director && <p><span className="text-zinc-400">Руководитель: </span>{prospect.director}</p>}
              {prospect.ogrn && <p><span className="text-zinc-400">ОГРН: </span>{prospect.ogrn}</p>}
              {prospect.address && <p><span className="text-zinc-400">Адрес: </span>{prospect.address}</p>}
              {prospect.companyType && <p><span className="text-zinc-400">Тип: </span>{prospect.companyType}</p>}
              {prospect.caseUrl && (
                <p className="break-all">
                  <span className="text-zinc-400">Кейс: </span>
                  <a href={prospect.caseUrl} target="_blank" rel="noopener noreferrer" className="underline">{prospect.caseUrl}</a>
                </p>
              )}
              {prospect.checkedAt && <p><span className="text-zinc-400">Данные сверены: </span>{formatDate(prospect.checkedAt)}</p>}
            </div>
            {prospect.dataNotes && (
              <p className="mt-2 whitespace-pre-line rounded border border-zinc-200 bg-white p-2 text-[11px] text-zinc-500">
                {prospect.dataNotes}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function ProspectsTab() {
  const [list, setList] = useState<Prospect[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "">("");
  const [noContacts, setNoContacts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSite, setAddSite] = useState("");
  const [addDirection, setAddDirection] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setList(await fetchProspects(pbClient));
    } catch (err) {
      if ((err as { isAbort?: boolean })?.isAbort) return;
      setError("Не удалось загрузить базу. Если это первый запуск, проверьте, что миграция prospects применена на сервере.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of list ?? []) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [list]);

  const directions = useMemo(
    () => Array.from(new Set((list ?? []).map((p) => p.direction).filter(Boolean))),
    [list]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list ?? []).filter((p) => {
      if (direction && p.direction !== direction) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (noContacts && (p.emails || p.phones || p.telegram)) return false;
      if (!q) return true;
      return [p.name, p.domain, p.legalName, p.inn, p.emails, p.phones, p.telegram, p.notes, p.city]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [list, query, direction, statusFilter, noContacts]);

  function patchLocal(id: string, patch: Partial<Prospect>) {
    setList((prev) => (prev ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function changeStatus(p: Prospect, status: ProspectStatus) {
    const patch: Record<string, string> = { status };
    const stamp = new Date().toISOString();
    if ((status === "contacted" || status === "replied") && !p.lastContactedAt) patch.last_contacted_at = stamp;
    try {
      await updateProspect(pbClient, p.id, patch);
      patchLocal(p.id, { status, ...(patch.last_contacted_at ? { lastContactedAt: stamp } : {}) });
    } catch {
      setError("Не удалось сохранить статус.");
    }
  }

  async function changeNotes(p: Prospect, notes: string) {
    try {
      await updateProspect(pbClient, p.id, { notes });
      patchLocal(p.id, { notes });
    } catch {
      setError("Не удалось сохранить примечание.");
    }
  }

  async function remove(p: Prospect) {
    if (!window.confirm(`Удалить «${p.name}» из базы вместе с примечанием?`)) return;
    try {
      await deleteProspect(pbClient, p.id);
      setList((prev) => (prev ?? []).filter((x) => x.id !== p.id));
    } catch {
      setError("Не удалось удалить.");
    }
  }

  async function handleImport(file: File) {
    setError(null);
    setNotice(null);
    const { rows, problems } = csvToImportRows(await file.text());
    if (rows.length === 0) {
      setError(problems[0] ?? "В файле нечего импортировать.");
      return;
    }
    const known = new Set((list ?? []).map((p) => p.domain));
    const existing = rows.filter((r) => known.has(r.domain)).length;
    const ok = window.confirm(
      `В файле ${rows.length} контор: новых ${rows.length - existing}, уже есть в базе ${existing}.\n\n` +
        "У существующих обновятся контакты и реквизиты (пустые значения из файла ничего не сотрут); статус и примечание не изменятся.\n\nИмпортировать?"
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await importProspects(pbClient, rows);
      await refresh();
      setNotice(
        `Готово: добавлено ${res.created}, обновлено ${res.updated}` +
          (res.failed.length ? `, не удалось ${res.failed.length}: ${res.failed.slice(0, 3).join("; ")}` : "") +
          (problems.length ? `. Пропущено строк файла: ${problems.length}.` : ".")
      );
    } catch {
      setError("Импорт не удался.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleExport() {
    const blob = new Blob([prospectsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naidii_baza_ispolniteley_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !domainFromUrl(addSite)) {
      setError("Укажите название и сайт.");
      return;
    }
    setError(null);
    try {
      await createProspect(pbClient, { name: addName, website: addSite, direction: addDirection });
      setAddName("");
      setAddSite("");
      setShowAdd(false);
      await refresh();
    } catch {
      setError("Не удалось добавить (возможно, контора с таким сайтом уже есть).");
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-[11px] text-zinc-400">
        Закрытая картотека контор для приглашения на площадку: видна только администратору и ни с чем на сайте не
        связана. Данные загружаются через «Импорт CSV».
      </p>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`rounded-full border px-3 py-1 ${statusFilter === "" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-600"}`}
        >
          Все · {list?.length ?? 0}
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
            className={`rounded-full border px-3 py-1 ${statusFilter === s ? "border-zinc-900 bg-zinc-900 text-white" : STATUS_STYLES[s]}`}
          >
            {STATUS_LABELS[s]} · {counts[s] ?? 0}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: название, сайт, ИНН, почта, телефон, примечание"
          className="w-full max-w-sm rounded border border-zinc-300 px-2 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
        />
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1.5 text-xs focus:outline-none"
        >
          <option value="">Все направления</option>
          {directions.map((d) => (
            <option key={d} value={d}>
              {directionName(d)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-xs text-zinc-600">
          <input type="checkbox" checked={noContacts} onChange={(e) => setNoContacts(e.target.checked)} />
          без контактов
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
          >
            Добавить
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            {busy ? "Импортируем…" : "Импорт CSV"}
          </button>
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={handleExport}
            className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            Экспорт CSV ({filtered.length})
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            data-testid="prospects-file"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 rounded border border-zinc-200 bg-zinc-50 p-3">
          <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Название" className="w-48 rounded border border-zinc-300 px-2 py-1.5 text-xs" />
          <input value={addSite} onChange={(e) => setAddSite(e.target.value)} placeholder="сайт, например example.ru" className="w-56 rounded border border-zinc-300 px-2 py-1.5 text-xs" />
          <select value={addDirection} onChange={(e) => setAddDirection(e.target.value)} className="rounded border border-zinc-300 px-2 py-1.5 text-xs">
            <option value="">Направление</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700">Добавить в базу</button>
        </form>
      )}

      {notice && <p className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{notice}</p>}
      {error && <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50 text-left font-mono text-[11px] uppercase tracking-wide text-zinc-500">
              <th className="px-3 py-2 font-medium">Контора</th>
              <th className="px-3 py-2 font-medium">Направление</th>
              <th className="px-3 py-2 font-medium">Контакты</th>
              <th className="px-3 py-2 font-medium">Реквизиты</th>
              <th className="px-3 py-2 font-medium">Статус</th>
              <th className="px-3 py-2 font-medium">Примечание</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <ProspectRow key={p.id} prospect={p} onStatus={changeStatus} onNotes={changeNotes} onDelete={remove} />
            ))}
            {list === null && !error && (
              <tr><td className="px-3 py-3 text-zinc-400" colSpan={7}>Загружаем…</td></tr>
            )}
            {list && filtered.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={7}>
                  {list.length === 0 ? "База пока пуста: загрузите CSV кнопкой «Импорт CSV»." : "Под фильтр ничего не подошло."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
