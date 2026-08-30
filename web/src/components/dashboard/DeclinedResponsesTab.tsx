"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/chat";
import { fetchDeclinedResponses, type DeclinedResponse } from "@/lib/jobPosts";
import LeadChat from "./LeadChat";

// По просьбе пользователя (2026-08-30): "Отказать" отклику на объявление
// не должно быть похоже на удаление — переписка остаётся доступной здесь,
// в архиве, чтобы вспомнить, почему отказали конкретному специалисту.
// declineJobPostResponse (lib/jobPosts.ts) и так никогда не удалял lead,
// просто помечал status = "closed" — эта вкладка делает такие отклики
// видимыми отдельным списком, а не только приглушённой строкой внутри
// карточки объявления.
export default function DeclinedResponsesTab({ customerId }: { customerId: string }) {
  const [responses, setResponses] = useState<DeclinedResponse[] | null>(null);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return fetchDeclinedResponses(pbClient, customerId).then(setResponses);
  }, [customerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (openLeadId) {
    const response = responses?.find((r) => r.leadId === openLeadId);
    if (!response) return null;
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenLeadId(null)}
          className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Все отказанные отклики
        </button>
        <LeadChat
          leadId={response.leadId}
          currentUserId={customerId}
          currentUserRole="customer"
          customerId={customerId}
          specialistProfileId={response.specialistProfileId}
          otherPartyName={response.specialistName}
          onClose={() => setOpenLeadId(null)}
        />
      </div>
    );
  }

  if (responses === null) {
    return <p className="text-sm text-zinc-500">Загружаем…</p>;
  }

  if (responses.length === 0) {
    return <p className="text-sm text-zinc-500">Отказанных откликов пока нет.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {responses.map((r) => (
        <button
          key={r.leadId}
          type="button"
          onClick={() => setOpenLeadId(r.leadId)}
          className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-900">{r.specialistName}</p>
            <span className="shrink-0 text-[11px] text-zinc-400">
              Отказано {formatDate(r.declinedAt)}
            </span>
          </div>
          {r.jobPostDescription && (
            <p className="line-clamp-1 text-xs text-zinc-400">По объявлению: {r.jobPostDescription}</p>
          )}
          <p className="line-clamp-2 text-xs text-zinc-600">{r.message}</p>
        </button>
      ))}
    </div>
  );
}
