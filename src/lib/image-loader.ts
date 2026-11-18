/**
 * Loader slika za statični export (nema Next servera koji optimizuje slike na zahtjev).
 * Svaka slika iz /public (i /uploads iz admina) pri buildu dobija WebP verzije u više širina:
 *   /images/about/farmaceut.jpg  →  /_img/images/about/farmaceut.w1080.webp
 * Generiše ih `scripts/optimize-images.mjs` (iste širine kao `images.deviceSizes` + `imageSizes`).
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  // SVG, GIF i vanjske slike ostaju kakve jesu
  if (!src.startsWith("/") || /\.(svg|gif)$/i.test(src)) return src;
  const match = src.match(/^(.*)\.(jpe?g|png|webp)$/i);
  if (!match) return src;
  return `/_img${match[1]}.w${width}.webp`;
}
