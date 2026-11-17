import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="py-32">
      <Container className="text-center">
        <p className="bg-gradient-to-br from-brand-500 to-leaf-500 bg-clip-text text-8xl font-extrabold text-transparent">
          404
        </p>
        <h1 className="mt-6 text-3xl font-extrabold text-ink">Stranica nije pronađena</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Stranica koju tražite ne postoji ili je premještena. Vratite se na početnu ili pregledajte naše proizvode.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/">Početna</ButtonLink>
          <ButtonLink href="/proizvodi" variant="outline">
            Proizvodi
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
