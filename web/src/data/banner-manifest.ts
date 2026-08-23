// Слаги направлений, для которых уже загружена настоящая рекламная картинка
// в web/public/banners/{slug}.png (см. BANNER_PROMPTS.md). Ведётся вручную
// по мере добавления — та же схема, что и cover-manifest.ts для обложек
// карточек услуг, и по той же причине (карусель — клиентский компонент,
// без доступа к fs на билде).
export const BANNER_MANIFEST: ReadonlySet<string> = new Set([]);

export function getBannerImagePath(categorySlug: string): string | undefined {
  return BANNER_MANIFEST.has(categorySlug)
    ? `/banners/${categorySlug}.png`
    : undefined;
}
