import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";
import { Reveal } from "./Reveal";
import { SplitWords } from "./SplitWords";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-leaf-300" : "text-brand-600"
      }`}
    >
      <span className={`h-px w-8 ${light ? "bg-leaf-300" : "bg-leaf-500"}`} aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {typeof title === "string" ? <SplitWords text={title} /> : title}
      </h2>
      {children && (
        <div className={`mt-5 text-lg leading-relaxed ${light ? "text-brand-100/80" : "text-muted"}`}>{children}</div>
      )}
    </Reveal>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "white";
}) {
  const styles = {
    primary: "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600",
    outline: "border-2 border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white",
    white: "bg-white text-brand-700 hover:bg-leaf-600 hover:text-white",
  }[variant];
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold tracking-wide transition ${styles}`}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

export type Crumb = { href?: string; label: string };

export function PageHero({
  title,
  subtitle,
  image,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  image: string;
  crumbs: Crumb[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <Image
        src={image}
        alt=""
        fill
        fetchPriority="high"
        loading="eager"
        quality={50}
        sizes="100vw"
        className="-z-10 animate-[hero-zoom_2.4s_cubic-bezier(0.22,1,0.36,1)_both] object-cover opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-900/40"
      />
      <Container className="py-20 sm:py-24">
        <nav aria-label="Putanja">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-brand-100/80">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-leaf-300">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="split-load mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          <SplitWords text={title} />
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl animate-fade-up text-lg leading-relaxed text-brand-100/85 [animation-delay:120ms]">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}
