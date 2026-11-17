"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/site";

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const duration = 1600;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      setValue(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {/* Ručno formatiranje (1.037) – toLocaleString daje različit rezultat na serveru i u browseru */}
      {String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
    </span>
  );
}

export function Stats({ light = false }: { light?: boolean }) {
  return (
    <dl className="grid gap-6 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex flex-col rounded-3xl p-8 text-center ${light ? "bg-white/5 ring-1 ring-white/10" : "bg-surface"}`}
        >
          <dt className={`order-2 mt-2 text-sm font-bold uppercase tracking-[0.2em] ${light ? "text-brand-100/80" : "text-muted"}`}>
            {s.label}
          </dt>
          <dd
            className={`text-5xl font-extrabold tracking-tight sm:text-6xl ${
              light ? "text-white" : "bg-gradient-to-br from-brand-500 to-leaf-500 bg-clip-text text-transparent"
            }`}
          >
            <Counter to={s.value} />
            <span className={light ? "text-leaf-400" : ""}>+</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
