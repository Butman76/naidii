"use client";

import { useState } from "react";
import type { UnclaimedListing } from "@/lib/unclaimed";

// Форма "это моя компания" на странице профиля неподтверждённой карточки
// (см. app/unclaimed/[domain]/page.tsx) — раньше открывалась модалкой прямо
// из карточки в каталоге; по просьбе пользователя 2026-09-28 карточка ведёт
// на профиль, и форма живёт там. Сама форма не видна сразу — сначала кнопка
// "Это моя компания", по клику разворачивается (тоже по просьбе).
export default function ClaimSection({ listing }: { listing: UnclaimedListing }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/unclaimed/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing: listing.id,
          kind: "claim",
          contact_name: name,
          contact_email: email,
          contact_phone: phone,
          message,
          website_url_confirm: trap,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) setError(data.error ?? "Не удалось отправить заявку.");
      else setDone(true);
    } catch {
      setError("Нет связи с сервером, попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-900">Заявка отправлена</p>
        <p className="mt-1 text-sm text-emerald-800">Мы проверим её и свяжемся с вами по указанной почте.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Это моя компания
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-semibold text-zinc-900">Это ваша компания?</p>
      <p className="mt-1 text-sm text-zinc-600">
        Подтвердите карточку — и сможете сами дополнить и поправить информацию, добавить услуги и отвечать на заявки.
      </p>
      <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
        Самый надёжный способ подтвердить — написать нам с официальной почты компании, на домене {listing.domain} (например, имя@{listing.domain}).
      </p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" required maxLength={100} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`Email, лучше на домене ${listing.domain}`} required className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон (необязательно)" maxLength={40} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Комментарий (необязательно)" rows={2} maxLength={2000} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
        <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="mt-1 flex gap-2">
          <button type="submit" disabled={busy} className="self-start rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
            {busy ? "Отправляем…" : "Отправить"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="self-start rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
