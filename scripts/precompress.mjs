// Pravi Brotli (.br) verzije tekstualnih fajlova u out/ (HTML, JS, CSS, RSC .txt, XML…).
// IIS na hostingu kompresuje fajl tek kad se zatraži 2× u 10 s (frequentHitThreshold, zaključano na
// shared hostingu), pa bi većina posjetilaca dobila nekompresovane fajlove. web.config (URL Rewrite)
// zato poslužuje ove .br fajlove svakom browseru koji podržava Brotli.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUT = path.join(process.cwd(), "out");
const EXT = /\.(html|js|css|txt|xml|svg|json|webmanifest)$/i;
let count = 0;
let before = 0;
let after = 0;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.test(e.name)) yield p;
  }
}

for (const file of walk(OUT)) {
  const data = fs.readFileSync(file);
  if (data.length < 1024) continue; // mali fajlovi: kompresija ne donosi ništa
  const br = zlib.brotliCompressSync(data, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: data.length },
  });
  fs.writeFileSync(file + ".br", br);
  count++;
  before += data.length;
  after += br.length;
}
console.log(`precompress: ${count} fajlova, ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB (Brotli)`);
