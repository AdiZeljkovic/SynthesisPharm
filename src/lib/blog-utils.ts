/** Tipovi i pomoćne funkcije bloga koje smiju i u browser (bez fs/markdowna). */

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO datum, npr. 2026-11-17 */
  date: string;
  category: string;
  cover: string;
  coverAlt: string;
  author: string;
  /** slugovi povezanih proizvoda (src/lib/products.ts) */
  products: string[];
  draft: boolean;
  readingMinutes: number;
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MONTHS = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

/** 2026-11-17 → "17. novembar 2026." (bez Intl-a, isti rezultat svugdje) */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}.`;
}
