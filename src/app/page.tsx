import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, FileText } from "lucide-react";
import { ViewTransition } from "react";
import { AboutTabs } from "@/components/AboutTabs";
import { PostCard } from "@/components/blog";
import { CtaBanner } from "@/components/CtaBanner";
import { HeroVideo } from "@/components/HeroVideo";
import { Reveal } from "@/components/Reveal";
import { SplitWords } from "@/components/SplitWords";
import { Stats } from "@/components/Stats";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { brandTheme, brands, getBrand } from "@/lib/brands";
import { featuredProducts, leafletProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Synthesis Pharma – pouzdan partner za tržište BiH",
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const latestPosts = (await getPosts()).slice(0, 3);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-brand-950 lg:min-h-[calc(100svh-7.25rem)]">
        <HeroVideo />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-950/60 to-brand-950/10"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-brand-950/70 to-transparent" />
        <Container className="w-full py-24">
          <div className="hero-fade max-w-2xl">
            <div className="animate-fade-up">
              <Eyebrow light>Synthesis Pharma · Sarajevo</Eyebrow>
            </div>
            <h1 className="split-load mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              <SplitWords text="Pouzdan partner za" />{" "}
              <span className="text-leaf-400">
                <SplitWords text="tržište BiH" offset={3} />
              </span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-white/85 [animation-delay:450ms] sm:text-xl">
              Zajedno s veledrogerijom Hercegovinalijek, renomiranim evropskim farmaceutskim kompanijama pružamo
              marketinške i prodajne usluge – od istraživanja tržišta do promocije proizvoda.
            </p>
            <div className="mt-10 flex animate-fade-up flex-wrap gap-4 [animation-delay:600ms]">
              <ButtonLink href="/brendovi">Naši brendovi</ButtonLink>
              <Link
                href="/o-nama"
                className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-bold tracking-wide text-white ring-2 ring-white/40 backdrop-blur-sm transition hover:bg-white/10"
              >
                O nama
              </Link>
            </div>
          </div>
        </Container>
        <a
          href="#o-nama"
          aria-label="Skroluj na sadržaj"
          className="hero-fade absolute bottom-8 left-1/2 hidden h-11 w-7 -translate-x-1/2 justify-center rounded-full border-2 border-white/50 pt-2 transition hover:border-white sm:flex"
        >
          <span className="h-2 w-1 animate-[scroll-dot_1.8s_ease-in-out_infinite] rounded-full bg-white" />
        </a>
      </section>

      {/* ───────── Brend traka ───────── */}
      <section aria-label="Brendovi s kojima sarađujemo" className="border-b border-slate-100 bg-white">
        <Container className="grid grid-cols-2 items-center gap-x-10 gap-y-8 py-10 md:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={`/brendovi/${b.slug}`}
              className="relative mx-auto h-12 w-full max-w-[170px] opacity-60 mix-blend-multiply grayscale transition hover:opacity-100 hover:grayscale-0"
            >
              <Image src={b.mark} alt={b.name} fill sizes="170px" className="object-contain" />
            </Link>
          ))}
        </Container>
      </section>

      {/* ───────── O nama ───────── */}
      <section id="o-nama" className="scroll-mt-24 py-24">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="O nama" title="Pouzdan partner za tržište Bosne i Hercegovine">
              <p>
                Synthesis Pharma, zajedno s veledrogerijom Hercegovinalijek, razvija partnerstvo s renomiranim
                evropskim farmaceutskim kompanijama kojima pruža marketinške i prodajne usluge, uključujući
                istraživanje tržišta, registraciju proizvoda, provođenje promotivnih aktivnosti te administrativne
                usluge prema njihovim potrebama.
              </p>
              <p className="mt-4 text-base">
                Krajnji cilj svih aktivnosti je približiti naše proizvode što većem broju korisnika i učiniti
                kvalitetnu zdravstvenu zaštitu dostupnom svima u Bosni i Hercegovini.
              </p>
            </SectionHeading>
            <div className="mt-10">
              <AboutTabs />
            </div>
          </Reveal>

          <div className="relative">
            <Reveal variant="clip" className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image
                src="/images/about/farmaceut.jpg"
                alt="Farmaceut slaže proizvode na police u skladištu Synthesis Pharme"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal
              delay={700}
              className="absolute -bottom-8 left-6 right-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_24px_60px_-20px_rgba(6,46,59,0.35)] sm:left-auto sm:right-[-1.5rem] sm:w-80"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-600">
                <Building2 className="size-6" aria-hidden />
              </span>
              <p className="text-sm leading-snug text-muted">
                U partnerstvu s veledrogerijom <strong className="text-ink">Hercegovinalijek</strong>
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ───────── Izdvojeni proizvodi ───────── */}
      <section className="bg-surface py-24">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Izdvojeni proizvodi" title="Šta nudimo?">
              Za vas smo odabrali vrhunsku ponudu mliječnih formula za dojenčad, dodataka prehrani, medicinskih proizvoda te
              proizvoda za samoliječenje.
            </SectionHeading>
            <ButtonLink href="/proizvodi" variant="outline">
              Svi proizvodi
            </ButtonLink>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 100} className={i === 0 ? "lg:row-span-2" : ""}>
                <Link
                  href={`/proizvodi/${p.slug}`}
                  data-spotlight
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)]"
                >
                  <ViewTransition name={`product-${p.slug}`} share="morph" default="none">
                    <div className={`relative overflow-hidden ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[9/5]"}`}>
                      <Image
                        src={p.photo!}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className={`transition duration-500 group-hover:scale-105 ${i === 0 ? "object-cover" : "object-contain"}`}
                      />
                    </div>
                  </ViewTransition>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                        {getBrand(p.brand)?.name}
                      </span>
                      <ArrowUpRight className="size-5 text-muted transition group-hover:text-brand-600" aria-hidden />
                    </div>
                    <h3 className="mt-2 text-xl font-extrabold text-ink">{p.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{p.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── Brendovi ───────── */}
      <section className="relative py-24">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading eyebrow="Brendovi" title="Kompanije s kojima sarađujemo">
                Ovakva saradnja donosi vrhunske rezultate – naše aktivnosti medicinskog marketinga prilagođavamo
                potrebama svake pojedine farmaceutske kompanije.
              </SectionHeading>
              <Reveal variant="clip" className="relative mt-10 hidden aspect-[3/2] overflow-hidden rounded-[2rem] lg:block">
                <Image src="/images/about/core-bg.jpg" alt="" fill sizes="40vw" className="object-cover" />
              </Reveal>
            </div>
          </div>
          <div className="grid gap-5 lg:col-span-7">
            {brands.map((b, i) => (
              <Reveal key={b.slug} delay={i * 80}>
                <Link
                  href={`/brendovi/${b.slug}`}
                  data-spotlight
                  style={brandTheme(b)}
                  className="group flex flex-col gap-6 rounded-3xl border border-slate-200/80 p-6 transition hover:border-brand-200 hover:bg-brand-50/40 sm:flex-row sm:items-center"
                >
                  <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                    <Image src={b.mark} alt={`${b.name} logo`} fill sizes="144px" className="object-contain p-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-extrabold text-ink transition-colors group-hover:text-brand-600">{b.name}</h3>
                      <ArrowUpRight
                        className="size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-leaf-600">{b.origin}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{b.summary}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── Edukativni letci ───────── */}
      <section className="bg-surface py-20">
        <Container>
          <SectionHeading eyebrow="Edukativni materijali" title="Letci za naše proizvode" center>
            Detaljne informacije o sastavu, djelovanju i preporučenoj upotrebi.
          </SectionHeading>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {leafletProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/proizvodi/${p.slug}/letak`}
                data-spotlight
                className="group flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)]"
              >
                <div className="relative h-14 w-full">
                  <Image src={p.logo!} alt={p.name} fill sizes="240px" className="object-contain" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
                  <FileText className="size-4" aria-hidden /> Pogledaj letak
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── Brojke ───────── */}
      <section className="relative isolate overflow-hidden bg-brand-950 py-24">
        <Image
          src="/images/about/team-2.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-20"
        />
        <Container>
          <SectionHeading eyebrow="U brojkama" title="Rezultati koji govore" center light />
          <div className="mt-14">
            <Stats light />
          </div>
        </Container>
      </section>

      {/* ───────── Sa bloga ───────── */}
      {latestPosts.length > 0 && (
        <section className="py-24">
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Blog" title="Najnovije sa bloga" />
              <ButtonLink href="/blog" variant="outline">
                Svi tekstovi
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((p, i) => (
                // Jedan članak → široka (istaknuta) kartica preko cijele širine
                <Reveal key={p.slug} delay={i * 100} className={latestPosts.length === 1 ? "sm:col-span-2 lg:col-span-3" : ""}>
                  <PostCard post={p} featured={latestPosts.length === 1} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBanner />    </>
  );
}
