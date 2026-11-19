import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BrandCard } from "@/components/cards";
import { CtaBanner } from "@/components/CtaBanner";
import { Reveal } from "@/components/Reveal";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { brands } from "@/lib/brands";
import { pages } from "@/lib/pages";
import { productsByBrand } from "@/lib/products";

const c = pages.brendovi;

export const metadata: Metadata = pageMetadata({
  title: c.seo.title || "Brendovi",
  description: c.seo.description,
  path: "/brendovi",
});

export default function BrandsPage() {
  return (
    <>
      <PageHero
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        image={c.hero.image}
        crumbs={[{ href: "/", label: "Početna" }, { label: c.hero.title }]}
      />
      <section className="py-24">
        <Container>
          <SectionHeading eyebrow={c.heading.eyebrow} title={c.heading.title} />
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
