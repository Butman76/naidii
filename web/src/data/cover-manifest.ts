// Слаги типов результата, для которых уже загружена настоящая обложка в
// web/public/covers/{slug}.png (см. COVER_ART_PROMPTS.md). Список ведётся
// вручную по мере добавления картинок — файлы в web/public/covers/ не
// сканируются на лету, потому что mock-services.ts (через ResultTypePlate)
// подключается и в клиентские компоненты ("use client" в ServicesCatalog),
// а там нет доступа к fs.
export const COVER_MANIFEST: ReadonlySet<string> = new Set([
  "ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt",
  "ai-agents-prodazhi-i-zayavki-ai-agent-kvalifikacii-lidov-dly",
  "ai-agents-podderzhka-klientov-ai-agent-podderzhki-247-s-eska",
  "ai-agents-podderzhka-klientov-audit-suschestvuyuschego-ai-ag",
  "ai-agents-hr-i-rekruting-ai-agent-dlya-hr-pervichnyy-skrinin",
  "ai-agents-hr-i-rekruting-ai-agent-onbordinga-novyh-sotrudnik",
]);

export function getCoverImagePath(slug: string): string | undefined {
  return COVER_MANIFEST.has(slug) ? `/covers/${slug}.png` : undefined;
}
