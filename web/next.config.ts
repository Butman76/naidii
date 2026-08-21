import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  // basePath isn't auto-applied to <img>/next-image src (only to next/link
  // and framework-managed assets like the favicon) - see
  // node_modules/next/dist/docs/.../basePath.md. Mirror it into a
  // NEXT_PUBLIC_ var so components can prefix their own asset URLs.
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.PAGES_BASE_PATH ?? "",
  },
  images: {
    // Static export can't use the default Next.js image optimizer (it
    // needs a running server); revisit once the site is hosted on the
    // Timeweb server with a real Node process instead of GitHub Pages.
    unoptimized: true,
  },
};

export default nextConfig;
