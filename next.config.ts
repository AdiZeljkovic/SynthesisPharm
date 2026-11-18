import type { NextConfig } from "next";

/** Stari URL-ovi s HTML stranice → nove rute (301, čuva SEO i postojeće linkove). */
const legacyPages: Record<string, string> = {
  "/index.html": "/",
  "/about-2.html": "/o-nama",
  "/pricing-2.html": "/brendovi",
  "/vitabiotics.html": "/brendovi/vitabiotics",
  "/lerbolario.html": "/brendovi", // brend više nije u ponudi
  "/bayer-consumer-health.html": "/brendovi/bayer-consumer-health",
  "/recordati.html": "/brendovi/recordati",
  "/contact.html": "/kontakt",
  "/services-details.html": "/proizvodi",
  "/project-details.html": "/proizvodi",
};

/**
 * Poddomene s letcima (osteocare.synthesispharma.ba, …) – ako se DNS usmjeri na ovu aplikaciju,
 * posjetioci se preusmjeravaju na stranicu proizvoda s letkom.
 */
const leafletSubdomains = ["osteocare", "feroglobin", "neurozan", "jointace"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 75, 90],
    // optimizovane slike se keširaju 30 dana (izvori u /public se rijetko mijenjaju)
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    const staticCache = { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" };
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      { source: "/images/:path*", headers: [staticCache] },
      { source: "/video/:path*", headers: [staticCache] },
      { source: "/icons/:path*", headers: [staticCache] },
    ];
  },
  async redirects() {
    return [
      ...Object.entries(legacyPages).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      ...leafletSubdomains.map((sub) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: `${sub}.synthesispharma.ba` }],
        destination: `https://www.synthesispharma.ba/proizvodi/${sub}/letak`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
