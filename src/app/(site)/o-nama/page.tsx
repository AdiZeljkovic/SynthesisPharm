import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { AboutTabs } from "@/components/AboutTabs";
import { CtaBanner } from "@/components/CtaBanner";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Stats } from "@/components/Stats";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { icon } from "@/lib/icons";
import { pages, paragraphs } from "@/lib/pages";

const c = pages.oNama;

export const metadata: Metadata = pageMetadata({
  title: c.seo.title || "O nama",
  description: c.seo.description,
  path: "/o-nama",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        image={c.hero.image}
        crumbs={[{ href: "/", label: "Početna" }, { label: c.hero.title }]}
      />

      <section className="py-24">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <Reveal variant="clip" className="relative mt-12 aspect-[2/3] overflow-hidden rounded-[2rem]">
                <Image
                  src={c.intro.image1}
                  alt={c.intro.image1Alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </Reveal>
              <Reveal variant="clip" delay={200} className="relative aspect-[2/3] overflow-hidden rounded-[2rem]">
                <Image
                  src={c.intro.image2}
                  alt={c.intro.image2Alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </Reveal>
            </div>
          </div>

          <Reveal className="order-1 lg:order-2" delay={100}>
            <SectionHeading eyebrow={c.intro.eyebrow} title={c.intro.title}>
              {paragraphs(c.intro.paragraphs).map((p, i) => (
                <p key={i} className={i > 0 ? "mt-4 text-base" : undefined}>
                  <RichText text={p} />
                </p>
              ))}
            </SectionHeading>
            <div className="mt-10">
              <AboutTabs tabs={c.tabs} />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface py-24">
        <Container>
          <SectionHeading eyebrow={c.services.eyebrow} title={c.services.title} center>
            {c.services.text}
          </SectionHeading>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.services.items.map((s, i) => {
              const Icon = icon(s.icon);
              return (
                <Reveal key={i} delay={i * 80}>
                  <div data-spotlight className="h-full overflow-hidden rounded-3xl bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)]">
                    <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 text-white">
                      <Icon className="size-7" aria-hidden />
                    </span>
                    <h3 className="mt-6 text-lg font-extrabold text-ink">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative isolate overflow-hidden bg-brand-950 py-24">
        <div aria-hidden className="absolute -left-32 top-0 -z-10 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden className="absolute -right-32 bottom-0 -z-10 size-96 rounded-full bg-leaf-500/20 blur-3xl" />
        <Container>
          <SectionHeading eyebrow={c.values.eyebrow} title={c.values.title} center light />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {c.values.items.map((v, i) => {
              const Icon = icon(v.icon);
              return (
                <div key={i} className="flex items-center gap-5 rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-leaf-500/15 text-leaf-400">
                    <Icon className="size-7" aria-hidden />
                  </span>
                  <h3 className="text-lg font-bold text-white">{v.title}</h3>
                </div>
              );
            })}
          </div>
          <div className="mt-16">
            <Stats light />
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
