import type { Metadata } from "next";
import { site } from "./site";

/** Putanja stranice sa kosom crtom na kraju (sajt koristi trailingSlash: "/o-nama" → "/o-nama/"). */
export function pagePath(path: string) {
  return path === "/" ? "/" : path.replace(/\/?$/, "/");
}

export const DEFAULT_OG_IMAGE = { url: "/video/hero-poster.jpg", width: 1920, height: 1080, alt: "Synthesis Pharma – Sarajevo" };

type PageMetaInput = {
  /** Naslov stranice (bez " | Synthesis Pharma" – dodaje ga šablon iz layouta) */
  title: string;
  description: string;
  /** Putanja stranice, npr. "/o-nama" – koristi se za canonical i og:url */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  /** Naslov bez šablona (početna) */
  absoluteTitle?: boolean;
};

/**
 * Kompletni metapodaci jedne stranice: title, description, canonical, OpenGraph i Twitter kartica.
 * (OpenGraph iz layouta se ne spaja automatski sa stranicom, zato se ovdje uvijek šalje cijeli objekat.)
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  const images = image ? [{ url: image, alt: imageAlt ?? title }] : [DEFAULT_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: pagePath(path) },
    openGraph: {
      type,
      locale: "bs_BA",
      siteName: site.name,
      url: pagePath(path),
      title: fullTitle,
      description,
      images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}

/** Meta opis do ~155 znakova, rezan na granici riječi (Google ionako skraćuje duže opise). */
export function metaDescription(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–-]$/, "")}…`;
}

/** Organizacija + web stranica (schema.org) – ide na svaku stranicu kroz layout. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo: `${site.url}/images/brand/logo.png`,
        image: `${site.url}${DEFAULT_OG_IMAGE.url}`,
        description: site.description,
        email: site.email,
        telephone: "+387 33 568 372",
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: "71000",
          addressLocality: "Sarajevo",
          addressCountry: "BA",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "16:00",
          },
        ],
        sameAs: [site.social.facebook, site.social.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: "bs",
        publisher: { "@id": `${site.url}/#organization` },
      },
    ],
  };
}

/** Breadcrumbs (schema.org BreadcrumbList); zadnja stavka (trenutna stranica) nema link. */
export function breadcrumbLd(crumbs: { href?: string; label: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${pagePath(c.href)}` } : {}),
    })),
  };
}
