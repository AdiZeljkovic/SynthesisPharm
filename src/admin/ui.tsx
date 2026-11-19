"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ───────── Dugmad ───────── */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ variant = "secondary", size = "md", loading, icon, className, children, disabled, ...rest }: BtnProps) {
  const styles = {
    primary: "bg-brand-500 text-white shadow-sm hover:bg-brand-600 disabled:bg-brand-500/50",
    secondary: "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 disabled:text-muted",
    ghost: "text-muted hover:bg-slate-100 hover:text-ink",
    danger: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  }[variant];
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        styles,
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function Spinner({ label = "Učitavanje…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden /> {label}
    </div>
  );
}

export function Card({ title, help, children, actions, className }: { title?: ReactNode; help?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
            {help && <p className="mt-1 text-sm text-muted">{help}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  const map = {
    info: ["bg-brand-50 text-brand-900 ring-brand-100", Info],
    warn: ["bg-amber-50 text-amber-900 ring-amber-200", AlertTriangle],
    error: ["bg-red-50 text-red-900 ring-red-200", AlertTriangle],
    ok: ["bg-emerald-50 text-emerald-900 ring-emerald-200", CheckCircle2],
  } as const;
  const [cls, Icon] = map[tone];
  return (
    <div className={cx("flex gap-3 rounded-xl p-4 text-sm ring-1", cls)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ───────── Modal ───────── */

export function Modal({ title, onClose, children, wide, footer }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx("flex max-h-[92svh] w-full flex-col rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl", wide ? "max-w-5xl" : "max-w-lg")}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:bg-slate-100" aria-label="Zatvori">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Potvrda u stilu admina (umjesto window.confirm). */
export function useConfirm() {
  const [state, setState] = useState<{ title: string; text: ReactNode; ok: string; danger?: boolean; resolve: (v: boolean) => void } | null>(null);
  const confirm = useCallback(
    (title: string, text: ReactNode, ok = "Potvrdi", danger = false) =>
      new Promise<boolean>((resolve) => setState({ title, text, ok, danger, resolve })),
    [],
  );
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = state ? (
    <Modal
      title={state.title}
      onClose={() => close(false)}
      footer={
        <>
          <Button onClick={() => close(false)}>Odustani</Button>
          <Button variant={state.danger ? "danger" : "primary"} onClick={() => close(true)}>
            {state.ok}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-muted">{state.text}</div>
    </Modal>
  ) : null;
  return { confirm, dialog };
}

/* ───────── Obavještenja (toast) ───────── */

type Toast = { id: number; tone: "ok" | "error" | "info"; text: ReactNode };
const ToastCtx = createContext<(tone: Toast["tone"], text: ReactNode) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], text: ReactNode) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 9000 : 5000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[110] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
              t.tone === "ok" && "bg-emerald-600 text-white",
              t.tone === "error" && "bg-red-600 text-white",
              t.tone === "info" && "bg-slate-800 text-white",
            )}
          >
            {t.tone === "ok" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0" />}
            <div>{t.text}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/* ───────── Polja forme ───────── */

export function FieldLabel({ label, help, htmlFor, required }: { label: string; help?: string; htmlFor?: string; required?: boolean }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {help && <p className="mt-0.5 text-xs text-muted">{help}</p>}
    </div>
  );
}

export const inputCls =
  "block w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500";
