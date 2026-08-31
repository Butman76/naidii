"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import {
  fetchModerationData,
  fetchAdminLogs,
  fetchAllSpecialistProfiles,
  logAdminAction,
  type ModerationData,
  type AdminLogEntry,
  type SpecialistPlanRow,
} from "@/lib/admin";
import { PLANS } from "@/data/plans";
import { fetchDisputedDeals, formatMoney, type DisputedDealSummary } from "@/lib/chat";
import LeadChat from "@/components/dashboard/LeadChat";

type Tab = "profiles" | "types" | "reviews" | "users" | "disputes" | "plans" | "log";

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
  const [actionError, setActionError] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<DisputedDealSummary[] | null>(null);
  const [openDisputeLeadId, setOpenDisputeLeadId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SpecialistPlanRow[] | null>(null);

  const isAdmin = user?.role === "admin";

  const refreshDisputes = useCallback(() => {
    return fetchDisputedDeals(pbClient).then(setDisputes);
  }, []);

  const refreshPlans = useCallback(() => {
    return fetchAllSpecialistProfiles(pbClient).then(setPlans);
  }, []);

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

  useEffect(() => {
    if (tab !== "disputes") return;
    refreshDisputes();
  }, [tab, refreshDisputes]);

  useEffect(() => {
    if (tab !== "plans" || !isAdmin) return;
    refreshPlans();
  }, [tab, isAdmin, refreshPlans]);

  async function runAction(
    id: string,
    action: () => Promise<void>,
    afterRefresh: () => Promise<void> | void = refresh
  ) {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      await afterRefresh();
    } catch (err) {
      // Раньше ошибка проглатывалась молча — из-за этого баг с manageRule
      // (кнопка "confirm email" ничего не делала) было не отличить от
      // "ничего не сломалось, просто такое поведение". Показываем текст
      // ошибки от PocketBase, чтобы это не повторилось незамеченным.
      const message =
        err instanceof Error
          ? err.message
          : "Не удалось выполнить действие.";
      setActionError(message);
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

      // Блокировка пользователя должна скрывать и его карточку из каталога —
      // /specialists и /services фильтруют только по profile_status, они не
      // знают о users.status. Без этого шага заблокированный пользователь
      // не может войти, но его витрина остаётся на сайте как ни в чём не
      // бывало. Симметрично: разблокировка возвращает профиль в published —
      // первая версия делала это только в одну сторону ("это отдельное
      // решение модератора"), но живая проверка показала, что для того, кто
      // разблокировал, это выглядит как баг ("разблокировал, а карточки всё
      // равно нет") — раздела "Профили" для уже опубликованных карточек и
      // не существует, туда попадают только pending, так что вручную
      // вернуть её тоже неоткуда.
      try {
        const profile = await pbClient
          .collection("specialist_profiles")
          .getFirstListItem(pbClient.filter("user_id = {:id}", { id }));
        const wanted = nextStatus === "blocked" ? "blocked" : "published";
        if (profile.profile_status !== wanted) {
          await pbClient
            .collection("specialist_profiles")
            .update(profile.id, { profile_status: wanted });
          await logAdminAction(pbClient, {
            action:
              wanted === "blocked"
                ? "Скрыл профиль (блокировка пользователя)"
                : "Вернул профиль в каталог (разблокировка пользователя)",
            entityType: "specialist_profiles",
            entityId: profile.id,
            newData: { profile_status: wanted },
          });
        }
      } catch {
        // У заказчика (или специалиста без анкеты) профиля просто нет —
        // это ожидаемо, не ошибка.
      }
    });
  }

  async function verifyUserEmail(id: string) {
    await runAction(id, async () => {
      await pbClient.collection("users").update(id, { verified: true });
      await logAdminAction(pbClient, {
        action: "Подтвердил почту вручную",
        entityType: "users",
        entityId: id,
        newData: { verified: true },
      });
    });
  }

  async function deleteUser(id: string, name: string) {
    if (!window.confirm(`Удалить пользователя «${name || id}» безвозвратно? Его анкета и услуги (если есть) удалятся вместе с ним.`)) {
      return;
    }
    await runAction(id, async () => {
      await pbClient.collection("users").delete(id);
      await logAdminAction(pbClient, {
        action: "Удалил пользователя",
        entityType: "users",
        entityId: id,
      });
    });
  }

  // Тариф специалиста (basic/pro/enterprise, см. web/src/data/plans.ts) —
  // оплаты online ещё нет, назначает вручную только admin (сервер тоже это
  // проверяет, см. pocketbase/pb_hooks/plan_guard.pb.js, — на случай если
  // кто-то дёрнет API мимо этой панели). enterprise включает специалисту
  // премиум-лендинг вместо обычной карточки (web/src/lib/specialists.ts).
  async function updatePlan(id: string, planCode: string, publicName: string) {
    await runAction(
      id,
      async () => {
        await pbClient.collection("specialist_profiles").update(id, { plan_code: planCode });
        await logAdminAction(pbClient, {
          action: `Назначил тариф «${planCode}»`,
          entityType: "specialist_profiles",
          entityId: id,
          newData: { plan_code: planCode, public_name: publicName },
        });
      },
      refreshPlans
    );
  }

  // "Войти как" — реальная подмена сессии на целевого пользователя через
  // серверный /api/impersonate (нужен суперпользователь PocketBase, у
  // обычной роли admin прав на impersonate нет). Свою admin-сессию кладём
  // в sessionStorage, чтобы ImpersonationBanner мог вернуть её одной
  // кнопкой — без повторного логина в обе стороны.
  async function impersonateUser(targetId: string, targetRole: string) {
    const res = await fetch("/api/impersonate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: pbClient.authStore.token,
      },
      body: JSON.stringify({ targetUserId: targetId }),
    });
    if (!res.ok) {
      window.alert("Не удалось войти как этот пользователь.");
      return;
    }
    const { token, record } = await res.json();

    sessionStorage.setItem(
      "naidii_admin_return",
      JSON.stringify({ token: pbClient.authStore.token, record: pbClient.authStore.record })
    );

    pbClient.authStore.save(token, record);
    // Полная перезагрузка, а не router.push: /admin остаётся смонтированной,
    // пока идёт клиентский переход, и её собственный RequireAuth видит уже
    // подменённую (не-admin) сессию раньше, чем успевает сработать переход
    // на кабинет — и перекидывает на "/" первым. Жёсткая навигация убирает
    // гонку: старое дерево целиком уничтожается, новая страница читает уже
    // сохранённую сессию из localStorage с чистого листа.
    window.location.href = targetRole === "specialist" ? "/dashboard" : "/dashboard/customer";
  }

  const TABS: Array<{ id: Tab; label: string; count?: number }> = [
    { id: "profiles", label: "Профили", count: data?.profiles.length },
    { id: "types", label: "Типы услуг", count: data?.resultTypes.length },
    { id: "reviews", label: "Отзывы", count: data?.reviews.length },
    { id: "users", label: "Пользователи", count: data?.users.length },
    { id: "disputes", label: "Споры", count: disputes?.length },
    ...(isAdmin ? [{ id: "plans" as Tab, label: "Тарифы", count: plans?.length }] : []),
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

      {actionError && (
        <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {actionError}
        </p>
      )}

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
                  <Th>Почта</Th>
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
                    <Td>
                      <span className={u.verified ? "text-emerald-600" : "text-amber-600"}>
                        {u.verified ? "подтверждена" : "не подтверждена"}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-zinc-500">{formatDate(u.createdAt)}</Td>
                    <Td>
                      {isAdmin ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(u.role === "specialist" || u.role === "customer") && u.id !== user?.id && (
                            <ActionBtn
                              label="войти как"
                              tone="ok"
                              disabled={busyId === u.id}
                              onClick={() => impersonateUser(u.id, u.role)}
                            />
                          )}
                          {!u.verified && (
                            <ActionBtn
                              label="confirm email"
                              tone="ok"
                              disabled={busyId === u.id}
                              onClick={() => verifyUserEmail(u.id)}
                            />
                          )}
                          {u.status === "blocked" ? (
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
                          )}
                          {u.id !== user?.id && (
                            <ActionBtn
                              label="delete"
                              tone="bad"
                              disabled={busyId === u.id}
                              onClick={() => deleteUser(u.id, u.name)}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-300">только admin</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "disputes" && !openDisputeLeadId && (
            <table className="w-full min-w-[720px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Заказчик</Th>
                  <Th>Специалист</Th>
                  <Th>Результат</Th>
                  <Th>Цена</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {(disputes ?? []).map((d) => (
                  <tr key={d.deal.id} className="border-b border-zinc-100 last:border-0">
                    <Td>{d.customerName}</Td>
                    <Td>{d.specialistName}</Td>
                    <Td className="max-w-xs truncate" title={d.deal.resultText}>
                      {d.deal.resultText}
                    </Td>
                    <Td>{formatMoney(d.deal.price)}</Td>
                    <Td>
                      <ActionBtn
                        label="открыть чат"
                        tone="warn"
                        onClick={() => setOpenDisputeLeadId(d.leadId)}
                      />
                    </Td>
                  </tr>
                ))}
                {disputes !== null && disputes.length === 0 && (
                  <tr>
                    <Td className="text-zinc-400">Споров нет</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                  </tr>
                )}
                {disputes === null && (
                  <tr>
                    <Td className="text-zinc-400">Загружаем…</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                    <Td>{""}</Td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "disputes" && openDisputeLeadId && (() => {
            const item = disputes?.find((d) => d.leadId === openDisputeLeadId);
            if (!item || !user) return null;
            return (
              <div className="p-3 font-sans">
                <button
                  type="button"
                  onClick={() => setOpenDisputeLeadId(null)}
                  className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  ← Все споры
                </button>
                <LeadChat
                  leadId={item.leadId}
                  currentUserId={user.id}
                  currentUserRole="moderator"
                  customerId={item.deal.customerId}
                  specialistProfileId={item.deal.specialistProfileId}
                  otherPartyName={`${item.customerName} ↔ ${item.specialistName}`}
                  onClose={() => setOpenDisputeLeadId(null)}
                  onDealChanged={refreshDisputes}
                />
              </div>
            );
          })()}

          {tab === "plans" && isAdmin && (
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <Th>Специалист</Th>
                  <Th>Email</Th>
                  <Th>Статус карточки</Th>
                  <Th>Тариф</Th>
                </tr>
              </thead>
              <tbody>
                {(plans ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                    <Td className="font-medium">{p.publicName}</Td>
                    <Td>{p.ownerEmail || "—"}</Td>
                    <Td className="text-zinc-500">{p.profileStatus}</Td>
                    <Td>
                      <select
                        value={p.planCode}
                        disabled={busyId === p.id}
                        onChange={(e) => updatePlan(p.id, e.target.value, p.publicName)}
                        className="rounded border border-zinc-300 bg-white px-2 py-1 font-mono text-[11px] disabled:opacity-40"
                      >
                        {PLANS.map((plan) => (
                          <option key={plan.code} value={plan.code}>
                            {plan.title}
                          </option>
                        ))}
                      </select>
                    </Td>
                  </tr>
                ))}
                {plans === null && (
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
