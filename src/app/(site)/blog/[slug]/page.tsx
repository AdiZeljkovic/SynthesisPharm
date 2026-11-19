import type { Metadata } from "next";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft, ChevronRight, User } from "lucide-react";
import { PostCard, PostMetaLine } from "@/components/blog";
import { ProductCard } from "@/components/cards";
import { CtaBanner } from "@/components/CtaBanner";
import { Reveal } from "@/components/Reveal";
import { ShareButtons } from "@/components/ShareButtons";
import { SplitWords } from "@/components/SplitWords";
import { Container, SectionHeading } from "@/components/ui";
import { getPost, getPosts } from "@/lib/blog";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.cover,
    imageAlt: post.coverAlt,
    type: "article",
    publishedTime: post.date,
  });
}

/** Svi slugovi su poznati (generateStaticParams) – stranica se generiše pri buildu. */
export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `${site.url}/blog/${post.slug}/`;
  const products = post.products.map((s) => getProduct(s)).filter((p) => p !== undefined);
  const more = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: `${site.url}${post.cover}`,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: site.name, logo: `${site.url}/images/brand/logo.png` },
    mainEntityOfPage: url,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd
        data={breadcrumbLd([
          { href: "/", label: "Početna" },
          { href: "/blog", label: "Blog" },
          { label: post.title },
        ])}
      />

      <article>
        <header className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
          <div aria-hidden className="absolute -right-40 -top-40 size-[30rem] rounded-full bg-leaf-200/30 blur-3xl" />
          <Container className="relative max-w-4xl pb-10 pt-10 text-center">
            <nav aria-label="Putanja">
              <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted">
                {[
                  { href: "/", label: "Početna" },
                  { href: "/blog", label: "Blog" },
                ].map((c) => (
                  <li key={c.href} className="flex items-center gap-1.5">
                    <Link href={c.href} className="hover:text-brand-600">
                      {c.label}
                    </Link>
                    <ChevronRight className="size-3.5 opacity-60" aria-hidden />
                  </li>
                ))}
                <li aria-current="page" className="max-w-60 truncate font-semibold text-ink">
                  {post.title}
                </li>
              </ol>
            </nav>
            <span className="mt-10 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 ring-1 ring-brand-100">
              {post.category}
            </span>
            <h1 className="split-load mt-6 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              <SplitWords text={post.title} />
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-muted [animation-delay:300ms]">
              {post.excerpt}
            </p>
            <div className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-x-4 gap-y-2 [animation-delay:400ms]">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <User className="size-4 text-brand-500" aria-hidden /> {post.author}
              </span>
              <PostMetaLine post={post} />
            </div>
          </Container>
          <Container className="max-w-5xl pb-4">
            <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-surface shadow-[0_30px_70px_-30px_rgba(6,46,59,0.35)]">
                <Image src={post.cover} alt={post.coverAlt} fill fetchPriority="high" loading="eager" sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover object-center" />
              </div>
            </ViewTransition>
          </Container>
        </header>

        <Container className="grid gap-12 py-16 lg:grid-cols-12">
          <div
            className="prose prose-lg max-w-none lg:col-span-8 prose-headings:scroll-mt-28 prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-ink prose-p:text-muted prose-a:font-semibold prose-a:text-brand-600 prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-leaf-500 prose-blockquote:bg-leaf-50 prose-blockquote:px-6 prose-blockquote:py-1 prose-blockquote:font-semibold prose-blockquote:not-italic prose-blockquote:text-ink [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none prose-strong:text-ink prose-li:text-muted prose-li:marker:text-brand-500 prose-hr:border-slate-200"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-32">
              {post.headings.length > 1 && (
                <nav aria-label="Sadržaj članka" className="rounded-3xl bg-surface p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Sadržaj</p>
                  <ol className="mt-4 space-y-2.5 text-sm">
                    {post.headings.map((h, i) => (
                      <li key={h.id} className="flex gap-3">
                        <span className="font-bold text-brand-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        <a href={`#${h.id}`} className="font-medium text-ink transition hover:text-brand-600">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="rounded-3xl bg-surface p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Podijelite</p>
                <div className="mt-4">
                  <ShareButtons url={url} title={post.title} />
                </div>
              </div>
            </div>
          </aside>
        </Container>
      </article>

      {products.length > 0 && (
        <section className="bg-surface py-20">
          <Container>
            <SectionHeading eyebrow="Iz teksta" title="Proizvodi spomenuti u članku" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <Reveal key={p.slug}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {more.length > 0 && (
        <section className="py-20">
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Blog" title="Pročitajte još" />
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-muted transition hover:text-ink"
              >
                <ArrowLeft className="size-4" aria-hidden /> Svi tekstovi
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
