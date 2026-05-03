# Web Apps Lab

Personal program for designing, building, and deploying small web apps.
One mono-repo, one app per `apps/` folder, GitHub Pages by default.

## Apps

| App | Description | Live URL |
|---|---|---|
| [ride-tracker](apps/ride-tracker/) | Real-time MTB & kite session tracker with collaborative availability calendar | https://rchalanc-crypto.github.io/APP_Dev/apps/ride-tracker/ |

## Structure

```
apps/          one folder per shipped app
templates/     starter kits — copy out, don't edit in place
shared/        design tokens, JS snippets, reusable prompt fragments
.claude/       Claude Code instructions and personas
docs/          program plan, tooling log
```

## Docs

- [Program Plan](docs/PROGRAM_PLAN.md) — operating model, tool roles, standard workflow
- [CLAUDE.md](CLAUDE.md) — master coding conventions and stack defaults
- [Tooling Decisions Log](docs/tooling-decisions.md) — which AI tool did what

## Quickstart: add a new app

```
# in Claude Code at repo root
"Scaffold a new app called <name> from templates/static-firebase.
 Create apps/<name>/ with index.html, README.md, and CLAUDE.md.
 Read CLAUDE.md and .claude/instructions/firebase-setup.md first."
```
