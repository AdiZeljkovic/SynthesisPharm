import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { brands } from "@/lib/brands";
import { nav, site } from "@/lib/site";
import { cacheLife } from "next/cache";
import { SocialLinks } from "./SocialIcons";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-950 text-brand-100">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[28rem] rounded-full bg-brand-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-40 size-[28rem] rounded-full bg-leaf-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="inline-block rounded-2xl bg-white px-5 py-4">
            <Image src="/images/brand/logo.png" alt="Synthesis Pharma" width={401} height={173} className="h-12 w-auto" />
          </div>
          <p className="mt-6 max-w-sm leading-relaxed text-brand-100/80">
            Pouzdan partner evropskim farmaceutskim kompanijama na tržištu Bosne i Hercegovine – od registracije
            proizvoda do promocije i prodaje.
          </p>
          <SocialLinks
            className="mt-6"
            itemClassName="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-leaf-600"
          />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Stranice</h2>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-leaf-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Brendovi</h2>
          <ul className="mt-5 space-y-3">
            {brands.map((b) => (
              <li key={b.slug}>
                <Link href={`/brendovi/${b.slug}`} className="transition hover:text-leaf-400">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Kontakt</h2>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-leaf-400" aria-hidden />
              <a href={site.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {site.address.street}, {site.address.city}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-leaf-400" aria-hidden />
              <a href={site.phoneHref} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-leaf-400" aria-hidden />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-leaf-400" aria-hidden />
              <span>{site.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-brand-100/60 sm:flex-row sm:px-6">
          <p>
            © <CurrentYear /> Synthesis Pharma. Sva prava zadržana.
          </p>
          <p>Stranicu kreirao Adi Zeljković</p>
        </div>
      </div>
    </footer>
  );
}
