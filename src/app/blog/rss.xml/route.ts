import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const dynamic = "force-static";


const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site.url}/blog/${p.slug}/</link>
      <guid>${site.url}/blog/${p.slug}/</guid>
      <pubDate>${new Date(`${p.date}T08:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Synthesis Pharma – Blog</title>
    <link>${site.url}/blog/</link>
    <description>Savjeti o zdravlju, prehrani i proizvodima iz ponude Synthesis Pharme.</description>
    <language>bs</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
