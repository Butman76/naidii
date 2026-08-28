"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import {
  fetchUserDeals,
  formatMoney,
  daysRemainingLabel,
  type UserDealSummary,
  type DealStatus,
} from "@/lib/chat";
import LeadChat from "./LeadChat";

const ACTIVE_STATUSES: DealStatus[] = ["confirmed", "delivered", "needs_revision", "disputed"];
const ARCHIVE_STATUSES: DealStatus[] = ["archived", "declined"];

const STATUS_LABELS: Record<DealStatus, string> = {
  proposed: "Предложена",
  confirmed: "В работе",
  delivered: "На проверке",
  needs_revision: "На доработке",
  archived: "Выполнен",
  declined: "Отклонена",
  disputed: "Спор",
};

const STATUS_STYLES: Record<DealStatus, string> = {
  proposed: "bg-violet-100 text-violet-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-sky-100 text-sky-800",
  needs_revision: "bg-amber-100 text-amber-800",
  archived: "bg-emerald-100 text-emerald-800",
  declined: "bg-zinc-100 text-zinc-600",
  disputed: "bg-red-100 text-red-700",
};

// Общая вкладка "Заказы"/"Архив" для обоих кабинетов — показывает сделки
// (не заявки: сюда карточка попадает только после того, как обе стороны
// подтвердили условия, см. lib/chat.ts) квадратной сеткой с ценой, сроком
// сдачи и днями до дедлайна, клик открывает тот же чат, что и в "Заявках".
export default function OrdersTab({
  role,
  ownId,
  archive,
}: {
  role: "customer" | "specialist";
  ownId: string;
  archive: boolean;
}) {
  const [deals, setDeals] = useState<UserDealSummary[] | null>(null);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return fetchUserDeals(pbClient, role, ownId).then(setDeals);
  }, [role, ownId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const statuses = archive ? ARCHIVE_STATUSES : ACTIVE_STATUSES;
  const filtered = (deals ?? []).filter((d) => statuses.includes(d.deal.status));

  if (openLeadId) {
    const item = filtered.find((d) => d.leadId === openLeadId) ?? deals?.find((d) => d.leadId === openLeadId);
    if (!item) return null;
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenLeadId(null)}
          className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← {archive ? "Весь архив" : "Все заказы"}
        </button>
        <LeadChat
          leadId={item.leadId}
          currentUserId={ownId}
          currentUserRole={role}
          customerId={item.customerId}
          specialistProfileId={item.specialistProfileId}
          otherPartyName={item.otherPartyName}
          onClose={() => setOpenLeadId(null)}
          onDealChanged={refresh}
        />
      </div>
    );
  }

  if (!deals) {
    return <p className="text-sm text-zinc-500">Загружаем…</p>;
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {archive ? "В архиве пока пусто." : "Активных заказов пока нет."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {filtered.map((item) => (
        <button
          key={item.deal.id}
          type="button"
          onClick={() => setOpenLeadId(item.leadId)}
          className="flex aspect-square flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-3 text-left transition-shadow hover:shadow-md"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{item.otherPartyName}</p>
            <p className="mt-1.5 line-clamp-2 text-xs text-zinc-600">{item.deal.resultText}</p>
            <p className="mt-1.5 text-sm font-semibold text-zinc-900">
              {formatMoney(item.deal.price)}
            </p>
            {!archive && (
              <p className="text-[11px] text-zinc-500">{daysRemainingLabel(item.deal.dueDate)}</p>
            )}
          </div>
          <span
            className={`w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[item.deal.status]}`}
          >
            {STATUS_LABELS[item.deal.status]}
          </span>
        </button>
      ))}
    </div>
  );
}
