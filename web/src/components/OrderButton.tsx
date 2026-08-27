"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { pbClient } from "@/lib/auth-client";
import { getCategory3D } from "@/data/category-style";

// Единая точка входа в заказ услуги (Фаза A стратегии "заказчик заказывает
// услугу", см. STATUS.md 2026-08-27) — без регистрации взаимодействия нет
// вообще, по требованию пользователя: не залогинен → предложение
// зарегистрироваться вместо формы, гостевые заявки не создаются.
// Само действие пока создаёт запись leads (полноценная переписка —
// отдельная, ещё не сделанная Фаза B) — важно, что уже сейчас это реальная
// заявка в базе, а не заглушка.
export default function OrderButton({
  specialistProfileId,
  categorySlug,
  contextLabel,
}: {
  specialistProfileId: string;
  categorySlug: string;
  contextLabel: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isCustomer = isAuthenticated && user?.role === "customer";
  const plateClasses = getCategory3D(categorySlug);

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
        category_slug: categorySlug,
        status: "new",
        source: "website",
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      {/* flip-сцена: перед — кнопка, зад — цветная 3D-плашка с
          подтверждением, переключение по классу is-flipped при state ===
          "sent". Обе грани держим одной высоты через min-h, чтобы не
          прыгал макет карточки при перевороте. */}
      <div className="order-flip-scene min-h-[52px]">
        <div className={`order-flip-card h-full ${state === "sent" ? "is-flipped" : ""}`}>
          <div className="order-flip-face">
            <button
              type="button"
              onClick={handleClick}
              disabled={state === "sending" || state === "sent"}
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

          <div
            className={`order-flip-face order-flip-face-back flex items-center justify-center rounded-xl border-b-4 bg-gradient-to-br p-2 text-center text-[10px] font-semibold leading-snug text-white shadow-lg ${plateClasses}`}
          >
            Заявка отправлена — ждите ответа от исполнителя в личном кабинете.
          </div>
        </div>
      </div>
    </div>
  );
}
