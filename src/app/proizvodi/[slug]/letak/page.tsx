import type { Metadata } from "next";
import { breadcrumbLd, metaDescription, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText, MapPin, Phone } from "lucide-react";
import { OriginalLeafletButton } from "@/components/Leaflet";
import { LeafletBlocks } from "@/components/LeafletBlocks";
import { Reveal } from "@/components/Reveal";
import { SplitWords } from "@/components/SplitWords";
import { ButtonLink, Container } from "@/components/ui";
import { getBrand } from "@/lib/brands";
import { getLeaflet, leafletSlugs, leafletTheme } from "@/lib/leaflets";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return leafletSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/proizvodi/[slug]/letak">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLeaflet(slug);
  const product = getProduct(slug);
  if (!doc || !product) return {};
  return pageMetadata({
    title: `${product.name} – ${doc.hero.tagline.replace(/\.$/, "")}`,
    description: metaDescription(doc.hero.paragraphs.join(" ")),
    path: `/proizvodi/${slug}/letak`,
    image: doc.hero.image,
    imageAlt: doc.hero.imageAlt,
  });
}

/** Svi slugovi su poznati (generateStaticParams) – stranica se generiše pri buildu. */
export default async function LeafletPage({ params }: PageProps<"/proizvodi/[slug]/letak">) {
  const { slug } = await params;
  const doc = getLeaflet(slug);
  const product = getProduct(slug);
  if (!doc || !product) notFound();
  const brand = getBrand(product.brand)!;

  const crumbs = [
    { href: "/", label: "Početna" },
    { href: "/proizvodi", label: "Proizvodi" },
    { href: `/proizvodi/${slug}`, label: product.name },
  ];

  return (
    <div style={leafletTheme(doc)}>
      <JsonLd data={breadcrumbLd([...crumbs, { label: "Letak" }])} />
      {/* ───────── Hero u bojama letka ───────── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand-500 via-brand-700 to-brand-950 text-white">
        <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[30rem] rounded-full bg-brand-400/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-24 -z-10 size-[26rem] rounded-full bg-leaf-500/25 blur-3xl" />
        <Container className="py-10">
          <nav aria-label="Putanja">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                  <ChevronRight className="size-3.5 opacity-60" aria-hidden />
                </li>
              ))}
              <li aria-current="page" className="font-semibold text-white">
                Letak
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-12 py-12 lg:grid-cols-2 lg:py-16">
            <div>
              {/* Bijeli natpis: sekundarna boja letka nije uvijek čitljiva na primarnoj */}
              <span className="inline-flex animate-fade-up items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                <span className="h-px w-8 bg-white/60" aria-hidden />
                {brand.name}
              </span>
              <h1 className="split-load mt-5 text-5xl font-extrabold tracking-tight sm:text-7xl">
                <SplitWords text={product.name} />
              </h1>
              <p className="mt-5 animate-fade-up text-2xl font-bold leading-snug text-white [animation-delay:250ms] sm:text-3xl">
                {doc.hero.tagline}
              </p>
              <div className="mt-6 animate-fade-up space-y-4 text-lg leading-relaxed text-white/85 [animation-delay:350ms]">
                {doc.hero.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {doc.hero.note && (
                <p className="mt-8 inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/20 [animation-delay:450ms]">
                  <MapPin className="size-4" aria-hidden /> {doc.hero.note}
                </p>
              )}
            </div>
            <Reveal variant="clip" className="relative mx-auto w-fit max-w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-black/30">
              <Image
                src={doc.hero.image}
                quality={90}
                alt={doc.hero.imageAlt}
                width={1400}
                height={1400}
                fetchPriority="high"
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto max-h-[600px] w-auto max-w-full"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ───────── Sadržaj letka ───────── */}
      <div className="bg-surface">
        <LeafletBlocks blocks={doc.sections} heroTagline={doc.hero.tagline} />
      </div>

      {/* ───────── Zatvaranje ───────── */}
      <section className="bg-surface pb-24">
        <Container>
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-950 px-8 py-14 text-center sm:px-14">
            <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full border-[40px] border-white/10" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{doc.closing.title}</h2>
            {doc.closing.text && <p className="relative mt-3 text-lg text-white/85">{doc.closing.text}</p>}
            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/kontakt" variant="white">
                Kontaktirajte nas
              </ButtonLink>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-white ring-2 ring-white/40 transition hover:bg-white/10"
              >
                <Phone className="size-4" aria-hidden /> {site.phone}
              </a>
              {product.leaflet && (
                <OriginalLeafletButton
                  leaflet={product.leaflet}
                  name={product.name}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-white/85 transition hover:bg-white/10 hover:text-white"
                >
                  <FileText className="size-4" aria-hidden /> Otvori u punoj veličini
                </OriginalLeafletButton>
              )}
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
