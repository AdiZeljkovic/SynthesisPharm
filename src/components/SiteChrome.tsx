import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JsonLd } from "./JsonLd";
import { SmoothScroll } from "./SmoothScroll";
import { Spotlight } from "./Spotlight";
import { organizationLd } from "@/lib/seo";

/** Okvir javnog sajta (header, footer, efekti) – koristi ga (site)/layout i 404 stranica, ali ne i admin. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
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
    </>
  );
}
