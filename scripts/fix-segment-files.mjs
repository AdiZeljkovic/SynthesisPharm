// Ispravka za Next.js statični export na Windowsu.
// Next imenuje prefetch fajlove segmenata kao `__next.<segment>.<segment>.__PAGE__.txt`, ali na Windowsu
// `path.relative` vraća "\" pa nastanu podfolderi (`__next.o-nama\__PAGE__.txt`) koje browser ne nađe (404).
// Na Linuxu (GitHub Actions) problem ne postoji; skripta tada ništa ne radi.
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
let fixed = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) flatten(p, dir);
    else walk(p);
  }
}

/** `<parent>/__next.a/b/__PAGE__.txt` → `<parent>/__next.a.b.__PAGE__.txt` */
function flatten(segmentDir, parent) {
  const stack = [segmentDir];
  while (stack.length) {
    const d = stack.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else {
        const rel = path.relative(parent, p).split(path.sep).join(".");
        fs.renameSync(p, path.join(parent, rel));
        fixed++;
      }
    }
  }
  fs.rmSync(segmentDir, { recursive: true, force: true });
}

if (process.platform === "win32" && fs.existsSync(OUT)) {
  walk(OUT);
  console.log(`fix-segment-files: ${fixed} fajlova preimenovano`);
}
