"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
import { api } from "../api";
import { Fields, validate } from "../fields";
import { useSaver } from "../publish";
import { useDirtyGuard } from "../router";
import type { DocDef, Field } from "../schema";
import { Button, Card, Notice, Spinner } from "../ui";
import { clone } from "../util";

type Obj = Record<string, unknown>;

/** Uređivanje jednog JSON fajla (stranica ili opšte informacije). */
export function DocEditor({ def }: { def: DocDef }) {
  const [orig, setOrig] = useState<Obj | null>(null);
  const [draft, setDraft] = useState<Obj | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const { save, saving, dialog } = useSaver();

  useEffect(() => {
    api.file(def.path).then(
      (f) => {
        const data = JSON.parse(f.content) as Obj;
        setOrig(data);
        setDraft(clone(data));
        setSha(f.sha);
      },
      (e) => setError((e as Error).message),
    );
  }, [def.path]);

  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(orig);
  useDirtyGuard(dirty);

  const onSave = async () => {
    if (!draft) return;
    const errs = validate(def.fields, draft);
    setErrors(errs);
    if (errs.length) return;
    const res = await save({
      message: `Admin: ${def.title}`,
      files: [{ path: def.path, content: JSON.stringify(draft, null, 2) + "\n", baseSha: sha }],
    });
    if (res) {
      setOrig(clone(draft));
      setSha(res.files[def.path] ?? sha);
    }
  };

  return (
    <EditorFrame
      title={def.title}
      description={def.description}
      url={def.url}
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      onReset={() => {
        setDraft(clone(orig));
        setErrors([]);
      }}
    >
      {error && <Notice tone="error">{error}</Notice>}
      {!draft && !error && <Spinner />}
      {errors.length > 0 && <RequiredErrors errors={errors} />}
      {draft && <TopFields fields={def.fields} value={draft} onChange={setDraft} />}
      {dialog}
    </EditorFrame>
  );
}

/** Polja najvišeg nivoa: svaka grupa u svojoj kartici. */
export function TopFields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <>
      {fields.map((f, i) =>
        f.kind === "group" ? (
          <Card key={f.key || i} title={f.label} help={f.help}>
            <Fields
              fields={f.fields}
              value={f.key === "" ? value : ((value[f.key] as Obj) ?? {})}
              onChange={(nv) => onChange(f.key === "" ? nv : { ...value, [f.key]: nv })}
            />
          </Card>
        ) : (
          <Card key={f.key || i}>
            <Fields fields={[f]} value={value} onChange={onChange} />
          </Card>
        ),
      )}
    </>
  );
}

export function RequiredErrors({ errors }: { errors: string[] }) {
  return (
    <Notice tone="error">
      <p className="font-semibold">Popunite obavezna polja:</p>
      <ul className="mt-1 list-disc pl-5">
        {errors.slice(0, 8).map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </Notice>
  );
}

export function EditorFrame({
  title,
  description,
  url,
  dirty,
  saving,
  onSave,
  onReset,
  actions,
  back,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  url?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  actions?: ReactNode;
  back?: ReactNode;
  children: ReactNode;
}) {
  // Ctrl+S / Cmd+S čuva
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, onSave]);

  return (
    <div className="pb-28">
      {back}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-slate-100 hover:text-ink">
              <ExternalLink className="size-4" aria-hidden /> Pogledaj na sajtu
            </a>
          )}
        </div>
      </header>
      <div className="space-y-5">{children}</div>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition lg:left-72 ${
          dirty || saving ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!dirty && !saving}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">{saving ? "Čuvanje…" : "Imate nesačuvane izmjene."}</p>
          <div className="flex gap-2">
            {onReset && (
              <Button variant="ghost" icon={<RotateCcw className="size-4" />} onClick={onReset} disabled={saving}>
                <span className="hidden sm:inline">Poništi</span>
              </Button>
            )}
            <Button variant="primary" icon={<Save className="size-4" />} loading={saving} onClick={onSave}>
              Sačuvaj i objavi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
