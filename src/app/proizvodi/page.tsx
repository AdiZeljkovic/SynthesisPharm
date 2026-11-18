import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CtaBanner } from "@/components/CtaBanner";
import { ProductCatalog } from "@/components/ProductCatalog";
import { Container, PageHero } from "@/components/ui";
import { brands } from "@/lib/brands";
import { products, productsByBrand } from "@/lib/products";

export const metadata: Metadata = pageMetadata({
  title: "Proizvodi",
  description: "Dodaci prehrani Vitabiotics – pregled proizvoda iz ponude Synthesis Pharme.",
  path: "/proizvodi",
});

export default function ProductsPage() {
  const filters = brands
    .map((b) => ({ slug: b.slug, name: b.name, count: productsByBrand(b.slug).length }))
    .filter((f) => f.count > 0);

  return (
    <>
      <PageHero
        title="Proizvodi"
        subtitle="Vrhunska ponuda dodataka prehrani renomiranih evropskih brendova."
        image="/images/banners/proizvodi.jpg"
        crumbs={[{ href: "/", label: "Početna" }, { label: "Proizvodi" }]}
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
