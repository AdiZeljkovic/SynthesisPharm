import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { Marked, Renderer } from "marked";
import { slugify, type PostMeta } from "./blog-utils";

export { formatDate, slugify, type PostMeta } from "./blog-utils";

/**
 * Blog – sloj podataka.
 * Trenutno čita Markdown fajlove iz src/content/blog/*.md (frontmatter + tekst).
 * Kad se uvede CMS/admin, mijenja se samo ovaj fajl: stranice koriste isključivo getPosts / getPost.
 */

export type Post = PostMeta & {
  html: string;
  headings: { id: string; text: string }[];
};

const DIR = path.join(process.cwd(), "src", "content", "blog");

function render(markdown: string) {
  const headings: Post["headings"] = [];
  const renderer = new Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const inner = this.parser.parseInline(tokens);
    const text = inner.replace(/<[^>]+>/g, "");
    const id = slugify(text);
    if (depth === 2) headings.push({ id, text });
    return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
  };
  const html = new Marked({ renderer, gfm: true }).parse(markdown, { async: false });
  return { html, headings };
}

async function loadAll(): Promise<Post[]> {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(DIR, file), "utf8");
      const { data, content } = matter(raw);
      const { html, headings } = render(content);
      const words = content.split(/\s+/).filter(Boolean).length;
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title),
        excerpt: String(data.excerpt ?? ""),
        date: String(data.date),
        category: String(data.category ?? "Novosti"),
        cover: String(data.cover),
        coverAlt: String(data.coverAlt ?? ""),
        author: String(data.author ?? "Synthesis Pharma"),
        products: Array.isArray(data.products) ? data.products.map(String) : [],
        draft: Boolean(data.draft),
        readingMinutes: Math.max(1, Math.round(words / 200)),
        html,
        headings,
      } satisfies Post;
    }),
  );
  return posts
    .filter((p) => !p.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Svi objavljeni postovi, najnoviji prvi (bez teksta). */
export async function getPosts(): Promise<PostMeta[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (await loadAll()).map(({ html, headings, ...meta }) => meta);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await loadAll()).find((p) => p.slug === slug);
}
