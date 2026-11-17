import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { ViewTransition } from "react";
import { formatDate, type PostMeta } from "@/lib/blog-utils";

export function PostMetaLine({ post, light = false }: { post: PostMeta; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${light ? "text-white/75" : "text-muted"}`}>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden /> {post.readingMinutes} min čitanja
      </span>
    </p>
  );
}

export function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-spotlight
      className={`group flex h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_24px_50px_-20px_rgba(6,46,59,0.25)] ${
        featured ? "flex-col lg:flex-row" : "flex-col"
      }`}
    >
      <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
        <div className={`relative overflow-hidden bg-surface ${featured ? "aspect-[16/10] lg:aspect-auto lg:w-3/5" : "aspect-[16/10]"}`}>
          <Image
            src={post.cover}
            alt={post.coverAlt}
            fill
            sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            {...(featured ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
            className="object-cover object-[50%_25%] transition duration-700 group-hover:scale-105"
          />
        </div>
      </ViewTransition>
      <div className={`flex flex-1 flex-col ${featured ? "p-8 lg:p-12" : "p-6"}`}>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{post.category}</span>
        <h3
          className={`mt-3 font-extrabold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-600 ${
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          {post.title}
        </h3>
        <p className={`mt-3 leading-relaxed text-muted ${featured ? "text-base" : "line-clamp-3 text-sm"}`}>{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <PostMetaLine post={post} />
          <ArrowUpRight
            className="size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
