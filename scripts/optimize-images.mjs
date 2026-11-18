// Pravi WebP verzije svih slika u više širina za statični export (vidi src/lib/image-loader.ts).
//   public/images/a/b.jpg  →  public/_img/images/a/b.w1080.webp
// Pokreće se prije `next build`; postojeće (novije od izvora) verzije se preskaču.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Moraju se poklapati sa images.imageSizes + images.deviceSizes u next.config.ts
const WIDTHS = [96, 256, 384, 640, 828, 1080, 1600, 2400];
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(PUBLIC, "_img");
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

let made = 0;
let skipped = 0;
const started = Date.now();

for (const src of SOURCES) {
  for (const file of walk(path.join(PUBLIC, src))) {
    const rel = path.relative(PUBLIC, file).split(path.sep).join("/");
    // Originalni štampani letci (images/leaflets/<ime>.jpg) prikazuju se neoptimizovani (unoptimized),
    // a Jointace je viši od WebP limita (16 383 px) – preskačemo ih.
    if (/^images\/leaflets\/[^/]+\.(jpe?g|png)$/i.test(rel)) continue;
    const base = rel.replace(EXT, "");
    const srcTime = fs.statSync(file).mtimeMs;
    const meta = await sharp(file).metadata();
    for (const w of WIDTHS) {
      const out = path.join(OUT, `${base}.w${w}.webp`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) {
        skipped++;
        continue;
      }
      fs.mkdirSync(path.dirname(out), { recursive: true });
      // Bez povećavanja: širina veća od originala dobija original (ime ostaje isto zbog loadera)
      await sharp(file)
        .rotate()
        .resize({ width: Math.min(w, meta.width ?? w), withoutEnlargement: true })
        .webp({ quality: qualityFor(rel), effort: 5 })
        .toFile(out);
      made++;
    }
  }
}

console.log(`optimize-images: ${made} napravljeno, ${skipped} preskočeno (${((Date.now() - started) / 1000).toFixed(1)} s)`);
