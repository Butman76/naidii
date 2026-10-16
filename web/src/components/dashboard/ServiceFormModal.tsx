"use client";

import { useEffect } from "react";

// Окно поверх всей страницы для формы новой карточки услуги (по просьбе
// пользователя 2026-10-16). Закрывается ТОЛЬКО кнопками (крестик, «Отмена» /
// «Закрыть» внутри формы): клик по тёмному фону и Esc намеренно ничего не
// делают — форма длинная, и потерять введённое из-за случайного клика мимо —
// знакомая ошибка (см. то же решение в unclaimed/ClaimModal.tsx). Пока окно
// открыто, страница под ним не прокручивается; прокручивается само окно.
export default function ServiceFormModal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-zinc-900/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Новая карточка услуги">
      <div className="mx-auto w-full max-w-3xl px-2 py-4 sm:px-4 sm:py-8">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="absolute -top-1 right-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-zinc-600 shadow-lg ring-2 ring-zinc-200 transition hover:bg-zinc-100 hover:text-zinc-900 sm:-right-3 sm:-top-3"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
