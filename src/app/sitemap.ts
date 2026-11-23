import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { brands } from "@/lib/brands";
import { leafletSlugs } from "@/lib/leaflets";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

export const dynamic = "force-static";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/o-nama", "/brendovi", "/proizvodi", "/blog", "/kontakt"].map((p) => ({
    url: `${site.url}${p}/`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const posts = await getPosts();
  return [
    ...pages,
    ...brands.map((b) => ({ url: `${site.url}/brendovi/${b.slug}/`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${site.url}/proizvodi/${p.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...leafletSlugs.map((s) => ({ url: `${site.url}/proizvodi/${s}/letak/`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}/`,
      ...(/^\d{4}-\d{2}-\d{2}$/.test(p.date) ? { lastModified: p.date } : {}),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
