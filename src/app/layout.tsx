import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Spotlight } from "@/components/Spotlight";
import { JsonLd } from "@/components/JsonLd";
import { DEFAULT_OG_IMAGE, organizationLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Synthesis Pharma – pouzdan partner za tržište BiH",
    template: "%s | Synthesis Pharma",
  },
  description: site.description,
  keywords: [
    "Synthesis Pharma",
    "farmacija",
    "zdravstvena zaštita",
    "Bayer Consumer Health",
    "Vitabiotics",
    "Recordati",
    "L'Erbolario",
    "dodaci prehrani",
    "dermokozmetika",
    "Sarajevo",
    "Bosna i Hercegovina",
  ],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "health",
  // Zadano za stranice bez vlastitih metapodataka; svaka stranica šalje svoje kroz pageMetadata()
  openGraph: {
    type: "website",
    locale: "bs_BA",
    siteName: site.name,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Google Search Console: postaviti GOOGLE_SITE_VERIFICATION u .env (vrijednost meta taga)
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0a7a96",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={organizationLd()} />
        <a
          href="#sadrzaj"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Preskoči na sadržaj
        </a>
        <Header />
        <main id="sadrzaj" className="flex-1">
          {children}
        </main>
        <Footer />
        <SmoothScroll />
        <Spotlight />
      </body>
    </html>
  );
}
