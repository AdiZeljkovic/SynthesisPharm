import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { CSSProperties } from "react";
import { Reveal } from "./Reveal";
import { SplitWords } from "./SplitWords";
import { Container } from "./ui";
import type {
  BenefitsBlock,
  FeatureBlock,
  ImageBlock,
  LeafletBlock,
  NutrientsBlock,
  ProductBlock,
  VariantsBlock,
} from "@/lib/leaflets";

function Paragraphs({ items, className = "" }: { items?: string[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <div className={`space-y-4 text-lg leading-relaxed text-muted ${className}`}>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-6 space-y-3">
      {items.map((b, i) => (
        <li key={i} className="flex gap-3 rounded-2xl bg-white p-4 leading-relaxed text-ink ring-1 ring-slate-100">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function BlockTitle({ children }: { children: string }) {
  return (
    <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
      <SplitWords text={children} />
    </h2>
  );
}

function Variants({ block }: { block: VariantsBlock }) {
  const cols = block.items.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <Container>
      {block.title && (
        <Reveal className="mb-10 text-center">
          <BlockTitle>{block.title}</BlockTitle>
        </Reveal>
      )}
      <div className={`grid gap-6 sm:grid-cols-2 ${cols} ${block.items.length < 3 ? "mx-auto max-w-4xl" : ""}`}>
        {block.items.map((v, i) => (
          <Reveal key={v.image} delay={i * 100}>
            <figure data-spotlight className="flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100">
              {/* #f3f4f9 = pozadina letka oko pakovanja, da se slika stopi s karticom */}
              <div className="relative aspect-square bg-[#f3f4f9]">
                <Image quality={90} src={v.image} alt={v.name} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-contain p-8" />
              </div>
              <figcaption className="flex-1 border-t border-slate-100 p-6">
                <p className="font-extrabold text-ink">{v.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.caption}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

function Feature({ block, index }: { block: FeatureBlock; index: number }) {
  const text = (
    <Reveal>
      {block.title && <BlockTitle>{block.title}</BlockTitle>}
      {block.lead && (
        <p className={`text-xl font-bold leading-relaxed text-ink sm:text-2xl ${block.title ? "mt-5" : ""}`}>{block.lead}</p>
      )}
      <Paragraphs items={block.paragraphs} className={block.title || block.lead ? "mt-5" : ""} />
      <Bullets items={block.bullets} />
    </Reveal>
  );

  if (!block.image) {
    return <Container className="max-w-3xl">{text}</Container>;
  }

  const imageLeft = (block.imageSide ?? (index % 2 === 0 ? "left" : "right")) === "left";
  return (
    <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal variant="clip" className={`relative overflow-hidden rounded-[2rem] ${imageLeft ? "" : "lg:order-2"}`}>
        <Image quality={90}
          src={block.image}
          alt={block.imageAlt ?? ""}
          width={1400}
          height={1000}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-auto w-full"
        />
      </Reveal>
      {text}
    </Container>
  );
}

function Nutrients({ block }: { block: NutrientsBlock }) {
  return (
    <Container>
      <div className={block.image ? "grid items-start gap-12 lg:grid-cols-12" : ""}>
        <div className={block.image ? "lg:col-span-7" : ""}>
          {block.intro && (
            <Reveal>
              <p className="max-w-3xl text-xl font-bold leading-relaxed text-ink sm:text-2xl">{block.intro}</p>
            </Reveal>
          )}
          <div className={`mt-10 grid gap-4 sm:grid-cols-2 ${block.image ? "" : "lg:grid-cols-4"}`}>
            {block.items.map((n, i) => (
              <Reveal key={n.symbol} delay={(i % 4) * 70}>
                <div data-spotlight className="h-full overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-extrabold text-white shadow-lg shadow-brand-500/25">
                      {n.symbol}
                    </span>
                    <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink">{n.name}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{n.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        {block.image && (
          <Reveal variant="clip" className="relative overflow-hidden rounded-[2rem] lg:sticky lg:top-32 lg:col-span-5">
            <Image quality={90} src={block.image} alt={block.imageAlt ?? ""} width={1400} height={1000} sizes="(min-width: 1024px) 40vw, 100vw" className="h-auto w-full" />
          </Reveal>
        )}
      </div>
      {block.outro && (
        <Reveal>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-muted">{block.outro}</p>
        </Reveal>
      )}
    </Container>
  );
}

function Benefits({ block }: { block: BenefitsBlock }) {
  const half = Math.ceil(block.items.length / 2);
  const chip = (label: string, i: number) => (
    <Reveal key={label} delay={i * 60}>
      <li className="rounded-full bg-brand-500 px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-brand-500/20">
        {label}
      </li>
    </Reveal>
  );
  return (
    <Container>
      {block.title && (
        <Reveal className="mb-12 text-center">
          <BlockTitle>{block.title}</BlockTitle>
        </Reveal>
      )}
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <ul className="order-2 grid gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">{block.items.slice(0, half).map(chip)}</ul>
        {block.image && (
          <Reveal className="order-1 mx-auto lg:order-2">
            <div className="relative grid size-56 place-items-center rounded-full bg-white shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)] ring-8 ring-brand-50 sm:size-72">
              <Image quality={90} src={block.image} alt={block.imageAlt ?? ""} width={400} height={400} className="h-auto w-3/4" />
            </div>
          </Reveal>
        )}
        <ul className="order-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{block.items.slice(half).map((l, i) => chip(l, i + half))}</ul>
      </div>
      <Paragraphs items={block.paragraphs} className="mx-auto mt-14 max-w-3xl text-center" />
    </Container>
  );
}

function Product({ block, index, hideHeadline }: { block: ProductBlock; index: number; hideHeadline?: boolean }) {
  const color = block.color ?? "var(--color-brand-500)";
  const band = `color-mix(in oklab, ${color} 88%, black)`;
  const imageLeft = index % 2 === 1;
  return (
    <Container>
      <div className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-100">
        <div className="px-6 pt-10 sm:px-12">
          <Reveal className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{block.name}</h2>
            {block.label && (
              <span className="rounded-lg px-3 py-1 text-sm font-extrabold uppercase tracking-wide text-white" style={{ background: band }}>
                {block.label}
              </span>
            )}
          </Reveal>
        </div>
        {hideHeadline ? (
          <div className="h-8" />
        ) : (
          <Reveal className="mt-6 px-6 py-5 sm:px-12" as="div">
            <p
              className="rounded-2xl px-6 py-5 text-xl font-extrabold uppercase leading-snug tracking-wide text-white"
              style={{ background: band } as CSSProperties}
            >
              {block.headline}
            </p>
          </Reveal>
        )}
        <div className="grid gap-10 px-6 pb-12 pt-4 sm:px-12 lg:grid-cols-2 lg:items-start">
          {block.image && (
            <Reveal variant="clip" className={`relative overflow-hidden rounded-[1.5rem] bg-surface lg:sticky lg:top-32 ${imageLeft ? "" : "lg:order-2"}`}>
              <Image quality={90}
                src={block.image}
                alt={block.imageAlt ?? block.name}
                width={1400}
                height={1000}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-auto max-h-[560px] w-full object-contain"
              />
            </Reveal>
          )}
          <Reveal className={block.image ? "" : "lg:col-span-2"}>
            <Paragraphs items={block.paragraphs} className="text-base sm:text-lg" />
            <Bullets items={block.bullets} />
          </Reveal>
        </div>
      </div>
    </Container>
  );
}

function ImageFigure({ block }: { block: ImageBlock }) {
  return (
    <Container className="max-w-5xl">
      {/* Okvir je širok koliko slika smije biti uz maks. visinu 720px, pa uglovi ostaju zaobljeni */}
      <div className="mx-auto" style={{ maxWidth: `${Math.round((720 * block.width) / block.height)}px` }}>
        <Reveal variant="clip" as="figure" className="overflow-hidden rounded-[2rem]">
          <Image quality={90}
            src={block.image}
            alt={block.imageAlt}
            width={block.width}
            height={block.height}
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="h-auto w-full"
          />
          {block.caption && <figcaption className="bg-white p-5 text-center text-sm text-muted">{block.caption}</figcaption>}
        </Reveal>
      </div>
    </Container>
  );
}

/** heroTagline: naslov koji je već prikazan u heroju (ne ponavlja se u prvom bloku proizvoda). */
export function LeafletBlocks({ blocks, heroTagline }: { blocks: LeafletBlock[]; heroTagline?: string }) {
  let featureIdx = 0;
  let productIdx = 0;
  return (
    <div className="space-y-24 py-24 sm:space-y-32">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "variants":
            return <Variants key={i} block={b} />;
          case "feature":
            return <Feature key={i} block={b} index={featureIdx++} />;
          case "nutrients":
            return <Nutrients key={i} block={b} />;
          case "benefits":
            return <Benefits key={i} block={b} />;
          case "product":
            return <Product key={i} block={b} index={productIdx++} hideHeadline={b.headline === heroTagline} />;
          case "image":
            return <ImageFigure key={i} block={b} />;
        }
      })}
    </div>
  );
}
