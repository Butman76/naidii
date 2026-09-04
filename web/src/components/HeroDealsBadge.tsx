"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { withBasePath } from "@/lib/base-path";

// Круглая плашка "ТУТ НОВЫЕ ЗАКАЗЫ" поверх карусели на главной (2026-08-30,
// по прямому запросу пользователя) — быстрый вход специалиста в свою "Доску
// объявлений" (см. SpecialistJobBoard.tsx), минуя каталог и кабинет.
// Вошедшему специалисту — прямая ссылка с ?tab=jobboard (SpecialistDashboard
// сам разбирает этот параметр при монтировании). Всем остальным (гость,
// заказчик, admin/moderator) — тот же клик открывает подсказку "только для
// специалистов" вместо перехода, ничего не показывая из чужого кабинета.
const BADGE_CLASSES =
  "absolute -top-4 right-2 z-30 h-20 w-20 -rotate-6 drop-shadow-lg transition-transform duration-200 hover:-rotate-2 hover:scale-105 sm:-top-6 sm:right-4 sm:h-24 sm:w-24 md:-top-8 md:right-6 md:h-28 md:w-28 lg:h-32 lg:w-32";

export default function HeroDealsBadge() {
  const { user, isAuthenticated } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const isSpecialist = isAuthenticated && user?.role === "specialist";

  if (isSpecialist) {
    return (
      <Link
        href="/dashboard?tab=jobboard"
        aria-label="Тут новые заказы — открыть доску объявлений в кабинете"
        className={BADGE_CLASSES}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
        <img
          src={withBasePath("/badges/tut-novye-zakazy.png")}
          alt="Тут новые заказы"
          className="h-full w-full"
        />
      </Link>
    );
  }

  return (
    <div className="absolute -top-4 right-2 z-30 sm:-top-6 sm:right-4 md:-top-8 md:right-6">
      <button
        type="button"
        onClick={() => setShowGate((v) => !v)}
        aria-label="Тут новые заказы — доступно только зарегистрированным специалистам"
        className="block h-20 w-20 -rotate-6 drop-shadow-lg transition-transform duration-200 hover:-rotate-2 hover:scale-105 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
        <img
          src={withBasePath("/badges/tut-novye-zakazy.png")}
          alt="Тут новые заказы"
          className="h-full w-full"
        />
      </button>

      {showGate && (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-relaxed text-zinc-700 shadow-xl">
          Доска объявлений доступна только зарегистрированным специалистам.{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline">
            Зарегистрироваться
          </Link>{" "}
          или{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            войти
          </Link>
          .
        </div>
      )}
    </div>
  );
}
