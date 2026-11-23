import pocetna from "@/content/pages/pocetna.json";
import oNama from "@/content/pages/o-nama.json";
import kontakt from "@/content/pages/kontakt.json";
import brendovi from "@/content/pages/brendovi.json";
import proizvodi from "@/content/pages/proizvodi.json";
import blog from "@/content/pages/blog.json";

/**
 * Tekstovi i slike stranica – uređuju se u adminu (src/content/pages/*.json).
 * Tipovi su eksplicitni: prazna lista iz admina ([]) bi se inače tipizirala kao never[] i build bi pao.
 */
type Seo = { title: string; description: string };
type Hero = { title: string; subtitle: string; image: string };
type Heading = { eyebrow: string; title: string };

export type PocetnaPage = {
  seo: Seo;
  hero: { eyebrow: string; title: string; titleHighlight: string; text: string };
  about: Heading & { paragraphs: string[]; image: string; imageAlt: string; badge: string };
  featured: Heading & { text: string; products: string[] };
  brands: Heading & { text: string; image: string };
  leaflets: Heading & { text: string };
  stats: Heading & { image: string };
  blog: Heading;
};
export type ONamaPage = {
  seo: Seo;
  hero: Hero;
  intro: Heading & { paragraphs: string[]; image1: string; image1Alt: string; image2: string; image2Alt: string };
  tabs: { label: string; items: string[] }[];
  services: Heading & { text: string; items: { icon: string; title: string; text: string }[] };
  values: Heading & { items: { icon: string; title: string }[] };
};
export type KontaktPage = { seo: Seo; hero: Hero; form: { title: string; note: string }; infoTitle: string };
export type BrendoviPage = { seo: Seo; hero: Hero; heading: Heading };
export type ProizvodiPage = { seo: Seo; hero: Hero };
export type BlogPage = { seo: Seo; hero: Hero; empty: string };

export const pages = {
  pocetna: pocetna as PocetnaPage,
  oNama: oNama as ONamaPage,
  kontakt: kontakt as KontaktPage,
  brendovi: brendovi as BrendoviPage,
  proizvodi: proizvodi as ProizvodiPage,
  blog: blog as BlogPage,
};

/** Prazni paragrafi (npr. obrisani u adminu) se ne prikazuju. */
export function paragraphs(list: string[] | undefined) {
  return (list ?? []).map((p) => p.trim()).filter(Boolean);
}
