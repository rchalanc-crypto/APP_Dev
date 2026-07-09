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
