"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FacebookIcon, LinkedinIcon } from "./SocialIcons";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url);
  const btn =
    "grid size-11 place-items-center rounded-full bg-surface text-ink ring-1 ring-slate-200 transition hover:bg-brand-500 hover:text-white hover:ring-brand-500";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopirajte link:", url);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Podijeli „${title}” na Facebooku`}
        className={btn}
      >
        <FacebookIcon className="size-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Podijeli „${title}” na LinkedInu`}
        className={btn}
      >
        <LinkedinIcon className="size-4" />
      </a>
      <button type="button" onClick={copy} aria-label="Kopiraj link" className={btn}>
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </button>
      <span aria-live="polite" className="text-sm font-semibold text-leaf-600">
        {copied ? "Link kopiran" : ""}
      </span>
    </div>
  );
}
