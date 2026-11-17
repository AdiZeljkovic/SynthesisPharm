"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import type { Leaflet as LeafletType } from "@/lib/products";

/** Dugme koje otvara originalni (štampani) letak preko cijelog ekrana, sa zumiranjem. */
export function OriginalLeafletButton({
  leaflet,
  name,
  className = "",
  children,
}: {
  leaflet: LeafletType;
  name: string;
  className?: string;
  children: ReactNode;
}) {
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const alt = `${name} – edukativni letak`;

  const open = () => {
    setZoomed(false);
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" onClick={open} className={className}>
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={alt}
        onClose={() => (document.documentElement.style.overflow = "")}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="leaflet-dialog fixed inset-0 m-0 size-full max-h-none max-w-none bg-brand-950/90 p-0 backdrop:bg-transparent backdrop:backdrop-blur-md"
      >
        <div className="sticky top-0 z-10 flex justify-end gap-2 p-4">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Umanji" : "Uvećaj"}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
          >
            {zoomed ? <ZoomOut className="size-5" /> : <ZoomIn className="size-5" />}
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Zatvori"
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </div>
        <div
          data-lenis-prevent
          className="absolute inset-0 overflow-auto overscroll-contain pb-10 pt-20"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={`mx-auto block px-4 ${zoomed ? "w-max cursor-zoom-out" : "w-full max-w-4xl cursor-zoom-in"}`}
            aria-label={zoomed ? "Umanji" : "Uvećaj"}
          >
            {/* Originalna rezolucija (bez optimizacije) da tekst bude oštar pri uvećanju */}
            <Image
              src={leaflet.src}
              alt={alt}
              width={leaflet.width}
              height={leaflet.height}
              unoptimized
              className={`h-auto rounded-xl shadow-2xl ${zoomed ? "w-[1600px] max-w-none" : "w-full"}`}
            />
          </button>
        </div>
      </dialog>
    </>
  );
}
