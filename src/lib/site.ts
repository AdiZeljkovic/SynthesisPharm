import raw from "@/content/site.json";

/**
 * Opšti podaci (kontakt, statistika, footer…) – uređuju se u adminu (src/content/site.json).
 * Izvedena polja (telefon za link, mapa) računaju se ovdje.
 * Eksplicitan tip: kad klijent u adminu isprazni listu (npr. sve brojke), JSON sadrži [] koji bi
 * TypeScript inače shvatio kao never[] i build bi pao.
 */
export type SiteData = {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: { street: string; city: string; country: string };
  hours: string;
  social: { facebook: string; linkedin: string };
  stats: { value: number; label: string }[];
  footerText: string;
  cta: { title: string; text: string };
};
const data = raw as SiteData;
const addressLine = `${data.address.street}, ${data.address.city}`;

export const site = {
  ...data,
  url: "https://www.synthesispharma.ba",
  phoneHref: `tel:${data.phone.replace(/[^\d+]/g, "")}`,
  mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(addressLine)}&z=15&output=embed`,
  mapLink: `https://maps.google.com/?q=${encodeURIComponent(addressLine)}`,
};

export const stats = data.stats;

export const nav = [
  { href: "/", label: "Početna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/brendovi", label: "Brendovi" },
  { href: "/proizvodi", label: "Proizvodi" },
  { href: "/blog", label: "Blog" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

/** Logotipi proizvoda u meniju (vode na letak proizvoda) */
export const navProducts = [
  { slug: "osteocare", name: "Osteocare", logo: "/images/featured/osteocare-nav.png", width: 456, height: 89 },
  { slug: "feroglobin", name: "Feroglobin", logo: "/images/featured/feroglobin-nav.png", width: 370, height: 96 },
  { slug: "neurozan", name: "Neurozan", logo: "/images/featured/neurozan-nav.png", width: 605, height: 96 },
  { slug: "jointace", name: "Jointace", logo: "/images/featured/jointace-nav.png", width: 365, height: 96 },
] as const;
