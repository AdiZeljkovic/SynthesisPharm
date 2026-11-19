import pocetna from "@/content/pages/pocetna.json";
import oNama from "@/content/pages/o-nama.json";
import kontakt from "@/content/pages/kontakt.json";
import brendovi from "@/content/pages/brendovi.json";
import proizvodi from "@/content/pages/proizvodi.json";
import blog from "@/content/pages/blog.json";

/** Tekstovi i slike stranica – uređuju se u adminu (src/content/pages/*.json). */
export const pages = { pocetna, oNama, kontakt, brendovi, proizvodi, blog };

/** Prazni paragrafi (npr. obrisani u adminu) se ne prikazuju. */
export function paragraphs(list: string[] | undefined) {
  return (list ?? []).map((p) => p.trim()).filter(Boolean);
}
