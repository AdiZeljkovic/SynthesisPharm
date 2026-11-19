import type { Token } from "marked";

/**
 * Sigurnost Markdowna iz admina: sirovi HTML se prikazuje kao tekst (ne izvršava se), a linkovi i slike
 * smiju biti samo http(s), mailto, tel ili relativni. Isti sajt (origin) dijeli i admin, pa skripta u
 * članku ne smije moći ništa izvršiti. Koriste ga i sajt (lib/blog.ts) i pregled u adminu.
 */
export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function safeHref(href: string) {
  const h = href.trim();
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(h);
  return !hasScheme || /^(https?:|mailto:|tel:)/i.test(h) ? h : "#";
}

export function sanitizeTokens(token: Token) {
  if ((token.type === "link" || token.type === "image") && typeof token.href === "string") token.href = safeHref(token.href);
}

/** Renderer za sirovi HTML: prikaži ga kao običan tekst */
export const escapeRawHtml = ({ text }: { text: string }) => escapeHtml(text);
