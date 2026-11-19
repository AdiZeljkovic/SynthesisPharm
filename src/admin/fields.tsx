"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useCatalog } from "./catalog";
import { ImageField } from "./media";
import { ICONS, type Field, type Option } from "./schema";
import { Button, FieldLabel, cx, inputCls } from "./ui";

type Obj = Record<string, unknown>;

/** Forma iz šeme. "group" sa praznim ključem uređuje polja na istom nivou. */
export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div className="space-y-5">
      {fields.map((f, i) => (
        <FieldView key={f.key || `g${i}`} field={f} value={value} onChange={onChange} />
      ))}
    </div>
  );
}

function FieldView({ field, value, onChange }: { field: Field; value: Obj; onChange: (v: Obj) => void }) {
  const id = useId();
  const v = field.key === "" ? value : value?.[field.key];
  const set = (nv: unknown) => onChange(field.key === "" ? (nv as Obj) : { ...value, [field.key]: nv });

  switch (field.kind) {
    case "group":
      return (
        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-bold text-ink">{field.label}</legend>
          {field.help && <p className="-mt-1 mb-3 text-xs text-muted">{field.help}</p>}
          <Fields fields={field.fields} value={(v as Obj) ?? {}} onChange={set} />
        </fieldset>
      );
    case "text":
      return (
        <div>
          <FieldLabel label={field.label} help={field.help} htmlFor={id} required={field.required} />
          <input id={id} className={inputCls} value={String(v ?? "")} placeholder={field.placeholder} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "textarea":
      return (
        <div>
          <FieldLabel label={field.label} help={field.help} htmlFor={id} required={field.required} />
          <AutoTextarea id={id} rows={field.rows ?? 3} value={String(v ?? "")} onChange={set} />
          {field.bold && <BoldHint />}
        </div>
      );
    case "number":
      return (
        <div>
          <FieldLabel label={field.label} help={field.help} htmlFor={id} />
          <input id={id} type="number" inputMode="numeric" className={cx(inputCls, "max-w-48")} value={Number(v ?? 0)} onChange={(e) => set(Number(e.target.value))} />
        </div>
      );
    case "date":
      return (
        <div>
          <FieldLabel label={field.label} help={field.help} htmlFor={id} />
          <input id={id} type="date" className={cx(inputCls, "max-w-56")} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input type="checkbox" className="size-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} />
          {field.label}
        </label>
      );
    case "color":
      return (
        <div>
          <FieldLabel label={field.label} help={field.help} htmlFor={id} />
          <div className="flex items-center gap-3">
            <input id={id} type="color" className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" value={String(v || "#000000")} onChange={(e) => set(e.target.value)} />
            <input aria-label={`${field.label} (heks kod)`} className={cx(inputCls, "max-w-36 font-mono")} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />
          </div>
        </div>
      );
    case "image":
      return (
        <div>
          <FieldLabel label={field.label} help={field.help} required={field.required} />
          <ImageField value={String(v ?? "")} onChange={set} required={field.required} />
        </div>
      );
    case "select":
      return <SelectField id={id} field={field} value={String(v ?? "")} onChange={set} />;
    case "products":
      return <ProductsField field={field} value={(v as string[]) ?? []} onChange={set} />;
    case "strings":
      return <StringsField field={field} value={(v as string[]) ?? []} onChange={set} />;
    case "list":
      return <ListField field={field} value={(v as Obj[]) ?? []} onChange={set} />;
  }
}

function BoldHint() {
  return (
    <p className="mt-1 text-xs text-slate-400">
      Savjet: <code className="rounded bg-slate-100 px-1">**ovako**</code> se prikazuje <strong>podebljano</strong>.
    </p>
  );
}

export function AutoTextarea({ id, value, onChange, rows = 3, className }: { id?: string; value: string; onChange: (v: string) => void; rows?: number; className?: string }) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cx(inputCls, "[field-sizing:content] min-h-[4.5rem] resize-y leading-relaxed", className)}
    />
  );
}

function SelectField({ id, field, value, onChange }: { id: string; field: Extract<Field, { kind: "select" }>; value: string; onChange: (v: string) => void }) {
  const catalog = useCatalog();
  let options: Option[];
  if (field.options === "icons") options = ICONS;
  else if (field.options === "brands") options = (catalog?.brands ?? []).map((b) => ({ value: b.slug, label: b.name }));
  else options = field.options;
  if (value && !options.some((o) => o.value === value)) options = [{ value, label: value }, ...options];
  return (
    <div>
      <FieldLabel label={field.label} help={field.help} htmlFor={id} />
      <select id={id} className={cx(inputCls, "max-w-md")} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function move<T>(arr: T[], i: number, d: number) {
  const next = [...arr];
  const j = i + d;
  if (j < 0 || j >= next.length) return arr;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function MoveButtons({ i, len, onMove, onRemove, label }: { i: number; len: number; onMove: (d: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" disabled={i === 0} onClick={() => onMove(-1)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30" aria-label={`Pomjeri ${label} gore`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" disabled={i === len - 1} onClick={() => onMove(1)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30" aria-label={`Pomjeri ${label} dolje`}>
        <ArrowDown className="size-4" />
      </button>
      <button type="button" onClick={onRemove} className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label={`Obriši ${label}`}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function StringsField({ field, value, onChange }: { field: Extract<Field, { kind: "strings" }>; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <FieldLabel label={field.label} help={field.help} />
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              {field.textarea ? (
                <AutoTextarea value={s} rows={3} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
              ) : (
                <input className={inputCls} value={s} aria-label={`${field.label} ${i + 1}`} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
              )}
            </div>
            <MoveButtons i={i} len={value.length} label={field.itemLabel} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      {field.bold && <BoldHint />}
      <Button size="sm" variant="ghost" className="mt-2" icon={<Plus className="size-4" />} onClick={() => onChange([...value, ""])}>
        Dodaj {field.itemLabel}
      </Button>
    </div>
  );
}

function emptyFor(fields: Field[]): Obj {
  const o: Obj = {};
  for (const f of fields) {
    if (f.kind === "group") Object.assign(f.key === "" ? o : (o[f.key] = {}), emptyFor(f.fields));
    else if (f.kind === "list" || f.kind === "strings" || f.kind === "products") o[f.key] = [];
    else if (f.kind === "number") o[f.key] = 0;
    else if (f.kind === "checkbox") o[f.key] = false;
    else if (f.kind === "select") o[f.key] = f.options === "icons" ? ICONS[0].value : "";
    else o[f.key] = "";
  }
  return o;
}

function ListField({ field, value, onChange }: { field: Extract<Field, { kind: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <FieldLabel label={field.label} help={field.help} />
      <div className="space-y-2">
        {value.map((item, i) => {
          const title = (field.titleKey && String(item[field.titleKey] ?? "")) || `${field.itemLabel[0].toUpperCase()}${field.itemLabel.slice(1)} ${i + 1}`;
          const isOpen = open === i;
          return (
            <div key={i} className="rounded-xl ring-1 ring-slate-200">
              <div className="flex items-center gap-2 py-1 pl-3 pr-1">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm font-semibold text-ink" aria-expanded={isOpen}>
                  <ChevronDown className={cx("size-4 shrink-0 text-muted transition", isOpen && "rotate-180")} aria-hidden />
                  <span className="truncate">{title}</span>
                </button>
                <MoveButtons
                  i={i}
                  len={value.length}
                  label={field.itemLabel}
                  onMove={(d) => {
                    onChange(move(value, i, d));
                    setOpen(null);
                  }}
                  onRemove={() => {
                    onChange(value.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                />
              </div>
              {isOpen && (
                <div className="border-t border-slate-100 p-4">
                  <Fields fields={field.fields} value={item} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="mt-2"
        icon={<Plus className="size-4" />}
        onClick={() => {
          onChange([...value, emptyFor(field.fields)]);
          setOpen(value.length);
        }}
      >
        Dodaj {field.itemLabel}
      </Button>
    </div>
  );
}

function ProductsField({ field, value, onChange }: { field: Extract<Field, { kind: "products" }>; value: string[]; onChange: (v: string[]) => void }) {
  const catalog = useCatalog();
  const id = useId();
  const name = (slug: string) => catalog?.products.find((p) => p.slug === slug)?.name ?? `${slug} (ne postoji)`;
  const available = (catalog?.products ?? []).filter((p) => !value.includes(p.slug));
  return (
    <div>
      <FieldLabel label={field.label} help={field.help} htmlFor={id} />
      {value.length > 0 && (
        <ol className="mb-2 space-y-1.5">
          {value.map((slug, i) => (
            <li key={slug} className="flex items-center gap-2 rounded-xl bg-slate-50 py-1 pl-3 pr-1 text-sm ring-1 ring-slate-200">
              <span className="w-5 text-xs font-bold text-muted">{i + 1}.</span>
              <span className="flex-1 font-semibold text-ink">{name(slug)}</span>
              <MoveButtons i={i} len={value.length} label="proizvod" onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((s) => s !== slug))} />
            </li>
          ))}
        </ol>
      )}
      <select
        id={id}
        className={cx(inputCls, "max-w-md")}
        value=""
        onChange={(e) => e.target.value && onChange([...value, e.target.value])}
        disabled={!catalog}
      >
        <option value="">{catalog ? "+ Dodaj proizvod…" : "Učitavanje proizvoda…"}</option>
        {available.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
      {value.length === 0 && <p className="mt-1 text-xs text-muted">Nijedan proizvod nije izabran.</p>}
    </div>
  );
}

/* ───────── Provjera obaveznih polja ───────── */

export function validate(fields: Field[], value: Obj, trail = ""): string[] {
  const errors: string[] = [];
  for (const f of fields) {
    const v = f.key === "" ? value : value?.[f.key];
    const where = trail ? `${trail} → ${f.label}` : f.label;
    if (f.kind === "group") errors.push(...validate(f.fields, (v as Obj) ?? {}, f.key === "" ? trail : where));
    else if (f.kind === "list") ((v as Obj[]) ?? []).forEach((item, i) => errors.push(...validate(f.fields, item, `${where} ${i + 1}`)));
    else if ("required" in f && f.required && !String(v ?? "").trim()) errors.push(where);
  }
  return errors;
}

