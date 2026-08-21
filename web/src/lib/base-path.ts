// GitHub Pages serves this build under a sub-path (e.g. /naidii). Next.js
// only auto-prefixes that basePath for next/link and framework-managed
// assets (favicon, etc.) - not for raw <img src> strings - so uploaded
// asset URLs need it applied manually. See next.config.ts.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
