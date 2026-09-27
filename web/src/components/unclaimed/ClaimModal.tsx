"use client";

import { useState } from "react";

// Кнопка "Это моя компания" на профиле неподтверждённой карточки —
// раньше открывала форму (сначала модалкой, потом разворачивалась под
// кнопкой). По просьбе пользователя 2026-09-28 весь путь подтверждения
// упростили до одного шага: владелец сам пишет на claim@naidii.ru со своей
// официальной почты (домен виден нам — этого достаточно, чтобы убедиться,
// что письмо не от постороннего), а не заполняет форму на сайте. Почта —
// картинка (public/img/claim-email.png, отрендерена через sharp, не текст
// в DOM), чтобы её не собирали простые боты-парсеры. Закрывается только
// крестиком: клик по фону намеренно ничего не делает — частый баг, когда
// оверлей-модалка закрывается от случайного клика мимо, тут его нет.
export default function ClaimModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Это моя компания
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              ×
            </button>
            <p className="pr-6 text-sm font-semibold text-zinc-900">Это ваша компания?</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700">
              Если в карточке указан ваш бренд — напишите нам письмо с вашего официального электронного адреса (на домене компании). В ответ мы пришлём вам ссылку на редактирование данных в системе.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- картинка, не текст: не даём простым ботам собрать почту */}
            <img src="/img/claim-email.png" alt="claim@naidii.ru" className="mt-4 h-9 w-auto" />
          </div>
        </div>
      )}
    </>
  );
}
