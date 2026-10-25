"use client";

import { useState } from "react";

// Копирование в буфер для оператора, который переносит опубликованную новость
// в каналы и блоки: «анонс» — заголовок + анонс (если анонса нет — начало
// текста), «ссылка» — адрес страницы новости. Нужны разрешения буфера обмена
// (https / localhost); на случай их отсутствия есть запасной способ через
// скрытое поле.
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export default function CopyKey({ label, icon, getText, colors }: { label: string; icon: string; getText: () => string; colors: Record<string, string> }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  return (
    <button
      type="button"
      className="adm-key !rounded-full !px-3.5 !py-1.5 text-xs"
      style={colors as React.CSSProperties}
      onClick={async () => {
        setState((await copyToClipboard(getText())) ? "done" : "fail");
        setTimeout(() => setState("idle"), 1800);
      }}
    >
      <span className="adm-ico" aria-hidden="true">{state === "done" ? "✅" : icon}</span>
      <span className="whitespace-nowrap">{state === "done" ? "Скопировано" : state === "fail" ? "Не вышло" : label}</span>
    </button>
  );
}
