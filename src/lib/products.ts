export type Leaflet = { src: string; width: number; height: number };

export type Product = {
  slug: string;
  name: string;
  brand: "vitabiotics" | "lerbolario";
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
const l = (p: Omit<Product, "brand" | "image">): Product => ({
  brand: "lerbolario",
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

  // ───────────── L'Erbolario ─────────────
  l({
    slug: "accordo-viola",
    name: "Accordo Viola",
    description:
      "Dok ljubičice sramežljivo cvjetaju svake godine u sjenovitim šumama, pjesnici ih slave u stihovima, a slikari na platnima zbog nevjerovatno nježnih latica i iznimnog mirisa.",
  }),
  l({
    slug: "lilla-lilla",
    name: "Lillà Lillà",
    description:
      "Odlika koja je jorgovane učinila slavnima je njihov cvjetni i zaista „bezbrižan” miris. Jako je rijetko grmlje koje može dostići tako jedinstven miris kao onaj koji jorgovani šire u aprilu i maju!",
  }),
  l({
    slug: "iris",
    name: "Iris",
    description:
      "Šaroliki iris, poznat i kao perunika, pruža toliko zamamnih nijansi i boja da ne čudi da je u staroj Grčkoj riječ „Iris” označavala dugu. Raskošna ljepota ovog cvijeta cijeni se još od drevnog Egipta.",
  }),
  l({
    slug: "3-rosa",
    name: "3 Rosa",
    description:
      "3 Rosa je jedinstveni miris koji objedinjuje posebne, ali sjajno usklađene osobnosti bogate galske ruže, poticajnih bobica crvenog papra i ponosnog i ukrasnog vrtnog sljeza.",
  }),
  l({
    slug: "rosa-purpurea",
    name: "Rosa Purpurea",
    description:
      "Potpuno novi pogled na miris dragocjenog romantičnog cvijeta – ruže. Parfemisana, iznenađujuće ženstvena i senzualna linija, stvorena kako bi predstavila ljepotu svake žene.",
  }),
  l({
    slug: "golden-bouquet",
    name: "Golden Bouquet",
    description:
      "Simbol svjetlosti, radosti i bogatstva – blistava zlatna boja „ulijeva se” u formulu ove dragocjene kreme za tijelo: hidratantni bagremov med za glatku kožu kombinuje se s ekstraktima cvijeća zlatne boje, poput zlatnice i hidratantnog žutog irisa.",
  }),
  l({
    slug: "bouquet-dargento",
    name: "Bouquet d'Argento",
    description:
      "Srebro predstavlja cjelovitu i sveobuhvatnu ljepotu: povezano je s Mjesečevom simbolikom, a samim tim i s intuicijom, unutrašnjom mudrošću i ženstvenošću. Također je energično i veličanstveno.",
  }),
  l({
    slug: "sfumature-di-dalia",
    name: "Sfumature di Dalia",
    description:
      "Suštinu cvijeta dalije čine pustolovna putovanja, istraživanja i egzotična mjesta. Dalija je nacionalni cvijet Meksika i simbol poštovanja, suosjećanja, dostojanstva i otmjenosti.",
  }),
  l({
    slug: "ortensia",
    name: "Ortensia",
    description:
      "Dugotrajna i raskošna ljepota u cvatu. U svakom vrtu, elegantna prisutnost i ponosno držanje cvijeta hortenzije plijeni pažnju svojim veličanstvenim, okruglim cvjetovima nalik šarenim oblacima i raskošnim listovima.",
  }),
  l({
    slug: "karite",
    name: "Karité",
    description:
      "Od davnina su afričke žene imale nezamjenjivu tajnu ljepote: karite maslac. Dobiva se od ploda impresivne Vitellaria paradoxa, poznate i kao „drvo mladosti”. Poznat je po omekšavajućim i antioksidativnim svojstvima i jedan je od izvrsnih eliksira protiv starenja.",
  }),
  l({
    slug: "cocco",
    name: "Cocco",
    description:
      "Fair trade egzotična mirisna linija spremna za putovanja. Kokos je mirisna linija koja naša čula vodi prema rajskim odredištima – bogat i velikodušan miris, dizajniran u mini formatima bez vanjskog pakovanja.",
  }),
  l({
    slug: "accordo-arancio",
    name: "Accordo Arancio",
    description:
      "Narandžasta je jedna od najsjajnijih boja i simbolizira mnogo pozitivnih stvari. Ova intenzivna boja duboko je povezana s unutrašnjom vitalnošću i harmonijom te uravnotežuje raspoloženje.",
  }),
  l({
    slug: "krema-za-ruke-maslinovo-ulje",
    name: "Krema za ruke s maslinovim uljem",
    description:
      "L'Erbolario krema za ruke s maslinovim uljem i vitaminom E. Dragocjena hidratantna, hranjiva i omekšavajuća svojstva ove kreme tonizuju i održavaju kožu ruku elastičnom, štite je od vanjskih faktora i bore se protiv ljuskave i crvene kože.",
  }),
  l({
    slug: "sampon-protiv-prhuti",
    name: "Šampon protiv peruti",
    description:
      "Pročišćavajući i osvježavajući tretman za regulisanje proizvodnje sebuma kod kose s upornom peruti.",
  }),
  l({
    slug: "frescaessenza",
    name: "Frescaessenza",
    description:
      "Frescaessenza nastaje iz kore agruma i topline drveta, dvaju suprotnosti koje se, iako različite, privlače i jedna drugu naglašavaju, stvarajući onu „najljepšu harmoniju” o kojoj je govorio Heraklit.",
  }),
  l({
    slug: "papavero-soave",
    name: "Papavero Soave",
    description:
      "Svjež, cvjetni miris maka prisutan je u ovoj liniji proizvoda s formulama koje se temelje na dragocjenim aktivnim derivatima maka.",
  }),
  l({
    slug: "linija-za-sunce",
    name: "Linija za sunce",
    description:
      "L'Erbolario donosi široku liniju proizvoda za zaštitu od sunca, posebno formulisanu za lice i usne, budući da je koža na tim područjima nježnija, a starenje kože lako primjetno.",
  }),
  l({
    slug: "sampon-sport",
    name: "Šampon Sport",
    description:
      "Dva proizvoda s ekstraktima mirte i žalfije posvećena su svima koji se bave intenzivnim sportskim aktivnostima i redovno posjećuju teretane, bazene i saune.",
  }),
  l({
    slug: "ginepro-nero",
    name: "Ginepro Nero",
    description:
      "Dugački, igličasti listovi borovice koji paraju zrak oko sebe i obavijaju ga bodljikavom i oštrom aromom. Zelenilo koje se njiše s vjetrom, savijajući se nježno, ali stabilno.",
  }),
  l({
    slug: "meharees",
    name: "Méharées",
    description:
      "Pravo putovanje za čula, od jedne oaze do druge, prema potpunom blagostanju o kojem vaša koža oduvijek sanja. Proizvodi ove linije povezuju jedinstvenu učinkovitost i privlačnost zaista čarobnog mirisa za lijepu i svježu kožu.",
  }),
  l({
    slug: "baobab",
    name: "Baobab",
    description:
      "Tonizirajuća i osvježavajuća mirisna linija Baobab za muškarce obogaćena je notama citrusa (limeta, zelena mandarina, bergamot), tragovima baobaba i galbanuma te drvenastim notama cedra i copaiba balzama.",
  }),
  l({
    slug: "frangipani",
    name: "Frangipani",
    description:
      "Plumeria rubra ili frangipani srce je ove linije jedinstvenog mirisa, obavijene mekim, toplim, slatkim i umirujućim notama. L'Erbolario laboratorij odabrao je cvijet plumerije sicilijanskog porijekla kako bi preradom svježe biljke dobio aktivne sastojke koji ističu ovu liniju.",
  }),
  l({
    slug: "melograno",
    name: "Melograno",
    description:
      "Kolekcija senzualnog mirisa bogata svježinom, posvećena jedinstvenom stablu nara koje se od davnina, zbog obilja cvijeća i sočnih plodova, povezuje sa simbolikom prosperiteta, veličanstvenosti i ponovnog rođenja.",
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
