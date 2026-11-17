import type { CSSProperties } from "react";
import { themeVars } from "./brands";
import osteocare from "@/content/leaflets/osteocare.json";
import feroglobin from "@/content/leaflets/feroglobin.json";
import neurozan from "@/content/leaflets/neurozan.json";
import jointace from "@/content/leaflets/jointace.json";

/**
 * Sadržaj edukativnih letaka (ranije PDF/slike), prepisan doslovno u strukturirane blokove.
 * Tekst se uređuje u src/content/leaflets/<slug>.json, slike su u public/images/leaflets/<slug>/.
 */

export type VariantsBlock = {
  type: "variants";
  title?: string;
  items: { name: string; image: string; caption: string }[];
};
export type FeatureBlock = {
  type: "feature";
  title?: string;
  lead?: string;
  paragraphs?: string[];
  bullets?: string[];
  image?: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
};
export type NutrientsBlock = {
  type: "nutrients";
  intro?: string;
  items: { symbol: string; name: string; text: string }[];
  outro?: string;
  image?: string;
  imageAlt?: string;
};
export type BenefitsBlock = {
  type: "benefits";
  title?: string;
  items: string[];
  paragraphs?: string[];
  image?: string;
  imageAlt?: string;
};
export type ProductBlock = {
  type: "product";
  name: string;
  label?: string;
  color?: string;
  headline: string;
  paragraphs: string[];
  bullets?: string[];
  image?: string;
  imageAlt?: string;
  imageAfterParagraph?: number;
};
export type ImageBlock = {
  type: "image";
  image: string;
  imageAlt: string;
  caption?: string;
  width: number;
  height: number;
};

export type LeafletBlock = VariantsBlock | FeatureBlock | NutrientsBlock | BenefitsBlock | ProductBlock | ImageBlock;

export type LeafletDoc = {
  slug: string;
  colors: { primary: string; secondary?: string };
  hero: { tagline: string; paragraphs: string[]; note?: string; image: string; imageAlt: string };
  sections: LeafletBlock[];
  closing: { title: string; text?: string };
};

const docs = [osteocare, feroglobin, neurozan, jointace] as unknown as LeafletDoc[];

export function getLeaflet(slug: string) {
  return docs.find((d) => d.slug === slug);
}

export const leafletSlugs = docs.map((d) => d.slug);

/** Tema stranice letka iz boja samog letka. */
export function leafletTheme(doc: LeafletDoc): CSSProperties {
  const { primary, secondary } = doc.colors;
  return themeVars({
    accent: primary,
    soft: secondary ?? primary,
    deep: `color-mix(in oklab, ${primary} 45%, black)`,
  });
}
