"use client";

import { startTransition, useState, ViewTransition } from "react";
import { PostCard } from "./blog";
import type { PostMeta } from "@/lib/blog-utils";

export function BlogList({ posts }: { posts: PostMeta[] }) {
  const categories = [...new Set(posts.map((p) => p.category))];
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? posts.filter((p) => p.category === active) : posts;
  const [first, ...rest] = visible;

  const chips: { key: string | null; label: string; count: number }[] = [
    { key: null, label: "Sve", count: posts.length },
    ...categories.map((c) => ({ key: c, label: c, count: posts.filter((p) => p.category === c).length })),
  ];

  return (
    <div>
      {categories.length > 1 && (
        <div role="group" aria-label="Filtriraj po kategoriji" className="mb-10 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={active === c.key}
              onClick={() => startTransition(() => setActive(c.key))}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                active === c.key ? "bg-brand-500 text-white shadow-md shadow-brand-500/25" : "bg-white text-muted hover:text-ink"
              }`}
            >
              {c.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active === c.key ? "bg-white/20" : "bg-surface"}`}>{c.count}</span>
            </button>
          ))}
        </div>
      )}

      <h2 className="sr-only">Tekstovi</h2>
      <ViewTransition key={active ?? "sve"} enter="grid-swap" exit="grid-swap" default="none">
        <div className="space-y-6">
          {first && <PostCard post={first} featured priority />}
          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </ViewTransition>
    </div>
  );
}
