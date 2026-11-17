"use client";

import { useEffect } from "react";
import "lenis/dist/lenis.css";

/**
 * Uglađeno skrolovanje točkićem miša (Lenis).
 * - Na uređajima na dodir se ne učitava uopšte (tamo je nativno skrolovanje bolje).
 * - Na desktopu se Lenis učitava dinamički tek pri prvom okretanju točkića → nije u početnom JS-u
 *   i ne vrti requestAnimationFrame petlju dok korisnik ne počne skrolati.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      window.removeEventListener("wheel", start);
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.11,
        // Sidra (#id) prepuštamo browseru: Lenisovo računanje pozicije griješi kad se visina stranice
        // mijenja nakon učitavanja (lazy slike), a naslovi imaju scroll-margin za header.
        anchors: false,
        allowNestedScroll: true,
      });
      destroy = () => lenis.destroy();
    };

    window.addEventListener("wheel", start, { passive: true, once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("wheel", start);
      destroy?.();
    };
  }, []);
  return null;
}
