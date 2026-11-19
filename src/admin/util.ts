import { slugify } from "@/lib/blog-utils";

export { slugify };

/* ───────── Blog: Markdown sa zaglavljem (frontmatter) ───────── */

export type PostData = {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  cover: string;
  coverAlt: string;
  author: string;
  products: string[];
  draft: boolean;
};

export const POST_KEYS: (keyof PostData)[] = ["title", "excerpt", "date", "category", "cover", "coverAlt", "author", "products", "draft"];

/** Čita zaglavlje koje pravi serializePost (vrijednosti su JSON – ujedno ispravan YAML). */
export function parsePost(raw: string): { data: PostData; body: string } {
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  const data: Record<string, unknown> = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
      if (!kv) continue;
      const v = kv[2].trim();
      try {
        data[kv[1]] = JSON.parse(v);
      } catch {
        data[kv[1]] = v.replace(/^['"]|['"]$/g, "");
      }
    }
  }
  return {
    data: {
      title: String(data.title ?? ""),
      excerpt: String(data.excerpt ?? ""),
      date: String(data.date ?? today()),
      category: String(data.category ?? ""),
      cover: String(data.cover ?? ""),
      coverAlt: String(data.coverAlt ?? ""),
      author: String(data.author ?? "Synthesis Pharma"),
      products: Array.isArray(data.products) ? data.products.map(String) : [],
      draft: data.draft === true || data.draft === "true",
    },
    body: (m ? text.slice(m[0].length) : text).replace(/^\n+/, ""),
  };
}

export function serializePost(data: PostData, body: string) {
  const lines = POST_KEYS.filter((k) => k !== "draft" || data.draft).map((k) => `${k}: ${JSON.stringify(data[k])}`);
  return `---\n${lines.join("\n")}\n---\n\n${body.replace(/\r\n/g, "\n").trim()}\n`;
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ───────── Slike: smanjenje u browseru prije slanja ───────── */

const MAX_SIDE = 2400;

/**
 * Fotografije s mobitela (5–10 MB) smanjuje na najviše 2400 px i ~85% JPEG kvalitet prije slanja,
 * pa je otpremanje brzo, a server ne odbija velike fajlove. PNG ostaje PNG (zbog providne pozadine).
 */
export async function prepareImage(file: File): Promise<{ blob: Blob; name: string }> {
  const base = file.name.replace(/\.[^.]+$/, "") || "slika";
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== "function") {
    return { blob: file, name: file.name };
  }
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { blob: file, name: file.name };
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const isPng = file.type === "image/png";
  const isJpeg = file.type === "image/jpeg";
  // JPEG se uvijek ponovo snima: uklanja EXIF (lokacija GPS, model telefona) prije objave
  if (scale === 1 && !isJpeg && file.size < 1.5 * 1024 * 1024) {
    bmp.close();
    return { blob: file, name: file.name };
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const type = isPng ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.86));
  if (!blob) return { blob: file, name: file.name };
  // Original zadržavamo samo ako nije JPEG (EXIF) i ponovno snimanje ne bi ništa smanjilo
  if (!isJpeg && blob.size >= file.size) return { blob: file, name: file.name };
  return { blob, name: `${base}.${isPng ? "png" : "jpg"}` };
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "upravo";
  if (s < 3600) return `prije ${Math.round(s / 60)} min`;
  if (s < 86400) return `prije ${Math.round(s / 3600)} h`;
  const d = new Date(iso);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`;
}

/** Vrijednost na putanji ("" = sam objekat) */
export function getAt(obj: Record<string, unknown>, key: string) {
  return key === "" ? obj : (obj?.[key] as unknown);
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
