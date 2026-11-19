import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Rss } from "lucide-react";
import { BlogList } from "@/components/BlogList";
import { CtaBanner } from "@/components/CtaBanner";
import { Container, PageHero } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { pages } from "@/lib/pages";

const c = pages.blog;

export const metadata: Metadata = {
  ...pageMetadata({
    title: c.seo.title || "Blog",
    description: c.seo.description,
    path: "/blog",
  }),
  alternates: { canonical: "/blog/", types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHero
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        image={c.hero.image}
        crumbs={[{ href: "/", label: "Početna" }, { label: c.hero.title }]}
      />
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          {posts.length > 0 ? (
            <BlogList posts={posts} />
          ) : (
            <p className="rounded-3xl bg-white p-12 text-center text-muted">{c.empty}</p>
          )}
          <p className="mt-12 text-center text-sm text-muted">
            <a href="/blog/rss.xml" className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-600">
              <Rss className="size-4" aria-hidden /> RSS
            </a>
          </p>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
