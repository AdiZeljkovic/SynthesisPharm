"use client";

import { useEffect, useState } from "react";
import { BookOpen, Building2, FileText, Images, KeyRound, LayoutTemplate, Package, Settings2 } from "lucide-react";
import { api, type Settings } from "../api";
import { MediaLibrary } from "../media";
import { RunList, usePublish } from "../publish";
import { pageDocs } from "../schema";
import { Button, Card, FieldLabel, Notice, Spinner, inputCls, useToast } from "../ui";
import { timeAgo } from "../util";

export function Dashboard({ tokenSet }: { tokenSet: boolean }) {
  const { refresh } = usePublish();
  const links = [
    { href: "#/stranica/pocetna", icon: LayoutTemplate, title: "Stranice", text: "Tekstovi i slike na Početnoj, O nama, Kontakt…" },
    { href: "#/blog", icon: BookOpen, title: "Blog", text: "Pisanje i uređivanje članaka" },
    { href: "#/proizvodi", icon: Package, title: "Proizvodi", text: "Nazivi, opisi i slike proizvoda" },
    { href: "#/brendovi", icon: Building2, title: "Brendovi", text: "Opisi, logotipi i boje brendova" },
    { href: "#/slike", icon: Images, title: "Slike", text: "Biblioteka slika i otpremanje novih" },
    { href: "#/opste", icon: Settings2, title: "Opšte informacije", text: "Kontakt podaci, brojke, podnožje" },
  ];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Dobro došli</h1>
        <p className="mt-1 text-sm text-muted">Izaberite šta želite urediti. Svaka sačuvana izmjena se automatski objavljuje na sajtu za 2–4 minute.</p>
      </header>
      {!tokenSet && (
        <Notice tone="warn">
          Čuvanje izmjena još nije moguće: nedostaje GitHub token. <a href="#/postavke" className="font-semibold underline">Otvorite Postavke</a>.
        </Notice>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="flex h-full gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <l.icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-bold text-ink">{l.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{l.text}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Card title="Posljednje objave" help="Nakon svakog čuvanja sajt se ponovo napravi i postavi na server." actions={<Button size="sm" variant="ghost" onClick={refresh}>Osvježi</Button>}>
        {tokenSet ? <RunList /> : <p className="text-sm text-muted">Dostupno nakon postavljanja tokena.</p>}
      </Card>
    </div>
  );
}

export function PagesIndex() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink">Stranice</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {pageDocs.map((d) => (
          <li key={d.id}>
            <a href={`#/stranica/${d.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold text-ink shadow-sm ring-1 ring-slate-200/70 hover:ring-brand-300">
              <FileText className="size-5 text-brand-500" aria-hidden /> {d.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MediaScreen() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Slike</h1>
        <p className="mt-1 text-sm text-muted">
          Sve slike sajta. Nove slike otpremljene ovdje se objavljuju zajedno sa sljedećom sačuvanom izmjenom. Sliku na stranici mijenjate u
          uređivanju te stranice (polje sa slikom → Promijeni).
        </p>
      </header>
      <Card>
        <MediaLibrary />
      </Card>
    </div>
  );
}

export function SettingsScreen({ onTokenSaved }: { onTokenSaved: () => void }) {
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [savingToken, setSavingToken] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", repeat: "" });
  const [savingPw, setSavingPw] = useState(false);

  const load = () =>
    api
      .settings()
      .then(setS)
      .catch((e) => setError((e as Error).message));
  useEffect(() => {
    load();
  }, []);

  const saveToken = async () => {
    setSavingToken(true);
    try {
      await api.setToken(token);
      setToken("");
      toast("ok", "Token je sačuvan i radi.");
      onTokenSaved();
      load();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setSavingToken(false);
    }
  };

  const savePw = async () => {
    if (pw.next !== pw.repeat) return toast("error", "Nove lozinke se ne poklapaju.");
    setSavingPw(true);
    try {
      await api.setPassword(pw.current, pw.next);
      setPw({ current: "", next: "", repeat: "" });
      toast("ok", "Lozinka je promijenjena.");
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Postavke</h1>
      {error && <Notice tone="error">{error}</Notice>}
      {!s && !error && <Spinner />}
      {s && (
        <>
          <Card title="Promjena lozinke">
            <div className="grid max-w-md gap-4">
              <div>
                <FieldLabel label="Trenutna lozinka" htmlFor="pw-cur" />
                <input id="pw-cur" type="password" autoComplete="current-password" className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </div>
              <div>
                <FieldLabel label="Nova lozinka" help="Najmanje 10 znakova." htmlFor="pw-new" />
                <input id="pw-new" type="password" autoComplete="new-password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </div>
              <div>
                <FieldLabel label="Ponovite novu lozinku" htmlFor="pw-rep" />
                <input id="pw-rep" type="password" autoComplete="new-password" className={inputCls} value={pw.repeat} onChange={(e) => setPw({ ...pw, repeat: e.target.value })} />
              </div>
              <div>
                <Button variant="primary" icon={<KeyRound className="size-4" />} loading={savingPw} disabled={!pw.current || pw.next.length < 10} onClick={savePw}>
                  Promijeni lozinku
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Povezanost sa GitHubom" help={`Repozitorij: ${s.repo} (grana ${s.branch})`}>
            {s.tokenCheck ? <Notice tone={s.tokenCheck.ok ? "ok" : "error"}>{s.tokenCheck.message}</Notice> : <Notice tone="warn">Token nije postavljen – izmjene se ne mogu sačuvati.</Notice>}
            <details className="mt-4 text-sm text-muted">
              <summary className="cursor-pointer font-semibold text-ink">Kako napraviti novi token</summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Na GitHubu otvorite <strong>Settings → Developer settings → Personal access tokens → Fine-grained tokens</strong> →{" "}
                  <a className="font-semibold text-brand-600 underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">
                    Generate new token
                  </a>
                  .
                </li>
                <li>Repository access: <strong>Only select repositories</strong> → {s.repo}.</li>
                <li>
                  Permissions → Repository: <strong>Contents: Read and write</strong>, <strong>Actions: Read-only</strong>.
                </li>
                <li>Kopirajte token (počinje sa <code>github_pat_</code>) i zalijepite ga ispod.</li>
              </ol>
            </details>
            <div className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
              <input
                type="password"
                autoComplete="off"
                placeholder="github_pat_…"
                aria-label="Novi GitHub token"
                className={inputCls}
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
              />
              <Button variant="primary" loading={savingToken} disabled={token.length < 20} onClick={saveToken}>
                Sačuvaj token
              </Button>
            </div>
          </Card>

          <Card title="Posljednje aktivnosti">
            {s.log.length === 0 ? (
              <p className="text-sm text-muted">Nema zapisa.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {s.log.map((l, i) => (
                  <li key={i} className="flex flex-wrap gap-x-3 py-2">
                    <span className="w-28 shrink-0 text-muted">{timeAgo(l.t)}</span>
                    <span className="font-semibold text-ink">{l.e}</span>
                    {l.d && <span className="min-w-0 truncate text-muted">{l.d}</span>}
                    <span className="ml-auto text-xs text-slate-400">{l.ip}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
