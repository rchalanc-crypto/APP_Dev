# WEB APPS LAB — CHANGE LOG

> Audit trail for all structural, architectural, and deployment changes across the program.
> App-level bugs and minor edits belong in commit messages; decisions that affect the whole
> program structure or that a future session needs to understand belong here.
> Entries ordered newest-first (reverse chronological).

---
## [2026-05-06] — nassims-folly Phase 3: Spec Approved [PENDING BUILD]

[SPEC] Phase 3 spec drafted in Claude.ai chat. Content seed v2 finalised.

- SPEC-PHASE-3.md added to apps/nassims-folly/
- Deadpan First Mate replaced by Gnatalee McCringleberry, Keeper of the Sanity
- Data model update: keeper_note optional field on /content/diary/{id}
- Seed content: 3 diary entries (dep-001, voy-014, arr-001), 50 fun facts,
  25 activities (20 original + 5 motor category)
- Character canon locked: J.D.M. plays golf and pickleball badly; Gnatalee
  beats him at both first try; her real sports are kitesurfing, rally, MTB
- Phase 4 planned: activities UI, kite weather (Open-Meteo, 3 spots),
  Required Viewing video section (Ken Block + Travis Pastrana Gymkhana),
  property gallery

---
## [2026-05-06] — nassims-folly: Phase 3 Planning [PLANNING]

Phase 3 scope confirmed in Claude.ai session 2026-05-06. No code changes — planning only.

### Scope
- Fun facts seed (~50 entries) in `/content/fun_facts` — Claude.ai chat session
- Diary seeding: J.D.M. voice (3 entries: pre-departure, mid-voyage, arrival) + Gnatalee McCringleberry, Keeper of the Sanity (3 entries) — Claude.ai chat session
- Admin compose UI for new diary entries — Claude Code session
- Property section wiring (activates when `/content/property/status` flips to `confirmed`) — Claude Code session
- Voyage page visual pass — Claude Code session

### Character name confirmed
"Deadpan First Mate" working name resolved: **Gnatalee McCringleberry, Keeper of the Sanity**. Voice: bone-dry, undermines J.D.M. without directly contradicting him.

### Session order
1. Claude.ai: seed fun facts pool
2. Claude.ai: seed diary samples (J.D.M. + Gnatalee)
3. Claude Code: Phase 3 build (admin compose UI + property wiring + voyage visual pass)

---
## [2026-05-06] — nassims-folly: Admin Dashboard Bug Fixes [COMPLETED]

- RSVP Dashboard was showing stale data (only Aubry) due to Firebase RTDB SDK serving a cached snapshot for `/invitees` on first admin load. Fixed by switching to direct REST API fetch (`/invitees.json?auth=<idToken>`) which bypasses the SDK local sync tree entirely.
- Tab switching now reloads data on each click (was load-once on admin screen open).
- Admin link now uses a direct click handler instead of relying on hashchange, fixing intermittent navigation failures.

---
## [2026-05-05] — nassims-folly Phase 2.H: Custom Email Sender [COMPLETED]

Phase 2.H — Custom email sender: configured Firebase Auth custom domain for follyintenerife.com. Auth emails now send from `noreply@follyintenerife.com` (was: `noreply@wal-nassims-folly.firebaseapp.com`). Required Blaze plan upgrade (already done) and DNS records at Cloudflare (TXT for SPF + Firebase verification, 2× CNAME for DKIM).

- From address: `noreply@follyintenerife.com` ✓ — verified end-to-end
- Magic link continueUrl: `follyintenerife.com/apps/nassims-folly/` ✓
- SPF/DKIM: DNS records confirmed live via nslookup
- Spam on first sends: expected for new sending domain — no action needed, reputation builds over time
- Firebase platform limitation: passwordless sign-in email body, sender display name, and reply-to are NOT customizable through Firebase Console — locked by Firebase. Workaround (future): generate link via Admin SDK and send via custom SMTP (out of scope Phase 2)

---
## [2026-05-05] — nassims-folly Phase 2.G: Custom Domain URL Cutover [COMPLETED]

Phase 2.G — URL cutover: follyintenerife.com live, actionCodeSettings.url updated, Firebase authorized domains updated. github.io retained as fallback. Email sender still default firebaseapp.com — addressed in Phase 2.H.

- Custom domain `follyintenerife.com` configured: DNS A records (4x GitHub Pages IPs) + CNAME `www` → `rchalanc-crypto.github.io`, all DNS-only via Cloudflare
- GitHub Pages custom domain set; TLS cert provisioned by GitHub
- Firebase authorized domains: `follyintenerife.com` added; `rchalanc-crypto.github.io` retained
- `LIVE_URL` in `apps/nassims-folly/index.html` switched from `rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/` to `follyintenerife.com/apps/nassims-folly/`
- End-to-end verified: magic link email URL confirmed `follyintenerife.com`, sign-in and voyage page load confirmed on new domain
- github.io fallback URL still functional; ride-tracker URL untouched
- Email sender remains `noreply@wal-nassims-folly.firebaseapp.com` (Phase 2.H)

---
## [2026-05-05] — nassims-folly Phase 2: RSVP + Voyage Skeleton + Admin Dashboard [COMPLETED]

### Summary

**[FEATURE] Phase 2 complete — RSVP flow, voyage page skeleton, admin dashboard, tightened Firebase rules.**

**RSVP screen (§2.1)**
- Three-state machine driven by `/invitees/{uid}/status`: `pending` (Yes/No buttons + optional notes), `yes` (auto-routes to voyage page), `no` (warm decline screen with footer link)
- Optimistic UI: routes immediately on submit, writes `{status, responded_at, notes}` to Firebase in background, reverts with banner on failure
- Bidirectional "change my mind" links from both yes and no states back to pending

**Voyage page skeleton (§2.2)**
- Hero: 60-second countdown to 2027-05-25 00:00 WEST (explicit ISO offset `+01:00`, not browser-local)
- The Property: placeholder card pending Phase 3 content
- The Diary: placeholder pending Phase 3 content
- Activities: placeholder pending Phase 4 content
- Footer: fun fact pulled from `/content/fun_facts` at random; avoids last 30 seen via localStorage; falls back to a seeded fact until pool is populated
- Admin link in footer: shown only to admins; checked once per session via `/admin/{uid}` read (permission-denied caught silently for non-admins)

**Admin dashboard (§2.3)**
- Hash-routed at `#admin`; gated by `isAdmin` session flag; `hashchange` listener handles browser back
- RSVP tab: counts bar (Yes/No/Pending/Total), sortable table (status order: yes→no→pending, then name), click-to-expand notes rows
- Allowlist tab: table with Remove button per row (optimistic DOM removal + Firebase `remove()`); bulk CSV add with preview/confirm flow (validates name/email/party_size, computes sha256, multi-path `update()` at db root)
- XSS protection via `escapeHtml()` on all table rendering

**Firebase rules update (§2.4 / Step D)**
- `/invitees`: added collection-level `.read` for admins (needed by RSVP tab)
- `/allowlist`: collection `.read` tightened from any-signed-in to admin-only; per-hash `.read` left open to any signed-in user (needed by sign-in allowlist check)
- Rules deployed via Firebase Console paste

**Security pass**
- E1: invalid status `"maybe"` rejected by validate rule ✓
- E2: write to `/admin/{uid}` rejected (`admin/.write: false`) ✓
- E3: unknown field rejected (`$other: {".validate": false}`) ✓
- E4: admin reads `/invitees` collection ✓
- E5: non-admin read of `/invitees` denied (Simulator) ✓
- E6: non-admin read of `/allowlist` denied (Simulator) ✓
- No sensitive data in console output (only `console.error` with error objects)
- README no-warranty disclaimer present
- $0.01 budget alert active (Blaze plan, $0.00 used)

**Acceptance (§2.5)**
- All F1–F14 items confirmed; F9 verified with a real test account

### Deviations from SPEC

- None. All §2.1–2.4 items implemented as specified.

### What's next (Phase 3)

- Seed fun facts pool (~50 entries) in `/content/fun_facts` — Claude.ai chat session
- Seed diary entries (J.D.M. voice + Deadpan First Mate) — Claude.ai chat session
- Property section wiring (activates when `/content/property/status` flips to `confirmed`)
- Voyage page visual pass once first content block is in (deferred from Phase 2)
- Send real invites once test couple confirms (outside Claude Code scope)

---
## [2026-05-04] — nassims-folly Phase B: Deploy [COMPLETED]

**[DEPLOY] Wired firebaseConfig, switched GitHub Pages from Pattern A to Pattern B, ride-tracker continuity verified.**

- Replaced three firebaseConfig placeholders (`apiKey`, `messagingSenderId`, `appId`) in `apps/nassims-folly/index.html`; `storageBucket` updated from `.appspot.com` to `.firebasestorage.app` (new Firebase default for this project)
- Added `.gitignore` to main (was only on docs branch; added `*:Zone.Identifier`, `.env`, `dist/`, `node_modules/`)
- Added `.github/workflows/deploy-pages.yml` (Pattern B workflow with ride-tracker fallback redirect)
- Pushed to main; "Deploy GitHub Pages" Actions workflow ran green in ~28s
- Switched GitHub Pages source from "Deploy from a branch" to "GitHub Actions"
- nassims-folly live at `https://rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/`
- Ride-tracker continuity confirmed: root URL `https://rchalanc-crypto.github.io/APP_Dev/` still serves ride-tracker

**Deviations from SPEC:**
- Root URL serves ride-tracker directly (not via redirect to `apps/ride-tracker/`) — the redirect structure in SPEC §1.6 exists only on `docs/draft-deployment-runbook` branch, never merged to main. No regression: ride-tracker was always at the root URL.
- `apps/ride-tracker/` sub-path does not exist on main and returns 404 — this path never existed on main, only on the docs branch plan.

---
## [2026-05-04] — nassims-folly Phase A: Firebase Bootstrap & Allowlist Seed [COMPLETED]

### Summary

**[INFRA] Firebase project `wal-nassims-folly` bootstrapped; allowlist seeded; production rules deployed.**

- Firebase project created: `wal-nassims-folly`, Analytics disabled
- Authentication: Email link (passwordless) enabled; password sign-in left disabled
- Authorized domain added: `rchalanc-crypto.github.io`
- Realtime Database created (United States / us-central1 — Firebase RTDB does not offer us-west1;
  SPEC said us-west1 but the hardcoded `databaseURL` in `index.html` already targets the
  us-central1 URL format, so no code change needed)
- `/allowlist` seeded with both admin entries (SHA-256 hashes of lowercase emails):
  - Robert Chalmers (`rchalanc@gmail.com`) — hash `76b4975b…`
  - Nassim Rowhani (`nassim.rowhani@icloud.com`) — hash `3c2a96b3…`
- Production rules from `apps/nassims-folly/firebase-rules.json` deployed via Console paste
  (Option 1 — Firebase CLI not installed, no `.firebaserc`; console paste was faster for one-shot)
- Test mode banner confirmed gone; rules verified in Console
- `firebaseConfig` (`apiKey`, `messagingSenderId`, `appId`) captured by Robert for Phase B

### Deviations from SPEC

- RTDB region is `us-central1` (not `us-west1`) — Firebase RTDB US region maps to us-central1 only

### What's next (Phase B)

- Replace `{{FIREBASE_API_KEY}}`, `{{FIREBASE_MESSAGING_SENDER_ID}}`, `{{FIREBASE_APP_ID}}`
  placeholders in `apps/nassims-folly/index.html` with captured config values
- Push to main and confirm GitHub Pages serves the app at the live URL
- Both admins sign in via magic link; manually set `/admin/{uid}` records in RTDB Console

---
## [2026-05-03] — Tooling Library Seeded [COMPLETED]

[DOCS] Added reusable prompt and Gem definition files.

- .claude/prompts/fill-instruction-stubs.md
- .claude/prompts/draft-deployment-runbook.md
- .gemini/gems/repo-auditor.md
- .gemini/gems/pixel-and-polish.md

scaffold-new-app.md prompt deferred until app #2 is ready to scaffold.


## [2026-05-03] — Deployment Runbook Drafted [COMPLETED — branch: docs/draft-deployment-runbook]

### Summary

**[DOCS] Drafted `.claude/instructions/deployment.md` — the orchestrating end-to-end deployment runbook.**

All four `.claude/instructions/` runbooks are now filled; the instruction layer is complete.

- Covers deployment target selection (GitHub Pages / Netlify / Cloudflare Pages decision table)
- Standard deploy flows for both GitHub Pages (single-file) and Netlify (build-step)
- Public-promotion gate (four conditions must hold before sharing a URL beyond a closed group)
- Rollback procedure for both Pages and Netlify
- Disaster-scenario quick-reference table (404, Firebase quota, secret leak, stale cache)
- Multi-app coordination notes (Pattern A vs B behavior, adding/removing apps)
- Explicit "what goes here vs. elsewhere" section linking out to the three sibling runbooks

Does not duplicate content from firebase-setup.md, github-pages-setup.md, or security-checklist.md — links to them throughout.

**Instruction layer now complete. All four runbooks ready for upload to Claude.ai Project per `docs/PROGRAM_PLAN.md §3`.**

---

## [2026-05-03] — Instruction Runbooks Filled [COMPLETED — branch: docs/fill-instruction-stubs]

### Summary

**[DOCS] Replaced three `.claude/instructions/` stubs with full runbook content.**

- `.claude/instructions/firebase-setup.md` — stubs replaced with content (filled in prior session)
- `.claude/instructions/github-pages-setup.md` — stubs replaced with content
- `.claude/instructions/security-checklist.md` — stubs replaced with content

Firebase setup covers project creation (`wal-<app-name>` naming), RTDB vs Firestore tradeoff, web config wiring (SDK 10.7.1 ES module pattern from ride-tracker), three security rule tiers, free-tier ceilings, and a pre-share checklist.

GitHub Pages setup covers Pattern A (current, branch root) vs Pattern B (Actions, multi-app), the complete Pattern B workflow YAML, one-time switch steps, custom domain, cache busting, rollback, and when to move to Netlify/Cloudflare.

Security checklist covers 9 sections (secrets, Firebase rules, user input, supply chain, logging, free-tier limits, privacy, accessibility, pre-share) plus a hard-stop/redesign list. Format: Skeptic persona pass with `[ ]` checkboxes.

**Open items:**
- `.claude/instructions/deployment.md` — still pending (stub only) [CLOSED — drafted in branch docs/draft-deployment-runbook, 2026-05-03]

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
