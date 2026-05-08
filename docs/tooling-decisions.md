# Tooling Decisions Log

Running log of which AI tool did what on each app.
Format: date | app | decision | tool used | notes

---

2026-05-03 | program-base | initial repo restructure | Claude Code | Restructured single-app repo into multi-app program. Plan drafted in Claude.ai chat. See docs/PROGRAM_PLAN.md.

2026-05-04 | nassims-folly | Phase 1 scaffold | Claude Code | Created apps/nassims-folly/ from static-firebase template with Firebase Email Link auth replacing name-based login. Auth gates on /allowlist/{sha256(email)} in RTDB. Rules in firebase-rules.json. Switched GitHub Pages to Pattern B via .github/workflows/deploy-pages.yml. Spec approved in Claude.ai chat on 2026-05-03.

2026-05-04 | nassims-folly | Phase B deploy | Claude Code | Wired real firebaseConfig values (apiKey, messagingSenderId, appId; storageBucket updated to .firebasestorage.app). Added .gitignore to main. Pushed to main; GitHub Actions workflow ran green. Switched GitHub Pages source to GitHub Actions (Pattern B). nassims-folly live. Ride-tracker continuity verified at root URL.

2026-05-05 | nassims-folly | Phase 2 build | Claude Code | RSVP screen, voyage page skeleton, admin dashboard (RSVP tab + allowlist tab), Firebase rules update (§2.D). Security pass complete. All §2.1–2.4 items from SPEC-PHASE-2.md implemented. Spec approved 2026-05-04.

2026-05-05 | nassims-folly | Phase 2.G — URL cutover | Claude Code + browser | Custom domain follyintenerife.com configured: GitHub Pages custom domain + Cloudflare A records (4×, DNS-only). actionCodeSettings.url updated in index.html. Firebase authorized domains updated (follyintenerife.com added, github.io retained as fallback). End-to-end verified.

2026-05-05 | nassims-folly | Phase 2.H — custom email sender | Claude Code + browser | Firebase Auth custom domain configured for follyintenerife.com. Auth emails now from noreply@follyintenerife.com. SPF/DKIM DNS records at Cloudflare (TXT + 2× CNAME). Blaze plan required (already active). Note: passwordless sign-in email body and display name are locked by Firebase — not customizable via Console.

2026-05-06 | nassims-folly | admin dashboard bug fix | Claude Code | RSVP dashboard was serving stale data (SDK cached /invitees snapshot). Switched to direct REST API fetch (/invitees.json?auth=<idToken>) to bypass SDK local sync tree. Tab switching now reloads data on each click.

2026-05-06 | nassims-folly | Phase 3 planning: SPEC-PHASE-3.md, content seed v2, diary-entries-draft.md | Claude.ai chat | Gnatalee McCringleberry character finalised. keeper_note data model. 50 fun facts, 3 seed diary entries, 20+5 activities. Paragliding + Moustache activities + widgets planned for Phase 4. Activity ranker widget planned. Required Viewing section (Akkersdijk/Block/Pastrana) planned.

2026-05-07 | nassims-folly | Phase 3.5 UI redesign + Expedition Briefs | Claude Code | §A–§E from SPEC-PHASE-3.5.md. Dark token system (asphalt/neon/terracotta palette), Barlow Condensed + Cormorant Garamond + DM Sans. Sticky nav (Tabler Icons, scroll spy, IntersectionObserver). Voyage topbar replaces teal app-header. RSVP darkReveal transition. Hero countdown 4-unit / 1s tick. Expedition Briefs: /content/announcements Firebase node, voyage feed with seenBriefIds localStorage, admin compose tab (4th). Two production bugs fixed: J'Dinklage apostrophe SyntaxError in JS strings; .rsvp-screen display:flex CSS specificity overriding .screen { display:none }.

2026-05-08 | nassims-folly | Phase 4: Activities, Weather Widgets, Required Viewing | Claude Code | §A–§G from SPEC-PHASE-4.md. Required Viewing (3-card YouTube grid, lazy iframes). Activities grid with CATEGORIES filter (9 cats, colour-coded border-left), Firebase onValue onlyOnce. Open-Meteo shared fetch layer with 2-hour localStorage TTL cache. Three wx widgets (Kite/Para/Moust) each with 3 spots, traffic-light score bar, 7-day dot forecast. Activity ranker re-uses El Médano cached data. Property section with confirmed/placeholder gate. seed-phase4.js for 3 air activities. Video ID 5ybJz0oByhA (Akkersdijk) confirmed by Robert.
