// Pravi male HTML stranice na starim adresama (about-2.html …) koje odmah preusmjeravaju na nove.
// IIS bez URL Rewrite modula ne može raditi 301 preusmjerenja iz web.config-a, pa ovo radi svuda:
// meta refresh (Google ga tretira kao trajno preusmjerenje) + canonical + JS za trenutni prelaz.
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.synthesispharma.ba";
const REDIRECTS = {
  "index.html": "/",
  "about-2.html": "/o-nama/",
  "pricing-2.html": "/brendovi/",
  "vitabiotics.html": "/brendovi/vitabiotics/",
  "lerbolario.html": "/brendovi/",
  "bayer-consumer-health.html": "/brendovi/bayer-consumer-health/",
  "recordati.html": "/brendovi/recordati/",
  "contact.html": "/kontakt/",
  "services-details.html": "/proizvodi/",
  "project-details.html": "/proizvodi/",
  // Stari WordPress letci u podfolderima (obrisani sa servera 19.11.2026.)
  "feroglobin2.html": "/proizvodi/feroglobin/letak/",
  "feroglobin/index.html": "/proizvodi/feroglobin/letak/",
  "feroglobin/feroglobin2.html": "/proizvodi/feroglobin/letak/",
  "osteocare/index.html": "/proizvodi/osteocare/letak/",
  "osteocare/osteocare2.html": "/proizvodi/osteocare/letak/",
};

const OUT = path.join(process.cwd(), "out");
let n = 0;
for (const [file, target] of Object.entries(REDIRECTS)) {
  if (file === "index.html") continue; // index.html je prava početna stranica
  const html = `<!doctype html><html lang="bs"><head><meta charset="utf-8"><title>Preusmjeravanje…</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}${target}"><meta http-equiv="refresh" content="0; url=${target}"><script>location.replace(${JSON.stringify(target)})</script></head><body><p>Stranica je premještena: <a href="${target}">${SITE}${target}</a></p></body></html>\n`;
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), html, "utf8");
  n++;
}
console.log(`legacy-redirects: ${n} preusmjerenja`);
