"use client";

import { useMemo, useRef, useState } from "react";
import { Marked } from "marked";
import { escapeRawHtml, sanitizeTokens } from "@/lib/markdown-safety";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote } from "lucide-react";
import { api } from "./api";
import { MediaPicker } from "./media";
import { cx } from "./ui";

// Isto čišćenje kao na sajtu: sirovi HTML kao tekst, samo sigurni linkovi
const previewMarked = new Marked({ gfm: true, walkTokens: sanitizeTokens, renderer: { html: escapeRawHtml } });

const TOOLS = [
  { id: "h2", icon: <Heading2 className="size-4" />, label: "Podnaslov" },
  { id: "h3", icon: <Heading3 className="size-4" />, label: "Manji podnaslov" },
  { id: "bold", icon: <Bold className="size-4" />, label: "Podebljano" },
  { id: "italic", icon: <Italic className="size-4" />, label: "Kurziv" },
  { id: "ul", icon: <List className="size-4" />, label: "Lista" },
  { id: "ol", icon: <ListOrdered className="size-4" />, label: "Numerisana lista" },
  { id: "quote", icon: <Quote className="size-4" />, label: "Istaknuti citat" },
  { id: "link", icon: <Link2 className="size-4" />, label: "Link" },
  { id: "image", icon: <ImagePlus className="size-4" />, label: "Slika" },
  { id: "hr", icon: <Minus className="size-4" />, label: "Linija" },
] as const;

/** Uređivač teksta članka (Markdown) sa alatnom trakom i pregledom. */
export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [picker, setPicker] = useState(false);

  /** Omotaj označeni tekst (npr. **…**) ili ubaci tekst na početak linija. */
  const apply = (kind: "wrap" | "line" | "insert", a: string, b = a) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = value.slice(s, e);
    let next = value;
    let cursor = s;
    if (kind === "wrap") {
      const inner = sel || "tekst";
      next = value.slice(0, s) + a + inner + b + value.slice(e);
      cursor = s + a.length + inner.length + b.length;
    } else if (kind === "line") {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const block = value.slice(lineStart, e) || "";
      const lines = block.split("\n").map((l, i) => (a === "1. " ? `${i + 1}. ` : a) + l.replace(/^(#{1,6} |> |- |\d+\. )/, ""));
      next = value.slice(0, lineStart) + lines.join("\n") + value.slice(e);
      cursor = lineStart + lines.join("\n").length;
    } else {
      const before = value.slice(0, s);
      const pad = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      next = before + pad + a + "\n\n" + value.slice(e);
      cursor = s + pad.length + a.length + 2;
    }
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    });
  };

  const link = () => {
    const url = window.prompt("Adresa linka (npr. https://… ili /proizvodi/osteocare/):", "https://");
    if (url) apply("wrap", "[", `](${url})`);
  };

  const html = useMemo(() => {
    if (tab !== "preview") return "";
    const out = previewMarked.parse(value, { async: false }) as string;
    // Slike iz admina prikaži preko API-ja (nove slike još nisu na sajtu)
    return out.replace(/src="(\/(?:uploads|images)\/[^"]+)"/g, (_, p: string) => `src="${api.imgUrl(p, 1200)}"`);
  }, [tab, value]);

  const runTool = (id: (typeof TOOLS)[number]["id"]) => {
    if (id === "h2") apply("line", "## ");
    else if (id === "h3") apply("line", "### ");
    else if (id === "bold") apply("wrap", "**");
    else if (id === "italic") apply("wrap", "*");
    else if (id === "ul") apply("line", "- ");
    else if (id === "ol") apply("line", "1. ");
    else if (id === "quote") apply("line", "> ");
    else if (id === "link") link();
    else if (id === "image") setPicker(true);
    else apply("insert", "---");
  };

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-500">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Oblikovanje teksta">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              aria-label={t.label}
              disabled={tab === "preview"}
              onClick={() => runTool(t.id)}
              className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-white hover:text-ink disabled:opacity-40"
            >
              {t.icon}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-slate-200">
          {(["edit", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cx("rounded-md px-3 py-1 text-xs font-bold", tab === t ? "bg-brand-500 text-white" : "text-muted hover:text-ink")}
            >
              {t === "edit" ? "Pisanje" : "Pregled"}
            </button>
          ))}
        </div>
      </div>
      {tab === "edit" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          aria-label="Tekst članka"
          className="block min-h-[28rem] w-full resize-y border-0 bg-white p-4 font-mono text-[14px] leading-relaxed text-ink focus:outline-none focus:ring-0"
          placeholder={"Počnite pisati…\n\n## Podnaslov\n\nTekst paragrafa. **Podebljano**, *kurziv*.\n\n- stavka liste"}
        />
      ) : (
        <div
          className="prose max-w-none bg-white p-6 prose-headings:font-extrabold prose-headings:text-ink prose-a:text-brand-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: html || "<p><em>Nema teksta.</em></p>" }}
        />
      )}
      <p className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-muted">
        Prazan red = novi paragraf · <code>## </code> podnaslov (pojavljuje se i u sadržaju članka) · <code>**tekst**</code> podebljano
      </p>
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(p) => {
            const alt = window.prompt("Kratak opis slike (za slabovide i Google):", "") ?? "";
            apply("insert", `![${alt.replace(/[[\]]/g, "")}](${p})`);
          }}
        />
      )}
    </div>
  );
}
