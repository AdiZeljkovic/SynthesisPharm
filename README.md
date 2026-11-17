# Synthesis Pharma – web stranica

Nova verzija stranice [synthesispharma.ba](https://www.synthesispharma.ba), napravljena u **Next.js 16** (App Router, TypeScript, Tailwind CSS v4).

## Pokretanje

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # produkcija
```

## Struktura

| Ruta | Opis |
| --- | --- |
| `/` | Početna – video hero, o nama, izdvojeni proizvodi, brendovi, letci, brojke |
| `/o-nama` | O kompaniji, usluge, vrijednosti |
| `/brendovi` | Pregled brendova |
| `/brendovi/[slug]` | Vitabiotics, L'Erbolario, Bayer Consumer Health, Recordati |
| `/proizvodi` | Katalog s filterom po brendu i pretragom |
| `/proizvodi/[slug]` | Stranica proizvoda (+ najava letka gdje postoji) |
| `/proizvodi/[slug]/letak` | Edukativni letak kao HTML stranica (Osteocare, Feroglobin, Neurozan, Jointace) |
| `/blog` | Blog – istaknuti post, filter po kategoriji, RSS (`/blog/rss.xml`) |
| `/blog/[slug]` | Post – sadržaj članka, dijeljenje, povezani proizvodi, „Pročitajte još” |
| `/kontakt` | Kontakt forma (Server Action + SMTP), podaci, mapa |

## Uređivanje sadržaja

Sav sadržaj je u `src/lib/`:

- `site.ts` – kontakt podaci, radno vrijeme, društvene mreže, navigacija, brojke
- `brands.ts` – brendovi (opis, misija, logo)
- `products.ts` – proizvodi (naziv, opis, slika, letak)

Slike su u `public/images/`, video u `public/video/`.

Letci: tekst je u `src/content/leaflets/<slug>.json` (blokovi: `variants`, `feature`, `nutrients`, `benefits`,
`product`, `image` – tipovi su opisani u `src/lib/leaflets.ts`), slike u `public/images/leaflets/<slug>/`.
Originalni štampani letak (`public/images/leaflets/<slug>.jpg`) i dalje se može otvoriti preko cijelog ekrana.

Novi proizvod: dodati sliku `public/images/products/<slug>.jpg` (570×350) i unos u `products.ts`.

## Blog

Postovi su Markdown fajlovi u `src/content/blog/<slug>.md`. Zaglavlje (frontmatter):

```yaml
title: "Naslov posta"
excerpt: "Kratak opis za kartice i Google"
date: "2026-11-17"
category: "Zdravlje kostiju"
cover: "/images/blog/naslovna.jpg"
coverAlt: "Opis slike"
author: "Synthesis Pharma"
products: ["osteocare"]   # povezani proizvodi (slugovi), opcionalno
draft: true               # opcionalno – nacrt se vidi samo u `npm run dev`
```

Ispod zaglavlja ide tekst u Markdownu (`##` naslovi automatski grade „Sadržaj” članka).
Sav pristup postovima ide kroz `src/lib/blog.ts` (`getPosts`, `getPost`) – kad se uvede admin/CMS, mijenja se samo taj fajl.

## SEO i performanse

- Metapodaci svake stranice idu kroz `pageMetadata()` iz `src/lib/seo.ts` (title, description, canonical, OpenGraph, Twitter).
- Strukturirani podaci (schema.org): `LocalBusiness` + `WebSite` na svakoj stranici, `BreadcrumbList` na podstranicama, `BlogPosting` na postovima.
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, ikone (`src/app/icon.svg`, `apple-icon.png`, `public/icons/`).
- Google Search Console: postaviti `GOOGLE_SITE_VERIFICATION` u `.env`.
- Hero video se učitava tek nakon učitavanja stranice (LCP je optimizovani poster); telefon dobija uspravnu verziju
  (`public/video/hero-mobile.mp4`), a uz Save-Data / 2G / „smanji animacije” video se ne učitava.
- Statični fajlovi (`/images`, `/video`, `/icons`) keširaju se 30 dana; postavljeni su sigurnosni headeri.

## Kontakt forma

Kopirati `.env.example` u `.env.local` i popuniti SMTP podatke. Bez njih forma prikazuje poruku da se piše direktno na email.

## Preusmjerenja

`next.config.ts` preusmjerava stare `.html` adrese (npr. `about-2.html` → `/o-nama`) i poddomene letaka
(`osteocare.synthesispharma.ba` → `/proizvodi/osteocare#letak`) ako se njihov DNS usmjeri na ovu aplikaciju.
