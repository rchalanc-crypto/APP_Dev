# Fill Instruction Stubs — Claude Code Prompt

> **Type:** One-time prompt (already executed 2026-05-03 era). Kept as a reference for how to draft structured runbooks via Claude Code.
> **Target tool:** Claude Code, terminal, repo root.
> **Outcome when run:** Three `.claude/instructions/` runbooks filled from stub state, on a feature branch with conventional commits and a PR.

## When to reuse this prompt

- A future runbook stub needs filling and you want the same structural discipline applied
- You're modeling a similar "fill multiple structured docs in one branch" task

## How to use

Paste the body below into Claude Code at the repo root. It assumes `change_log.md`, `CLAUDE.md`, the four `.claude/instructions/*.md` stubs, and `templates/static-firebase/*` already exist.

---

## Prompt body

```text
You are working in the web-apps repo. Three runbook stubs need to be filled:

  .claude/instructions/firebase-setup.md
  .claude/instructions/github-pages-setup.md
  .claude/instructions/security-checklist.md

These were created during the program-base restructure (see change_log.md
entry dated 2026-05-03). They currently contain stub headers only.

Before doing anything, do this discovery pass:

1. Read change_log.md to confirm current repo state and any decisions
   already made about deployment patterns.
2. Read CLAUDE.md to confirm conventions (stack, security non-negotiables,
   coding style).
3. Read each of the three stub files to confirm they are still stubs and
   to capture any existing section headers I want preserved.
4. Read templates/static-firebase/index.html and
   templates/static-firebase/TEMPLATE_README.md to ground the Firebase
   guidance in the actual template shape.
5. Read apps/ride-tracker/index.html ONLY to extract the canonical
   Firebase init pattern and CDN versions actually in use. Do not copy
   the live config values. The live config stays in the live app; the
   runbooks reference the template's placeholder shape.
6. STOP and report:
     - What's currently in each stub (section headers, any TODO content)
     - Any conflicts you see between the stubs' implied structure and
       what I'm asking you to write
     - The Firebase SDK version actually in use in ride-tracker (so the
       runbook matches reality)
   Wait for my confirmation before writing.

After I confirm, write all three runbooks on a new branch named
`docs/fill-instruction-stubs`. One commit per file. Conventional commit
messages: `docs: fill <filename> runbook`.

=============================================================================
CONTENT REQUIREMENTS — match these exactly. Do not improvise structure.
=============================================================================

--- firebase-setup.md ---

Sections, in order:
  1. Create the project — naming convention `wal-<app-name>`, disable
     Analytics, region pick (us-west1 default for Robert in Port Coquitlam)
  2. Pick your database — RTDB default; Firestore only when complex
     queries / offline-first / doc modeling is actually needed. Name the
     tradeoff.
  3. Get the web config — config object IS public, identifies the project
     not authorizes access. Rules protect data.
  4. Wire it into the app — show the exact import + initializeApp pattern
     used in ride-tracker, with placeholders. Use the actual SDK version
     ride-tracker uses (confirm in step 5 of discovery).
  5. Security rules — the actual gate. Include three rule blocks:
       a) Baseline 1KB write cap, open read/write
       b) Namespaced-by-feature with shape constraints
       c) When to add Firebase Auth (anonymous auth gate)
  6. Free-tier ceilings — RTDB: 1 GB storage, 100 simultaneous, 10 GB/mo
     download. State that friends-only apps will not hit these but to
     monitor in console; set a $0.01 budget alert in Google Cloud billing.
  7. Pre-share checklist — 7 checkboxes covering rules tightened, payload
     cap, malformed-write test, rapid-write test, budget alert, no real
     user data seeded, README disclaimer.

Tone: same as CLAUDE.md — direct, names tradeoffs, treats reader as senior.

--- github-pages-setup.md ---

Sections, in order:
  1. The two patterns — A: Pages from root/docs (current ride-tracker
     pattern); B: Pages via Actions, multi-app from apps/. State pros/cons
     of each, name when to pick which.
  2. Workflow for Pattern B — provide a complete `.github/workflows/
     deploy-pages.yml` that:
       - Triggers on push to main and workflow_dispatch
       - Has minimal permissions (contents: read, pages: write, id-token: write)
       - Has concurrency group "pages" with cancel-in-progress
       - Builds _site/ by copying apps/* and shared/ in
       - Uses actions/upload-pages-artifact@v3 and actions/deploy-pages@v4
       - Falls back to a redirect index.html if root index.html is missing
  3. One-time switch from Pattern A to B — explicit steps including the
     Pages source change in repo settings and the redirect handling for
     the existing live URL.
  4. Custom domain — CNAME file, DNS, settings, HTTPS enforcement. Brief.
  5. Cache busting — query string with commit-sha for single-file apps;
     hashed filenames only with build step. Note that hard refresh is
     usually fine for fun apps.
  6. Rollback — `git revert` + push, ~1 minute recovery. No native
     "deploy previous version" for Actions-based Pages.
  7. When to outgrow GitHub Pages — Netlify (build steps, PR previews,
     forms, functions); Cloudflare Pages (edge caching, Workers). Both
     free at this scale; don't switch preemptively.

CRITICAL: the current ride-tracker deployment is Pattern A with a redirect
at root. Per change_log.md the live URL `https://rchalanc-crypto.github.io/
APP_Dev/` redirects to apps/ride-tracker/. Reflect this accurately. Do
NOT recommend switching to Pattern B unless I ask — document both, default
to current state.

--- security-checklist.md ---

Format: checklist with [ ] checkboxes, grouped by section. Run as the
Skeptic / CRO persona pass before sharing any live URL.

Sections, in order, each as a checkbox group:
  1. Secrets — 5 items: no API keys/SA JSON/.env in repo; .gitignore
     correct; .env.example exists with placeholders; Firebase config
     acknowledged as public; spot-check git log for leaked secrets
  2. Firebase / backend rules — 7 items: rules tightened from test mode;
     payload size cap; malformed write rejected; rapid write doesn't
     crash; per-user data isolation; no `allow read, write: if true`
     in Firestore outside scaffolding; Auth gate for free-form/uploads
  3. User input — 6 items: maxlength on inputs; server/rules-side
     enforcement; no innerHTML with user content; no eval/Function
     dynamic injection; file upload type+size cap; URL params validated
  4. Third-party / supply chain — 4 items: versioned CDN URLs; no
     unknown CDN domains; analytics disclosed/no PII; no obscure-source
     copy-paste
  5. Logging and observability — 4 items: no console.log of user
     data/tokens; no leftover debug console.logs; console.error PII-free;
     analytics events PII-free
  6. Free-tier limits and abuse — 4 items: budget alert at $0.01;
     traffic estimate vs ceiling 10x headroom; rate-limit per-IP
     consideration; worst-case 500 visitors thought experiment
  7. Privacy and disclosure — 5 items: no real user data seeded;
     README has no-warranty disclaimer; "what we store" UI note when
     applicable; minimal PII collection; delete-my-data path exists
  8. Accessibility (security-adjacent) — 5 items: WCAG AA contrast;
     keyboard reach; focus-visible; labeled inputs; SR-accessible
     errors
  9. Pre-share final pass — 4 items: incognito-window test; mobile
     test; cross-browser test before sharing externally; rollback
     path confirmed

End with a "Hard stop / redesign" section — bullet list of patterns
that should trigger redesign rather than ship-with-fixes:
  - Storing data you'd be embarrassed to leak
  - Free-form user content rendered to others without moderation
  - Money / real-name identity / healthcare data (out of scope for
    fun apps)
  - "Type your email and we'll trust it" auth (use Firebase Auth)

Close with: Skeptic persona has veto power.

=============================================================================
GUARDRAILS
=============================================================================

- Do NOT change any other files in the repo.
- Do NOT touch the live ride-tracker app or its Firebase config.
- Do NOT generate or run shell commands that hit the network.
- If any section conflicts with what's already in CLAUDE.md, flag the
  conflict and stop. CLAUDE.md is the source of truth.
- After all three commits land, append an entry to change_log.md under
  a new dated heading:
    [YYYY-MM-DD] — Instruction Runbooks Filled
  with [DOCS] tag, listing the three files and noting "stubs replaced
  with content" + "deployment.md still pending" as an open item.
- Push the branch and open a PR titled "docs: fill three instruction
  runbooks". PR body lists what was filled and what's still pending
  (deployment.md).

=============================================================================
WHEN DONE
=============================================================================

Report back with:
  - Branch name and PR link
  - Word count per file (sanity check — none should be over 1500 words;
    these are runbooks not essays)
  - Anything you couldn't write because it required a decision from me
  - Confirmation that change_log.md was updated
```

---

## Pattern notes for future similar prompts

- **Discovery-then-stop** at the top forces a state-read before any edit. Catches stale assumptions.
- **Content requirements are structural, not narrative.** Section names + item counts + what each must reference. Prevents drift into prose-essay mode.
- **Guardrails block scope creep.** Explicit list of files NOT to touch, network calls NOT to make, decisions that require human input.
- **Change-log update is part of the task**, not a follow-up. Same instinct as the PMS Hourglass framework — every structural change leaves a trail.
