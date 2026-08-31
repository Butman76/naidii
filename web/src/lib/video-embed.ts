// Превращает обычную ссылку на YouTube/RuTube в адрес для встраиваемого
// iframe. Возвращает null, если ссылка не распознана — вызывающий код
// тогда просто не показывает видео-блок, а не ломает страницу непонятным
// iframe.
export function embedVideoUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return `https://www.youtube.com${parsed.pathname}`;
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      const id = parsed.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  }

  if (host === "rutube.ru") {
    const match = parsed.pathname.match(/^\/video\/([a-zA-Z0-9]+)\/?/);
    if (match) return `https://rutube.ru/play/embed/${match[1]}`;
    if (parsed.pathname.startsWith("/play/embed/")) {
      return `https://rutube.ru${parsed.pathname}`;
    }
  }

  return null;
}
