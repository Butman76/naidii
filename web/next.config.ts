import type { NextConfig } from "next";

// Два режима сборки:
// - STATIC_EXPORT=true (GitHub Actions, .github/workflows/deploy-web.yml) —
//   статический экспорт для временной витрины на GitHub Pages, без
//   сервера, basePath = /naidii.
// - без STATIC_EXPORT (по умолчанию, `npm run build` на VPS) — обычная
//   Next.js-сборка с сервером (SSR, API-роуты) для реального домена
//   naidii.ru, basePath пустой.
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  basePath: isStaticExport ? process.env.PAGES_BASE_PATH : undefined,
  // basePath isn't auto-applied to <img>/next-image src (only to next/link
  // and framework-managed assets like the favicon) - see
  // node_modules/next/dist/docs/.../basePath.md. Mirror it into a
  // NEXT_PUBLIC_ var so components can prefix their own asset URLs.
  env: {
    NEXT_PUBLIC_BASE_PATH: isStaticExport ? process.env.PAGES_BASE_PATH ?? "" : "",
  },
  images: {
    // Статический экспорт не может использовать штатный оптимизатор
    // изображений Next.js (нужен работающий сервер) - на VPS, где сервер
    // есть, можно было бы включить оптимизацию, но обложки уже приходят
    // как готовые PNG фиксированного размера, так что смысла пока нет.
    unoptimized: true,
  },
};

export default nextConfig;
