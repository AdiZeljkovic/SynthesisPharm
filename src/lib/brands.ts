import type { CSSProperties } from "react";
import data from "@/content/brands.json";

/** Brendovi – uređuju se u adminu (src/content/brands.json). */
export type Brand = {
  slug: string;
  name: string;
  logo: string;
  /** Logo bez margina (za trake i kartice) */
  mark: string;
  cover: string;
  hero?: string;
  origin: string;
  /** Kratki opis za kartice */
  summary: string;
  /** Duži opis za stranicu brenda */
  about: string[];
  mission?: string;
  /** Napomena ispod proizvoda ovog brenda */
  productNote?: string;
  category: string;
  /** Boje brenda za tematiziranje stranica: accent (dugmad, min. 4.5:1 s bijelim), soft (sekundarna), deep (tamne pozadine) */
  theme: { accent: string; soft: string; deep: string };
};

export const brands: Brand[] = (data as Brand[]).map((b) => ({
  ...b,
  // Prazni stringovi iz admina = polje nije postavljeno
  hero: b.hero || undefined,
  mission: b.mission || undefined,
  productNote: b.productNote || undefined,
  about: b.about.filter(Boolean),
}));

export function getBrand(slug: string) {
  return brands.find((b) => b.slug === slug);
}

/** CSS varijable koje pretvaraju boje Synthesisa (brand/leaf) u boje brenda unutar elementa. */
export function brandTheme(brand: Brand): CSSProperties {
  return themeVars(brand.theme);
}

/** Isto kao brandTheme, za proizvoljne boje (npr. boje letka). */
export function themeVars({ accent, soft, deep }: Brand["theme"]): CSSProperties {
  const mix = (c: string, pct: number, base = "white") => `color-mix(in oklab, ${c} ${pct}%, ${base})`;
  return {
    "--color-brand-50": mix(accent, 7),
    "--color-brand-100": mix(accent, 15),
    "--color-brand-200": mix(accent, 30),
    "--color-brand-300": mix(accent, 55),
    "--color-brand-400": mix(accent, 80),
    "--color-brand-500": accent,
    "--color-brand-600": mix(accent, 85, "black"),
    "--color-brand-700": mix(accent, 70, "black"),
    "--color-brand-900": mix(deep, 80, accent),
    "--color-brand-950": deep,
    "--color-leaf-50": mix(soft, 12),
    "--color-leaf-200": mix(soft, 45),
    "--color-leaf-300": soft,
    "--color-leaf-400": soft,
    "--color-leaf-500": soft,
    "--color-leaf-600": mix(soft, 70, "black"),
    "--color-leaf-700": mix(soft, 55, "black"),
  } as CSSProperties;
}