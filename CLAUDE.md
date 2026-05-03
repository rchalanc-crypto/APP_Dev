# CLAUDE.md — Web Apps Lab

> Read this first. Per-app `CLAUDE.md` files in `apps/<name>/` may override sections; if so, app-level wins.

## What this repo is

A personal lab for designing, building, and deploying small web apps for fun. Author: Robert Chalmers. Backed by GitHub. Apps are deployed to free hosting (GitHub Pages by default, Netlify when previews matter).

## Default stack

- **Frontend:** Single-file HTML + vanilla JS + CSS variables. Use a build step (Vite + React) only when state/routing complexity actually demands it — note the justification in the app's `CLAUDE.md`.
- **Backend (when needed):** Firebase Realtime Database or Firestore, free tier.
- **Hosting:** GitHub Pages from the `apps/<name>/` folder. Netlify if the app needs build steps or preview deploys.
- **Visual baseline:** Pull from `shared/design-tokens/tokens.css`. Override per app, but start there.
- **Fonts:** Google Fonts via CDN is fine.

## File and folder conventions

- New apps live under `apps/<kebab-case-name>/`.
- Single-file HTML apps: `index.html` at the app root.
- Multi-file apps: `src/`, `public/`, build output to `dist/` (gitignored).
- Each app has its own `README.md` with: one-line description, live URL, screenshot, setup instructions, data model summary.
- Each app has its own `CLAUDE.md` only if it diverges from the master.
- Templates in `templates/` are read-only references — copy out, don't edit in place.

## Personas (Gem Swarm)

When designing or reviewing, run the relevant subset:

1. **Strategist** — scope and value
2. **Designer** — UX, mobile-first, design tokens
3. **Architect** — frontend structure, data model, state location
4. **Shipper** — deploy, secrets, hosting
5. **Skeptic / CRO** — security, abuse vectors, free-tier limits
6. **Janitor** — README, tooling log, cleanup

Default cycle: Strategist → Designer → Architect → Shipper. Add Skeptic for any backend or user-data app. Janitor closes.

See `.claude/personas/personas.md` for full descriptions.

## Security non-negotiables

- **No secrets in the repo.** Ever. Use `.env.example` to document shape; real `.env` is gitignored.
- **Firebase config is public, Firebase rules protect data.** Review and tighten rules before any app is shared. "Test mode" rules are not a deployable state.
- **Any user-write path needs a size cap and a rate consideration.** Default: max 1KB per write, max 10 writes per user per minute via rules where possible.
- **No real user data in chats with any AI tool.** Use synthetic data.
- **Before sharing a live URL with anyone:** run a Skeptic-persona pass and confirm rules, secrets, and inputs.

## Coding conventions

- 2-space indent, semicolons in JS, double quotes in HTML attributes, single quotes in JS.
- CSS: use variables from `shared/design-tokens/tokens.css`. No hard-coded colors outside `:root`.
- Mobile-first CSS (`min-width` media queries, not `max-width`).
- Vanilla JS unless framework is justified in the app's `CLAUDE.md`.
- Accessibility minimums: semantic HTML, alt text on images, labels on inputs, focus-visible styles, color contrast checked.
- No `console.log` in committed code. `console.error` for genuine errors only.

## Deployment

- **GitHub Pages (default):** push to `main`, Pages serves from `/apps/<name>/`. Each app's `.github/workflows/deploy.yml` handles routing if needed.
- **Netlify:** for apps with build steps. Connect repo, base directory = `apps/<name>/`, build command per app.
- **Live URL goes in the app's README and the root README app index.**
- **Rollback:** `git revert` and re-push. Pages picks up the previous state within ~1 minute.

## Working with me (Claude Code specifically)

- Read this file before any non-trivial change.
- Read the app's local `CLAUDE.md` if working inside `apps/<name>/`.
- For backend or deployment work, read the relevant `.claude/instructions/*.md`.
- Prefer small, reviewable diffs. Open a PR for anything that touches more than three files unless I say otherwise.
- When making a tradeoff, name it. "I went with X because Y; the lazy alternative was Z" beats silent decisions.
- After shipping an app or major feature, append an entry to `docs/tooling-decisions.md` (date, app, what was decided, which AI tool did what).

## When to use which AI tool (reminder)

- **Claude.ai chat / Artifacts** — design, persona reviews, single-file prototypes
- **Claude for Desktop (MCP)** — multi-file editor sessions
- **Claude Code (terminal)** — scaffolding, refactors, git, deploy
- **Gemini 2.5 Pro / AI Studio** — whole-repo review, screenshot→code, Imagen for graphics, Deep Research
- **Gemini CLI** — adversarial second opinion in the same repo
