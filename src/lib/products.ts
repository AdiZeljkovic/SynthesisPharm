export type Leaflet = { src: string; width: number; height: number };

export type Product = {
  slug: string;
  name: string;
  brand: "vitabiotics";
  image: string;
  /** Fotografija pakovanja (ako postoji) */
  photo?: string;
  description: string;
  /** Edukativni letak (ranije na poddomenama *.synthesispharma.ba) */
  leaflet?: Leaflet;
  /** Logo proizvoda za istaknute letke */
  logo?: string;
};

const v = (p: Omit<Product, "brand" | "image"> & { image?: string }): Product => ({
  brand: "vitabiotics",
  image: `/images/products/${p.slug}.jpg`,
  ...p,
});
export const products: Product[] = [
  // ───────────── Vitabiotics ─────────────
  v({
    slug: "cardioace",
    name: "Cardioace",
    description:
      "Cardioace dodatak prehrani je formulisan na temelju novih studija koje dokazuju djelovanje određenih nutrijenata na normalnu funkciju srca i krvnog sistema. Cardioace tablete sadrže kompleksnu kombinaciju nutrijenata, poput tiamina (vitamin B1), koji doprinose normalnoj funkciji srca i krvnog sistema.",
  }),
  v({
    slug: "diabetone",
    name: "Diabetone",
    description:
      "Diabetone je specijalno formulisan dodatak prehrani sa 21 hranjivim sastojkom koji pomažu u održavanju dnevnih potreba organizma. Ovi hranjivi sastojci uključuju hrom, vitamin B6 te tiamin (vitamin B1) koji pomaže u održavanju normalnog funkcionisanja nervnog sistema.",
  }),
  v({
    slug: "feroglobin",
    name: "Feroglobin",
    photo: "/images/products/photo/feroglobin.jpg",
    logo: "/images/featured/feroglobin-logo.png",
    leaflet: { src: "/images/leaflets/feroglobin.jpg", width: 1600, height: 3260 },
    description:
      "Feroglobin je dodatak prehrani koji služi za očuvanje zdravlja, vitalnosti i energije. Sadrži nutrijente potrebne za formiranje hemoglobina i crvenih krvnih zrnaca kao što su: željezo, folna kiselina, vitamini B12 i B6, cink. Potražite ga u obliku kapsula s vremenski postepenim otpuštanjem ili u obliku sirupa.",
  }),
  v({
    slug: "immunace",
    name: "Immunace",
    description:
      "Immunace asortiman dodataka prehrani sadrži sve vitamine i minerale neophodne za pravilnu funkciju imunološkog sistema. Visoka doza vitamina D, vitamina C, cinka i selena čine optimalnu kombinaciju mikronutrijenata za zdravlje cjelokupnog organizma i imuniteta.",
  }),
  v({
    slug: "jointace",
    name: "Jointace",
    photo: "/images/products/photo/jointace.jpg",
    logo: "/images/featured/jointace-logo.png",
    leaflet: { src: "/images/leaflets/jointace.jpg", width: 1500, height: 16607 },
    description:
      "Jointace je napredan asortiman dodataka prepunih minerala u tragovima, vitamina i hranjivih tvari za podršku zglobovima, hrskavici i aktivnom načinu života u bilo kojoj dobi. Ovaj dodatak prehrani potražite u obliku tableta, kapsula ili gela.",
  }),
  v({
    slug: "liverel",
    name: "Liverel",
    photo: "/images/products/photo/liverel.jpg",
    description:
      "Liverel tablete predstavljaju multivitaminski i mineralni dodatak prehrani koji služi za prevenciju i korekciju nezadovoljavajućeg statusa vitamina i minerala u organizmu, te normalnu funkciju i zdravlje jetre. Potražite ga u obliku tableta.",
  }),
  v({
    slug: "menopace",
    name: "Menopace",
    description:
      "Menopace dodatak prehrani sadrži preko 20 vitamina, minerala i sojin izoflavon, namijenjen ženama u menopauzi i nakon nje. Uspješno otklanja psihičke i fizičke simptome tokom menopauze.",
  }),
  v({
    slug: "neurozan",
    name: "Neurozan",
    photo: "/images/products/photo/neurozan.jpg",
    logo: "/images/featured/neurozan-logo.png",
    leaflet: { src: "/images/leaflets/neurozan.jpg", width: 1500, height: 5737 },
    description:
      "Neurozan je dodatak prehrani na bazi prirodnih bioaktivnih nutrijenata, koji pomažu u očuvanju moždane funkcije i poboljšanju kognitivnih sposobnosti. Potražite ga u obliku tableta.",
  }),
  v({
    slug: "osteocare",
    name: "Osteocare",
    photo: "/images/products/photo/osteocare.jpg",
    logo: "/images/featured/osteocare-logo.png",
    leaflet: { src: "/images/leaflets/osteocare.jpg", width: 1600, height: 3629 },
    description:
      "Osteocare je najprodavaniji dodatak prehrani za zdravlje kostiju u Velikoj Britaniji. Upotrijebljeni sastojci temelje se na novim, međunarodnim spoznajama o utjecaju nutrijenata na zdravlje kostiju te brojnim naučnim studijama iz posljednjih dvadeset godina. Potražite ga u obliku tableta ili sirupa.",
  }),
  v({
    slug: "perfectil",
    name: "Perfectil",
    description:
      "Perfectil je najprodavaniji dodatak prehrani u Velikoj Britaniji za zdravu i lijepu kosu, kožu i nokte. Iza ove formule stoji 45 godina iskustva i istraživanja te 20 nutrijenata koji optimalno podupiru „ljepotu iznutra”.",
  }),
  v({
    slug: "pregnacare",
    name: "Pregnacare",
    description:
      "Pregnacare Conception tablete su formulisane za punu nutritivnu potporu ženama koje nastoje začeti. Sadrže pažljivo izbalansirane mikronutrijente, poput cinka koji doprinosi normalnoj plodnosti, plus inozitol, L-arginin, N-acetilcistein i selen.",
  }),
  v({
    slug: "ultra-garlic",
    name: "Ultra Garlic",
    description:
      "Ultra Garlic dodatak prehrani je dijetetski proizvod na bazi ekstrakta bijelog luka namijenjen očuvanju zdravlja imunog sistema, srca i cirkulacije. Tablete sadrže alicin, koji je ključni sastojak bijelog luka.",
  }),
  v({
    slug: "visionace",
    name: "Visionace",
    description:
      "Visionace dodatak prehrani predstavlja najkompletniju formulu za oči, nastalu kao rezultat dugogodišnjeg naučnog ispitivanja britanske kompanije Vitabiotics. Vitaminsko-mineralna formulacija koju preporučuju vodeći britanski oftalmolozi.",
  }),

];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsByBrand(brand: string) {
  return products.filter((p) => p.brand === brand);
}

export const featuredProducts = ["feroglobin", "osteocare", "jointace", "neurozan", "liverel"]
  .map((s) => getProduct(s)!)
  .filter(Boolean);

export const leafletProducts = products.filter((p) => p.leaflet);
