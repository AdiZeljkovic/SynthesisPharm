import data from "@/content/products.json";
import { getBrand } from "./brands";
import { pages } from "./pages";

/** Proizvodi – uređuju se u adminu (src/content/products.json). */

export type Leaflet = { src: string; width: number; height: number };

export type Product = {
  slug: string;
  name: string;
  /** slug brenda */
  brand: string;
  /** Slika pakovanja */
  image: string;
  /** Fotografija proizvoda (ako postoji) */
  photo?: string;
  description: string;
  /** Originalni štampani letak (ranije na poddomenama *.synthesispharma.ba) */
  leaflet?: Leaflet;
  /** Logo proizvoda za istaknute letke */
  logo?: string;
};

// Prazni stringovi iz admina = polje nije postavljeno.
// Proizvod čiji brend ne postoji (npr. obrisan) se ne prikazuje – stranice inače ne bi mogle nastati.
export const products: Product[] = (data as Product[])
  .filter((p) => {
    const ok = !!getBrand(p.brand) && !!p.slug && !!p.image;
    if (!ok) console.warn(`[products] preskačem "${p.name}" (nepostojeći brend "${p.brand}" ili bez slike/adrese)`);
    return ok;
  })
  .map((p) => ({
    ...p,
    photo: p.photo || undefined,
    logo: p.logo || undefined,
  }));

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsByBrand(brand: string) {
  return products.filter((p) => p.brand === brand);
}

export const featuredProducts = pages.pocetna.featured.products
  .map((s) => getProduct(s))
  .filter((p): p is Product => p !== undefined);

export const leafletProducts = products.filter((p) => p.leaflet);
