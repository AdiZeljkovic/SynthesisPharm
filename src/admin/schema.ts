/**
 * Opis svih sadržaja koje admin uređuje: koji fajl, koja polja, kako se zovu.
 * Forme se generišu iz ovoga (vidi fields.tsx), pa se novo polje dodaje samo ovdje + u stranici sajta.
 */

export type Option = { value: string; label: string };

type Base = { key: string; label: string; help?: string };
export type Field =
  | (Base & { kind: "text"; required?: boolean; placeholder?: string })
  | (Base & { kind: "textarea"; rows?: number; required?: boolean; bold?: boolean })
  | (Base & { kind: "image"; required?: boolean })
  | (Base & { kind: "number" })
  | (Base & { kind: "color" })
  | (Base & { kind: "date"; required?: boolean })
  | (Base & { kind: "checkbox" })
  | (Base & { kind: "select"; options: Option[] | "brands" | "icons" })
  | (Base & { kind: "products" })
  | (Base & { kind: "strings"; itemLabel: string; textarea?: boolean; bold?: boolean })
  | (Base & { kind: "list"; itemLabel: string; fields: Field[]; titleKey?: string })
  | (Base & { kind: "group"; fields: Field[] });

export const ICONS: Option[] = [
  { value: "istrazivanje", label: "Istraživanje (lupa)" },
  { value: "registracija", label: "Registracija (dokument)" },
  { value: "promocija", label: "Promocija (megafon)" },
  { value: "zdravstvo", label: "Zdravstvo (stetoskop)" },
  { value: "srce", label: "Srce" },
  { value: "stit", label: "Štit (zaštita)" },
  { value: "kvalitet", label: "Kvalitet (značka)" },
  { value: "nagrada", label: "Nagrada" },
  { value: "partnerstvo", label: "Partnerstvo (rukovanje)" },
  { value: "priroda", label: "Priroda (list)" },
  { value: "lijek", label: "Lijek (tableta)" },
  { value: "distribucija", label: "Distribucija (kamion)" },
  { value: "tim", label: "Tim (ljudi)" },
];

const seo: Field = {
  kind: "group",
  key: "seo",
  label: "Pretraživači (SEO)",
  help: "Naslov i opis koje Google prikazuje u rezultatima pretrage.",
  fields: [
    { kind: "text", key: "title", label: "Naslov za Google" },
    { kind: "textarea", key: "description", label: "Opis za Google", rows: 3, help: "Idealno 120–155 znakova." },
  ],
};

const pageHero: Field = {
  kind: "group",
  key: "hero",
  label: "Zaglavlje stranice",
  fields: [
    { kind: "text", key: "title", label: "Naslov", required: true },
    { kind: "textarea", key: "subtitle", label: "Podnaslov", rows: 2 },
    { kind: "image", key: "image", label: "Pozadinska slika", required: true, help: "Prikazuje se zatamnjena iza naslova." },
  ],
};

const heading = (key: string, label: string, withText = true, extra: Field[] = []): Field => ({
  kind: "group",
  key,
  label,
  fields: [
    { kind: "text", key: "eyebrow", label: "Mali natpis iznad naslova" },
    { kind: "text", key: "title", label: "Naslov", required: true },
    ...(withText ? [{ kind: "textarea", key: "text", label: "Tekst", rows: 3 } as Field] : []),
    ...extra,
  ],
});

export type DocDef = {
  id: string;
  title: string;
  path: string;
  url: string;
  description?: string;
  fields: Field[];
};

export const pageDocs: DocDef[] = [
  {
    id: "pocetna",
    title: "Početna",
    path: "src/content/pages/pocetna.json",
    url: "/",
    fields: [
      {
        kind: "group",
        key: "hero",
        label: "Naslovna sekcija (video)",
        fields: [
          { kind: "text", key: "eyebrow", label: "Mali natpis iznad naslova" },
          { kind: "text", key: "title", label: "Naslov (bijeli dio)", required: true },
          { kind: "text", key: "titleHighlight", label: "Naslov (zeleni dio)", help: "Nastavak naslova u zelenoj boji." },
          { kind: "textarea", key: "text", label: "Tekst ispod naslova", rows: 3 },
        ],
      },
      {
        kind: "group",
        key: "about",
        label: "O nama",
        fields: [
          { kind: "text", key: "eyebrow", label: "Mali natpis iznad naslova" },
          { kind: "text", key: "title", label: "Naslov", required: true },
          { kind: "strings", key: "paragraphs", label: "Paragrafi", itemLabel: "paragraf", textarea: true, bold: true },
          { kind: "image", key: "image", label: "Slika", required: true },
          { kind: "text", key: "imageAlt", label: "Opis slike (za slabovide i Google)" },
          { kind: "textarea", key: "badge", label: "Kartica preko slike", rows: 2, bold: true, help: "Ostavite prazno da se kartica ne prikazuje." },
        ],
      },
      heading("featured", "Izdvojeni proizvodi", true, [
        { kind: "products", key: "products", label: "Proizvodi (redoslijed)", help: "Prvi proizvod se prikazuje kao velika kartica." },
      ]),
      heading("brands", "Brendovi", true, [
        { kind: "image", key: "image", label: "Slika pored liste brendova" },
      ]),
      heading("leaflets", "Edukativni letci"),
      heading("stats", "Brojke", false, [
        { kind: "image", key: "image", label: "Pozadinska slika" },
      ]),
      heading("blog", "Najnovije sa bloga", false),
      seo,
    ],
  },
  {
    id: "o-nama",
    title: "O nama",
    path: "src/content/pages/o-nama.json",
    url: "/o-nama/",
    fields: [
      pageHero,
      {
        kind: "group",
        key: "intro",
        label: "Ko smo",
        fields: [
          { kind: "text", key: "eyebrow", label: "Mali natpis iznad naslova" },
          { kind: "text", key: "title", label: "Naslov", required: true },
          { kind: "strings", key: "paragraphs", label: "Paragrafi", itemLabel: "paragraf", textarea: true, bold: true },
          { kind: "image", key: "image1", label: "Slika lijevo", required: true },
          { kind: "text", key: "image1Alt", label: "Opis lijeve slike" },
          { kind: "image", key: "image2", label: "Slika desno", required: true },
          { kind: "text", key: "image2Alt", label: "Opis desne slike" },
        ],
      },
      {
        kind: "list",
        key: "tabs",
        label: "Kartice (Ciljevi / Proizvodi / Brendovi)",
        help: "Prikazuju se i na početnoj stranici.",
        itemLabel: "karticu",
        titleKey: "label",
        fields: [
          { kind: "text", key: "label", label: "Naziv kartice", required: true },
          { kind: "strings", key: "items", label: "Stavke", itemLabel: "stavku" },
        ],
      },
      {
        kind: "group",
        key: "services",
        label: "Usluge",
        fields: [
          { kind: "text", key: "eyebrow", label: "Mali natpis iznad naslova" },
          { kind: "text", key: "title", label: "Naslov", required: true },
          { kind: "textarea", key: "text", label: "Tekst", rows: 2 },
          {
            kind: "list",
            key: "items",
            label: "Usluge",
            itemLabel: "uslugu",
            titleKey: "title",
            fields: [
              { kind: "select", key: "icon", label: "Ikona", options: "icons" },
              { kind: "text", key: "title", label: "Naziv", required: true },
              { kind: "textarea", key: "text", label: "Opis", rows: 2 },
            ],
          },
        ],
      },
      {
        kind: "group",
        key: "values",
        label: "Vrijednosti",
        fields: [
          { kind: "text", key: "eyebrow", label: "Mali natpis iznad naslova" },
          { kind: "text", key: "title", label: "Naslov", required: true },
          {
            kind: "list",
            key: "items",
            label: "Vrijednosti",
            itemLabel: "vrijednost",
            titleKey: "title",
            fields: [
              { kind: "select", key: "icon", label: "Ikona", options: "icons" },
              { kind: "text", key: "title", label: "Naziv", required: true },
            ],
          },
        ],
      },
      seo,
    ],
  },
  {
    id: "brendovi-stranica",
    title: "Brendovi (stranica)",
    path: "src/content/pages/brendovi.json",
    url: "/brendovi/",
    description: "Tekstovi stranice sa spiskom brendova. Same brendove uređujete u meniju Brendovi.",
    fields: [pageHero, heading("heading", "Naslov iznad brendova", false), seo],
  },
  {
    id: "proizvodi-stranica",
    title: "Proizvodi (stranica)",
    path: "src/content/pages/proizvodi.json",
    url: "/proizvodi/",
    description: "Tekstovi stranice sa katalogom. Same proizvode uređujete u meniju Proizvodi.",
    fields: [pageHero, seo],
  },
  {
    id: "blog-stranica",
    title: "Blog (stranica)",
    path: "src/content/pages/blog.json",
    url: "/blog/",
    description: "Tekstovi stranice sa spiskom članaka. Same članke pišete u meniju Blog.",
    fields: [pageHero, { kind: "text", key: "empty", label: "Poruka kad nema članaka" }, seo],
  },
  {
    id: "kontakt",
    title: "Kontakt (stranica)",
    path: "src/content/pages/kontakt.json",
    url: "/kontakt/",
    description: "Email, telefon i adresu mijenjate u meniju Opšte informacije.",
    fields: [
      pageHero,
      {
        kind: "group",
        key: "form",
        label: "Forma",
        fields: [
          { kind: "text", key: "title", label: "Naslov forme", required: true },
          { kind: "text", key: "note", label: "Napomena ispod naslova" },
        ],
      },
      { kind: "text", key: "infoTitle", label: "Naslov okvira sa kontakt podacima" },
      seo,
    ],
  },
];

export const siteDoc: DocDef = {
  id: "opste",
  title: "Opšte informacije",
  path: "src/content/site.json",
  url: "/kontakt/",
  description: "Kontakt podaci, društvene mreže i tekstovi koji se ponavljaju na svim stranicama.",
  fields: [
    {
      kind: "group",
      key: "",
      label: "Kontakt podaci",
      help: "Prikazuju se u zaglavlju, podnožju i na stranici Kontakt.",
      fields: [
        { kind: "text", key: "email", label: "Email", required: true },
        { kind: "text", key: "phone", label: "Telefon", required: true },
        { kind: "text", key: "hours", label: "Radno vrijeme" },
      ],
    },
    {
      kind: "group",
      key: "address",
      label: "Adresa",
      help: "Mapa na stranici Kontakt se pravi automatski iz adrese.",
      fields: [
        { kind: "text", key: "street", label: "Ulica i broj", required: true },
        { kind: "text", key: "city", label: "Poštanski broj i grad", required: true, placeholder: "71000 Sarajevo" },
        { kind: "text", key: "country", label: "Država" },
      ],
    },
    {
      kind: "group",
      key: "social",
      label: "Društvene mreže",
      help: "Ostavite prazno da se ikona ne prikazuje.",
      fields: [
        { kind: "text", key: "facebook", label: "Facebook link" },
        { kind: "text", key: "linkedin", label: "LinkedIn link" },
      ],
    },
    {
      kind: "list",
      key: "stats",
      label: "Brojke (U brojkama)",
      itemLabel: "brojku",
      titleKey: "label",
      fields: [
        { kind: "number", key: "value", label: "Broj" },
        { kind: "text", key: "label", label: "Natpis", required: true },
      ],
    },
    {
      kind: "group",
      key: "cta",
      label: "Poziv na saradnju (plavi okvir na dnu stranica)",
      fields: [
        { kind: "text", key: "title", label: "Naslov", required: true },
        { kind: "textarea", key: "text", label: "Tekst", rows: 2 },
      ],
    },
    {
      kind: "group",
      key: "",
      label: "Podnožje i Google",
      fields: [
        { kind: "textarea", key: "footerText", label: "Tekst u podnožju", rows: 3 },
        { kind: "textarea", key: "description", label: "Opis firme za Google", rows: 3 },
      ],
    },
  ],
};

export type CollectionDef = {
  id: string;
  title: string;
  singular: string;
  path: string;
  urlPrefix: string;
  imageKey: string;
  subtitleKey: string;
  fields: Field[];
  empty: Record<string, unknown>;
};

export const brandsDef: CollectionDef = {
  id: "brendovi",
  title: "Brendovi",
  singular: "brend",
  path: "src/content/brands.json",
  urlPrefix: "/brendovi/",
  imageKey: "mark",
  subtitleKey: "category",
  fields: [
    { kind: "text", key: "name", label: "Naziv", required: true },
    { kind: "text", key: "category", label: "Kategorija", required: true, placeholder: "npr. Dodaci prehrani" },
    { kind: "text", key: "origin", label: "Porijeklo (država)", placeholder: "npr. Velika Britanija" },
    { kind: "textarea", key: "summary", label: "Kratak opis (za kartice)", rows: 3, required: true },
    { kind: "strings", key: "about", label: "Opis kompanije", itemLabel: "paragraf", textarea: true },
    { kind: "textarea", key: "mission", label: "Misija i vizija (citat)", rows: 3, help: "Ostavite prazno da se ne prikazuje." },
    {
      kind: "textarea",
      key: "productNote",
      label: "Napomena na stranicama proizvoda",
      rows: 2,
      help: "Npr. upozorenje za dodatke prehrani. Prazno = opšta napomena.",
    },
    { kind: "image", key: "mark", label: "Logo (bez bijelih margina)", required: true, help: "Za kartice i traku sa logotipima. Najbolje PNG s providnom pozadinom." },
    { kind: "image", key: "logo", label: "Logo (originalni)", required: true },
    { kind: "image", key: "cover", label: "Naslovna slika brenda", required: true },
    { kind: "image", key: "hero", label: "Pozadina zaglavlja stranice brenda", help: "Prazno = opšta slika." },
    {
      kind: "group",
      key: "theme",
      label: "Boje brenda",
      help: "Stranica brenda i njegovih proizvoda koristi ove boje.",
      fields: [
        { kind: "color", key: "accent", label: "Glavna boja (dugmad, naslovi)" },
        { kind: "color", key: "soft", label: "Sekundarna boja" },
        { kind: "color", key: "deep", label: "Tamna boja (pozadine)" },
      ],
    },
  ],
  empty: {
    slug: "",
    name: "",
    category: "",
    origin: "",
    summary: "",
    about: [""],
    mission: "",
    productNote: "",
    logo: "",
    mark: "",
    cover: "",
    hero: "",
    theme: { accent: "#0a7a96", soft: "#6cb33f", deep: "#062e3b" },
  },
};

export const productsDef: CollectionDef = {
  id: "proizvodi",
  title: "Proizvodi",
  singular: "proizvod",
  path: "src/content/products.json",
  urlPrefix: "/proizvodi/",
  imageKey: "image",
  subtitleKey: "brand",
  fields: [
    { kind: "text", key: "name", label: "Naziv", required: true },
    { kind: "select", key: "brand", label: "Brend", options: "brands" },
    { kind: "textarea", key: "description", label: "Opis", rows: 5, required: true },
    { kind: "image", key: "image", label: "Slika pakovanja", required: true, help: "Za kartice u katalogu (omjer oko 57:35)." },
    { kind: "image", key: "photo", label: "Fotografija proizvoda", help: "Velika slika na stranici proizvoda. Prazno = slika pakovanja." },
  ],
  empty: { slug: "", name: "", brand: "vitabiotics", image: "", photo: "", description: "" },
};

export const blogFields: Field[] = [
  { kind: "text", key: "title", label: "Naslov", required: true },
  { kind: "textarea", key: "excerpt", label: "Uvod / sažetak", rows: 3, required: true, help: "Prikazuje se na karticama i u Google rezultatima." },
  { kind: "date", key: "date", label: "Datum objave", required: true },
  { kind: "text", key: "category", label: "Kategorija", required: true, placeholder: "npr. Zdravlje kostiju" },
  { kind: "image", key: "cover", label: "Naslovna slika", required: true, help: "Najbolje vodoravna fotografija (16:9), bar 1600 px širine." },
  { kind: "text", key: "coverAlt", label: "Opis naslovne slike" },
  { kind: "text", key: "author", label: "Autor" },
  { kind: "products", key: "products", label: "Proizvodi spomenuti u članku", help: "Prikazuju se ispod teksta." },
  { kind: "checkbox", key: "draft", label: "Skica (ne prikazuje se na sajtu)" },
];
