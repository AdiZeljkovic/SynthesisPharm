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

/** 2026-11-17 → "17. novembar 2026." (bez Intl-a, isti rezultat svugdje); neispravan datum se vraća kakav jeste */
export function formatDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}.`;
}
