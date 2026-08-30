"use client";

import { useEffect, useRef, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { splitRedactedSegments } from "@/lib/contact-filter";
import {
  fetchLeadMessages,
  sendLeadMessage,
  subscribeToLeadMessages,
  sendSystemMessage,
  fetchDeal,
  subscribeToDeal,
  proposeDeal,
  confirmDeal,
  declineDeal,
  markDelivered,
  acceptDelivery,
  requestRevision,
  fileDispute,
  moderatorCloseDispute,
  moderatorSendToRevision,
  formatMoney,
  formatDate,
  formatDateTime,
  daysRemainingLabel,
  type LeadMessage,
  type Deal,
} from "@/lib/chat";

const REDACT_TOOLTIP =
  "Система не рекомендует осуществлять взаимодействие вне данного чата, т.к. тогда не сможет гарантировать соблюдение условий по качеству, срокам и стоимости работ.";

function MessageBody({ text, redact }: { text: string; redact: boolean }) {
  if (!redact) return <>{text}</>;
  const segments = splitRedactedSegments(text);
  if (segments.every((s) => !s.redacted)) return <>{text}</>;
  return (
    <>
      {segments.map((seg, i) =>
        seg.redacted ? (
          <span
            key={i}
            title={REDACT_TOOLTIP}
            className="cursor-help select-none rounded bg-zinc-400/70 px-0.5 text-transparent blur-[3px]"
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

type ChatRole = "customer" | "specialist" | "moderator";

export default function LeadChat({
  leadId,
  currentUserId,
  currentUserRole,
  customerId,
  specialistProfileId,
  otherPartyName,
  onClose,
  onDealChanged,
}: {
  leadId: string;
  currentUserId: string;
  currentUserRole: ChatRole;
  customerId: string;
  specialistProfileId: string;
  otherPartyName: string;
  onClose: () => void;
  onDealChanged?: () => void;
}) {
  const [messages, setMessages] = useState<LeadMessage[] | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealBusy, setDealBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isParticipant = currentUserRole === "customer" || currentUserRole === "specialist";

  useEffect(() => {
    let cancelled = false;
    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeDeal: (() => void) | null = null;

    Promise.all([fetchLeadMessages(pbClient, leadId), fetchDeal(pbClient, leadId)]).then(
      ([msgs, d]) => {
        if (cancelled) return;
        setMessages(msgs);
        setDeal(d);
      }
    );

    subscribeToLeadMessages(pbClient, leadId, (message) => {
      // Свои же сообщения уже добавляются сразу в handleSend (оптимистично,
      // без ожидания round-trip) — сервер всё равно рассылает событие о
      // создании и автору тоже, так что без этого фильтра сообщение
      // удваивалось бы у отправителя при каждой отправке.
      if (message.senderId === currentUserId) return;
      setMessages((prev) => {
        if (!prev) return [message];
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribeMessages = unsub;
    });

    // Предложение/подтверждение/отклонение сделки собеседником должно быть
    // видно сразу, без обновления страницы — та же логика, что у сообщений
    // выше, только для карточки статуса сделки над чатом.
    subscribeToDeal(pbClient, leadId, (updatedDeal) => {
      setDeal(updatedDeal);
      onDealChanged?.();
    }).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribeDeal = unsub;
    });

    return () => {
      cancelled = true;
      unsubscribeMessages?.();
      unsubscribeDeal?.();
    };
  }, [leadId, currentUserId, onDealChanged]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      const sent = await sendLeadMessage(pbClient, leadId, currentUserId, body);
      setMessages((prev) => (prev ? [...prev, sent] : [sent]));
    } catch {
      setDraft(body);
    } finally {
      setSending(false);
    }
  }

  async function runDealAction(action: () => Promise<Deal>) {
    setDealBusy(true);
    try {
      setDeal(await action());
      onDealChanged?.();
    } finally {
      setDealBusy(false);
    }
  }

  // "Заказчик"/"Специалист" отклонил/предложил — по просьбе пользователя
  // такие действия должны оставлять системную запись прямо в переписке
  // (не только менять цветную карточку статуса), с датой и временем.
  function roleLabel(): string {
    return currentUserRole === "customer" ? "Заказчик" : "Специалист";
  }

  async function postSystemMessage(body: string) {
    const message = await sendSystemMessage(pbClient, leadId, currentUserId, body);
    setMessages((prev) => (prev ? [...prev, message] : [message]));
  }

  async function handleDecline() {
    if (!deal) return;
    setDealBusy(true);
    try {
      await declineDeal(pbClient, deal.id);
      setDeal({ ...deal, status: "declined" });
      onDealChanged?.();
      await postSystemMessage(`${roleLabel()} отклонил предложение`);
    } finally {
      setDealBusy(false);
    }
  }

  const myConfirmed =
    deal && (currentUserRole === "customer" ? deal.customerConfirmed : deal.specialistConfirmed);
  const iProposed = deal?.proposedBy === currentUserId;
  const isActiveOrder =
    deal && ["confirmed", "delivered", "needs_revision"].includes(deal.status);

  return (
    <div className="flex h-[32rem] flex-col rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">{otherPartyName}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          Закрыть
        </button>
      </div>

      {/* --- Предложена сделка, ждём подтверждения второй стороны --- */}
      {deal?.status === "proposed" && (
        <div className="m-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs">
          <p className="font-semibold text-zinc-900">Предложена сделка</p>
          <DealTerms deal={deal} />
          {isParticipant && (
            <div className="mt-2">
              {myConfirmed ? (
                <p className="text-zinc-500">
                  {iProposed
                    ? "Ждём подтверждения от собеседника."
                    : "Вы подтвердили — ждём вторую сторону."}
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      runDealAction(() => confirmDeal(pbClient, deal, currentUserRole as "customer" | "specialist"))
                    }
                    disabled={dealBusy}
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Подтвердить
                  </button>
                  <button
                    type="button"
                    onClick={handleDecline}
                    disabled={dealBusy}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Активный заказ: подтверждена / оказана / на доработке --- */}
      {isActiveOrder && deal && (
        <div className="m-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-zinc-900">
              {deal.status === "confirmed" && "Заказ в работе"}
              {deal.status === "delivered" && "Услуга оказана — на проверке"}
              {deal.status === "needs_revision" && "Отправлено на доработку"}
            </p>
            <span className="text-zinc-500">{daysRemainingLabel(deal.dueDate)}</span>
          </div>
          <DealTerms deal={deal} />
          <div className="mt-2 flex flex-wrap gap-2">
            {currentUserRole === "specialist" &&
              (deal.status === "confirmed" || deal.status === "needs_revision") && (
                <button
                  type="button"
                  onClick={() => runDealAction(() => markDelivered(pbClient, deal.id))}
                  disabled={dealBusy}
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Услуга оказана
                </button>
              )}
            {currentUserRole === "customer" && deal.status === "delivered" && (
              <>
                <button
                  type="button"
                  onClick={() => runDealAction(() => acceptDelivery(pbClient, deal.id))}
                  disabled={dealBusy}
                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  Всё устраивает
                </button>
                <button
                  type="button"
                  onClick={() => runDealAction(() => requestRevision(pbClient, deal.id))}
                  disabled={dealBusy}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50"
                >
                  Требуется доработка
                </button>
              </>
            )}
            {isParticipant && (
              <button
                type="button"
                onClick={() => runDealAction(() => fileDispute(pbClient, deal.id, currentUserId))}
                disabled={dealBusy}
                className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Жалоба модераторам
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- Спор --- */}
      {deal?.status === "disputed" && (
        <div className="m-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs">
          <p className="font-semibold text-red-900">Спор передан модераторам</p>
          <DealTerms deal={deal} />
          {currentUserRole === "moderator" && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runDealAction(() => moderatorCloseDispute(pbClient, deal.id))}
                disabled={dealBusy}
                className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Закрыть сделку
              </button>
              <button
                type="button"
                onClick={() => runDealAction(() => moderatorSendToRevision(pbClient, deal.id))}
                disabled={dealBusy}
                className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50"
              >
                Отправить на доработку
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Архив --- */}
      {deal?.status === "archived" && (
        <div className="m-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs">
          <p className="font-semibold text-emerald-900">Заказ выполнен и принят</p>
          <DealTerms deal={deal} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages === null && <p className="text-xs text-zinc-400">Загружаем переписку…</p>}
        {messages?.length === 0 && (
          <p className="text-xs text-zinc-400">Сообщений пока нет — начните переписку.</p>
        )}
        <div className="flex flex-col gap-2">
          {messages?.map((m) => {
            if (m.isSystem) {
              return (
                <div
                  key={m.id}
                  className="self-center rounded-full bg-zinc-100 px-3 py-1 text-center text-[11px] text-zinc-500"
                >
                  {m.body} · {formatDateTime(m.createdAt)}
                </div>
              );
            }
            const isOwn = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  isOwn
                    ? "self-end bg-zinc-900 text-white"
                    : "self-start bg-zinc-100 text-zinc-800"
                }`}
              >
                <MessageBody text={m.body} redact={!isOwn && currentUserRole !== "moderator"} />
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {isParticipant && (!deal || deal.status === "declined") && !showDealForm && (
        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={() => setShowDealForm(true)}
            className="w-full rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800 transition-colors hover:bg-violet-100"
          >
            Заключить сделку
          </button>
        </div>
      )}

      {showDealForm && (
        <DealForm
          onCancel={() => setShowDealForm(false)}
          onSubmit={async (form) => {
            setDealBusy(true);
            try {
              const created = await proposeDeal(pbClient, {
                leadId,
                customerId,
                specialistProfileId,
                proposedBy: currentUserId,
                proposerRole: currentUserRole as "customer" | "specialist",
                resultText: form.resultText,
                price: form.price,
                dueDate: form.dueDate,
              });
              setDeal(created);
              setShowDealForm(false);
              onDealChanged?.();
              await postSystemMessage(`${roleLabel()} предложил заключить сделку`);
            } finally {
              setDealBusy(false);
            }
          }}
          busy={dealBusy}
        />
      )}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 p-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Напишите сообщение…"
          className="flex-1 rounded-full border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}

function DealTerms({ deal }: { deal: Deal }) {
  return (
    <dl className="mt-1.5 flex flex-col gap-0.5 text-zinc-700">
      <div>
        <dt className="inline text-zinc-500">Результат: </dt>
        <dd className="inline">{deal.resultText}</dd>
      </div>
      <div>
        <dt className="inline text-zinc-500">Стоимость: </dt>
        <dd className="inline">{formatMoney(deal.price)}</dd>
      </div>
      <div>
        <dt className="inline text-zinc-500">Срок сдачи: </dt>
        <dd className="inline">{formatDate(deal.dueDate)}</dd>
      </div>
    </dl>
  );
}

function DealForm({
  onSubmit,
  onCancel,
  busy,
}: {
  onSubmit: (form: { resultText: string; price: number; dueDate: string }) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [resultText, setResultText] = useState("");
  const [price, setPrice] = useState("");
  const [dueDate, setDueDate] = useState("");

  const canSubmit = resultText.trim().length > 3 && Number(price) > 0 && dueDate.length > 0;

  return (
    <div className="mx-3 mb-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-semibold text-zinc-700">Условия сделки</p>
      <div className="mt-2 flex flex-col gap-2">
        <input
          type="text"
          value={resultText}
          onChange={(e) => setResultText(e.target.value)}
          placeholder="Результат, который хочет заказчик"
          className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Стоимость, ₽"
            className="w-1/2 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-1/2 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={!canSubmit || busy}
          onClick={() =>
            onSubmit({
              resultText: resultText.trim(),
              price: Number(price),
              dueDate: new Date(dueDate).toISOString(),
            })
          }
          className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Предложить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
