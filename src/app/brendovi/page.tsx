import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BrandCard } from "@/components/cards";
import { CtaBanner } from "@/components/CtaBanner";
import { Reveal } from "@/components/Reveal";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { brands } from "@/lib/brands";
import { productsByBrand } from "@/lib/products";

export const metadata: Metadata = pageMetadata({
  title: "Brendovi",
  description: "Vitabiotics, Nestlé NAN, Bayer Consumer Health i Recordati – renomirani evropski brendovi koje Synthesis Pharma predstavlja na tržištu BiH.",
  path: "/brendovi",
});

export default function BrandsPage() {
  return (
    <>
      <PageHero
        title="Brendovi"
        subtitle="Renomirane evropske farmaceutske kompanije koje s ponosom predstavljamo na tržištu Bosne i Hercegovine."
        image="/images/banners/brendovi.jpg"
        crumbs={[{ href: "/", label: "Početna" }, { label: "Brendovi" }]}
      />
      <section className="py-24">
        <Container>
          <SectionHeading eyebrow="Naši partneri" title="Kompanije s kojima sarađujemo" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b, i) => (
              <Reveal key={b.slug} delay={i * 80}>
                <BrandCard brand={b} count={productsByBrand(b.slug).length} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
