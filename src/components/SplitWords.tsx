import { Fragment, type CSSProperties } from "react";

/**
 * Dijeli tekst na riječi koje izranjaju jedna za drugom.
 * Animacija se pokreće kad roditelj dobije klasu `is-visible` (Reveal) ili odmah s `split-load` na roditelju.
 * `offset` nastavlja brojanje kad se naslov sastoji od više dijelova.
 */
export function SplitWords({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(" ").filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="split-word">
            <span style={{ "--i": i + offset } as CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}
