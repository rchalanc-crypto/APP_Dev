# Session 1 — Housekeeping & Guest-Viewing Cutover

> One Claude Code session, fresh, execution-ready. Lands at repo root or `docs/`.
> Ride-tracker v2 is a SEPARATE spec: `apps/ride-tracker/SPEC-V2.md` — run it AFTER this.

---

# SESSION 1 — Housekeeping & Guest-Viewing Cutover [EXECUTION-READY]

## Goals

1. `follyintenerife.com/` root serves the Tenerife site (guests who type the bare domain land right).
2. Ride-tracker gets a permanent home at `apps/ride-tracker/`.
3. Firebase rules live in the repo and deploy via CLI — no more Console-paste drift (the cause of this week's outage).

## 1.1 Verify current state first (do not assume)

The change log records a contradiction: the restructure branch moved ride-tracker to
`apps/ride-tracker/`, but the Phase B deploy note says that path 404s and root serves
ride-tracker directly. Resolve empirically before editing:

```bash
ls apps/ride-tracker/          # does it exist on main? what's in it?
head -30 index.html            # is root index.html the full ride-tracker app?
```

Proceed on what main actually contains. Expected: root `index.html` IS the live
ride-tracker (confirmed via raw.githubusercontent fetch 2026-06-12, firebaseConfig
targets `bigwhinybabyteartracker`).

## 1.2 Relocate ride-tracker

- `git mv index.html apps/ride-tracker/index.html` (or reconcile if a stale copy
  already exists there — the live root version wins; diff before overwriting).
- Confirm `apps/ride-tracker/README.md` exists and reflects reality.

## 1.3 Root redirect → folly

New root `index.html`:

```html
<!DOCTYPE html><meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=apps/nassims-folly/">
<link rel="canonical" href="https://follyintenerife.com/apps/nassims-folly/">
<title>Nassim's Folly</title>
```

- Also update the Pattern B workflow fallback in `.github/workflows/deploy-pages.yml`
  (it currently synthesizes a redirect to ride-tracker if root index.html is missing)
  → point fallback at `apps/nassims-folly/` for consistency.

## 1.4 Firebase rules into the repo + CLI deploys

- `npm install -g firebase-tools` && `firebase login` (one-time, interactive — Robert
  does the browser auth step).
- **ride-tracker**: create `apps/ride-tracker/database.rules.json` containing the
  production rules deployed via Console on 2026-06-12 (sessions + availability,
  shape-validated). Add `apps/ride-tracker/firebase.json` + `.firebaserc` pinning
  project `bigwhinybabyteartracker`.
- **nassims-folly**: `apps/nassims-folly/firebase-rules.json` already exists in repo
  (Phase A). Add matching `firebase.json` + `.firebaserc` pinning `wal-nassims-folly`
  so it deploys the same way. Verify repo copy matches Console (diff manually — the
  Phase 2 rules update went via Console paste and may have drifted).
- Deploy command per app, documented in each app README:
  `cd apps/<name> && firebase deploy --only database`
- Rule going forward (add to root CLAUDE.md): **rules changes are commits + CLI
  deploys. Console paste is for emergencies only, and must be back-ported to the
  repo file same-day.**

## 1.5 Comms + docs

- Glenn's URL changes to `follyintenerife.com/apps/ride-tracker/` (github.io
  equivalent also works). Tell Glenn. Old root URL now shows the folly redirect.
- README (root): update app index URLs.
- change_log.md: one entry covering — test-mode expiry outage (dead since May 31,
  diagnosed + production rules deployed 2026-06-12, root cause: template paths
  `entries` ≠ live paths `sessions`, rules lived only in Console); this cutover;
  rules-in-repo policy.
- docs/tooling-decisions.md: entry for the session.

## 1.6 Acceptance

- [ ] `follyintenerife.com/` redirects to the folly app; magic-link sign-in still works
      (LIVE_URL and authorized domains unchanged — folly app path didn't move)
- [ ] `follyintenerife.com/apps/ride-tracker/` serves ride-tracker; data loads; log a
      test session; availability toggle works
- [ ] `firebase deploy --only database` succeeds from both app folders with no diff
      vs Console state
- [ ] Workflow fallback updated; Actions run green
- [ ] Glenn notified; READMEs, change_log, tooling-decisions updated

---

---

# Note

Session 2 (ride-tracker v2) lives in its own final spec: `apps/ride-tracker/SPEC-V2.md`
(SPEC-V2-ridetracker.md). Decisions locked 2026-06-12. Do not look for it here.
