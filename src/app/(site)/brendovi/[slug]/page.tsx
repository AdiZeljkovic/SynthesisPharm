import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Mail, Quote } from "lucide-react";
import { ProductCard } from "@/components/cards";
import { CtaBanner } from "@/components/CtaBanner";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Container, PageHero, SectionHeading } from "@/components/ui";
import { brandTheme, brands, getBrand } from "@/lib/brands";
import { productsByBrand } from "@/lib/products";

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/brendovi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};
  return pageMetadata({
    title: `${brand.name} – ${brand.category}`,
    description: brand.summary,
    path: `/brendovi/${brand.slug}`,
    image: brand.hero ?? brand.cover,
    imageAlt: brand.name,
  });
}

/** Svi slugovi su poznati (generateStaticParams) – stranica se generiše pri buildu. */
export default async function BrandPage({ params }: PageProps<"/brendovi/[slug]">) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();
  const items = productsByBrand(brand.slug);

  return (
    <>
      <div style={brandTheme(brand)}>
      <PageHero
        title={brand.name}
        subtitle={`${brand.category} · ${brand.origin}`}
        image={brand.hero ?? "/images/banners/proizvodi.jpg"}
        crumbs={[{ href: "/", label: "Početna" }, { href: "/brendovi", label: "Brendovi" }, { label: brand.name }]}
      />

      {/* Prekidač brendova */}
      <div className="sticky top-20 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <Container>
          <nav aria-label="Brendovi" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-2 py-3">
              {brands.map((b) => {
                const active = b.slug === brand.slug;
                return (
                  <li key={b.slug}>
                    <Link
                      href={`/brendovi/${b.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide transition ${
                        active ? "bg-brand-500 text-white" : "bg-surface text-muted hover:text-ink"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{ background: active ? "white" : b.theme.accent }}
                      />
                      {b.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>
      </div>

      <section className="py-20">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 lg:sticky lg:top-44">
              <ViewTransition name={`brand-${brand.slug}`} share="morph" default="none">
                <div className="relative mx-auto h-28 w-full max-w-60">
                  <Image src={brand.mark} alt={`${brand.name} logo`} fill sizes="240px" className="object-contain" />
                </div>
              </ViewTransition>
              <dl className="mt-8 divide-y divide-slate-100 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">Kategorija</dt>
                  <dd className="text-right font-bold text-ink">{brand.category}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">Porijeklo</dt>
                  <dd className="text-right font-bold text-ink">{brand.origin}</dd>
                </div>
                {items.length > 0 && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">Proizvoda u ponudi</dt>
                    <dd className="font-bold text-ink">{items.length}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-8" delay={100}>
            <SectionHeading eyebrow={`O kompaniji`} title={`O ${brand.name} kompaniji`} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              {brand.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {brand.mission && (
              <figure className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-leaf-50 p-8 sm:p-10">
                <Quote className="absolute right-6 top-6 size-16 text-brand-500/10" aria-hidden />
                <figcaption className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  Misija i vizija
                </figcaption>
                <blockquote className="mt-4 text-lg font-medium leading-relaxed text-ink">{brand.mission}</blockquote>
              </figure>
            )}
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface py-20">
        <Container>
          {items.length > 0 ? (
            <>
              <SectionHeading eyebrow="Asortiman" title={`${brand.name} proizvodi`} />
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 60}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Mail className="size-7" aria-hidden />
              </span>
              <h2 className="mt-6 text-2xl font-extrabold text-ink">Informacije o proizvodima</h2>
              <p className="mt-3 text-muted">
                Za detaljne informacije o {brand.name} proizvodima u našoj ponudi obratite nam se direktno – rado
                ćemo vam pomoći.
              </p>
              <div className="mt-8">
                <ButtonLink href="/kontakt">Kontaktirajte nas</ButtonLink>
              </div>
            </div>
          )}
        </Container>
      </section>

      </div>
      <CtaBanner />
    </>
  );
}
