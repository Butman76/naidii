// Слаги направлений, для которых уже загружена настоящая рекламная картинка
// в web/public/banners/banner-{slug}.png (см. BANNER_PROMPTS.md — там же
// указано называть файл с префиксом "banner-"). Ведётся вручную по мере
// добавления — та же схема, что и cover-manifest.ts для обложек карточек
// услуг, и по той же причине (карусель — клиентский компонент, без доступа
// к fs на билде).
export const BANNER_MANIFEST: ReadonlySet<string> = new Set([
  "ai-agents",
  "rag",
  "orchestration",
  "chatbots",
  "voice-ai",
]);

export function getBannerImagePath(categorySlug: string): string | undefined {
  return BANNER_MANIFEST.has(categorySlug)
    ? `/banners/banner-${categorySlug}.png`
    : undefined;
}
