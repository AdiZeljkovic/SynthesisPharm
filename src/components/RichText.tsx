import { Fragment } from "react";

/**
 * Tekst iz admina sa podebljanim dijelovima: **ovako** → <strong>ovako</strong>.
 * Ništa drugo se ne tumači (bez HTML-a), pa je sigurno za bilo kakav unos.
 */
export function RichText({ text, strongClassName = "text-ink" }: { text: string; strongClassName?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className={strongClassName}>
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
