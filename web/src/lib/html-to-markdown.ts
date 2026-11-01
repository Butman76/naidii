import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

// Вставка отформатированного текста (Word, Google Docs, сайты) в редактор
// новостей (MarkdownEditor): HTML из буфера обмена превращается в тот же
// Markdown, который редактор и так хранит. Сохраняются заголовки, жирный,
// курсив, зачёркнутый, списки с вложенностью, цитаты, ссылки, таблицы.
// Не переносятся (в Markdown их нет): шрифты и размеры, цвета, красная
// строка и несколько пробелов подряд. Картинки из буфера не берём: адреса
// из Docs/Word временные, фото вставляют кнопкой «Фото в текст».

const NO_FORMAT = /^(normal|400|lighter|initial|inherit)$/i;

function isBold(style: CSSStyleDeclaration): boolean {
  const w = style.fontWeight;
  if (!w || NO_FORMAT.test(w)) return false;
  return w === "bold" || w === "bolder" || Number(w) >= 600;
}

function wrapChildren(el: Element, tag: string) {
  const doc = el.ownerDocument;
  const wrapper = doc.createElement(tag);
  while (el.firstChild) wrapper.appendChild(el.firstChild);
  el.appendChild(wrapper);
}

// Google Docs и Word передают жирный/курсив не тегами, а стилями на <span>.
function normalizeInlineStyles(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("b, strong").forEach((el) => {
    // Docs оборачивает весь фрагмент в <b style="font-weight:normal">.
    if (NO_FORMAT.test(el.style.fontWeight)) el.replaceWith(...Array.from(el.childNodes));
  });
  root.querySelectorAll<HTMLElement>("span, p, div, li, td, th").forEach((el) => {
    const s = el.style;
    if (!s.cssText) return;
    if (s.textDecorationLine?.includes("line-through") || s.textDecoration?.includes("line-through")) wrapChildren(el, "s");
    if (s.fontStyle === "italic") wrapChildren(el, "em");
    if (el.tagName === "SPAN" && isBold(s)) wrapChildren(el, "strong");
  });
}

// Списки из Word приходят абзацами <p style="mso-list:l0 level2 lfo1"> с
// символом маркера в <span style="mso-list:Ignore"> — собираем из них
// настоящие вложенные <ul>/<ol>.
function convertWordLists(root: HTMLElement) {
  const isListPara = (n: Element | null): n is HTMLElement =>
    !!n && n.tagName === "P" && /mso-list:\s*l\d+/i.test(n.getAttribute("style") ?? "");

  const doc = root.ownerDocument;
  let node: Element | null = root.firstElementChild;
  while (node) {
    if (!isListPara(node)) {
      node = node.nextElementSibling;
      continue;
    }
    const stack: { list: HTMLElement; level: number }[] = [];
    const tops: HTMLElement[] = [];
    let p: Element | null = node;
    while (isListPara(p)) {
      const marker = p.querySelector('[style*="mso-list:Ignore"], [style*="mso-list: Ignore"]');
      const markerText = (marker?.textContent ?? "").trim();
      marker?.remove();
      const level = Number(/level(\d+)/i.exec(p.getAttribute("style") ?? "")?.[1] ?? 1);
      const tag = /^[\dA-Za-zа-яА-Я]+[.)]$/.test(markerText) ? "ol" : "ul";

      while (stack.length && stack[stack.length - 1].level > level) stack.pop();
      const top = stack[stack.length - 1];
      // Новый список — на новом уровне или при смене типа (маркер → нумерация).
      if (!top || top.level < level || top.list.tagName.toLowerCase() !== tag) {
        if (top && top.level === level) stack.pop();
        const list = doc.createElement(tag);
        const parent = stack.length ? stack[stack.length - 1].list.lastElementChild : null;
        if (parent) parent.appendChild(list);
        else tops.push(list);
        stack.push({ list, level });
      }
      const li = doc.createElement("li");
      li.innerHTML = p.innerHTML;
      stack[stack.length - 1].list.appendChild(li);

      const next: Element | null = p.nextElementSibling;
      if (p !== node) p.remove();
      p = next;
    }
    node.replaceWith(...tops);
    node = p;
  }
}

// Есть ли в вставке настоящая разметка. Если нет (например, код из редактора
// кода приходит HTML-ом из <div><span> без смысла) — оставляем обычную
// вставку текста, иначе пропали бы переводы строк.
const SEMANTIC = "b, strong, i, em, s, strike, del, h1, h2, h3, h4, h5, h6, ul, ol, li, a[href], table, blockquote";

let service: TurndownService | null = null;

function getService(): TurndownService {
  if (service) return service;
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
    codeBlockStyle: "fenced",
    hr: "---",
  });
  td.use(gfm);
  // Три уровня заголовков, как в панели редактора: ## / ### / ####.
  td.addRule("heading", {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    replacement(content, node) {
      const level = Number(node.nodeName.charAt(1));
      const hashes = level <= 2 ? "##" : level === 3 ? "###" : "####";
      const text = content.replace(/\*\*|__/g, "").replace(/\s+/g, " ").trim();
      return text ? `\n\n${hashes} ${text}\n\n` : "";
    },
  });
  // Компактные пункты: "- текст" и "1. текст", вложенность — четыре пробела.
  td.addRule("listItem", {
    filter: "li",
    replacement(content, node) {
      const body = content.replace(/^\n+/, "").replace(/\n+$/, "").replace(/\n/g, "\n    ");
      const parent = node.parentNode as HTMLElement | null;
      let prefix = "- ";
      if (parent?.nodeName === "OL") {
        const start = Number(parent.getAttribute("start") ?? 1) || 1;
        prefix = `${start + Array.prototype.indexOf.call(parent.children, node)}. `;
      }
      return prefix + body + (node.nextSibling ? "\n" : "");
    },
  });
  td.addRule("dropImages", { filter: "img", replacement: () => "" });
  td.remove(["script", "style", "meta", "link", "title"]);
  service = td;
  return td;
}

/** Markdown из HTML буфера обмена, либо null, если форматирования в нём нет. */
export function htmlToMarkdown(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.body;
  root.querySelectorAll("script, style, meta, link").forEach((n) => n.remove());
  normalizeInlineStyles(root);
  convertWordLists(root);
  root.querySelectorAll("li > p").forEach((para) => para.replaceWith(...Array.from(para.childNodes)));
  if (!root.querySelector(SEMANTIC)) return null;

  const md = getService()
    .turndown(root.innerHTML)
    .replace(/ /g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return md || null;
}
