# WEB APPS LAB — CHANGE LOG

> Audit trail for all structural, architectural, and deployment changes across the program.
> App-level bugs and minor edits belong in commit messages; decisions that affect the whole
> program structure or that a future session needs to understand belong here.
> Entries ordered newest-first (reverse chronological).

---

## [2026-05-03] — Program Base Restructure [COMPLETED — branch: restructure/program-base]

### Summary

**[ARCH] Converted single-app repo to multi-app program structure.**

**Motivation:** ride-tracker was the only app and lived at repo root with no scaffolding for
adding a second app without clobbering the first. Repo had no conventions, no templates, no
shared design layer, and no deployment runbooks. Any new app would have required re-inventing
structure from scratch each session.

**What changed:**

**[ARCH] Folder structure introduced**
- `apps/<name>/` — one folder per shipped app; each self-contained with its own README and CLAUDE.md
- `templates/` — read-only starter kits; copy out, never edit in place
- `shared/design-tokens/` + `shared/snippets/` — reusable CSS vars and JS patterns across apps
- `.claude/instructions/` — deployment, Firebase, Pages, and security runbooks (currently stubs)
- `.claude/personas/` — Gem Swarm crew definitions for design/review passes
- `docs/` — program plan and tooling decisions log
- `.gemini/` — reserved for Gemini CLI context files

**[REFACTOR] ride-tracker moved to `apps/ride-tracker/`**
- `index.html` and `README.md` moved via `git mv` (history preserved; git detects ~100% rename on README)
- Root `index.html` replaced with a meta-refresh redirect to `apps/ride-tracker/`
- **Pages continuity:** GitHub Pages source unchanged (main / root). Existing live URL
  `https://rchalanc-crypto.github.io/APP_Dev/` redirects seamlessly. No workflow changes needed.

**[ARCH] Master config files dropped in**
- `CLAUDE.md` at root — stack defaults, conventions, security non-negotiables, persona invocation
- `.claude/personas/personas.md` — full Gem Swarm crew (Strategist, Designer, Architect, Shipper, Skeptic, Janitor)
- `docs/PROGRAM_PLAN.md` — operating model, tool roles, per-app workflow

**[ARCH] static-firebase template seeded**
- `templates/static-firebase/index.html` — ride-tracker scrubbed of all live Firebase config and
  app-specific copy; replaced with `{{PLACEHOLDER}}` markers. Structural HTML/CSS/JS preserved as
  the reusable pattern.
- All six `firebaseConfig` values replaced. `databaseURL` placeholder added (was missing from
  live app config but required for Realtime Database in some SDK versions).
- `TEMPLATE_README.md` documents every placeholder and the copy-out workflow.
- `firebase-config.example.js` documents the config shape with safe placeholder values.

**[ARCH] Shared layer seeded**
- `shared/design-tokens/tokens.css` — `:root` CSS variable block extracted from ride-tracker
  with usage notes for both self-contained and multi-file apps
- `shared/snippets/firebase-init.js` — clean, annotated Firebase init + localStorage fallback
  pattern; reference snippet, not a live module

**[ARCH] Root hygiene**
- `.gitignore` — node_modules/, .env, .env.*, dist/, .DS_Store, *.log; `.env.example` negated
- `.env.example` — shape reference; Firebase client config explicitly called out as belonging in
  `index.html`, not here
- `README.md` — program-level index (replaces ride-tracker setup guide at root); apps table
  with live URLs, structure overview, quickstart for adding app #2

### Files Changed

| File | Change Type | Description |
|---|---|---|
| `index.html` | Replaced | Root now holds meta-refresh redirect; old content moved to apps/ride-tracker/ |
| `apps/ride-tracker/index.html` | Moved | git mv from root; live app unchanged |
| `apps/ride-tracker/README.md` | Moved | git mv from root; content unchanged |
| `apps/ride-tracker/CLAUDE.md` | New | Stub: inherits root, no overrides |
| `CLAUDE.md` | New | Master conventions and stack defaults |
| `.claude/personas/personas.md` | New | Gem Swarm crew definitions |
| `.claude/instructions/deployment.md` | New | Stub runbook |
| `.claude/instructions/firebase-setup.md` | New | Stub runbook |
| `.claude/instructions/github-pages-setup.md` | New | Stub runbook |
| `.claude/instructions/security-checklist.md` | New | Stub runbook |
| `templates/static-firebase/index.html` | New | Scrubbed ride-tracker template |
| `templates/static-firebase/TEMPLATE_README.md` | New | Placeholder reference and copy-out instructions |
| `templates/static-firebase/firebase-config.example.js` | New | Config shape reference |
| `shared/design-tokens/tokens.css` | New | Extracted :root CSS variables |
| `shared/snippets/firebase-init.js` | New | Firebase init + fallback snippet |
| `docs/PROGRAM_PLAN.md` | New | Operating model and tool roles |
| `docs/tooling-decisions.md` | New | Tooling log; seeded with this restructure entry |
| `README.md` | New | Program-level index (replaces app-specific setup guide at root) |
| `.gitignore` | New | Standard web project ignores |
| `.env.example` | New | Secret shape reference |
| `change_log.md` | New | This file |

### Open Items

- [ ] Push `restructure/program-base` and merge via PR (push blocked by missing HTTPS credential in WSL; push manually)
- [ ] Confirm live redirect: `https://rchalanc-crypto.github.io/APP_Dev/` → `apps/ride-tracker/`
- [ ] Fill in four `.claude/instructions/` runbook stubs
- [ ] Add screenshot to `apps/ride-tracker/README.md`
- [ ] Create Claude.ai Project "Web Apps Lab" and upload files listed in `docs/PROGRAM_PLAN.md §3`

---

## [2026-05-01] — ride-tracker v1 Shipped [COMPLETED]

### Summary

**[FEATURE] Real-time collaborative MTB and kite session tracker.**

Single-file HTML app. No build step. Firebase Realtime Database for live multi-user sync,
localStorage fallback for offline/Firebase-unavailable use.

**Stack decisions:**
- Single-file HTML — justified: app state is simple (availability grid + session log + stats).
  No routing. No component hierarchy that demands a framework.
- Firebase Realtime Database (free tier) — chosen over localStorage-only because the core
  value proposition is two users seeing each other's availability in real-time without a
  server to maintain.
- GitHub Pages — zero-config for a static HTML file; no build step required.
- Google Fonts CDN (Bebas Neue + DM Sans) — acceptable for a private/friends app; not suitable
  for apps where font CDN privacy or offline use matters.

**Features shipped:**
- Name-based login (no auth; identity is a plain string stored in localStorage)
- 14-day rolling availability calendar — click to toggle; real-time sync via Firebase
- Session logger — type (MTB / Kite), date, location dropdown with "Other" free-text, notes
- Session history — reverse-chron card list; user can delete own entries only
- Stats view — total session counts, MTB location breakdown with progress bars
- Live/offline status indicator (fixed bottom-right)
- localStorage fallback when Firebase config is missing or init fails

**Security posture at ship:**
- Firebase config committed to repo (acceptable — client config is public; rules protect data)
- Database rules: test mode (open read/write) — acceptable for private friends-only use;
  flagged for tightening before any broader sharing
- No user auth — identity spoofing is possible; acceptable for the use case

**Known limitations at ship:**
- Availability calendar always shows 14 days from today; no ability to view past availability
- Location dropdown is hard-coded (Squamish, Eagle Mountain, Other); no per-user custom locations
- No pagination on session history
- Session notes field has no length cap in client or Firebase rules

### Files at Ship

| File | Description |
|---|---|
| `index.html` | Complete single-file app (30 KB) |
| `README.md` | Firebase setup guide for a new instance |

---
