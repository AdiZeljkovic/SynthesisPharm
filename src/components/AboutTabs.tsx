"use client";

import { useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export type AboutTab = { label: string; items: string[] };

export function AboutTabs({ tabs: allTabs }: { tabs: AboutTab[] }) {
  const tabs = allTabs.filter((t) => t.label.trim());
  const [active, setActive] = useState(0);
  const id = useId();

  if (tabs.length === 0) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="O nama" className="inline-flex flex-wrap rounded-full bg-surface p-1.5" onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button
            key={i}
            id={`${id}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
              active === i ? "bg-brand-500 text-white shadow-md shadow-brand-500/30" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={i}
          id={`${id}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
          className="mt-6"
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.items.filter(Boolean).map((item, j) => (
              <li key={j} className="flex animate-fade-up items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 font-semibold text-ink">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
