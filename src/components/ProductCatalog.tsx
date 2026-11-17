"use client";

import { startTransition, useDeferredValue, useMemo, useState, ViewTransition } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "./cards";
import type { Product } from "@/lib/products";

type Filter = { slug: string; name: string; count: number };

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "dj");
}

export function ProductCatalog({ products, filters }: { products: Product[]; filters: Filter[] }) {
  const [brand, setBrand] = useState<string>("sve");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const visible = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return products.filter(
      (p) =>
        (brand === "sve" || p.brand === brand) &&
        (!q || normalize(p.name).includes(q) || normalize(p.description).includes(q)),
    );
  }, [products, brand, deferredQuery]);

  const all: Filter = { slug: "sve", name: "Svi proizvodi", count: products.length };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtriraj po brendu" className="flex flex-wrap gap-2">
          {[all, ...filters].map((f) => (
            <button
              key={f.slug}
              type="button"
              data-spotlight
              aria-pressed={brand === f.slug}
              onClick={() => startTransition(() => setBrand(f.slug))}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                brand === f.slug ? "bg-brand-500 text-white shadow-md shadow-brand-500/25" : "bg-white text-muted hover:text-ink"
              }`}
            >
              {f.name}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${brand === f.slug ? "bg-white/20" : "bg-surface"}`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Pretraži proizvode</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži proizvode…"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-10 text-base outline-none sm:text-sm transition placeholder:text-muted focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface"
              aria-label="Obriši pretragu"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        Prikazano proizvoda: <strong className="text-ink">{visible.length}</strong>
      </p>

      <h2 className="sr-only">Popis proizvoda</h2>
      {visible.length > 0 ? (
        <ViewTransition key={brand} enter="grid-swap" exit="grid-swap" default="none">
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </ViewTransition>
      ) : (
        <div className="mt-6 rounded-3xl bg-white p-12 text-center text-muted">
          Nema proizvoda koji odgovaraju pretrazi.
        </div>
      )}
    </div>
  );
}
