"use client";

import { useState } from "react";
import YandexCaptcha from "@/components/YandexCaptcha";
import { CATEGORIES } from "@/data/categories";
import { EVENT_TYPE_LABELS, FORMAT_LABELS } from "@/lib/events";

const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_YANDEX_CAPTCHA_SITE_KEY;

const input = "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none";
const label = "block text-sm font-medium text-zinc-800";

interface FormState {
  title: string; event_type: string; format: string; start_date: string; end_date: string; time_note: string;
  city: string; venue: string; address: string; online_platform: string; short_description: string; description: string;
  official_url: string; registration_url: string; program_url: string; price_type: string; price_from: string; promo_code: string;
  organizer: string; organizer_email: string; contact_name: string; contact_phone: string; organizer_note: string;
  categories: string[]; speakers_wanted: boolean; exhibitors_wanted: boolean; consent: boolean;
}

const EMPTY: FormState = {
  title: "", event_type: "conference", format: "offline", start_date: "", end_date: "", time_note: "", city: "", venue: "", address: "",
  online_platform: "", short_description: "", description: "", official_url: "", registration_url: "", program_url: "",
  price_type: "on_request", price_from: "", promo_code: "", organizer: "", organizer_email: "", contact_name: "", contact_phone: "",
  organizer_note: "", categories: [], speakers_wanted: false, exhibitors_wanted: false, consent: false,
};

export default function EventSubmitForm() {
  const [f, setF] = useState<FormState>(EMPTY);
  const [trap, setTrap] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const text = (k: keyof FormState) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (f.categories.length === 0) return setError("Выберите хотя бы одно направление.");
    if (CAPTCHA_SITE_KEY && !token) return setError("Подтвердите, что вы не робот.");
    setBusy(true);
    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, website_url_confirm: trap, captchaToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось отправить заявку.");
        setToken(null);
        setAttempt((n) => n + 1);
      } else {
        setDone(true);
      }
    } catch {
      setError("Нет связи с сервером, попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-base font-semibold text-emerald-900">Спасибо. Мы проверим событие и опубликуем его после модерации.</p>
        <p className="mt-2 text-sm text-emerald-800">Если понадобятся уточнения, мы напишем на указанную почту.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6">
      <div>
        <label className={label}>Название события *</label>
        <input required minLength={5} maxLength={200} className={input} {...text("title")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Тип *</label>
          <select className={input} {...text("event_type")}>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Формат *</label>
          <select className={input} {...text("format")}>
            {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Дата начала *</label>
          <input type="date" required className={input} {...text("start_date")} />
        </div>
        <div>
          <label className={label}>Дата окончания</label>
          <input type="date" className={input} {...text("end_date")} />
        </div>
        <div>
          <label className={label}>Время и часовой пояс</label>
          <input maxLength={80} placeholder="10:00–18:00 МСК" className={input} {...text("time_note")} />
        </div>
        {f.format !== "online" && (
          <div>
            <label className={label}>Город *</label>
            <input required maxLength={80} className={input} {...text("city")} />
          </div>
        )}
        {f.format !== "online" && (
          <div>
            <label className={label}>Площадка</label>
            <input maxLength={200} className={input} {...text("venue")} />
          </div>
        )}
        {f.format !== "online" && (
          <div>
            <label className={label}>Адрес</label>
            <input maxLength={300} className={input} {...text("address")} />
          </div>
        )}
        {f.format !== "offline" && (
          <div>
            <label className={label}>Онлайн-платформа</label>
            <input maxLength={100} placeholder="Zoom, Telegram, собственная платформа" className={input} {...text("online_platform")} />
          </div>
        )}
      </div>

      <div>
        <label className={label}>Направления * (хотя бы одно)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== "other").map((c) => {
            const on = f.categories.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => set("categories", on ? f.categories.filter((x) => x !== c.slug) : [...f.categories, c.slug])}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={label}>Краткое описание * (до 220 символов)</label>
        <textarea required minLength={20} maxLength={220} rows={2} className={input} {...text("short_description")} />
      </div>
      <div>
        <label className={label}>Полное описание *</label>
        <textarea required minLength={50} maxLength={8000} rows={6} className={input} {...text("description")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Официальный сайт *</label>
          <input type="url" required placeholder="https://" className={input} {...text("official_url")} />
        </div>
        <div>
          <label className={label}>Ссылка на регистрацию</label>
          <input type="url" placeholder="https://" className={input} {...text("registration_url")} />
        </div>
        <div>
          <label className={label}>Ссылка на программу</label>
          <input type="url" placeholder="https://" className={input} {...text("program_url")} />
        </div>
        <div>
          <label className={label}>Организатор</label>
          <input maxLength={150} className={input} {...text("organizer")} />
        </div>
        <div>
          <label className={label}>Цена</label>
          <select className={input} {...text("price_type")}>
            <option value="on_request">По запросу</option>
            <option value="free">Бесплатно</option>
            <option value="paid">Платно</option>
          </select>
        </div>
        {f.price_type === "paid" && (
          <div>
            <label className={label}>Цена от, ₽</label>
            <input type="number" min={0} className={input} {...text("price_from")} />
          </div>
        )}
        <div>
          <label className={label}>Промокод для посетителей НайдИИ</label>
          <input maxLength={60} className={input} {...text("promo_code")} />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.speakers_wanted} onChange={(e) => set("speakers_wanted", e.target.checked)} /> Идёт набор спикеров
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.exhibitors_wanted} onChange={(e) => set("exhibitors_wanted", e.target.checked)} /> Идёт набор экспонентов
        </label>
      </div>

      <div className="grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2">
        <div>
          <label className={label}>Контактное лицо *</label>
          <input required maxLength={100} className={input} {...text("contact_name")} />
        </div>
        <div>
          <label className={label}>Email организатора *</label>
          <input type="email" required className={input} {...text("organizer_email")} />
        </div>
        <div>
          <label className={label}>Телефон</label>
          <input maxLength={40} className={input} {...text("contact_phone")} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Комментарий для модератора</label>
          <textarea maxLength={2000} rows={2} className={input} {...text("organizer_note")} />
          <p className="mt-1 text-xs text-zinc-400">Контакты видит только модератор, на странице события они не публикуются.</p>
        </div>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />

      {CAPTCHA_SITE_KEY && <YandexCaptcha key={attempt} siteKey={CAPTCHA_SITE_KEY} onToken={setToken} />}

      <label className="flex items-start gap-2 text-sm text-zinc-700">
        <input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5" />
        <span>Подтверждаю, что данные достоверны, и согласен с публикацией информации о событии на НайдИИ после модерации.</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
        {busy ? "Отправляем…" : "Отправить на модерацию"}
      </button>
    </form>
  );
}
