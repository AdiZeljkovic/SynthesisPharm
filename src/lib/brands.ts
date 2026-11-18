import type { CSSProperties } from "react";

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
  category: string;
  /** Boje brenda za tematiziranje stranica: accent (dugmad, min. 4.5:1 s bijelim), soft (sekundarna), deep (tamne pozadine) */
  theme: { accent: string; soft: string; deep: string };
};

export const brands: Brand[] = [
  {
    slug: "vitabiotics",
    theme: { accent: "#c8003f", soft: "#ff6f96", deep: "#2b0613" },
    name: "Vitabiotics",
    logo: "/images/brands/vitabiotics-logo.png",
    mark: "/images/brands/vitabiotics-mark.png",
    cover: "/images/brands/vitabiotics-cover.jpg",
    hero: "/images/brands/vitabiotics-hero.jpg",
    origin: "Velika Britanija · od 1971.",
    category: "Dodaci prehrani",
    summary:
      "Vodeći britanski brend dodataka prehrani osnovan 1971. godine, pionir u razvoju i inovacijama na području vitamina i minerala.",
    about: [
      "Vitabiotics je vodeći britanski brend dodataka prehrani osnovan 1971. godine, a koji se može pohvaliti pionirskim pothvatima u razvoju i inovacijama na području vitamina i minerala u obliku dodataka prehrani.",
      "Svako doba. Svaki životni stil. Pomažemo svima da budu najbolji uz jednostavnu, ali učinkovitu prehrambenu podršku.",
    ],
    mission:
      "Vitabiotics je nastao na jednoj velikoj ideji. Već više od 45 godina predani smo istom cilju – pomoći vam da budete u najboljem izdanju, dan za danom i šta god vam život donese. Danas se život promijenio, ali još uvijek podržavamo ljude na više načina nego ikad. Iznad svega, ostajemo ista neovisna, porodična britanska kompanija kakva smo uvijek bili – ime kojem ljudi vjeruju za sigurnu, uravnoteženu i učinkovitu podršku.",
  },
  {
    slug: "nestle-nan",
    theme: { accent: "#1d3f94", soft: "#f0b323", deep: "#0b1f4d" },
    name: "Nestlé NAN",
    logo: "/images/brands/nestle-nan-logo.png",
    mark: "/images/brands/nestle-nan-mark.png",
    cover: "/images/brands/nestle-nan-cover.jpg",
    origin: "Nestlé · 160+ godina iskustva",
    category: "Mliječne formule za dojenčad",
    summary:
      "Međunarodno prepoznatljiv brend mliječnih formula za dojenčad, razvijen na temelju više od 160 godina iskustva kompanije Nestlé u oblasti prehrane.",
    about: [
      "Nestlé NAN je međunarodno prepoznatljiv brend mliječnih formula za dojenčad, razvijen na temelju više od 160 godina iskustva kompanije Nestlé u oblasti prehrane. Iza brenda stoje naučna istraživanja, više od 80 kliničkih studija i preko 200 patentiranih inovacija.",
      "Zahvaljujući naprednim formulacijama poput OPTIPRO® tehnologije i kompleksa od 5 HMO oligosaharida, NAN formule prilagođene su nutritivnim potrebama dojenčadi u različitim fazama razvoja. Posebna pažnja posvećena je kontroli kvaliteta, sigurnosti i jednostavnoj pripremi.",
    ],
  },
  {
    slug: "bayer-consumer-health",
    theme: { accent: "#0a6e9e", soft: "#89d329", deep: "#10384f" },
    name: "Bayer Consumer Health",
    logo: "/images/brands/bayer-logo.png",
    mark: "/images/brands/bayer-mark.png",
    cover: "/images/brands/bayer-cover.jpg",
    origin: "Njemačka · 150+ godina historije",
    category: "Bezreceptni program",
    summary:
      "Odjel bezreceptnog programa kompanije Bayer, koja ima više od 150 godina historije i temeljne kompetencije u područjima zdravstvene zaštite i poljoprivrede.",
    about: [
      "Bayer Consumer Health je odjel bezreceptnog programa kompanije Bayer koja ima više od 150 godina historije i temeljne kompetencije u područjima zdravstvene zaštite i poljoprivrede.",
    ],
    mission: "Zdravlje za sve, glad ni za koga.",
  },
  {
    slug: "recordati",
    theme: { accent: "#c8102e", soft: "#ff7a7a", deep: "#2a0d12" },
    name: "Recordati",
    logo: "/images/brands/recordati-logo.png",
    mark: "/images/brands/recordati-mark.png",
    cover: "/images/brands/recordati-cover.jpg",
    hero: "/images/brands/recordati-hero.jpg",
    origin: "Italija · međunarodna grupa",
    category: "Lijekovi",
    summary:
      "Međunarodna farmaceutska grupa sa sjedištem u Italiji, jedna od najaktivnijih svjetskih kompanija u istraživanju, razvoju i marketingu tretmana za rijetke bolesti.",
    about: [
      "Recordati je međunarodna farmaceutska grupacija, posvećena istraživanju, razvoju, proizvodnji i marketingu farmaceutskih proizvoda. Tim medicinskih predstavnika učinkovitim terenskim radom promoviše širok raspon inovativnih lijekova, kako vlastitih, tako i onih koji se proizvode pod licencom.",
      "Synthesis Pharma u svojoj ponudi posjeduje Eligard (leuprorelin), lijek koji je značajan u tretmanu pacijenata sa karcinomom prostate.",
    ],
    mission:
      "Naš uspjeh kao zdravstvene kompanije koristit će ne samo pacijentima čije potrebe zadovoljavamo, već i svim našim partnerima, klijentima, dioničarima, zaposlenicima i njihovim porodicama.",
  },
];

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