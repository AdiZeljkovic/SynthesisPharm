"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type NetInfo = { saveData?: boolean; effectiveType?: string };

const posterCommon = { alt: "", sizes: "100vw", quality: 60, fetchPriority: "high", loading: "eager" } as const;
const {
  props: { srcSet: posterDesktop },
} = getImageProps({ ...posterCommon, src: "/video/hero-poster.jpg", width: 1920, height: 1080 });
const {
  props: { srcSet: posterMobile, ...posterImg },
} = getImageProps({ ...posterCommon, src: "/video/hero-poster-mobile.jpg", width: 608, height: 1080 });

/**
 * Hero video, optimizovan za brzinu:
 * - LCP je optimizovana poster slika (AVIF/WebP, fetchpriority=high), ne video;
 * - video se počinje učitavati tek nakon `load` + kad je browser slobodan (requestIdleCallback);
 * - telefon dobija uspravnu, manju verziju (540×960);
 * - uz Save-Data, sporu mrežu (2G) ili "smanji animacije" video se ne učitava – ostaje poster.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
    const slow = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (slow || reduced) return;

    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      const run = () => setEnabled(true);
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(run, { timeout: 2500 });
      else timer = setTimeout(run, 800);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <>
      <div aria-hidden className="hero-parallax absolute inset-0 -z-20 origin-top">
        {/* Poster (art direction): browser preuzima samo jednu verziju – uspravnu za telefon, široku za veće ekrane */}
        <picture>
          <source media="(min-width: 768px)" srcSet={posterDesktop} sizes="100vw" />
          <source media="(max-width: 767px)" srcSet={posterMobile} sizes="100vw" />
          {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" je u posterImg (ukrasna slika) */}
          <img {...posterImg} className="absolute inset-0 size-full object-cover" />
        </picture>
        {enabled && (
          <video
            ref={ref}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => {
              setVisible(true);
              setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
          >
            <source src="/video/hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      {enabled && (
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-6 right-6 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
          aria-label={playing ? "Pauziraj video" : "Pokreni video"}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
      )}
    </>
  );
}
