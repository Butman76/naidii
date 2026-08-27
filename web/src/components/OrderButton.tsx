"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { pbClient } from "@/lib/auth-client";

// Единая точка входа в заказ услуги (Фаза A стратегии "заказчик заказывает
// услугу", см. STATUS.md 2026-08-27) — без регистрации взаимодействия нет
// вообще, по требованию пользователя: не залогинен → предложение
// зарегистрироваться вместо формы, гостевые заявки не создаются.
// Само действие пока создаёт запись leads (полноценная переписка —
// отдельная, ещё не сделанная Фаза B) — важно, что уже сейчас это реальная
// заявка в базе, а не заглушка.
export default function OrderButton({
  specialistProfileId,
  contextLabel,
}: {
  specialistProfileId: string;
  contextLabel: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isCustomer = isAuthenticated && user?.role === "customer";

  async function handleClick() {
    if (!isCustomer) {
      setShowGate(true);
      return;
    }
    setState("sending");
    try {
      await pbClient.collection("leads").create({
        specialist_profile_id: specialistProfileId,
        customer_id: user!.id,
        customer_name: user!.name || user!.email,
        customer_email: user!.email,
        request_text: `Интересует: ${contextLabel}`,
        status: "new",
        source: "website",
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <span className="block w-full rounded-full bg-emerald-100 px-3 py-1.5 text-center text-[11px] font-medium text-emerald-800">
        Заявка отправлена
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "sending"}
        className="w-full rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {state === "sending" ? "Отправляем…" : "Заказать"}
      </button>

      {showGate && (
        <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] leading-snug text-amber-800">
          {!isAuthenticated ? (
            <>
              Нужна регистрация —{" "}
              <Link href="/register" className="font-medium underline">
                создать аккаунт
              </Link>{" "}
              или{" "}
              <Link href="/login" className="font-medium underline">
                войти
              </Link>
              .
            </>
          ) : (
            <>Заказывать может только аккаунт с ролью «заказчик».</>
          )}
        </div>
      )}

      {state === "error" && (
        <p className="mt-1 text-[10px] text-red-600">Не получилось — попробуйте ещё раз.</p>
      )}
    </div>
  );
}
