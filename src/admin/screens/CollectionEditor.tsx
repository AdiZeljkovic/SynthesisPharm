"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../api";
import { refreshCatalog, useCatalog } from "../catalog";
import { Fields, validate } from "../fields";
import { Thumb } from "../media";
import { useSaver } from "../publish";
import { go, useDirtyGuard } from "../router";
import type { CollectionDef } from "../schema";
import { Button, Card, FieldLabel, Notice, Spinner, cx, inputCls, useConfirm } from "../ui";
import { clone, slugify } from "../util";
import { EditorFrame, RequiredErrors } from "./DocEditor";

type Item = Record<string, unknown> & { slug: string; name: string };

/**
 * Brendovi / proizvodi: cijela lista je jedan JSON fajl. Lista i uređivanje stavke dijele isto stanje,
 * pa se nesačuvane izmjene ne gube pri prelasku između njih.
 */
export function CollectionEditor({ def, slug }: { def: CollectionDef; slug?: string }) {
  const [orig, setOrig] = useState<Item[] | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  // Stavke dodane u ovoj sesiji (slug se može mijenjati dok nisu sačuvane)
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const { save, saving, dialog } = useSaver();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const catalog = useCatalog();

  useEffect(() => {
    api.file(def.path).then(
      (f) => {
        const data = JSON.parse(f.content) as Item[];
        setOrig(data);
        setItems(clone(data));
        setSha(f.sha);
      },
      (e) => setError((e as Error).message),
    );
  }, [def.path]);

  /** Nova prazna stavka na kraju liste, odmah otvorena za uređivanje */
  const addNew = () => {
    if (!items) return;
    const next = [...items, { ...clone(def.empty), slug: "", name: "" } as Item];
    setItems(next);
    setFresh(new Set(fresh).add(next.length - 1));
    go(`/${def.id}/@${next.length - 1}`);
  };

  const dirty = !!items && JSON.stringify(items) !== JSON.stringify(orig);
  useDirtyGuard(dirty, `#/${def.id}`);

  const index = useMemo(() => {
    if (!items || !slug || slug === "novi") return -1;
    if (slug.startsWith("@")) return Number(slug.slice(1));
    return items.findIndex((i) => i.slug === slug);
  }, [items, slug]);

  const checkAll = () => {
    if (!items) return ["?"];
    const errs: string[] = [];
    const seen = new Set<string>();
    items.forEach((it, i) => {
      const label = it.name || `${def.singular} ${i + 1}`;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(it.slug)) errs.push(`${label} → Adresa (samo mala slova, brojevi i crtice)`);
      else if (seen.has(it.slug)) errs.push(`${label} → Adresa "${it.slug}" već postoji`);
      seen.add(it.slug);
      errs.push(...validate(def.fields, it).map((e) => `${label} → ${e}`));
    });
    return errs;
  };

  const onSave = async () => {
    if (!items) return;
    const errs = checkAll();
    setErrors(errs);
    if (errs.length) return;
    const res = await save({
      message: `Admin: ${def.title}`,
      files: [{ path: def.path, content: JSON.stringify(items, null, 2) + "\n", baseSha: sha }],
    });
    if (res) {
      setOrig(clone(items));
      setSha(res.files[def.path] ?? sha);
      setFresh(new Set());
      // Novi slug u adresi umjesto @indeks
      if (index >= 0 && slug?.startsWith("@")) history.replaceState(null, "", `#/${def.id}/${items[index].slug}`);
      if (catalog) {
        const brands = def.id === "brendovi" ? items.map((b) => ({ slug: b.slug, name: b.name })) : catalog.brands;
        const products = def.id === "proizvodi" ? items.map((p) => ({ slug: p.slug, name: p.name, brand: String(p.brand) })) : catalog.products;
        refreshCatalog({ brands, products });
      }
    }
  };

  const remove = async (i: number) => {
    if (!items) return;
    const it = items[i];
    if (def.id === "brendovi") {
      const used = catalog?.products.filter((p) => p.brand === it.slug) ?? [];
      if (used.length) {
        await confirm("Brend ima proizvode", `Brend "${it.name}" ima ${used.length} proizvoda. Prvo njih obrišite ili prebacite na drugi brend.`, "U redu");
        return;
      }
    }
    if (def.id === "proizvodi" && it.leaflet) {
      await confirm("Proizvod ima letak", `"${it.name}" ima edukativni letak (posebnu stranicu), pa se ne može obrisati iz admina.`, "U redu");
      return;
    }
    const ok = await confirm(`Obrisati ${def.singular}?`, `"${it.name || "bez naziva"}" će biti uklonjen sa sajta kad sačuvate izmjene.`, "Obriši", true);
    if (!ok) return;
    setItems(items.filter((_, j) => j !== i));
    setFresh(new Set([...fresh].filter((j) => j !== i).map((j) => (j > i ? j - 1 : j))));
    go(`/${def.id}`);
  };

  const moveItem = (i: number, d: number) => {
    if (!items) return;
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setFresh(new Set([...fresh].map((k) => (k === i ? j : k === j ? i : k))));
  };

  const frame = (content: React.ReactNode, title: React.ReactNode, extra?: { url?: string; back?: boolean }) => (
    <EditorFrame
      title={title}
      url={extra?.url}
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      onReset={() => {
        setItems(clone(orig));
        setFresh(new Set());
        setErrors([]);
        go(`/${def.id}`);
      }}
      back={
        extra?.back && (
          <a href={`#/${def.id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> {def.title}
          </a>
        )
      }
      actions={
        !extra?.back && (
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={addNew} disabled={!items}>
            Dodaj {def.singular}
          </Button>
        )
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      {!items && !error && <Spinner />}
      {errors.length > 0 && <RequiredErrors errors={errors} />}
      {content}
      {dialog}
      {confirmDialog}
    </EditorFrame>
  );

  /* ───── Uređivanje jedne stavke ───── */
  if (items && slug && slug !== "novi") {
    const it = items[index];
    if (!it) return frame(<Notice tone="warn">Stavka nije pronađena.</Notice>, def.title, { back: true });
    const isNew = fresh.has(index);
    const update = (nv: Record<string, unknown>) => {
      const next = { ...nv } as Item;
      // Adresa se pravi iz naziva dok stavka nije sačuvana
      if (isNew && (it.slug === "" || it.slug === slugify(it.name))) next.slug = slugify(String(next.name ?? ""));
      setItems(items.map((x, j) => (j === index ? next : x)));
    };
    return frame(
      <>
        <Card>
          <Fields fields={def.fields.slice(0, 1)} value={it} onChange={update} />
          <div className="mt-5">
            <FieldLabel
              label="Adresa stranice"
              htmlFor="slug"
              help={isNew ? "Pravi se automatski iz naziva. Nakon prvog čuvanja se više ne mijenja." : "Adresa se ne mijenja da ne bi prestali raditi postojeći linkovi."}
            />
            <div className="flex items-center gap-1 text-sm text-muted">
              <span className="shrink-0">{def.urlPrefix}</span>
              <input
                id="slug"
                className={cx(inputCls, "max-w-xs font-mono", !isNew && "bg-slate-50 text-muted")}
                value={it.slug}
                readOnly={!isNew}
                onChange={(e) => setItems(items.map((x, j) => (j === index ? { ...x, slug: slugify(e.target.value) } : x)))}
              />
              <span>/</span>
            </div>
          </div>
        </Card>
        <Card>
          <Fields fields={def.fields.slice(1)} value={it} onChange={update} />
        </Card>
        <div className="flex justify-end">
          <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => remove(index)}>
            Obriši {def.singular}
          </Button>
        </div>
      </>,
      it.name || `Novi ${def.singular}`,
      { url: isNew ? undefined : `${def.urlPrefix}${it.slug}/`, back: true },
    );
  }

  /* ───── Lista ───── */
  const brandName = (s: unknown) => catalog?.brands.find((b) => b.slug === s)?.name ?? String(s);
  return frame(
    items && (
      <Card>
        <ul className="divide-y divide-slate-100">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <a href={`#/${def.id}/${fresh.has(i) || !it.slug ? `@${i}` : it.slug}`} className="flex min-w-0 flex-1 items-center gap-4 rounded-xl p-1 hover:bg-slate-50">
                <span className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                  {it[def.imageKey] ? <Thumb path={String(it[def.imageKey])} w={160} className="h-full w-full object-contain p-1" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{it.name || "(bez naziva)"}</span>
                  <span className="block truncate text-xs text-muted">
                    {def.subtitleKey === "brand" ? brandName(it.brand) : String(it[def.subtitleKey] ?? "")}
                    {fresh.has(i) && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">nije sačuvano</span>}
                  </span>
                </span>
              </a>
              <div className="flex shrink-0 items-center">
                <button type="button" disabled={i === 0} onClick={() => moveItem(i, -1)} className="hidden size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30 sm:grid" aria-label="Pomjeri gore">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => moveItem(i, 1)} className="hidden size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30 sm:grid" aria-label="Pomjeri dolje">
                  <ArrowDown className="size-4" />
                </button>
                <a href={`#/${def.id}/${fresh.has(i) || !it.slug ? `@${i}` : it.slug}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100" aria-label={`Uredi ${it.name}`}>
                  <Pencil className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">Redoslijed ovdje je redoslijed prikaza na sajtu.</p>
      </Card>
    ),
    def.title,
  );
}
