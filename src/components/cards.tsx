import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { ViewTransition, type CSSProperties } from "react";
import type { Brand } from "@/lib/brands";
import { getBrand } from "@/lib/brands";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const brand = getBrand(product.brand);
  return (
    <Link
      href={`/proizvodi/${product.slug}`}
      data-spotlight
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)]"
    >
      <div className="relative">
        <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
          <div className="relative aspect-[57/35] overflow-hidden bg-surface">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        </ViewTransition>
        {product.leaflet && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-leaf-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <FileText className="size-3" aria-hidden /> Letak
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{brand?.name}</span>
        <h3 className="mt-2 text-lg font-extrabold text-ink">{product.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{product.description}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-brand-600">
          Saznajte više
          <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function BrandCard({ brand, count }: { brand: Brand; count: number }) {
  return (
    <Link
      href={`/brendovi/${brand.slug}`}
      data-spotlight
      style={{ "--color-brand-400": brand.theme.accent } as CSSProperties}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)]"
    >
      <div className="relative aspect-[16/10] bg-white">
        <ViewTransition name={`brand-${brand.slug}`} share="morph" default="none">
          <div className="absolute inset-x-10 inset-y-12">
            <Image
              src={brand.mark}
              alt={`${brand.name} logo`}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 80vw"
              className="object-contain transition duration-500 group-hover:scale-105"
            />
          </div>
        </ViewTransition>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ background: brand.theme.accent }}
        />
      </div>
      <div className="flex flex-1 flex-col border-t border-slate-100 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-600">{brand.category}</span>
          <span className="text-xs font-medium text-muted">{brand.origin}</span>
        </div>
        <h3 className="mt-2 text-xl font-extrabold text-ink transition-colors group-hover:text-[var(--accent)]" style={{ "--accent": brand.theme.accent } as CSSProperties}>
          {brand.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{brand.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-brand-600">
          {count > 0 ? `Pogledajte proizvode (${count})` : "Saznajte više"}
          <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
