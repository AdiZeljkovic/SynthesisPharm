import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { BadgeCheck, ClipboardCheck, FileSearch, HeartPulse, Megaphone, ShieldCheck, Stethoscope } from "lucide-react";
import { AboutTabs } from "@/components/AboutTabs";
import { CtaBanner } from "@/components/CtaBanner";
import { Reveal } from "@/components/Reveal";
import { Stats } from "@/components/Stats";
import { Container, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "O nama",
  description: "Synthesis Pharma, zajedno s veledrogerijom Hercegovinalijek, razvija partnerstvo s renomiranim evropskim farmaceutskim kompanijama na tržištu BiH.",
  path: "/o-nama",
});

const services = [
  {
    icon: FileSearch,
    title: "Istraživanje tržišta",
    text: "Analiza tržišta Bosne i Hercegovine i prilika za pozicioniranje svakog proizvoda.",
  },
  {
    icon: ClipboardCheck,
    title: "Registracija proizvoda",
    text: "Priprema i vođenje postupka registracije proizvoda u skladu s domaćim propisima.",
  },
  {
    icon: Megaphone,
    title: "Promotivne aktivnosti",
    text: "Aktivnosti medicinskog marketinga prilagođene potrebama svake farmaceutske kompanije.",
  },
  {
    icon: Stethoscope,
    title: "Administrativne usluge",
    text: "Administrativna podrška partnerima prema njihovim potrebama, uz distribuciju preko Hercegovinalijeka.",
  },
];

const values = [
  { icon: HeartPulse, title: "Unapređenje zdravstva" },
  { icon: ShieldCheck, title: "Visokokvalitetna zdravstvena zaštita" },
  { icon: BadgeCheck, title: "Kvalitetni proizvodi" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="O nama"
        subtitle="Pouzdan partner evropskim farmaceutskim kompanijama na tržištu Bosne i Hercegovine."
        image="/images/about/team-2.jpg"
        crumbs={[{ href: "/", label: "Početna" }, { label: "O nama" }]}
      />

      <section className="py-24">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <Reveal variant="clip" className="relative mt-12 aspect-[2/3] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/about/farmaceut.jpg"
                  alt="Farmaceut slaže proizvode na police u skladištu"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </Reveal>
              <Reveal variant="clip" delay={200} className="relative aspect-[2/3] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/about/team-2.jpg"
                  alt="Visokoregalno skladište veledrogerije"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </Reveal>
            </div>
          </div>

          <Reveal className="order-1 lg:order-2" delay={100}>
            <SectionHeading eyebrow="Ko smo" title="Pouzdan partner za tržište BiH">
              <p>
                Synthesis Pharma, zajedno s veledrogerijom Hercegovinalijek, razvija partnerstvo s renomiranim
                evropskim farmaceutskim kompanijama kojima pruža marketinške i prodajne usluge, uključujući
                istraživanje tržišta, registraciju proizvoda, provođenje promotivnih aktivnosti te administrativne
                usluge prema njihovim potrebama.
              </p>
              <p className="mt-4 text-base">
                Naše aktivnosti medicinskog marketinga prilagođavamo potrebama svake pojedine farmaceutske kompanije
                kako bismo ih što bolje pozicionirali na tržištu Bosne i Hercegovine. Krajnji cilj svih aktivnosti je
                približiti naše proizvode što većem broju korisnika i učiniti kvalitetnu zdravstvenu zaštitu
                dostupnom svim korisnicima u Bosni i Hercegovini.
              </p>
              <p className="mt-4 text-base">
                Ovakva saradnja donosi vrhunske rezultate, što pokazuje i uspješna saradnja s brendovima kao što su
                Bayer Consumer Health, Vitabiotics, Recordati i Nestlé NAN.
              </p>
            </SectionHeading>
            <div className="mt-10">
              <AboutTabs />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface py-24">
        <Container>
          <SectionHeading eyebrow="Šta radimo" title="Usluge za naše partnere" center>
            Kompletna podrška farmaceutskim kompanijama – od prvog koraka na tržištu do proizvoda na policama
            apoteka.
          </SectionHeading>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div data-spotlight className="h-full overflow-hidden rounded-3xl bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)]">
                  <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 text-white">
                    <s.icon className="size-7" aria-hidden />
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative isolate overflow-hidden bg-brand-950 py-24">
        <div aria-hidden className="absolute -left-32 top-0 -z-10 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden className="absolute -right-32 bottom-0 -z-10 size-96 rounded-full bg-leaf-500/20 blur-3xl" />
        <Container>
          <SectionHeading eyebrow="Naše vrijednosti" title="Ono što nas pokreće" center light />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="flex items-center gap-5 rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-leaf-500/15 text-leaf-400">
                  <v.icon className="size-7" aria-hidden />
                </span>
                <h3 className="text-lg font-bold text-white">{v.title}</h3>
              </div>
            ))}
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
