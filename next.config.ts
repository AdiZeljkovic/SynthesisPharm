import type { NextConfig } from "next";

/**
 * Statični export za Windows Plesk (IIS) hosting bez Node.js-a:
 * - `next build` pravi gotove HTML fajlove u `out/`, koji se FTP-om prebacuju na server;
 * - `trailingSlash`: svaka stranica je `folder/index.html`, što IIS servira bez URL Rewrite modula;
 * - slike: vlastiti loader (src/lib/image-loader.ts) + `scripts/optimize-images.mjs` pravi veličine pri buildu;
 * - preusmjerenja sa starih adresa, keširanje i sigurnosni headeri su u `public/web.config` (IIS).
 */

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  poweredByHeader: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Moraju se poklapati sa WIDTHS u scripts/optimize-images.mjs
    imageSizes: [96, 256, 384],
    deviceSizes: [640, 828, 1080, 1600, 2400],
  },
};

export default nextConfig;
