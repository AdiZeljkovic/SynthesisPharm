import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialIcons";
import { Container, PageHero } from "@/components/ui";
import { pages } from "@/lib/pages";
import { site } from "@/lib/site";

const c = pages.kontakt;

export const metadata: Metadata = pageMetadata({
  title: c.seo.title || "Kontakt",
  description:
    c.seo.description ||
    `Kontaktirajte Synthesis Pharmu – ${site.address.street}, ${site.address.city}. Tel: ${site.phone}, email: ${site.email}.`,
  path: "/kontakt",
});

const info = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Broj telefona", value: site.phone, href: site.phoneHref },
  {
    icon: MapPin,
    label: "Adresa",
    value: `${site.address.street}, ${site.address.city}`,
    href: site.mapLink,
    external: true,
  },
  { icon: Clock, label: "Radno vrijeme", value: site.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        image={c.hero.image}
        crumbs={[{ href: "/", label: "Početna" }, { label: c.hero.title }]}
      />

      <section className="py-20">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 sm:p-10 lg:col-span-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">{c.form.title}</h2>
            {c.form.note && <p className="mt-2 text-muted">{c.form.note}</p>}
            <div className="relative mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-[2rem] bg-brand-950 p-8 text-brand-100 sm:p-10">
              <h2 className="text-2xl font-extrabold text-white">{c.infoTitle}</h2>
              <ul className="mt-8 space-y-6">
                {info.map((i) => (
                  <li key={i.label} className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-leaf-400">
                      <i.icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-100/60">{i.label}</p>
                      {i.href ? (
                        <a
                          href={i.href}
                          {...(i.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="mt-1 block font-semibold text-white hover:text-leaf-300"
                        >
                          {i.value}
                        </a>
                      ) : (
                        <p className="mt-1 font-semibold text-white">{i.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <SocialLinks
                className="mt-8 border-t border-white/10 pt-6"
                itemClassName="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-leaf-600"
              />
            </div>
          </aside>
        </Container>
      </section>

      <section aria-label="Mapa lokacije" className="pb-20">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80">
            <iframe
              src={site.mapEmbed}
              title={`Synthesis Pharma na mapi – ${site.address.street}, ${site.address.city}`}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
