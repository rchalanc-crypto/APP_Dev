# CLAUDE.md — Web Apps Lab

Master conventions for all apps in this repo. Per-app CLAUDE.md files in
apps/<name>/ inherit from this file and record overrides only.

## Default stack

Single-file HTML + vanilla JS + CSS variables + Firebase Realtime Database +
GitHub Pages. Use a build step (Vite + React) only when state or routing
complexity actually demands it. Name the justification in the app CLAUDE.md.

## Repository conventions

- One app per apps/<name>/ folder. Self-contained: own index.html, README.md,
  CLAUDE.md.
- templates/ — read-only starter kits. Copy out, never edit in place.
- shared/design-tokens/tokens.css — import or copy :root block into each app.
- shared/snippets/firebase-init.js — reference pattern, not a live module.
- docs/tooling-decisions.md — append an entry after every meaningful session.
- change_log.md — append structural/architectural decisions; commit-level
  details belong in git messages.

## Security non-negotiables

- Never commit API keys, service account JSON, or .env files.
- .gitignore must cover .env, .env.*, dist/, node_modules/, .DS_Store.
- Firebase client config (apiKey etc.) is public by design — Firebase security
  rules are the actual data gate. Review rules before every live URL share.
- Any user-write path in Firebase needs a payload size cap and shape validation.
- Never paste real user data into any AI chat. Use synthetic data only.
- Run the Skeptic-persona pass (security-checklist.md) before sharing any
  live URL beyond a closed group.

## Deployment defaults

1. GitHub Pages (Pattern A — branch root) for a single-file, single-app repo.
2. GitHub Pages (Pattern B — Actions workflow) when the repo has 2+ apps.
   See .claude/instructions/github-pages-setup.md for the one-time switch.
3. Netlify if the app needs a build step and per-PR preview URLs.
Do not switch hosting targets preemptively. Switch when a real limitation
forces it.

## Style conventions

- Mobile-first. Test at 375px before anything else.
- Use CSS variables from shared/design-tokens/tokens.css. Override per app;
  do not edit the shared file.
- Vanilla JS unless a framework is explicitly justified in the app CLAUDE.md.
- Google Fonts CDN acceptable for private/friends apps. Not for public apps
  where font CDN privacy or offline use matters.
- Animations: subtle. Prefer CSS transitions over JS animation libraries.

## Persona invocation

Personas are defined in .claude/personas/personas.md.
Default cycle for a new app: Strategist → Designer → Architect → Shipper.
Add Skeptic for any app with a backend or user data.
Janitor closes every shipped app.
Do not run a Swarm pass to rubber-stamp a decision already made.

## Tool division

- Claude.ai (web): design, persona reviews, single-file HTML prototypes,
  spec drafting, content generation.
- Claude for Desktop: multi-file editor sessions via MCP.
- Claude Code (terminal): scaffolding, refactors, git, deploy, seeding.
- Gemini 2.5 Pro / AI Studio: whole-repo review, visual assets, Imagen,
  Google-ecosystem work.
