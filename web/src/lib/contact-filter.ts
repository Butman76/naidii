// Ловит телефон, email, @telegram-юзернейм, t.me-ссылку — по запросу
// пользователя (2026-08-29): в чате между заказчиком и специалистом такие
// фрагменты должны быть замазаны у ОППОНЕНТА (сам автор видит, что написал,
// без замазывания). Похожий паттерн уже используется в
// ServiceCreationForm.tsx для другой цели (блокирует отправку формы) — тут
// своя копия, потому что здесь нужен глобальный флаг для поиска всех
// вхождений, а не одна проверка .test().
const CONTACT_RE =
  /(\+?\d[\d\s\-()]{7,}\d)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(@[a-zA-Z0-9_]{4,})|(t\.me\/\S+)/gi;

export interface TextSegment {
  text: string;
  redacted: boolean;
}

export function splitRedactedSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  const re = new RegExp(CONTACT_RE.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), redacted: false });
    }
    segments.push({ text: match[0], redacted: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), redacted: false });
  }
  return segments;
}
