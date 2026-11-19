import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CtaBanner } from "@/components/CtaBanner";
import { ProductCatalog } from "@/components/ProductCatalog";
import { Container, PageHero } from "@/components/ui";
import { brands } from "@/lib/brands";
import { pages } from "@/lib/pages";
import { products, productsByBrand } from "@/lib/products";

const c = pages.proizvodi;

export const metadata: Metadata = pageMetadata({
  title: c.seo.title || "Proizvodi",
  description: c.seo.description,
  path: "/proizvodi",
});

export default function ProductsPage() {
  const filters = brands
    .map((b) => ({ slug: b.slug, name: b.name, count: productsByBrand(b.slug).length }))
    .filter((f) => f.count > 0);

  return (
    <>
      <PageHero
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        image={c.hero.image}
        crumbs={[{ href: "/", label: "Početna" }, { label: c.hero.title }]}
      />
      <section className="bg-surface py-16">
        <Container>
          <ProductCatalog products={products} filters={filters} />
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
