// Pravi male HTML stranice na starim adresama (about-2.html …) koje odmah preusmjeravaju na nove.
// Glavno su 301 pravila koja se upisuju u out/web.config (URL Rewrite); ove stranice su rezerva:
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
// Prava 301 preusmjerenja: upiši mapu u out/web.config (URL Rewrite na serveru)
const wcPath = path.join(OUT, "web.config");
const wc = fs.readFileSync(wcPath, "utf8");
const entries = Object.entries(REDIRECTS)
  .filter(([file]) => file !== "index.html")
  .flatMap(([file, target]) => {
    const urls = ["/" + file];
    if (file.endsWith("/index.html")) urls.push("/" + file.slice(0, -"index.html".length));
    return urls.map((u) => `<add key="${u}" value="${target}" />`);
  });
if (!wc.includes("<!--STARE-ADRESE-->")) throw new Error("web.config nema <!--STARE-ADRESE--> oznaku");
fs.writeFileSync(wcPath, wc.replace("<!--STARE-ADRESE-->", entries.join("\n          ")));
console.log(`legacy-redirects: ${n} preusmjerenja (stranice + ${entries.length} pravila 301 u web.config)`);
