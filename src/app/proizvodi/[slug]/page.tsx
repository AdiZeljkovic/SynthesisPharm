import type { Metadata } from "next";
import { breadcrumbLd, metaDescription, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, FileText, Info, Tag } from "lucide-react";
import { ProductCard } from "@/components/cards";
import { CtaBanner } from "@/components/CtaBanner";
import { SplitWords } from "@/components/SplitWords";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { brandTheme, getBrand } from "@/lib/brands";
import { getLeaflet, leafletTheme } from "@/lib/leaflets";
import { getProduct, products, productsByBrand } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/proizvodi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const brand = getBrand(product.brand);
  return pageMetadata({
    title: `${product.name} – ${brand?.name}`,
    description: metaDescription(product.description),
    path: `/proizvodi/${product.slug}`,
    image: product.photo ?? product.image,
    imageAlt: product.name,
  });
}

/**
 * Svi slugovi su poznati (generateStaticParams) pa je stranica potpuno statična.
 * `instant = false`: params se čitaju direktno, bez <Suspense> granice – sadržaj je odmah u HTML-u,
 * bez kašnjenja pri otkrivanju (LCP) i bez skoka footera (CLS).
 */
export const instant = false;

export default async function ProductPage({ params }: PageProps<"/proizvodi/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const brand = getBrand(product.brand)!;
  const leaflet = getLeaflet(product.slug);
  const related = productsByBrand(product.brand)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { href: "/", label: "Početna" },
          { href: "/proizvodi", label: "Proizvodi" },
          { href: `/brendovi/${brand.slug}`, label: brand.name },
          { label: product.name },
        ])}
      />
      <div style={brandTheme(brand)}>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
        <div aria-hidden className="absolute -right-40 -top-40 size-[30rem] rounded-full bg-leaf-200/30 blur-3xl" />
        <Container className="relative py-10">
          <nav aria-label="Putanja">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              {[
                { href: "/", label: "Početna" },
                { href: "/proizvodi", label: "Proizvodi" },
                { href: `/brendovi/${brand.slug}`, label: brand.name },
              ].map((c) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <Link href={c.href} className="hover:text-brand-600">
                    {c.label}
                  </Link>
                  <ChevronRight className="size-3.5 opacity-60" aria-hidden />
                </li>
              ))}
              <li aria-current="page" className="font-semibold text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid items-center gap-12 pb-10 lg:grid-cols-2">
            <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
              <div className="relative aspect-[57/35] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-30px_rgba(6,46,59,0.35)] ring-1 ring-slate-100">
                <Image
                  src={product.photo ?? product.image}
                  alt={product.name}
                  fill
                  fetchPriority="high"
                  loading="eager"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </ViewTransition>
            <div className="animate-fade-up">
              <Link
                href={`/brendovi/${brand.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 ring-1 ring-brand-100 hover:ring-brand-300"
              >
                {brand.name}
              </Link>
              <h1 className="split-load mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                <SplitWords text={product.name} />
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>
              <ul className="mt-8 flex flex-wrap gap-3 text-sm">
                <li className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-2 font-semibold text-leaf-700">
                  <Tag className="size-4" aria-hidden /> {brand.category}
                </li>
                {leaflet && (
                  <li>
                    <Link
                      href={`/proizvodi/${product.slug}/letak`}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      <FileText className="size-4" aria-hidden /> Edukativni letak
                    </Link>
                  </li>
                )}
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href="/kontakt">Upit o proizvodu</ButtonLink>
                <Link
                  href="/proizvodi"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-muted transition hover:text-ink"
                >
                  <ArrowLeft className="size-4" aria-hidden /> Svi proizvodi
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {leaflet && (
        <section id="letak" className="scroll-mt-28 py-16">
          <Container>
            <Link
              href={`/proizvodi/${product.slug}/letak`}
              data-spotlight
              style={leafletTheme(leaflet)}
              className="group grid items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 text-white lg:grid-cols-2"
            >
              <div className="p-8 sm:p-12">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  <FileText className="size-4" aria-hidden /> Edukativni letak
                </span>
                <p className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{leaflet.hero.tagline}</p>
                <p className="mt-4 line-clamp-3 leading-relaxed text-white/80">{leaflet.hero.paragraphs[0]}</p>
                <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brand-700 transition group-hover:bg-leaf-400 group-hover:text-brand-950">
                  Pogledaj letak
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </div>
              <div className="relative h-72 bg-white lg:h-full lg:min-h-96">
                <Image
                  src={leaflet.hero.image}
                  alt={leaflet.hero.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain transition duration-700 group-hover:scale-105"
                />
              </div>
            </Link>
          </Container>
        </section>
      )}

      <Container>
        <p className="flex items-start gap-3 rounded-2xl bg-surface p-5 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          {brand.slug === "vitabiotics"
            ? "Dodaci prehrani nisu zamjena za uravnoteženu i raznovrsnu prehranu i zdrav način života. Prije upotrebe pročitajte uputstvo, a za savjet se obratite ljekaru ili farmaceutu."
            : "Za više informacija o proizvodu i dostupnosti obratite se farmaceutu ili nas kontaktirajte."}
        </p>
      </Container>

      {related.length > 0 && (
        <section className="py-20">
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow={brand.name} title="Iz istog asortimana" />
              <ButtonLink href={`/brendovi/${brand.slug}`} variant="outline">
                Svi {brand.name} proizvodi
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      </div>
      <CtaBanner />
    </>
  );
}
