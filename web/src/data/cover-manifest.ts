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
  "rag-korporativnye-bazy-znaniy-baza-znaniy-s-rag-poiskom-po-d",
  "rag-korporativnye-bazy-znaniy-obnovlenie-i-pereindeksaciya-s",
  "rag-rag-dlya-botov-podderzhki-integraciya-rag-v-suschestvuyu",
  "rag-rag-dlya-botov-podderzhki-rag-poverh-bazy-faq-i-tiketov-",
  "rag-yuridicheskiy-ai-analiz-rag-konsultant-dlya-yuridichesko",
]);

export function getCoverImagePath(slug: string): string | undefined {
  return COVER_MANIFEST.has(slug) ? `/covers/${slug}.png` : undefined;
}
