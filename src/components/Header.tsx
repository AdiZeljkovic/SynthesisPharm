"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, Mail, Menu, Phone, X } from "lucide-react";
import { nav, navProducts, site } from "@/lib/site";
import { SocialLinks } from "./SocialIcons";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Zatvori meni pri promjeni rute
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Info traka */}
      <div className="hidden bg-brand-950 text-sm text-brand-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-6">
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="size-4 text-leaf-400" aria-hidden />
              {site.email}
            </a>
            <a href={site.phoneHref} className="flex items-center gap-2 hover:text-white">
              <Phone className="size-4 text-leaf-400" aria-hidden />
              {site.phone}
            </a>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-leaf-400" aria-hidden />
              {site.hours}
            </span>
          </div>
          <SocialLinks itemClassName="grid size-7 place-items-center rounded-full transition hover:bg-white/10 hover:text-white" />
        </div>
      </div>

      <header
        style={{ viewTransitionName: "site-header" }}
        className={`sticky top-0 z-50 border-b bg-white/95 lg:bg-white/90 lg:backdrop-blur-md transition-shadow ${
          scrolled ? "border-slate-200/80 shadow-[0_8px_30px_-12px_rgba(6,46,59,0.18)]" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="Synthesis Pharma – početna">
            <Image src="/images/brand/logo.png" alt="Synthesis Pharma" width={401} height={173} className="h-12 w-auto" fetchPriority="high" loading="eager" />
          </Link>

          <nav aria-label="Glavna navigacija" className="hidden items-center lg:flex">
            <ul className="flex items-center gap-1">
              {nav.slice(0, -1).map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                        active ? "text-brand-600" : "text-ink hover:text-brand-600"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-leaf-500 transition-transform duration-300 ease-out ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul aria-label="Letci proizvoda" className="ml-4 hidden items-center gap-5 border-l border-slate-200 pl-6 xl:flex">
              {navProducts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/proizvodi/${p.slug}/letak`}
                    className="block opacity-90 transition hover:-translate-y-0.5 hover:opacity-100"
                  >
                    <Image src={p.logo} alt={p.name} width={p.width} height={p.height} className="h-[18px] w-auto" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/kontakt"
              className="hidden rounded-full bg-brand-500 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 sm:inline-flex"
            >
              Kontaktirajte nas
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-full border border-slate-200 text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobilni-meni"
              aria-label={open ? "Zatvori meni" : "Otvori meni"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobilni meni – izvan <header> jer backdrop-filter pravi containing block za fixed elemente */}
      <div
          id="mobilni-meni"
          className={`fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-white transition-[opacity,visibility] duration-300 lg:hidden ${
            open ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <nav aria-label="Mobilna navigacija" className="px-6 pb-10 pt-4">
            <ul className="divide-y divide-slate-100">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between py-4 text-xl font-bold ${
                      isActive(pathname, item.href) ? "text-brand-600" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul aria-label="Letci proizvoda" className="mt-6 grid grid-cols-2 gap-3">
              {navProducts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/proizvodi/${p.slug}/letak`}
                    className="grid h-16 place-items-center rounded-2xl border border-slate-100 px-4"
                  >
                    <Image src={p.logo} alt={p.name} width={p.width} height={p.height} className="h-5 w-auto max-w-full" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-3 rounded-2xl bg-surface p-5 text-sm">
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 font-medium">
                <Mail className="size-4 text-brand-500" aria-hidden /> {site.email}
              </a>
              <a href={site.phoneHref} className="flex items-center gap-3 font-medium">
                <Phone className="size-4 text-brand-500" aria-hidden /> {site.phone}
              </a>
              <p className="flex items-center gap-3 text-muted">
                <Clock className="size-4 text-brand-500" aria-hidden /> {site.hours}
              </p>
              <SocialLinks
                className="pt-2"
                itemClassName="grid size-9 place-items-center rounded-full bg-white text-brand-600 shadow-sm"
              />
            </div>
          </nav>
      </div>
    </>
  );
}
