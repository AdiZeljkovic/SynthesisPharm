"use client";

/* eslint-disable @next/next/no-img-element -- admin prikazuje preglede iz PHP API-ja, ne optimizovane slike */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { api, type MediaItem } from "./api";
import { Button, Modal, Notice, Spinner, cx, inputCls, useToast } from "./ui";
import { formatBytes, prepareImage } from "./util";

/** Pregled slike (preko PHP-a – radi i za slike koje još nisu objavljene). */
export function Thumb({ path, w = 400, className, alt = "" }: { path: string; w?: 160 | 400 | 1200; className?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  if (!path) return null;
  if (failed)
    return <div className={cx("grid place-items-center bg-slate-100 text-xs text-muted", className)}>Pregled nije dostupan</div>;
  return <img src={api.imgUrl(path, w)} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />;
}

let cache: MediaItem[] | null = null;

export function useUpload() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const upload = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const { blob, name } = await prepareImage(file);
        const res = await api.upload(blob, name);
        cache = cache ? [{ path: res.path, size: res.size, pending: true }, ...cache] : null;
        toast("ok", "Slika je otpremljena. Na sajtu će se pojaviti nakon što sačuvate izmjene.");
        return res.path;
      } catch (e) {
        toast("error", (e as Error).message);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [toast],
  );
  return { upload, busy };
}

export function MediaLibrary({ onSelect, selected }: { onSelect?: (path: string) => void; selected?: string }) {
  const [items, setItems] = useState<MediaItem[] | null>(cache);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, busy } = useUpload();
  const toast = useToast();

  const reload = async () => {
    setError("");
    try {
      const res = await api.media(true);
      cache = res.items;
      setItems(res.items);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (cache) return;
    api.media().then(
      (res) => {
        cache = res.items;
        setItems(res.items);
      },
      (e) => setError((e as Error).message),
    );
  }, []);

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const path = await upload(file);
    if (path) {
      setItems(cache);
      onSelect?.(path);
    }
  };

  const discard = async (path: string) => {
    try {
      await api.discard(path);
      cache = (cache ?? []).filter((i) => i.path !== path);
      setItems(cache);
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (items ?? []).filter((i) => !term || i.path.toLowerCase().includes(term));
  }, [items, q]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onFiles(e.dataTransfer.files);
      }}
      className={cx("rounded-2xl transition", drag && "bg-brand-50 ring-2 ring-brand-400")}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" icon={<Upload className="size-4" />} loading={busy} onClick={() => fileRef.current?.click()}>
          Otpremi novu sliku
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pretraži po nazivu…" className={cx(inputCls, "pl-9")} aria-label="Pretraga slika" />
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="size-4" />} onClick={reload}>
          Osvježi
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">Možete i prevući sliku ovdje. Velike fotografije se automatski smanjuju na 2400 px.</p>

      {error && (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {!items && !error && <Spinner />}
      {items && shown.length === 0 && <p className="py-10 text-center text-sm text-muted">Nema slika.</p>}

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shown.map((item) => {
          const isSel = selected === item.path;
          const name = item.path.split("/").pop();
          return (
            <li key={item.path} className="group relative">
              <button
                type="button"
                disabled={!onSelect}
                onClick={() => onSelect?.(item.path)}
                className={cx(
                  "block w-full overflow-hidden rounded-xl bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] text-left ring-1 transition",
                  isSel ? "ring-2 ring-brand-500" : "ring-slate-200",
                  onSelect && "hover:ring-brand-400",
                )}
              >
                <Thumb path={item.path} w={160} className="aspect-[4/3] w-full object-contain" />
                <span className="block truncate bg-white px-2 py-1.5 text-xs text-muted" title={item.path}>
                  {name}
                </span>
                {isSel && (
                  <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand-500 text-white">
                    <Check className="size-4" />
                  </span>
                )}
              </button>
              {item.pending && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">Čeka objavu</span>
              )}
              {item.pending && (
                <button
                  type="button"
                  onClick={() => discard(item.path)}
                  className="absolute bottom-9 right-2 hidden size-7 place-items-center rounded-full bg-white text-red-600 shadow group-hover:grid"
                  aria-label="Ukloni neobjavljenu sliku"
                  title="Ukloni (još nije objavljena)"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
              {!onSelect && <span className="mt-1 block text-[11px] text-slate-400">{formatBytes(item.size)}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MediaPicker({ value, onSelect, onClose }: { value?: string; onSelect: (path: string) => void; onClose: () => void }) {
  return (
    <Modal title="Izaberite sliku" onClose={onClose} wide>
      <MediaLibrary
        selected={value}
        onSelect={(p) => {
          onSelect(p);
          onClose();
        }}
      />
    </Modal>
  );
}

export function ImageField({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-xl bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] ring-1 ring-slate-200 transition hover:ring-brand-400 sm:w-44"
        aria-label={value ? "Promijeni sliku" : "Izaberi sliku"}
      >
        {value ? (
          <Thumb path={value} w={400} className="h-full w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs font-medium text-muted">
            <ImagePlus className="size-6" aria-hidden /> Izaberi sliku
          </span>
        )}
      </button>
      <div className="min-w-0 flex-1">
        {value && <p className="truncate text-xs text-muted" title={value}>{value}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setOpen(true)} icon={<ImagePlus className="size-4" />}>
            {value ? "Promijeni" : "Izaberi ili otpremi"}
          </Button>
          {value && !required && (
            <Button size="sm" variant="ghost" onClick={() => onChange("")}>
              Ukloni
            </Button>
          )}
        </div>
      </div>
      {open && <MediaPicker value={value} onSelect={onChange} onClose={() => setOpen(false)} />}
    </div>
  );
}
