import { Phone } from "lucide-react";
import { site } from "@/lib/site";
import { ButtonLink, Container } from "./ui";

export function CtaBanner() {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-500 to-leaf-500 px-8 py-14 sm:px-14">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 size-80 animate-[float_14s_ease-in-out_infinite] rounded-full border-[40px] border-white/10 motion-reduce:animate-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 right-40 size-64 animate-[float_11s_ease-in-out_infinite_reverse] rounded-full bg-white/10 motion-reduce:animate-none"
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{site.cta.title}</h2>
              {site.cta.text && <p className="mt-3 text-lg text-white/85">{site.cta.text}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="/kontakt" variant="white">
                Kontaktirajte nas
              </ButtonLink>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-white ring-2 ring-white/40 transition hover:bg-white/10"
              >
                <Phone className="size-4" aria-hidden /> {site.phone}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
