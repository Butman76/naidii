import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  images: {
    // Static export can't use the default Next.js image optimizer (it
    // needs a running server); revisit once the site is hosted on the
    // Timeweb server with a real Node process instead of GitHub Pages.
    unoptimized: true,
  },
};

export default nextConfig;
