"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

/** Spisak brendova i proizvoda za padajuće liste (keš za cijelu sesiju, osvježava se nakon čuvanja). */
export type Catalog = {
  brands: { slug: string; name: string }[];
  products: { slug: string; name: string; brand: string }[];
};

let cache: Catalog | null = null;
let pending: Promise<Catalog> | null = null;
const listeners = new Set<(c: Catalog) => void>();

async function load(): Promise<Catalog> {
  const [b, p] = await Promise.all([api.file("src/content/brands.json"), api.file("src/content/products.json")]);
  const brands = (JSON.parse(b.content) as { slug: string; name: string }[]).map(({ slug, name }) => ({ slug, name }));
  const products = (JSON.parse(p.content) as { slug: string; name: string; brand: string }[]).map(({ slug, name, brand }) => ({ slug, name, brand }));
  return { brands, products };
}

export function refreshCatalog(next?: Catalog) {
  pending = null;
  if (next) {
    cache = next;
    listeners.forEach((l) => l(next));
    return;
  }
  cache = null;
  getCatalog().then((c) => listeners.forEach((l) => l(c)));
}

export function getCatalog() {
  if (cache) return Promise.resolve(cache);
  pending ??= load().then((c) => (cache = c));
  return pending;
}

export function useCatalog() {
  const [c, setC] = useState<Catalog | null>(cache);
  useEffect(() => {
    listeners.add(setC);
    if (!cache) getCatalog().then(setC, () => {});
    return () => {
      listeners.delete(setC);
    };
  }, []);
  return c;
}
