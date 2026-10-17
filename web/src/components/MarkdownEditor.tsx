"use client";

import { useRef, useState } from "react";
import NewsBody from "@/components/news/NewsBody";

// Редактор текста с кнопками форматирования и живым предпросмотром — тот же,
// что в админке для новостей (admin/NewsTab.tsx), вынесен сюда, чтобы
// пользоваться им и в кабинете исполнителя («Полное описание» профиля,
// 2026-10-17). Хранит Markdown: заголовки трёх уровней, жирный, курсив,
// цитата, списки, ссылка, разделитель и (если передан uploadImage) фото.

const KEY_BLUE = { "--c1": "#3b82f6", "--c2": "#06b6d4", "--cd": "#1e3a8a", "--cs": "rgba(59,130,246,0.7)" };
const KEY_AMBER = { "--c1": "#f59e0b", "--c2": "#f43f5e", "--cd": "#7c2d12", "--cs": "rgba(245,158,11,0.7)" };
const KEY_GREEN = { "--c1": "#10b981", "--c2": "#84cc16", "--cd": "#065f46", "--cs": "rgba(16,185,129,0.7)" };
const KEY_PINK = { "--c1": "#d946ef", "--c2": "#8b5cf6", "--cd": "#581c87", "--cs": "rgba(217,70,239,0.7)" };
const KEY_ROSE = { "--c1": "#fb7185", "--c2": "#f97316", "--cd": "#7c2d12", "--cs": "rgba(251,113,133,0.7)" };
const KEY_SLATE = { "--c1": "#64748b", "--c2": "#94a3b8", "--cd": "#334155", "--cs": "rgba(100,116,139,0.6)" };

const fieldClass = "adm-field w-full px-3.5 py-2.5 text-sm text-zinc-900 outline-none";

function ToolKey({ colors, onClick, children, disabled, className = "" }: {
  colors: Record<string, string>; onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`adm-key adm-key--sm ${className}`} style={colors as React.CSSProperties}>
      {children}
    </button>
  );
}

export default function MarkdownEditor({
  value,
  onChange,
  label = "Текст",
  rows = 14,
  placeholder,
  uploadImage,
  toolbarExtra,
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  rows?: number;
  placeholder?: string;
  /** Если передан — в панели появляется «Фото в текст»; функция возвращает адрес загруженной картинки. */
  uploadImage?: (file: File) => Promise<string>;
  /** Дополнительные элементы справа в панели (например, кнопка «Предпросмотр лендинга»). */
  toolbarExtra?: React.ReactNode;
}) {
  const [preview, setPreview] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function setBody(next: string, selStart: number, selEnd: number) {
    onChange(next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      }
    });
  }

  function wrap(before: string, after: string, placeholderText: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const chosen = value.slice(s, e) || placeholderText;
    setBody(value.slice(0, s) + before + chosen + after + value.slice(e), s + before.length, s + before.length + chosen.length);
  }

  function prefixLines(prefix: string, placeholderText: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const chosen = value.slice(lineStart, e) || placeholderText;
    const lines = chosen.split("\n").map((l) => (l.startsWith(prefix) ? l : prefix + l.replace(/^#{1,6}\s+/, ""))).join("\n");
    const lead = lineStart > 0 && value[lineStart - 1] !== "\n" ? "\n" : "";
    setBody(value.slice(0, lineStart) + lead + lines + value.slice(e), lineStart + lead.length, lineStart + lead.length + lines.length);
  }

  function insertText(text: string) {
    const el = ref.current;
    const s = el ? el.selectionStart : value.length;
    const e = el ? el.selectionEnd : value.length;
    setBody(value.slice(0, s) + text + value.slice(e), s + text.length, s + text.length);
  }

  async function insertImage(file: File) {
    if (!uploadImage) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadImage(file);
      const caption = window.prompt("Подпись под фото (можно оставить пустой):", "") ?? "";
      insertText(`\n\n![${caption.replace(/[\[\]]/g, "")}](${url})\n\n`);
    } catch (err) {
      setError(`Не удалось загрузить фото: ${err instanceof Error ? err.message : "ошибка"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-zinc-500">{label}</span>
        <ToolKey colors={KEY_BLUE} onClick={() => prefixLines("## ", "Крупный заголовок")}>Заголовок</ToolKey>
        <ToolKey colors={KEY_BLUE} onClick={() => prefixLines("### ", "Подзаголовок")}>Подзаголовок</ToolKey>
        <ToolKey colors={KEY_BLUE} onClick={() => prefixLines("#### ", "Мелкий подзаголовок")}>Мелкий</ToolKey>
        <ToolKey colors={KEY_AMBER} className="font-black" onClick={() => wrap("**", "**", "жирный текст")}>Ж</ToolKey>
        <ToolKey colors={KEY_AMBER} className="italic" onClick={() => wrap("*", "*", "курсив")}>К</ToolKey>
        <ToolKey colors={KEY_GREEN} onClick={() => prefixLines("> ", "Цитата")}>Цитата</ToolKey>
        <ToolKey colors={KEY_GREEN} onClick={() => prefixLines("- ", "Пункт списка")}>• Список</ToolKey>
        <ToolKey colors={KEY_GREEN} onClick={() => prefixLines("1. ", "Пункт списка")}>1. Список</ToolKey>
        <ToolKey colors={KEY_PINK} onClick={() => {
          const url = window.prompt("Адрес ссылки (https://…):", "https://");
          if (url) wrap("[", `](${url})`, "текст ссылки");
        }}>Ссылка</ToolKey>
        <ToolKey colors={KEY_SLATE} onClick={() => insertText("\n\n---\n\n")}>— Разделитель</ToolKey>
        {uploadImage && (
          <>
            <ToolKey colors={KEY_ROSE} disabled={busy} onClick={() => imageInputRef.current?.click()}>Фото в текст</ToolKey>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void insertImage(f);
              }}
            />
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {toolbarExtra}
          <label className="flex items-center gap-1.5 text-xs text-zinc-600">
            <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} /> предпросмотр
          </label>
        </div>
      </div>

      <div className={`mt-2 grid gap-4 ${preview ? "xl:grid-cols-2" : ""}`}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${fieldClass} font-mono leading-relaxed`}
          placeholder={placeholder ?? "## Заголовок раздела\n\nОбычный абзац. Можно **жирный**, *курсив*, [ссылку](https://…).\n\n### Подзаголовок\n\n- пункт списка"}
        />
        {preview && (
          <div className="max-h-[560px] overflow-y-auto rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 p-5">
            {value.trim() ? <NewsBody body={value} /> : <p className="text-sm text-zinc-400">Здесь появится предпросмотр.</p>}
          </div>
        )}
      </div>
      <p className="mt-1 text-[11px] text-zinc-400">
        Заголовки: ## крупный, ### средний, #### мелкий. **жирный**, *курсив*. Пустая строка между абзацами.
      </p>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
