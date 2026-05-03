# GitHub Pages Setup

## 1. The Two Patterns

**Pattern A — Pages from branch root (current)**

Source: Settings → Pages → Deploy from branch → `main` / `/ (root)`

GitHub serves files directly from the `main` branch root. The root `index.html` is the entry point.

**Current state:** Root `index.html` is a `<meta>` refresh redirect to `apps/ride-tracker/`. Live URL is `https://rchalanc-crypto.github.io/APP_Dev/`, which loads ride-tracker. Pages source is `main / root` — no workflow file, no Actions runs.

Pros:
- Zero config. No workflow file. No Actions minutes consumed.
- Live within ~30 seconds of enabling Pages.

Cons:
- One entry point per repo. Adding a second app means hand-rolling a hub page or updating the redirect manually.
- No per-app path isolation — everything is relative to root.

**Pick this when** you have one primary app, no build step, and want to ship in two minutes. This is the current pattern — don't change it until you're adding app #2.

---

**Pattern B — Pages via GitHub Actions (multi-app)**

Source: Settings → Pages → Deploy from GitHub Actions

A workflow assembles an `_site/` directory by copying `apps/*` and `shared/` in, then uploads it as the Pages artifact via `actions/upload-pages-artifact`.

Pros:
- Each app at its own sub-path: `/APP_Dev/apps/ride-tracker/`
- Shared assets served once from `_site/shared/`
- Adding app #2 is just dropping it in `apps/` — no redirect surgery

Cons:
- Every push triggers a workflow run (~1–2 min deploy vs ~30 sec for Pattern A)
- Build logic lives in YAML and must stay in sync with the folder structure
- Requires a one-time settings change to flip the Pages source

**Pick this when** you have two or more apps that need independent paths, or when any app gets a build step.

**Current default is Pattern A. Do not switch preemptively.**

---

## 2. Workflow for Pattern B

When ready to switch, add this at `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build _site
        run: |
          mkdir -p _site
          cp -r apps _site/apps
          cp -r shared _site/shared
          if [ -f index.html ]; then
            cp index.html _site/index.html
          else
            echo '<meta http-equiv="refresh" content="0;url=apps/ride-tracker/">' > _site/index.html
          fi

      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

The fallback `index.html` in the build step ensures the existing live URL keeps redirecting to ride-tracker even if someone removes the root `index.html`.

---

## 3. One-Time Switch from Pattern A to Pattern B

Do this when you're adding app #2 and need per-app paths.

1. Add the workflow file above and push to `main`. Confirm the Actions run completes without error before touching Settings.
2. Repo **Settings → Pages → Build and deployment → Source** → switch from "Deploy from a branch" to "GitHub Actions".
3. Trigger a manual run: Actions tab → "Deploy GitHub Pages" → "Run workflow". Confirm the deploy URL loads correctly.
4. Update `README.md` app-index links to the new sub-paths (e.g. `/APP_Dev/apps/ride-tracker/`).
5. Test the existing live URL — the fallback redirect in the workflow keeps it working.

Tradeoff: you lose the ~30-second instant deploy. Every `main` push now takes ~2 minutes. Worth it when you have two apps; not worth it for one.

---

## 4. Custom Domain

1. Add a `CNAME` file at repo root containing exactly one line: your domain (e.g. `rides.example.com`).
2. At your DNS provider, add a `CNAME` record: `rides.example.com → rchalanc-crypto.github.io`.
3. Repo **Settings → Pages → Custom domain** — enter the domain and save.
4. Check "Enforce HTTPS" once GitHub provisions the cert (usually under 5 minutes).
5. Update README links and the root redirect target to the new domain.

For an apex domain (`example.com` with no subdomain), use four `A` records pointing at GitHub's IPs instead of a `CNAME`. Check GitHub's Pages documentation for current IPs — they change occasionally.

---

## 5. Cache Busting

GitHub Pages CDN caches assets for ~10 minutes.

**Single-file apps (current pattern):** A hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) clears the local browser cache. For a friends app this is almost always sufficient — just tell people to hard-refresh if they're seeing stale content.

If you want automatic busting without a build step, append a commit SHA as a query string to any asset you're versioning:

```html
<script src="app.js?v=abc1234"></script>
```

Update the hash manually on meaningful releases, or pull it from a build script with `$(git rev-parse --short HEAD)`.

**Apps with a build step:** Vite hashes filenames by default (`app.a1b2c3.js`). Don't add query strings manually — the bundler handles it and does it correctly.

For fun apps, hard-refresh is a legitimate strategy. Don't introduce a build step just for cache control.

---

## 6. Rollback

```bash
git revert <bad-commit-sha>
git push
```

Pages re-deploys within ~1 minute (Pattern A) or ~2 minutes after the Actions run completes (Pattern B). There is no "deploy previous version" button — the revert commit is the rollback mechanism. This is a feature: the rollback is explicit, tracked in git history, and itself reversible.

---

## 7. When to Outgrow GitHub Pages

**Move to Netlify when:**
- An app needs a build step *and* you want per-PR preview deploy URLs (Netlify generates these automatically)
- You need Netlify Forms for zero-backend form handling
- You need serverless functions without managing a backend

Netlify config: base directory `apps/<name>/`, build command per app, publish directory `dist/`.

**Move to Cloudflare Pages when:**
- Global edge caching matters (faster delivery outside North America)
- You want Cloudflare Workers co-located with the app

Both are free at this scale. Don't switch preemptively. GitHub Pages is the right default until a specific limitation forces the move — and switching is a 15-minute task when you get there.
