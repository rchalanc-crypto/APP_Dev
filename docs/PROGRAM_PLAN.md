# Web Apps Program — Build Plan

**Owner:** Robert Chalmers
**Purpose:** Personal program for designing, building, and deploying small web-based applications for fun, using a coordinated stack of AI tools (Claude.ai, Claude for Desktop, Claude Code, Gemini) with GitHub as the source of truth.
**Reference exemplar:** `ride-tracker` — single-file HTML + Firebase Realtime DB + GitHub Pages.

---

## 1. Operating Model

This program borrows the discipline you already apply in PMS_Production — versioned source of truth, named personas for adjudication, scripted deployment, no secrets in code — and applies it to throwaway-grade fun projects so you can ship without re-inventing structure each time.

The rule of thumb:

| Tool | Best for | Why |
|---|---|---|
| **Claude.ai (web)** | Project hub, ideation, persona deliberation, drafting specs, single-file HTML artifacts | Project Knowledge holds your CLAUDE.md, personas, and exemplars; artifacts let you prototype a working app inline before any file ever hits a repo |
| **Claude for Desktop** | Working against your local repo with MCP filesystem + GitHub MCP, longer planning sessions, file-by-file edits | Persistent local context, can read/write your repo via MCP without copy-paste |
| **Claude Code** (terminal) | Implementation, refactors, multi-file edits, deploy commands, git operations | Agentic, runs in the repo, executes shell, reads/writes files, opens PRs |
| **Gemini 2.5 Pro / AI Studio** | Whole-repo ingestion (1M+ token context), multimodal design work (screenshot → code), Firebase/Google Cloud-native scaffolding, Imagen for graphics, Deep Research for tech selection | Different blind spots than Claude — useful as an adjudicator and for Google-ecosystem work |
| **Gemini CLI** (if you adopt it) | Parallel to Claude Code; cross-check refactors and security reviews | A second opinion on the same repo state |

You don't need every tool for every app. The default workflow uses **Claude.ai for design → Claude Code for build/deploy → Gemini for review and visual assets**. Claude Desktop is optional and shines when you want to keep an editor-side conversation going across many files.

---

## 2. Repository Structure

You already have GitHub set up. Recommended layout — single mono-repo for the program, with each app self-contained:

```
web-apps/                           ← repo root
├── CLAUDE.md                       ← master conventions (read by Claude Code)
├── README.md                       ← human-facing index of apps
├── .gitignore                      ← node_modules, .env, .DS_Store, /dist
├── .env.example                    ← naming convention for any secrets
│
├── .claude/                        ← Claude Code project files
│   ├── instructions/
│   │   ├── deployment.md
│   │   ├── firebase-setup.md
│   │   ├── github-pages-setup.md
│   │   └── security-checklist.md
│   └── personas/
│       └── personas.md             ← see §4
│
├── .gemini/                        ← parallel folder for Gemini CLI / context
│   └── context.md                  ← can symlink or mirror CLAUDE.md
│
├── templates/                      ← starter kits — copy, don't edit in place
│   ├── static-firebase/            ← single-file HTML + Firebase (ride-tracker pattern)
│   │   ├── index.html
│   │   ├── README.md
│   │   └── firebase-config.example.js
│   ├── react-vite/                 ← when you want a build step
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── src/
│   └── static-no-backend/          ← pure local-storage / client-only apps
│       └── index.html
│
├── apps/                           ← one folder per shipped app
│   ├── ride-tracker/
│   │   ├── CLAUDE.md               ← app-specific overrides
│   │   ├── README.md               ← what it is, live URL, setup
│   │   ├── index.html
│   │   ├── docs/
│   │   │   └── data-model.md
│   │   └── .github/workflows/
│   │       └── deploy.yml          ← GitHub Pages deploy
│   └── <next-app>/
│
├── shared/                         ← reusable across apps
│   ├── design-tokens/
│   │   └── tokens.css              ← CSS vars: colors, type, spacing
│   ├── snippets/
│   │   └── firebase-init.js
│   └── prompts/                    ← reusable prompt fragments
│       └── ux-review.md
│
└── docs/
    ├── tooling-decisions.md        ← which AI tool you used for what (running log)
    └── lessons-learned.md          ← post-mortems on each app
```

**Why this shape:**
- `CLAUDE.md` at root + per-app overrides matches Claude Code's convention.
- `templates/` means new apps start from a known-good seed in seconds.
- `shared/design-tokens/` keeps your apps visually coherent without forcing a framework.
- `.claude/instructions/` holds the runbooks you'd otherwise re-paste into every conversation.
- `docs/tooling-decisions.md` becomes your audit trail — same instinct as your PMS Hourglass framework, scaled down.

---

## 3. Files to Include in the Claude.ai Project

Create one Claude.ai Project named **"Web Apps Lab"**. Upload these to Project Knowledge:

| File | Purpose |
|---|---|
| `CLAUDE.md` | Master conventions and stack defaults |
| `personas.md` | The deliberation crew (see §4) |
| `templates/static-firebase/index.html` | Reference exemplar — the ride-tracker pattern |
| `shared/design-tokens/tokens.css` | Visual baseline so apps don't look generic |
| `.claude/instructions/firebase-setup.md` | Firebase steps so you never re-explain them |
| `.claude/instructions/github-pages-setup.md` | Deployment steps |
| `.claude/instructions/security-checklist.md` | What never goes in client-side code |
| `docs/tooling-decisions.md` | Running log — Claude reads it and avoids repeating mistakes |

Set the Project's custom instructions to something like:

> *This project supports a personal program for building small, deployable web apps. Default stack: single-file HTML + Firebase Realtime DB + GitHub Pages, unless the use case clearly needs a build step (then React + Vite). Always honor `CLAUDE.md` and the security checklist. When designing, run a quick Gem-Swarm-style review using the personas before producing final code. Surface tradeoffs explicitly — I prefer being told "this is the lazy choice but it works" over polished prose that hides assumptions.*

---

## 4. Personas (Gem Swarm for Apps)

Mirroring your PMS Gem Swarm, but tuned for product/UX/engineering rather than risk-adjusted finance. Use these by name in prompts: *"Run a Swarm review on this design — Strategist first, then Critic, then Shipper."*

**1. The Strategist** — *Product & scope owner*
Asks: What problem does this actually solve? Who uses it? What's the smallest version that's still valuable? What's explicitly out of scope?

**2. The Designer** — *UX, visual, and interaction*
Asks: Does this feel good on a phone? Is the primary action obvious in 2 seconds? Are we leaning on the design tokens or reinventing? Are empty/loading/error states handled?

**3. The Architect** — *Frontend structure and data*
Asks: Single file or build step? What's the data model? What state lives where (URL, localStorage, Firebase, in-memory)? What breaks at 10x users?

**4. The Shipper** — *DevOps, deployment, hosting*
Asks: How does this get to a live URL? What's the rollback? Where do secrets live? Is the deploy reproducible from a clean clone?

**5. The Skeptic / CRO** — *Risk, security, what-could-go-wrong*
Asks: What's the worst input a user can send? Can someone scrape or vandalize the Firebase data? What are we logging? What happens if the free tier runs out?

**6. The Janitor** — *Post-ship hygiene*
Asks: Is the README accurate? Did we update `tooling-decisions.md`? Is the live URL in the root README? Are there leftover console.logs or test data?

For small apps, run Strategist → Designer → Architect → Shipper. Bring in Skeptic for anything with a backend or user data. Janitor closes the loop.

---

## 5. CLAUDE.md (Master) — Drop-in Template

See the companion file `CLAUDE.md` in this plan package. It encodes:
- Default stack
- File/naming conventions
- Security non-negotiables (no API keys committed; Firebase rules reviewed before deploy)
- Deployment defaults (GitHub Pages first; Netlify if you need build step + previews)
- Style conventions (use `shared/design-tokens/`, mobile-first, vanilla JS unless framework justified)
- Persona invocation reminder

Per-app `CLAUDE.md` files in `apps/<name>/` only need to record overrides — different stack, different host, special data model.

---

## 6. Tool Roles in More Detail

**Claude.ai (web)** — your design studio.
Use Projects to keep context. Use Artifacts to prototype a complete app inline (the ride-tracker is exactly this pattern — one file, runs in the browser, save as `.html`). Use the persona swarm here before any code lands in the repo. When the artifact is good, copy it into `apps/<name>/index.html` and let Claude Code take over for git/deploy.

**Claude for Desktop** — your editor-side pair.
Connect MCP servers for filesystem (your `web-apps/` directory) and GitHub. This is where you have a multi-hour conversation that touches many files without copy-pasting. Optional but powerful if you already like it for PMS work — same MCP discipline applies.

**Claude Code** — your hands.
Lives in the terminal at the repo root. Reads `CLAUDE.md` automatically. Use it for: scaffolding from a template, running git operations, opening PRs, deploying, fixing bugs across files, refactoring. Keep changes small and review diffs — same posture as your PMS_Production work.

**Gemini 2.5 Pro / AI Studio** — your second opinion and visual generator.
- **Whole-repo review:** dump the repo (or large slices) into Gemini's long context for architecture critique. It catches things Claude misses, and vice versa.
- **Screenshot → code:** paste a UI mockup or a competitor screenshot, get HTML/CSS back fast. Good for design starting points.
- **Imagen / Nano Banana:** generate icons, backgrounds, hero images, og:image cards. Faster and often better than wrestling with SVG by hand.
- **Deep Research:** when picking between, say, Firebase vs Supabase vs Cloudflare Workers, run a Deep Research and let it produce a comparison.
- **Google ecosystem:** if an app touches Gmail, Calendar, Drive, or Firebase Genkit, Gemini's native integrations are smoother.
- **Gemini in Chrome:** if/when you adopt it, useful for poking at your deployed app live and asking Gemini to debug what it sees.

**Gemini CLI** (if you use it) — parallel to Claude Code. Same repo, different model. Useful as an adversarial reviewer: have Claude Code build a feature, then ask Gemini CLI to find bugs.

---

## 7. Standard Workflow (Per App)

1. **Ideate (Claude.ai chat)** — describe the idea, run Strategist + Designer + Architect personas, lock scope.
2. **Prototype (Claude.ai Artifact)** — build a working single-file artifact. Iterate until it feels right.
3. **Land (Claude Code)** — `cp -r templates/static-firebase apps/<name>/`, paste artifact, scaffold README and `CLAUDE.md`, commit.
4. **Wire backend (Claude Code or Desktop)** — Firebase project, config swapped in, rules reviewed by Skeptic persona.
5. **Deploy (Claude Code)** — push, GitHub Pages or Netlify picks it up. Confirm live URL.
6. **Review (Gemini)** — paste the live URL or repo into Gemini, ask for a UX and security review. Open issues for anything real.
7. **Close (Janitor)** — README updated with live URL, `docs/tooling-decisions.md` gets an entry, repo root README updated.

Each app should be 1–3 sessions end-to-end. If it sprawls, the Strategist failed at scope.

---

## 8. Security Non-Negotiables

These go in `CLAUDE.md` and get re-stated in every chat that touches a backend:

- Never commit API keys, service account JSON, or `.env` files. Use `.env.example` for shape only.
- Firebase config (apiKey, authDomain, etc.) is technically public — but Firebase **security rules** are what actually protect data. Review rules before going live; "test mode" is fine for the first hour, not for the first week.
- For any app that lets users write data, add at minimum a length cap and a rate-limit rule.
- Never paste real user data into chats. Use synthetic data.
- Run a quick Skeptic pass before sharing a live URL with anyone.

---

## 9. Quickstart for App #2

Once the structure above exists and the ride-tracker is moved into `apps/ride-tracker/`:

```
# in Claude Code at repo root
"Scaffold a new app called <name> from templates/static-firebase.
 Create apps/<name>/ with index.html, README.md, CLAUDE.md, and a
 .github/workflows/deploy.yml for GitHub Pages. Read the master
 CLAUDE.md and .claude/instructions/firebase-setup.md first."
```

That should be the entire spin-up cost.

---

## 10. What I'd Build First

Before any new app, do a 30-minute housekeeping pass:

1. Create the folder structure above in your existing repo.
2. Move the current `index.html` into `apps/ride-tracker/`.
3. Drop the `CLAUDE.md` and `personas.md` from this package at the root.
4. Create the Claude.ai Project, upload the files listed in §3.
5. Add the four `.claude/instructions/` runbooks (stubs are fine — fill them as you hit each topic).

After that, app #2 starts cold-start-free.
