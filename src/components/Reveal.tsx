"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** fade: blago izranjanje · clip: slika se otkriva "zavjesom" */
  variant?: "fade" | "clip";
};

/**
 * Jedan zajednički IntersectionObserver za sve Reveal elemente na stranici
 * (bez scroll-listenera i čitanja layouta pri skrolovanju → nema forced reflow).
 */
let sharedObserver: IntersectionObserver | null = null;
function observer() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            sharedObserver!.unobserve(e.target);
          }
        }
      },
      // threshold 0 + negativna donja margina: element se otkriva čim ~10% ekrana uđe u njega,
      // bez obzira koliko je visok (radi i za elemente više od ekrana)
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
  }
  return sharedObserver;
}

/** Animacija pojavljivanja pri skrolanju (poštuje prefers-reduced-motion kroz CSS). */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0, variant = "fade" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = observer();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${variant === "clip" ? "reveal-clip" : "reveal"} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
