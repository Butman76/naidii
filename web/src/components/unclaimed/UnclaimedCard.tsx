"use client";

import { useState } from "react";
import type { UnclaimedListing } from "@/lib/unclaimed";
import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";

// Карточка компании, которую нашли и добавили мы сами по открытым данным —
// не сама компания (см. STATUS.md, «claim your business», 2026-09-28).
// Живёт вперемешку с обычными карточками специалистов в общей сетке (по
// просьбе пользователя убрали отдельный заголовок раздела) — единственное
// отличие визуально: пунктирная рамка и бейдж «Добавлено редакцией»,
// рейтинг/отзывы не показываем, их у неё нет и быть не может.
export default function UnclaimedCard({ listing }: { listing: UnclaimedListing }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{listing.name}</p>
            <p className="truncate text-xs text-zinc-500">{listing.domain}{listing.city ? ` · ${listing.city}` : ""}</p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            Добавлено редакцией
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {listing.categories.map((slug) => {
            const cat = CATEGORIES.find((c) => c.slug === slug);
            if (!cat) return null;
            const style = getCategoryStyle(slug);
            return (
              <span key={slug} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: style.hexLight, color: "#27272a" }}>
                {cat.name}
              </span>
            );
          })}
        </div>

        {listing.blurb && <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{listing.blurb}</p>}

        <div className="mt-auto flex gap-2 pt-4">
          <a
            href={listing.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-500"
          >
            Сайт компании
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-500"
          >
            Это моя компания
          </button>
        </div>
      </div>

      {open && <ClaimModal listing={listing} onClose={() => setOpen(false)} />}
    </>
  );
}

function ClaimModal({ listing, onClose }: { listing: UnclaimedListing; onClose: () => void }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <p className="text-sm font-semibold text-zinc-900">Заявка отправлена</p>
            <p className="mt-2 text-sm text-zinc-600">Мы проверим её и свяжемся с вами по указанной почте.</p>
            <button type="button" onClick={onClose} className="mt-4 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700">
              Закрыть
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-zinc-900">Подтвердите, что это ваша компания</p>
            <p className="text-xs text-zinc-500">{listing.name} · {listing.domain}</p>
            <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
              Самый надёжный способ подтвердить — написать нам с официальной почты компании, на домене {listing.domain} (например, имя@{listing.domain}).
            </p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" required maxLength={100} className="mt-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`Email, лучше на домене ${listing.domain}`} required className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон (необязательно)" maxLength={40} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Комментарий (необязательно)" rows={2} maxLength={2000} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm" />
            <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="mt-1 flex gap-2">
              <button type="submit" disabled={busy} className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                {busy ? "Отправляем…" : "Отправить"}
              </button>
              <button type="button" onClick={onClose} className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
