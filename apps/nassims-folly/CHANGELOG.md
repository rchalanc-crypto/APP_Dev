# NASSIMS-FOLLY — CHANGELOG

> App-level history for nassims-folly: features, bugfixes, and app-scoped decisions.
> Program-structural changes (repo restructures, Pages-pattern changes, rules-in-repo
> policy, shared-snippet/architecture decisions, cross-app decisions) belong in the root
> `change_log.md`.
> Routing test for any entry: would a session working on a DIFFERENT app need to read this?
> Yes → root `change_log.md`. No → here. Trivial, no-narrative changes stay in git commit
> messages.
> Entries ordered newest-first (reverse chronological); mark each [COMPLETED] or [PENDING].

---
## [2026-07-11] — Ranker geo/temporal rework + snapshot-collector fix + El Médano embed [COMPLETED]

Per `SPEC-folly-ranker-geo-rework.md` (Steps 1–3), one session, five path-scoped commits,
each verified by a scratch node audit harness (68 checks final: static / logic / synthetic
failures / live Open-Meteo / HEAD-repro) with Robert's live passes gating between rulings.

- **Widget wx guards** (`511d3aa`, pre-existing bug, separately ruled): corrupt `wx_*`
  localStorage entries threw in `JSON.parse` *before* the TTL check and were never
  overwritten — permanently bricking the El Médano kite card; daily-less payloads passed the
  `current`-only validation and TypeError'd from cache for a full TTL. Cache reads now
  try/catch + purge; shape-checked; `daily` validated before caching.
- **Ranker rework** (`45a0529`): 13 weather-sensitive activities scored at their own
  location/elevation/local window via 11 clustered fetches (0.1° grid cell + sea/mid/high
  elevation band, 2h cache, `Atlantic/Canary`, `kn`). Central estimate = ensemble median;
  El Médano cluster = ECMWF IFS member (`ecmwf_ifs`, live-verified) with neutral
  `ELMEDANO_WIND_BIAS` hook (mult 1.0 / add 0 — calibrate against live readings, never guess).
  Spread stays ensemble-wide everywhere. Roll-up = best activity per category (not mean);
  hero names the winning zone; garage day surfaces food/culture (exempt cats never
  weather-scored). Ruled `RANK_LIMITS` thresholds gave wheels/feet/motor real red states
  (motor was hardcoded green — garage day had been unreachable). Weather code follows the
  central model (ruled: one pessimistic ensemble member must not flag a dry cluster).
  Per-activity scores exposed at `window.__follyRank` for Spec B.
- **Live-pass fixes** (`5844578`): orphan audit prints verbatim live titles→slugs in its single
  warning; `rankSlugify` folds all combining marks (`\p{M}`) and is the app's only
  normalization path; chip sublines carry ±ensemble-spread (touch-readable); El Médano console
  line reads "bias neutral" unless the constant is non-neutral.
- **Snapshot early-cancel fix** (`46fc09c`, ruled after ground-truth reconciliation):
  `DataSnapshot.forEach` cancels on ANY truthy callback return (SDK 10.7.1
  `!!e(k,v)`); `push()/unshift()` implicit returns had truncated **every content list to its
  first record** — diary showed 1 of 3 entries (the oldest) since Phase 3; briefs/admin lists
  were latent time bombs masked by single-record nodes. All four collectors now route through
  one shared `collectChildren(snapshot)` (braced callback, footgun comment); activities
  collector is a thin sort wrapper on the same seam. Found via the ranker orphan audit's 12/13
  false-positive — which was this bug, not title drift.
- **El Médano live wind embed** (`e436ceb`, Step 3, the single permitted widget edit):
  collapsible block under the kite cards; Windfinder spot-widget iframe (official widget
  endpoint, no `X-Frame-Options`/`frame-ancestors`) injected only on first expand — zero
  first-paint cost, zero third-party requests until tapped; domain pinned (`EMBED_ORIGIN`,
  the app's only iframe); permanent `noopener` new-tab link-out beneath. Skeptic supply-chain
  touch: no criticals; pre-existing Important ticketed (tabler icons `@latest` unpinned,
  `index.html:8`).
- **Debug switch**: per-activity score table gated behind `localStorage.folly_rank_debug='1'`
  (or `?rankdebug=1`, persists) for trip-time bias calibration; ungated one-line `[ranker]
  scored N/13…` breadcrumb always prints and names the switch; orphan/cluster-failure
  warnings never gated.

---
## [2026-07-09] — Readability: diary prose 18px + evergreen Crew section [COMPLETED]

Per `SPEC-folly-readability-crew.md`. The prose-col (~680px centered) and 16.5px base font were
already live on briefs/diary/property from the prior type pass — not rebuilt.

- **Diary prose → 18px.** `.diary-body` had no explicit `font-size` and was inheriting the 16.5px
  base; bumped to 18px (Cormorant Garamond has a small x-height and needs it). Body/brief prose
  and buttons stay at the 16.5px base; display text (countdown 72px, nav, section-labels)
  untouched.
- **New `#crew` section** inserted **after `#briefs`, before `#diary`** (A1), wrapped in
  `.diary-entry .prose-col` so it shares the centered 680px reading column. Evergreen "who are
  these two people" notice from the Management. Scoped `#crew` CSS leans on the diary card +
  blockquote look: `crew-name` (Barlow Condensed 700, neon), `blockquote` (Cormorant italic 18px,
  terracotta left-border), intro/outro/byline in the body font.
- **Canon copy verbatim** — J'Dinklage (ASCII apostrophe, ×5), "the Captain" preserved in both
  pull-quotes and prose (not corrected), both quotes as `<blockquote>`, byline `— Robert (Human
  Mule)`. No curly quotes. **No nav item added** (A2) — scroll-spy untouched. Rules/DB/data
  untouched. Headless env (WSL): no browser; visual pass at wide + 375px pending Robert's live
  verify signed-in.

---
## [2026-07-09] — Required Viewing retired → per-activity tutorials + briefs sign-off fix [COMPLETED]

Folded the standalone Required Viewing section into the activities it belongs to, and fixed a
briefs render bug.

- **Activity tutorials.** Activity shape gains optional `tutorial = { youtube_id, title,
  jdm_caption, keeper_note }`. When present, the card shows a "Tutorial ▶" link-out
  (`youtube.com/watch?v=…`, `target=_blank rel=noopener`) with the J'Dinklage caption + Keeper
  note beside it, reusing the diary/keeper look. Contrast verified on the --charcoal card:
  neon link 11.65:1, parchment jdm 11.99:1 (AAA), smoke keeper 5.55:1 (AA). Cards without a
  tutorial are unchanged.
- **Two pairings** (captions carried **verbatim** from Required Viewing, no rewrite): El Médano
  ← 5ybJz0oByhA (Akkersdijk "2016 Capetown"); Subida al Boquerón ← m_KBvP0_8Tc (Ken Block
  Gymkhana Ten — the Keeper's "verge incident" note is deliberately kept to tie into the
  drip-scheduled Subida diary entry). Written via `seed-tutorials.html` (admin-authed,
  **title-match**, idempotent `update()` on the two children only — no push-keys touched).
- **Required Viewing retired.** Removed the `#watch` section (markup + `VIDEOS` +
  `renderRequiredViewing` + its CSS), its sticky-nav item (7→6 items), and its call. Scroll-spy
  uses `querySelectorAll('section[id]')` so it dropped automatically. Pastrana (LXzPkkQirnM)
  dropped with the section. No dangling refs.
- **Briefs double sign-off fix.** Diagnosis: the attribution is field-driven (the compose
  author dropdown, always set) and duplicated whenever a brief also hand-types a sign-off at the
  end of its body (e.g. Robert's "Human Mule / IT Support" flourish) — not a code double-render.
  Fix renders the attribution once: suppress the field line when the body already ends with a
  sign-off (leading dash, or the last line contains the author name), and never emit a bare
  "— " for a legitimately-empty author. No brief content changed.

Activities are not status-gated, so the render/retire went **live to guests on deploy**; the
two `tutorial` writes go live when Robert runs the seed. No rules, no status touched. Logic
headless-tested (module parses; 13 briefs/tutorial assertions pass).

---
## [2026-07-09] — Casa Estrella property gallery (Phase 4) [COMPLETED]

> Backfilled: Step 4 flipped `/content/property/status → "confirmed"` manually, so the spec's
> changelog write never ran. Recorded here after the fact.

Shipped the property section to guests (commits da7e612, d88ab3e, d32f8e3, 18e67de).

- **Gallery data** (`/content/property`, admin-write). Casa Estrella, El Madroñal — 6 bed / 6
  bath (usable-room count; the public listing's 8/8 splits the lower apartment + counts a staff
  flat — not surfaced). Hero + 32-image grid: 33 optimised JPGs in `gallery/` (≤1600px,
  EXIF-stripped, <300 KB, no identifiable people), categorised exterior → living → pool →
  bedroom → bath → amenity. `photos` is an **object** keyed `p01…p32`; the render **sorts keys**
  (not `Object.values()`, since Firebase only guarantees order on `forEach`); each `{ url,
  caption:"", alt }`. `hero` is its own key, **excluded from the grid** so it never doubles.
- **Additive render** (Path A — conformed to the existing flat shape, no rewrite): facts block
  (bed/bath chips, amenities, check-in/out, licence VV-38-4-0101440), hero `<img>`, one
  gallery-wide J'Dinklage caption, Management blurb; per-photo `alt` from category; caption
  omitted when empty. All via `escapeHtml()` / `renderMarkdown()`.
- **Admin preview bypass**: confirmed view gates on `status === "confirmed" || isAdmin`, reusing
  the existing `isAdmin` flag; `checkAdmin()` repaints on resolve to beat the listener race.
  Non-admins saw the placeholder until the manual flip. `seed-property.html` (admin-authed,
  idempotent `update()`, status deliberately held) wrote the content; its sign-in gate was later
  hardened (sole `onAuthStateChanged` gate, default indexedDB persistence, origin diagnostic).
- **Lightbox** (vanilla, no lib): click/Enter/Space on any thumbnail or the hero → full-screen
  `role="dialog"` `aria-modal` overlay of the full-size file; prev/next via arrows + ←/→ in grid
  order (hero first), no wrap; close on backdrop/×/Esc; focus into overlay on open and back to
  the thumbnail on close; **Tab focus-trap**; visible focus ring; body scroll lock; alt carried
  via safe property assignment. Overlay lives **outside `#property`** so re-renders never wipe
  its listeners.
- **Type passes**: centered ~680px reading column for prose (blurb/caption; grid stays
  full-width), base font lift to 16.5px (display text untouched), facts chips ≥14px; then a
  contrast pass raising all property reading text to **parchment #F2EFE8 = 14.84:1 (AAA)** on
  `--asphalt` (caption was `--iron` 2.29:1, failing AA; blurb/meta were `--smoke` 6.86:1).
- **Photo permission**: used with permission of Rick Dawson (Casa Amore / Luxury Casa Rentals);
  verbal grant 14 May 2026, written confirmation pending; downloaded and re-hosted, never
  hotlinked. Line stored in `/content/property` and appended to `README.md`.

---
## [2026-06-26] — App-level history begins here [COMPLETED]

This per-app CHANGELOG is established as the home for nassims-folly's detailed history going
forward. Earlier app-level entries remain in the root `change_log.md` and are not retrofitted
here. New app-scoped entries are recorded below from this date on.

---
