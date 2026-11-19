// Pravi WebP verzije svih slika u više širina za statični export (vidi src/lib/image-loader.ts).
//   public/images/a/b.jpg  →  public/_img/images/a/b.w1080.webp
// Pokreće se prije `next build`. Već obrađene slike se preskaču po sadržaju (SHA-1 u public/_img/manifest.json),
// pa keš radi i na GitHub Actions (gdje git checkout mijenja vrijeme fajlova). Verzije obrisanih slika se brišu.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Moraju se poklapati sa images.imageSizes + images.deviceSizes u next.config.ts
const WIDTHS = [96, 256, 384, 640, 828, 1080, 1600, 2400];
const VERSION = 1; // povećati pri promjeni postavki (kvaliteta, širine) da se sve ponovo napravi
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(PUBLIC, "_img");
const MANIFEST = path.join(OUT, "manifest.json");
const SOURCES = ["images", "uploads", "video"]; // video/ sadrži postere
const EXT = /\.(jpe?g|png|webp)$/i;

// Kvaliteta: letci (sitan tekst, pakovanja) viša, posteri niža (zatamnjeni su)
const qualityFor = (rel) => (rel.includes("/leaflets/") ? 88 : rel.startsWith("video/") ? 70 : 80);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.test(e.name)) yield p;
  }
}

const variants = (rel) => WIDTHS.map((w) => path.join(OUT, `${rel.replace(EXT, "")}.w${w}.webp`));

let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (manifest.__version !== VERSION) manifest = {};
} catch {}
const next = { __version: VERSION };

let made = 0;
let skipped = 0;
const started = Date.now();

for (const src of SOURCES) {
  for (const file of walk(path.join(PUBLIC, src))) {
    const rel = path.relative(PUBLIC, file).split(path.sep).join("/");
    // Originalni štampani letci (images/leaflets/<ime>.jpg) prikazuju se neoptimizovani (unoptimized),
    // a Jointace je viši od WebP limita (16 383 px) – preskačemo ih.
    if (/^images\/leaflets\/[^/]+\.(jpe?g|png)$/i.test(rel)) continue;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex");
    next[rel] = hash;
    const outs = variants(rel);
    if (manifest[rel] === hash && outs.every((o) => fs.existsSync(o))) {
      skipped++;
      continue;
    }
    const meta = await sharp(file).metadata();
    for (const [i, out] of outs.entries()) {
      const w = WIDTHS[i];
      fs.mkdirSync(path.dirname(out), { recursive: true });
      // Bez povećavanja: širina veća od originala dobija original (ime ostaje isto zbog loadera)
      await sharp(file)
        .rotate()
        .resize({ width: Math.min(w, meta.width ?? w), withoutEnlargement: true })
        .webp({ quality: qualityFor(rel), effort: 5 })
        .toFile(out);
    }
    made++;
  }
}

// Obrisane izvorne slike → obriši i njihove verzije
let removed = 0;
for (const rel of Object.keys(manifest)) {
  if (rel === "__version" || rel in next) continue;
  for (const o of variants(rel)) if (fs.existsSync(o)) fs.rmSync(o), removed++;
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 1));
console.log(
  `optimize-images: ${made} slika obrađeno, ${skipped} bez promjene, ${removed} starih verzija obrisano (${((Date.now() - started) / 1000).toFixed(1)} s)`,
);
