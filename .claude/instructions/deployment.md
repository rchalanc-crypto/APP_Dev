# Deployment Runbook

This is the orchestrating runbook for getting a Web Apps Lab app from local working code to a live public URL. It covers the decision of where to deploy, the step-by-step flow for each target, when an app is ready to go public, rollback, and disaster recovery. It does not duplicate content owned by the runbooks below — follow the links for details.

## 1. Runbook Owners

| Topic | Runbook |
|---|---|
| Firebase project setup, database choice, SDK wiring, security rules, free-tier limits | [firebase-setup.md](firebase-setup.md) |
| GitHub Pages Pattern A vs B, workflow YAML, cache busting, custom domain, rollback | [github-pages-setup.md](github-pages-setup.md) |
| Pre-share security checklist, abuse vectors, hard-stop conditions | [security-checklist.md](security-checklist.md) |

---

## 2. Deployment Targets — Which to Pick

| Target | Pick when… |
|---|---|
| **GitHub Pages** (default) | Single-file HTML, no build step, no preview deploys needed. Zero config; live within ~30 seconds of a push. |
| **Netlify** | App has a build step (Vite/React), needs per-PR preview deploy URLs, Netlify Forms, or light serverless functions. |
| **Cloudflare Pages** | Global edge delivery matters, or you need Cloudflare Workers co-located with the app for auth or rewrites. |

Default is GitHub Pages. Don't switch targets preemptively — the friction of switching is low when a real limitation forces it.

---

## 3. Standard Deploy Flow — GitHub Pages, Single-File App

Starting point: code is ready and tested in `apps/<name>/`.

1. **Pre-deploy checks**
   - Run the full [security-checklist.md](security-checklist.md) Skeptic-persona pass.
   - If the app has a Firebase backend: confirm rules are tightened from test mode — see [firebase-setup.md §5](firebase-setup.md) for rule tiers.
   - Confirm no secrets are staged: `git diff --cached | grep -iE 'apikey|secret|password|token'` should return nothing sensitive.

2. **Commit on a feature branch.** Open a PR if the change touches more than three files. Otherwise a direct push to `main` is fine for small single-app changes.

3. **Merge to `main`.**

4. **Pages source check.** Confirm which pattern is active before expecting the live URL to update — see [github-pages-setup.md §1](github-pages-setup.md) for Pattern A vs Pattern B and their deploy timing (~30 sec vs ~2 min).

5. **Verify the live URL** within ~1 minute of merge (Pattern A) or after the Actions run completes (Pattern B). Hard-refresh if you see stale content.

6. **First deploy only:** Update `apps/<name>/README.md` with the live URL.

7. **First deploy only:** Add or update the app entry in the root `README.md` app index.

8. **Append to `docs/tooling-decisions.md`** — date, app name, what was decided, which AI tool did what.

---

## 4. Standard Deploy Flow — Netlify, Build-Step App

Starting point: code is ready in `apps/<name>/`, build step confirmed working locally.

1. **Pre-deploy checks** — same as step 1 above.

2. **First deploy only:** Netlify dashboard → **Add new site → Import an existing project** → connect the GitHub repo.
   - Base directory: `apps/<name>/`
   - Build command and publish directory: per the app's `CLAUDE.md`
   - Confirm the first deploy succeeds before sharing any URL.

3. **Subsequent deploys:** Push to `main`. Netlify auto-builds and deploys. No manual steps required.

4. **PR preview URLs:** Every pull request gets a unique preview URL from Netlify. Verify the preview before merging to `main`.

5. **Verify the production URL** after merge. Netlify deploy typically completes in 1–3 minutes.

6. **README updates** — same as steps 6–8 above.

---

## 5. Promoting an App from Preview to Public

"Going public" means the URL is shared beyond a closed group — posted in a channel, linked from a profile, or sent to strangers. Four conditions must hold before that happens:

- [ ] **Skeptic-persona pass complete** — full [security-checklist.md](security-checklist.md) run, no boxes skipped
- [ ] **Firebase rules are not test-mode** — if the app has a backend, at minimum the baseline rule tier from [firebase-setup.md §5](firebase-setup.md) is applied
- [ ] **Budget alert active** — $0.01 alert set in Google Cloud Billing (see [firebase-setup.md §6](firebase-setup.md))
- [ ] **No-warranty disclaimer** added to the app's README and ideally to the app footer: *"Fun project, no warranty. Data may be lost."*

Until all four hold, the app is **private-share only** — direct link to specific people, not posted publicly.

---

## 6. Rollback

Revert the bad commit and push. Pages and Netlify pick up the push automatically.

```bash
git revert <bad-commit-sha>
git push origin main
```

- **GitHub Pages:** republishes within ~1 minute (Pattern A) or after the Actions run (~2 min for Pattern B). There is no "deploy previous version" button in the GitHub UI — the revert commit is the rollback mechanism, and it's itself reversible if needed.
- **Netlify:** also picks up the revert push and auto-deploys. You can additionally go to the Netlify dashboard → **Deploys** and click **Publish deploy** on any prior successful deploy to skip the build queue.

For workflow/YAML-level rollback issues, see [github-pages-setup.md §6](github-pages-setup.md).

---

## 7. Disaster Scenarios — Quick Reference

| Scenario | First action | Follow-up |
|---|---|---|
| **Live app down — 404 or blank page** | Check GitHub Pages or Netlify build status | If status is green: try a hard refresh (`Ctrl+Shift+R`). If status is red: read the build log for the failing step. |
| **Firebase quota hit or unexpected billing** | Check Google Cloud Console → Billing | Tighten database rules to reduce reads/writes. Consider adding an Auth gate. See [firebase-setup.md §6](firebase-setup.md) for free-tier ceilings. |
| **Secret accidentally committed** | **Rotate the secret immediately** — do NOT rely on `git revert` alone; the secret is in git history | Run `git filter-repo` or BFG Repo Cleaner to scrub history, then force-push. Notify any service whose key leaked. Then continue with normal revert/fix commit. |
| **Deploy succeeded but live URL serves old content** | Hard refresh first (`Ctrl+Shift+R` / `Cmd+Shift+R`) | If it persists: confirm the Actions workflow ran on the correct branch and that the Pages source is set to the correct pattern — see [github-pages-setup.md §1](github-pages-setup.md). |

---

## 8. Multi-App Coordination Notes

The repo deploys as a single GitHub Pages site (or a single Netlify project). All apps under `apps/` share the same infrastructure.

- **Adding an app with Pattern A active:** You will need to update the root `index.html` redirect or switch to Pattern B. See [github-pages-setup.md §3](github-pages-setup.md) for the one-time switch steps. Do not switch preemptively — wait until you're actually adding app #2.
- **Adding an app with Pattern B active:** Drop the app in `apps/<name>/`. The workflow copies all of `apps/*` into `_site/` automatically. No Pages config changes needed.
- **Every new app** requires an update to the root `README.md` app index, regardless of pattern.
- **Removing an app:** `rm -rf apps/<name>/`, remove from root `README.md`, commit. The live URL will return 404 — this is expected. Do not add a redirect for removed apps unless explicitly asked.

---

## 9. What Goes Here vs. Elsewhere

- Firebase config, rules, SDK wiring, free-tier details → [firebase-setup.md](firebase-setup.md)
- Pages workflow YAML, Pattern A vs B details, cache busting, custom domain → [github-pages-setup.md](github-pages-setup.md)
- Pre-share checklist, abuse vectors, hard-stop redesign conditions → [security-checklist.md](security-checklist.md)
