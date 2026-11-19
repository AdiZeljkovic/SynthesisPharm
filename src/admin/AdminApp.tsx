"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  ExternalLink,
  FileText,
  Home,
  Images,
  LogOut,
  Menu,
  Package,
  Settings,
  Settings2,
  X,
} from "lucide-react";
import { api, setUnauthorizedHandler, type Session } from "./api";
import { PublishBadge, PublishProvider } from "./publish";
import { useRoute } from "./router";
import { brandsDef, pageDocs, productsDef, siteDoc } from "./schema";
import { BlogEditor, BlogList } from "./screens/Blog";
import { CollectionEditor } from "./screens/CollectionEditor";
import { DocEditor } from "./screens/DocEditor";
import { Dashboard, MediaScreen, PagesIndex, SettingsScreen } from "./screens/Misc";
import { Button, Notice, Spinner, ToastProvider, cx, inputCls } from "./ui";

export function AdminApp() {
  return (
    <ToastProvider>
      <Gate />
    </ToastProvider>
  );
}

function Gate() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");

  const check = useCallback(() => {
    api.session().then(setSession, (e) => setError((e as Error).message));
  }, []);

  useEffect(() => {
    check();
    setUnauthorizedHandler(() => setSession((s) => (s ? { ...s, authenticated: false } : s)));
  }, [check]);

  if (error)
    return (
      <Centered>
        <Notice tone="error">
          Admin panel trenutno nije dostupan: {error}
          <div className="mt-3">
            <Button size="sm" onClick={() => location.reload()}>
              Pokušaj ponovo
            </Button>
          </div>
        </Notice>
      </Centered>
    );
  if (!session) return <Spinner />;
  if (!session.authenticated) return <Login configured={session.configured !== false} onLogin={setSession} />;
  return (
    <PublishProvider enabled={!!session.tokenSet}>
      <Shell
        session={session}
        onLogout={async () => {
          try {
            await api.logout();
          } catch {}
          check();
        }}
        onTokenSaved={() => setSession({ ...session, tokenSet: true })}
      />
    </PublishProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-svh place-items-center bg-slate-50 p-4">{<div className="w-full max-w-sm">{children}</div>}</div>;
}

function Login({ configured, onLogin }: { configured: boolean; onLogin: (s: Session) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onLogin(await api.login(password));
    } catch (err) {
      setError((err as Error).message);
      setPassword("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Centered>
      <form onSubmit={submit} className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70">
        <img src="/images/brand/logo.png" alt="Synthesis Pharma" className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center text-xl font-extrabold text-ink">Administracija sajta</h1>
        {!configured && (
          <div className="mt-4">
            <Notice tone="warn">Admin još nije podešen na serveru.</Notice>
          </div>
        )}
        <label htmlFor="pw" className="mt-6 block text-sm font-semibold text-ink">
          Lozinka
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className={cx(inputCls, "mt-1.5")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className="mt-6 w-full" loading={busy} disabled={!password}>
          Prijava
        </Button>
        <p className="mt-6 text-center text-xs text-muted">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- izlazak iz admina: puno učitavanje sajta */}
          <a href="/" className="hover:text-ink">
            ← Nazad na sajt
          </a>
        </p>
      </form>
    </Centered>
  );
}

const NAV = [
  { href: "#/", icon: Home, label: "Pregled", match: (r: string[]) => r.length === 0 },
  { href: "#/stranice", icon: FileText, label: "Stranice", match: (r: string[]) => r[0] === "stranice" || r[0] === "stranica" },
  { href: "#/blog", icon: BookOpen, label: "Blog", match: (r: string[]) => r[0] === "blog" },
  { href: "#/proizvodi", icon: Package, label: "Proizvodi", match: (r: string[]) => r[0] === "proizvodi" },
  { href: "#/brendovi", icon: Building2, label: "Brendovi", match: (r: string[]) => r[0] === "brendovi" },
  { href: "#/slike", icon: Images, label: "Slike", match: (r: string[]) => r[0] === "slike" },
  { href: "#/opste", icon: Settings2, label: "Opšte informacije", match: (r: string[]) => r[0] === "opste" },
  { href: "#/postavke", icon: Settings, label: "Postavke", match: (r: string[]) => r[0] === "postavke" },
];

function Shell({ session, onLogout, onTokenSaved }: { session: Session; onLogout: () => void; onTokenSaved: () => void }) {
  const route = useRoute();
  const [menu, setMenu] = useState(false);
  const routeKey = route.join("/");
  // Promjena ekrana: zatvori mobilni meni (bez efekta – vidi "storing information from previous renders")
  const [lastKey, setLastKey] = useState(routeKey);
  if (lastKey !== routeKey) {
    setLastKey(routeKey);
    setMenu(false);
  }
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  const needsToken = !session.tokenSet && route[0] !== "postavke" && route.length > 0;

  let screen: React.ReactNode;
  const [a, b] = route;
  if (needsToken)
    screen = (
      <Notice tone="warn">
        Prije uređivanja potrebno je postaviti GitHub token. <a href="#/postavke" className="font-semibold underline">Otvorite Postavke</a>.
      </Notice>
    );
  else if (!a) screen = <Dashboard tokenSet={!!session.tokenSet} />;
  else if (a === "stranice") screen = <PagesIndex />;
  else if (a === "stranica") {
    const def = pageDocs.find((d) => d.id === b);
    screen = def ? <DocEditor key={def.id} def={def} /> : <Notice tone="warn">Stranica ne postoji.</Notice>;
  } else if (a === "opste") screen = <DocEditor key="opste" def={siteDoc} />;
  else if (a === "brendovi") screen = <CollectionEditor key="brendovi" def={brandsDef} slug={b} />;
  else if (a === "proizvodi") screen = <CollectionEditor key="proizvodi" def={productsDef} slug={b} />;
  else if (a === "blog") screen = b ? <BlogEditor key={b} slug={b} /> : <BlogList />;
  else if (a === "slike") screen = <MediaScreen />;
  else if (a === "postavke") screen = <SettingsScreen onTokenSaved={onTokenSaved} />;
  else screen = <Notice tone="warn">Stranica ne postoji.</Notice>;

  const nav = (
    <nav aria-label="Admin meni" className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map((n) => {
        const active = n.match(route);
        return (
          <div key={n.href}>
            <a
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition",
                active ? "bg-brand-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-ink",
              )}
            >
              <n.icon className="size-5" aria-hidden /> {n.label}
            </a>
            {n.href === "#/stranice" && active && (
              <div className="mb-1 ml-6 mt-1 flex flex-col gap-0.5 border-l border-slate-200 pl-3">
                {pageDocs.map((d) => (
                  <a
                    key={d.id}
                    href={`#/stranica/${d.id}`}
                    aria-current={route[1] === d.id ? "page" : undefined}
                    className={cx("rounded-lg px-2 py-1.5 text-sm", route[1] === d.id ? "font-bold text-brand-600" : "text-muted hover:text-ink")}
                  >
                    {d.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-slate-100 pt-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <ExternalLink className="size-5" aria-hidden /> Otvori sajt
        </a>
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <LogOut className="size-5" aria-hidden /> Odjava
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-svh bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
          <img src="/images/brand/logo.png" alt="Synthesis Pharma" className="h-9 w-auto" />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-muted">Admin</span>
        </div>
        {nav}
      </aside>

      {menu && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenu(false)} />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <img src="/images/brand/logo.png" alt="Synthesis Pharma" className="h-8 w-auto" />
              <button type="button" onClick={() => setMenu(false)} className="grid size-10 place-items-center rounded-full hover:bg-slate-100" aria-label="Zatvori meni">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setMenu(true)} className="grid size-10 place-items-center rounded-full ring-1 ring-slate-200 lg:hidden" aria-label="Otvori meni">
            <Menu className="size-5" />
          </button>
          <p className="hidden text-sm text-muted lg:block">Uređivanje sajta synthesispharma.ba</p>
          {session.tokenSet ? <PublishBadge /> : <span />}
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{screen}</main>
      </div>
    </div>
  );
}
