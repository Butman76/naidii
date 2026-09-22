// Слаги направлений, для которых уже загружена настоящая рекламная картинка
// в web/public/banners/banner-{slug}.jpg (см. BANNER_PROMPTS.md — там же
// указано называть файл с префиксом "banner-"). Ведётся вручную по мере
// добавления — та же схема, что и cover-manifest.ts для обложек карточек
// услуг, и по той же причине (карусель — клиентский компонент, без доступа
// к fs на билде).
//
// .jpg, не .png: исходники из генератора весили по 4-4.6 МБ каждый (все 8
// грузятся одновременно — карусель рендерит все слайды сразу и просто
// переключает opacity), из-за чего главная страница ощутимо тормозила.
// Пересжаты в JPEG ~1600px по ширине — тот же визуальный результат, в
// ~40-60 раз меньше веса (см. STATUS.md, 2026-09-22).
export const BANNER_MANIFEST: ReadonlySet<string> = new Set([
  "ai-agents",
  "rag",
  "orchestration",
  "chatbots",
  "voice-ai",
  "ai-video",
  "crm-ai",
  "prompt-engineering",
  "ai-analytics",
]);

export function getBannerImagePath(categorySlug: string): string | undefined {
  return BANNER_MANIFEST.has(categorySlug)
    ? `/banners/banner-${categorySlug}.jpg`
    : undefined;
}
