"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, ExternalLink, Loader2 } from "lucide-react";
import { api, ApiError, type Run } from "./api";
import { cx, useConfirm, useToast } from "./ui";
import { timeAgo } from "./util";

type Ctx = {
  runs: Run[] | null;
  error: string;
  refresh: () => void;
  /** Poslije čuvanja: prati objavu ovog commita */
  expect: (commit: string) => void;
  expected: string | null;
};

const PublishCtx = createContext<Ctx>({ runs: null, error: "", refresh: () => {}, expect: () => {}, expected: null });
export const usePublish = () => useContext(PublishCtx);

const active = (r?: Run) => !!r && r.status !== "completed";

export function PublishProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [error, setError] = useState("");
  const [expected, setExpected] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const refresh = useCallback(async () => {
    try {
      const res = await api.status();
      setRuns(res.runs);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const expect = useCallback(
    (commit: string) => {
      setExpected(commit);
      setTimeout(refresh, 4000);
      // Ako GitHub ne pokrene objavu (npr. Actions isključen), ne prikazuj "Pokreće se…" zauvijek
      setTimeout(() => setExpected((cur) => (cur === commit ? null : cur)), 10 * 60 * 1000);
    },
    [refresh],
  );

  // Dok objava traje (ili čekamo da GitHub pokrene novu) provjerava svakih 8 s, inače svake minute
  const latest = runs?.[0];
  const seen = expected ? runs?.find((r) => r.commit === expected) : undefined;
  const waiting = !!expected && (!seen || active(seen));
  useEffect(() => {
    if (!enabled) return;
    timer.current = setTimeout(refresh, runs === null ? 0 : waiting || active(latest) ? 8000 : 60000);
    return () => clearTimeout(timer.current);
  }, [enabled, runs, waiting, latest, refresh]);

  useEffect(() => {
    if (expected && seen && !active(seen)) {
      const t = setTimeout(() => setExpected(null), 30000);
      return () => clearTimeout(t);
    }
  }, [expected, seen]);

  return <PublishCtx.Provider value={{ runs, error, refresh, expect, expected }}>{children}</PublishCtx.Provider>;
}

export function describeRun(run: Run | undefined, waitingForNew: boolean) {
  if (waitingForNew) return { tone: "busy" as const, text: "Pokreće se objava…" };
  if (!run) return { tone: "idle" as const, text: "Još nema objava" };
  if (run.status !== "completed") return { tone: "busy" as const, text: "Objavljuje se… (2–4 min)" };
  if (run.conclusion === "success") {
    if (run.deploy === "preskočeno") return { tone: "idle" as const, text: "Sajt napravljen · postavljanje na server isključeno" };
    return { tone: "ok" as const, text: "Objavljeno" };
  }
  if (run.conclusion === "cancelled") return { tone: "idle" as const, text: "Objava otkazana" };
  return { tone: "error" as const, text: "Objava nije uspjela" };
}

export function StatusIcon({ tone, className = "size-4" }: { tone: "busy" | "ok" | "error" | "idle"; className?: string }) {
  if (tone === "busy") return <Loader2 className={cx(className, "animate-spin text-amber-500")} aria-hidden />;
  if (tone === "ok") return <CheckCircle2 className={cx(className, "text-emerald-600")} aria-hidden />;
  if (tone === "error") return <AlertTriangle className={cx(className, "text-red-600")} aria-hidden />;
  return <CircleDashed className={cx(className, "text-slate-400")} aria-hidden />;
}

export function PublishBadge() {
  const { runs, expected, error } = usePublish();
  if (error && !runs) return null;
  const seen = expected ? runs?.find((r) => r.commit === expected) : undefined;
  const d = describeRun(seen ?? runs?.[0], !!expected && !seen);
  return (
    <a
      href="#/"
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
        d.tone === "busy" && "bg-amber-50 text-amber-900 ring-amber-200",
        d.tone === "ok" && "bg-emerald-50 text-emerald-900 ring-emerald-200",
        d.tone === "error" && "bg-red-50 text-red-900 ring-red-200",
        d.tone === "idle" && "bg-slate-50 text-slate-700 ring-slate-200",
      )}
      title="Stanje objave sajta"
    >
      <StatusIcon tone={d.tone} className="size-3.5" />
      <span className="hidden sm:inline">{d.text}</span>
    </a>
  );
}

export function RunList() {
  const { runs, error } = usePublish();
  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!runs) return <p className="text-sm text-muted">Učitavanje…</p>;
  if (runs.length === 0) return <p className="text-sm text-muted">Još nema objava.</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {runs.slice(0, 6).map((r) => {
        const d = describeRun(r, false);
        return (
          <li key={r.id} className="flex items-center gap-3 py-2.5 text-sm">
            <StatusIcon tone={d.tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{r.title}</p>
              <p className="text-xs text-muted">
                {d.text} · {timeAgo(r.created)}
              </p>
            </div>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-brand-600" aria-label="Detalji na GitHubu" title="Detalji (GitHub)">
              <ExternalLink className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Čuvanje sa provjerom konflikta: ako je fajl u međuvremenu promijenjen, pita da li pregaziti. */
export function useSaver() {
  const toast = useToast();
  const { expect } = usePublish();
  const { confirm, dialog } = useConfirm();
  const [saving, setSaving] = useState(false);

  const save = async (body: Parameters<typeof api.save>[0], okText = "Sačuvano. Izmjene će biti vidljive na sajtu za 2–4 minute.") => {
      setSaving(true);
      try {
        let res;
        try {
          res = await api.save(body);
        } catch (e) {
          if (e instanceof ApiError && e.status === 409 && e.data?.conflicts) {
            const ok = await confirm(
              "Sadržaj je u međuvremenu promijenjen",
              "Neko je (možda vi u drugom prozoru) sačuvao novu verziju dok ste uređivali. Ako nastavite, vaša verzija će zamijeniti tu izmjenu.",
              "Sačuvaj moju verziju",
              true,
            );
            if (!ok) return null;
            res = await api.save({ ...body, force: true });
          } else throw e;
        }
        expect(res.commit);
        toast("ok", okText);
        return res;
      } catch (e) {
        toast("error", (e as Error).message);
        return null;
      } finally {
        setSaving(false);
      }
  };

  return { save, saving, dialog };
}
