# Admin panel i objava sajta

## Kako radi

```
Klijent u /admin  ──►  PHP API (public/admin/api, PHP 7.3)  ──►  GitHub API: commit u granu main
                                                                      │
                     Plesk (httpdocs)  ◄── FTPS ◄──  GitHub Actions: npm run build (.github/workflows/deploy.yml)
```

- Sajt je statičan (`next build` → `out/`), hosting je Windows Plesk/IIS bez Node.js-a.
- Sadržaj je u `src/content/`:
  - `site.json` – kontakt, brojke, podnožje, CTA
  - `pages/*.json` – tekstovi i slike stranica
  - `brands.json`, `products.json`
  - `blog/*.md` – članci (zaglavlje + Markdown)
  - `leaflets/*.json` – letci (još se ne uređuju u adminu)
- Admin čuva izmjene kao commit (autor "Admin panel"); svaki commit na `main` pokreće build i objavu (2–4 min).
- Nove slike iz admina idu u `public/uploads/GGGG/MM/` (u istom commitu); WebP verzije pravi `scripts/optimize-images.mjs`.
- Forme admina se generišu iz `src/admin/schema.ts` – novo polje = dodati ga u JSON, šemu i stranicu sajta.

## Server (samo na serveru, nikad u repou)

`httpdocs/admin/_data/` – PHP ga sam pravi i puni:

| Fajl | Sadržaj |
|---|---|
| `config.php` | hash lozinke, GitHub token, repo, grana (JSON iza `<?php exit; ?>`) |
| `sessions/`, `ratelimit.php`, `log.php` | sesije, zaštita prijave, dnevnik |
| `pending/`, `cache/` | slike koje čekaju objavu, keš pregleda |

Zaštita: `hiddenSegments` u `public/admin/web.config` + svaki osjetljivi fajl počinje sa `<?php … exit; ?>`.
GitHub Actions ga ne dira (`exclude: admin/_data/**`).

## Postavljanje (jednom)

1. **GitHub token za admin** (fine-grained): github.com/settings/personal-access-tokens/new
   - Repository access: samo `AdiZeljkovic/SynthesisPharm`
   - Permissions: *Contents: Read and write*, *Actions: Read-only*
   - Unosi se u adminu: Postavke → Povezanost sa GitHubom.
2. **Tajne za objavu** (repo → Settings → Secrets and variables → Actions):
   `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
   Dok `FTP_PASSWORD` ne postoji, workflow samo builda (korak "Objava na server" je preskočen).

## Lokalni razvoj admina

```powershell
npm run build
php -S 127.0.0.1:8080 -t out      # PHP 7.3 sa curl, openssl, mbstring, fileinfo, gd
```

Napraviti `out/admin/_data/config.php`:

```
<?php http_response_code(404); exit; ?>
{"password_hash":"<password_hash() izlaz>","github_token":"…","repo":"AdiZeljkovic/SynthesisPharm","branch":"neka-test-grana"}
```

Za `next dev` + PHP na drugom portu: `NEXT_PUBLIC_ADMIN_API=http://127.0.0.1:8080/admin/api` i u configu `"dev_origin":"http://localhost:3000"`.
