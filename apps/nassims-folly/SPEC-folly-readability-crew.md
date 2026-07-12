# SPEC — nassims-folly: Readability Pass + Crew Section

> Claude Code session, fresh. Lands at `apps/nassims-folly/SPEC-readability-crew.md`.
> All code changes in `apps/nassims-folly/index.html`. **Pure CSS + static HTML content.**
> NO Firebase rules, NO data writes, NO new dependencies, NO build step.
> Run from the WSL-mode VS Code window. Pattern B deploy (GitHub Actions).
> Checkpointed. **Wait for Robert's "done" at each gate before proceeding.**

---

## Why (context)

A live screenshot showed the Expedition Briefs rendering in a ~300px column, hard-left,
stranded in a large black right-gutter on wide viewports — and the reading font (~13px)
too small. The narrow column is the real readability killer; the font is the second half.
This pass centers a proper reading column and bumps reading-text size only. It also places
the new evergreen **Crew** section (finalized copy in Step 2).

## Locked facts (do not re-derive)

- Single-file app: `apps/nassims-folly/index.html`. No build step, no framework.
- Type system (Phase 3.5): `--font-display` (Barlow Condensed), `--font-diary`
  (Cormorant Garamond), `--font-body` (DM Sans). Dark token palette (`--charcoal`,
  `--parchment`, `--neon`, `--terracotta`, `--iron`, `--smoke`, etc.).
- **Display elements to LEAVE ALONE this pass:** hero countdown (72px), sticky nav,
  section labels. This is a *reading-text* pass only.
- Voyage-page section order (from nav): countdown → watch → briefs → diary → conditions
  → ranker → activities. Briefs section is `#briefs`; diary is `#diary`.
- Deploy: Pattern B (Actions). Commit **path-scoped** (`git add apps/nassims-folly/index.html`,
  never `-A`), push, confirm Actions green, verify live after hard refresh **signed in**.
- Rules + data: **untouched** this session. If anything appears to require a rules or DB
  change, STOP — it doesn't; re-read the step.

## Assumptions — override BEFORE running if any are wrong

- **A1 — Crew placement.** New `<section id="crew">` inserted **after `#briefs`, before
  `#diary`.** Rationale: meet the crew immediately before reading their reports. To move it
  (e.g. directly under the hero), change only the insertion point; nothing else depends on it.
- **A2 — No new nav item** for `#crew` this pass. The sticky nav + scroll-spy
  (IntersectionObserver, 7 items) stays as-is; `#crew` lives in scroll flow without a nav
  entry. Adding an 8th nav item touches the scroll-spy and is a separate change — ticket it
  if wanted.
- **A3 — Reading-column width = 680px** (within the agreed 640–720 band). Briefs + diary +
  crew share it. Change the number here if Robert has a preference.

---

## Step 1 — Readability CSS (WAIT)

Locate by selector; no line numbers given (they drift).

1. **Reading column.**
   - Find the container(s) constraining the **Expedition Briefs** cards and the **diary**
     cards. Currently a brief card renders ~300px wide, left-aligned, leaving a large right
     gutter on wide viewports.
   - Cap the brief + diary **reading column** at `max-width: 680px` and center it
     (`margin-inline: auto`). The section band may stay full-bleed; it's the reading column
     that centers and caps. Kill the left-alignment/gutter so the column sits centered.
   - Do NOT cap or move the hero/countdown or nav.

2. **Reading font sizes** (bump from current ~13px):
   - Brief body + general body prose (`--font-body` / DM Sans): **16px** (1rem) minimum;
     line-height ~1.6.
   - Diary prose (`--font-diary` / Cormorant Garamond — small x-height, needs more): **18px**;
     line-height ~1.6.
   - Buttons / interactive labels on the body font: bump proportionally so they don't look
     tiny beside the larger prose (**≥15px**).
   - Section labels, nav, countdown: **UNCHANGED.**

3. **Paragraph spacing.**
   - Ensure `<p>` inside brief + diary bodies has `margin-bottom: ~0.75em` so long posts
     breathe (the screenshot brief runs together).
   - *Content note, NOT a CC task:* `renderMarkdown` turns single `\n` into `<br>` and blank
     lines into `<p>`. Entries authored with single newlines will still render tight regardless
     of CSS. Flag to Robert; do not attempt to reformat stored content.

4. **Mobile (375px).**
   - The 680px column becomes full-width with horizontal padding (**≥16px** each side) —
     verify text isn't edge-to-edge.
   - Keep the new (larger) reading sizes on mobile; small text was the problem everywhere,
     not just desktop.

→ **WAIT.** Robert eyeballs a **wide desktop viewport** (gutter gone, column centered,
text legible) **and 375px**, re-checking the Casa Estrella brief specifically.

---

## Step 2 — Crew section (WAIT)

Insert `<section id="crew">` at the **A1** location. Reuse existing dark-token + type styles
for consistency (lean on the brief/diary card + blockquote styling). The Step 1 reading-column
cap (680px, centered) applies here too.

- **Section label** (matching the `.section-label` pattern): `The Crew`
- **Copy — paste verbatim.** This is finalized canon copy: do NOT edit wording, names, or
  punctuation. The apostrophe in **J'Dinklage** is a plain ASCII `'` (U+0027) — not a curly
  quote (past bug: curly/typo'd apostrophes broke JS strings and violated canon). Character
  names **bold**; the two pull-quotes as **blockquotes**. The em-dash attributions inside the
  quotes are intentional and canon — preserve exactly, do NOT "correct" "the Captain".

---

**The Crew (An Explanation, of Sorts)**

*A notice from the Management regarding personnel.*

Several of you have now asked a reasonable question: who are these two people filing reports, and why. The Management wishes to be transparent.

The Management did not set out to hire anyone. An advertisement was placed on Facebook Marketplace, under "Miscellaneous," seeking assistance of an unspecified nature. Two applicants responded. They responded *together.* They presented remarkably well. It was made clear, by means the Management still cannot fully reconstruct, that they came as a set and that declining one meant declining both. Legal counsel was not consulted at the time, a fact counsel has since raised on several occasions.

They have been with the expedition ever since. The Management assumes no responsibility for their reports, their methods, or their titles — most of which are self-issued.

**J'Dinklage Morgoone — Chronicler to the Expedition**

Engaged to keep the record. Does so at considerable length. Introduces himself to strangers, hotel staff, and at least one visibly uncertain customs official as "the Captain" — a rank he does not hold and was not offered. The Management has elected not to correct this, on the grounds that correcting it would change nothing.

Considers himself a natural athlete. Plays golf. Plays pickleball. The evidence supporting the "natural athlete" designation has not been located, though J'Dinklage Morgoone maintains it exists and is merely between filings. In his own account:

> "The course received me with the deference one expects. My score is not relevant to this account." — the Captain

**Gnatalee McCringleberry — Keeper of the Sanity**

The G is silent. The role is self-appointed; the Management was not consulted and, on reflection, would have agreed to it anyway. In every report she files, she refers to J'Dinklage Morgoone as "the Captain." She has never explained why. The Management has stopped asking.

Her competencies — kitesurfing, rally driving, mountain biking — are real and pursued without commentary. She has never played golf or pickleball. She has beaten the Captain at both, on the first attempt, and recorded the scores he declined to mention. She does not gloat. She counts. In her own words:

> "The Captain reports we built fortifications. We stacked three rocks. The rocks are not load-bearing." — Gnatalee McCringleberry, Keeper of the Sanity

*The Management endorses neither of them, and both of them, and accepts that this is now the arrangement. Their reports are, regrettably, canon.*

— Robert (Human Mule)

---

→ **WAIT.** Robert confirms placement + on-voice rendering (names bold, quotes as
blockquotes, "the Captain" preserved in both, byline reads "Robert (Human Mule)").

---

## Step 3 — Ship + close

- Path-scoped commit: `git add apps/nassims-folly/index.html` (never `-A`). One commit:
  `folly: readability pass (reading column + font bump) + crew section`.
- Push; confirm the Pattern B Actions run is green.
- Verify live after hard refresh, **signed in**.
- `apps/nassims-folly/CHANGELOG.md` one-liner + `docs/tooling-decisions.md` entry
  (date · app · decision · tool).

## Acceptance

- [ ] On a wide viewport, briefs + diary render in a centered ~680px column — the left-align
      + right-gutter is gone.
- [ ] Reading text is legible: body/brief prose ≥16px, diary prose ≥18px, buttons ≥15px.
- [ ] Countdown (72px), nav, and section labels are visually **unchanged**.
- [ ] Long briefs (the Casa Estrella post) have paragraph breathing room, not a solid run.
- [ ] `#crew` renders at the A1 position, on-voice: names bold, both pull-quotes as
      blockquotes, "the Captain" intact in both, byline "— Robert (Human Mule)".
- [ ] ASCII apostrophe in "J'Dinklage" (no JS console error, no curly quote).
- [ ] 375px pass (column full-width w/ padding, text not edge-to-edge) + one second-browser pass.
- [ ] Commit path-scoped; Actions green; live verified signed-in.
- [ ] `CHANGELOG.md` + `tooling-decisions.md` entries written.

## Out of scope (park unless asked)

- **Editing the live Casa Estrella brief's author/sign-off** — Robert does this in the admin
  Briefs **edit UI**, not CC (see note below). No deploy.
- Firebase rules or DB/content data changes of any kind.
- New nav item for `#crew` (A2) — separate, touches scroll-spy.
- Countdown / nav / display-font changes.
- `nassims-folly-canon` skill update to encode the Management byline rule — small separate
  edit; ticket it.

---

## Separate note — Robert, not CC (admin UI, ~2 min, no deploy)

In **admin → Briefs → edit** the Casa Estrella post, so the card renders the two-level bit
(faceless entity posts, human signs):

- **Author field →** `The Management`
- **Body closing line →** `— Robert (Human Mule)` (remove the in-body `/ IT Support`
  redundancy and the duplicate lower `— Robert` collapses into a single clean attribution).

If the stacked result looks dash-heavy (author line + body sign-off both dashed), drop the
dash from the author render — eyeball it live. This is content data, edited in the UI you
already have; keep CC out of it.
