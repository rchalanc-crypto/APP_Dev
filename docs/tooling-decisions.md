# Tooling Decisions Log

Running log of which AI tool did what on each app.
Format: date | app | decision | tool used | notes

---

2026-05-03 | program-base | initial repo restructure | Claude Code | Restructured single-app repo into multi-app program. Plan drafted in Claude.ai chat. See docs/PROGRAM_PLAN.md.

2026-05-04 | nassims-folly | Phase 1 scaffold | Claude Code | Created apps/nassims-folly/ from static-firebase template with Firebase Email Link auth replacing name-based login. Auth gates on /allowlist/{sha256(email)} in RTDB. Rules in firebase-rules.json. Switched GitHub Pages to Pattern B via .github/workflows/deploy-pages.yml. Spec approved in Claude.ai chat on 2026-05-03.

2026-05-04 | nassims-folly | Phase B deploy | Claude Code | Wired real firebaseConfig values (apiKey, messagingSenderId, appId; storageBucket updated to .firebasestorage.app). Added .gitignore to main. Pushed to main; GitHub Actions workflow ran green. Switched GitHub Pages source to GitHub Actions (Pattern B). nassims-folly live. Ride-tracker continuity verified at root URL.
