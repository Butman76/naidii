"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import {
  fetchModerationData,
  fetchAdminLogs,
  logAdminAction,
  type ModerationData,
  type AdminLogEntry,
} from "@/lib/admin";

type Tab = "profiles" | "types" | "reviews" | "users" | "log";

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-500">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-3 py-2 align-top text-zinc-800 ${className}`} title={title}>
      {children}
    </td>
  );
}

function ActionBtn({
  label,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  tone: "ok" | "warn" | "bad";
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      : tone === "warn"
        ? "border-amber-300 text-amber-700 hover:bg-amber-50"
        : "border-red-300 text-red-700 hover:bg-red-50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded border px-2 py-1 font-mono text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
    >
      {label}
    </button>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("profiles");
  const [data, setData] = useState<ModerationData | null>(null);
  const [logs, setLogs] = useState<AdminLogEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const refresh = useCallback(() => {
    return fetchModerationData(pbClient)
      .then((result) => setData(result))
      .catch((err) => {
        if (err?.isAbort) return;
        setError(true);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab !== "log" || !isAdmin) return;
    fetchAdminLogs(pbClient)
      .then(setLogs)
      .catch((err) => {
        if (err?.isAbort) return;
      });
  }, [tab, isAdmin]);

  async function runAction(
    id: string,
    action: () => Promise<void>
  ) {
    setBusyId(id);
    try {
      await action();
      await refresh();
    } catch {
      // ошибка конкретного действия не должна ронять всю страницу — просто
      // не обновляем список, кнопки останутся кликабельными для повтора
    } finally {
      setBusyId(null);
    }
  }

  async function moderateProfile(id: string, status: string, label: string) {
    await runAction(id, async () => {
      await pbClient.collection("specialist_profiles").update(id, { profile_status: status });
      await logAdminAction(pbClient, {
        action: label,
        entityType: "specialist_profiles",
        entityId: id,
        newData: { profile_status: status },
      });
    });
  }

  async function moderateResultType(id: string, status: string, label: string) {
    await runAction(id, async () => {
      await pbClient.collection("result_types").update(id, { status });
      await logAdminAction(pbClient, {
        action: label,
        entityType: "result_types",
        entityId: id,
        newData: { status },
      });
    });
  }

  async function moderateReview(id: string, status: string, label: string) {
    await runAction(id, async () => {
      await pbClient.collection("reviews").update(id, { status });
      await logAdminAction(pbClient, {
        action: label,
        entityType: "reviews",
        entityId: id,
        newData: { status },
      });
    });
  }

  async function toggleUserBlock(id: string, nextStatus: string, label: string) {
    await runAction(id, async () => {
      await pbClient.collection("users").update(id, { status: nextStatus });
      await logAdminAction(pbClient, {
        action: label,
        entityType: "users",
        entityId: id,
        newData: { status: nextStatus },
      });
    });
  }

  const TABS: Array<{ id: Tab; label: string; count?: number }> = [
    { id: "profiles", label: "Профили", count: data?.profiles.length },
    { id: "types", label: "Типы услуг", count: data?.resultTypes.length },
    { id: "reviews", label: "Отзывы", count: data?.reviews.length },
    { id: "users", label: "Пользователи", count: data?.users.length },
    ...(isAdmin ? [{ id: "log" as Tab, label: "Журнал" }] : []),
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-zinc-500">
        Не удалось загрузить очередь модерации. Попробуйте обновить страницу.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 font-mono sm:px-6 lg:px-8">
      <h1 className="text-lg font-bold text-zinc-900">admin / moderation</h1>
      <p className="mt-1 text-xs text-zinc-500">
        {user?.email} · роль: {user?.role}
      </p>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-zinc-300 text-xs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-3 py-2 font-medium transition-colors ${
              tab === t.id
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span className="ml-1 text-zinc-400">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {!data ? (
        <p className="mt-6 text-xs text-zinc-500">Загружаем…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded border border-zinc-300 bg-white">
          {tab === "profiles" && (
            <table className="w-full min-w-[720px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Специалист</Th>
                  <Th>Заголовок</Th>
                  <Th>Email</Th>
                  <Th>Отправлено</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {data.profiles.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                    <Td className="font-medium">{p.publicName}</Td>
                    <Td>{p.title || "—"}</Td>
                    <Td>{p.ownerEmail}</Td>
                    <Td className="whitespace-nowrap text-zinc-500">{formatDate(p.createdAt)}</Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <ActionBtn
                          label="publish"
                          tone="ok"
                          disabled={busyId === p.id}
                          onClick={() => moderateProfile(p.id, "published", "Опубликовал профиль")}
                        />
                        <ActionBtn
                          label="revision"
                          tone="warn"
                          disabled={busyId === p.id}
                          onClick={() => moderateProfile(p.id, "needs_revision", "Отправил профиль на доработку")}
                        />
                        <ActionBtn
                          label="block"
                          tone="bad"
                          disabled={busyId === p.id}
                          onClick={() => moderateProfile(p.id, "blocked", "Заблокировал профиль")}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
                {data.profiles.length === 0 && (
                  <tr>
                    <Td className="text-zinc-400">Очередь пуста</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "types" && (
            <table className="w-full min-w-[800px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Название</Th>
                  <Th>Категория / подкатегория</Th>
                  <Th>Описание</Th>
                  <Th>Автор</Th>
                  <Th>Отправлено</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {data.resultTypes.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-100 last:border-0">
                    <Td className="font-medium">{t.title}</Td>
                    <Td>
                      {t.categoryName} / {t.subcategory}
                    </Td>
                    <Td className="max-w-xs truncate" title={t.description}>
                      {t.description || "—"}
                    </Td>
                    <Td>
                      {t.authorName}
                      {t.authorEmail && (
                        <div className="text-zinc-400">{t.authorEmail}</div>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-zinc-500">{formatDate(t.createdAt)}</Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <ActionBtn
                          label="approve"
                          tone="ok"
                          disabled={busyId === t.id}
                          onClick={() => moderateResultType(t.id, "approved", "Одобрил тип услуги")}
                        />
                        <ActionBtn
                          label="reject"
                          tone="bad"
                          disabled={busyId === t.id}
                          onClick={() => moderateResultType(t.id, "rejected", "Отклонил тип услуги")}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
                {data.resultTypes.length === 0 && (
                  <tr>
                    <Td className="text-zinc-400">Очередь пуста</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "reviews" && (
            <table className="w-full min-w-[720px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Профиль</Th>
                  <Th>Автор</Th>
                  <Th>Рейтинг</Th>
                  <Th>Текст</Th>
                  <Th>Отправлено</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {data.reviews.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                    <Td className="font-medium">{r.specialistName}</Td>
                    <Td>{r.customerName}</Td>
                    <Td>{"★".repeat(r.rating)}</Td>
                    <Td className="max-w-sm truncate" title={r.text}>
                      {r.text || "—"}
                    </Td>
                    <Td className="whitespace-nowrap text-zinc-500">{formatDate(r.createdAt)}</Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <ActionBtn
                          label="approve"
                          tone="ok"
                          disabled={busyId === r.id}
                          onClick={() => moderateReview(r.id, "approved", "Опубликовал отзыв")}
                        />
                        <ActionBtn
                          label="reject"
                          tone="bad"
                          disabled={busyId === r.id}
                          onClick={() => moderateReview(r.id, "rejected", "Отклонил отзыв")}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
                {data.reviews.length === 0 && (
                  <tr>
                    <Td className="text-zinc-400">Очередь пуста</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "users" && (
            <table className="w-full min-w-[680px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Имя</Th>
                  <Th>Email</Th>
                  <Th>Роль</Th>
                  <Th>Статус</Th>
                  <Th>Регистрация</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-100 last:border-0">
                    <Td className="font-medium">{u.name || "—"}</Td>
                    <Td>{u.email}</Td>
                    <Td>{u.role}</Td>
                    <Td>
                      <span
                        className={
                          u.status === "blocked"
                            ? "text-red-600"
                            : u.status === "active"
                              ? "text-emerald-600"
                              : "text-zinc-500"
                        }
                      >
                        {u.status}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-zinc-500">{formatDate(u.createdAt)}</Td>
                    <Td>
                      {isAdmin ? (
                        u.status === "blocked" ? (
                          <ActionBtn
                            label="unblock"
                            tone="ok"
                            disabled={busyId === u.id}
                            onClick={() => toggleUserBlock(u.id, "active", "Разблокировал пользователя")}
                          />
                        ) : (
                          <ActionBtn
                            label="block"
                            tone="bad"
                            disabled={busyId === u.id}
                            onClick={() => toggleUserBlock(u.id, "blocked", "Заблокировал пользователя")}
                          />
                        )
                      ) : (
                        <span className="text-zinc-300">только admin</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "log" && isAdmin && (
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Кто</Th>
                  <Th>Действие</Th>
                  <Th>Объект</Th>
                  <Th>Когда</Th>
                </tr>
              </thead>
              <tbody>
                {(logs ?? []).map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-100 last:border-0">
                    <Td>{entry.adminName}</Td>
                    <Td className="font-medium">{entry.action}</Td>
                    <Td className="text-zinc-500">
                      {entry.entityType}:{entry.entityId}
                    </Td>
                    <Td className="whitespace-nowrap text-zinc-500">{formatDate(entry.createdAt)}</Td>
                  </tr>
                ))}
                {logs === null && (
                  <tr>
                    <Td className="text-zinc-400">Загружаем…</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
