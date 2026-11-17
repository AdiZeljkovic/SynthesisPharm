export const site = {
  name: "Synthesis Pharma",
  url: "https://www.synthesispharma.ba",
  description:
    "Synthesis Pharma, zajedno s veledrogerijom Hercegovinalijek, pruža marketinške i prodajne usluge renomiranim evropskim farmaceutskim kompanijama na tržištu Bosne i Hercegovine.",
  email: "info@synthesispharma.ba",
  phone: "+387 33 568 372",
  phoneHref: "tel:+38733568372",
  address: {
    street: "Rajlovačka cesta 23",
    city: "71000 Sarajevo",
    country: "Bosna i Hercegovina",
  },
  hours: "Ponedjeljak – petak, 08:00 – 16:00",
  social: {
    facebook: "https://www.facebook.com/synthesispharmasarajevo/",
    linkedin: "https://www.linkedin.com/company/synthesis-pharma/",
  },
  mapEmbed:
    "https://maps.google.com/maps?q=Rajlova%C4%8Dka%20cesta%2023%2C%2071000%20Sarajevo&z=15&output=embed",
  mapLink: "https://maps.google.com/?q=Rajlova%C4%8Dka+cesta+23,+71000+Sarajevo",
} as const;

export const nav = [
  { href: "/", label: "Početna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/brendovi", label: "Brendovi" },
  { href: "/proizvodi", label: "Proizvodi" },
  { href: "/blog", label: "Blog" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

/** Logotipi proizvoda u meniju (vode na letak proizvoda) */
export const navProducts = [
  { slug: "osteocare", name: "Osteocare", logo: "/images/featured/osteocare-nav.png", width: 456, height: 89 },
  { slug: "feroglobin", name: "Feroglobin", logo: "/images/featured/feroglobin-nav.png", width: 370, height: 96 },
  { slug: "neurozan", name: "Neurozan", logo: "/images/featured/neurozan-nav.png", width: 605, height: 96 },
  { slug: "jointace", name: "Jointace", logo: "/images/featured/jointace-nav.png", width: 365, height: 96 },
] as const;

export const stats = [
  { value: 8, label: "Saradnika" },
  { value: 177, label: "Proizvoda" },
  { value: 1037, label: "Sretnih kupaca" },
] as const;
