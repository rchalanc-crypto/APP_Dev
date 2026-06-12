# nassims-folly — Polish Hotfix: Admin Contrast + El Médano Area Card

> One small Claude Code session, ~15 min. All changes in `apps/nassims-folly/index.html`.
> Run from the WSL-mode VS Code window. Fresh session.

## A. Admin table contrast (bug)

Symptom: Allowlist + RSVP tables render white-on-white. Cause: `.admin-table` has
`background: white` (~line 458) but `.admin-table td` (~line 473) sets no `color`,
so cells inherit the global `body { color: var(--parchment) }` from the Phase 3.5
dark redesign. (Line numbers approximate — locate by selector.)

1. Add `color: var(--charcoal);` to `.admin-table td`.
2. `.admin-table tbody tr.clickable:hover td` references `var(--cream)` (~line 481) —
   a token from the pre-3.5 palette. Verify whether `--cream` is still defined in
   `:root`; if not, replace with `var(--parchment)`.
3. Audit the rest of the admin screen for the same pattern — any element on a
   white/light background relying on inherited text color (counts bar, inputs,
   textareas, modal/expanded notes rows). Fix each with an explicit dark token.
   Do NOT touch dark-background admin elements that are rendering correctly.

## B. El Médano kite cards → one area card

Symptom: the three kite spots (El Médano 28.0436/−16.5388, Cabezo 28.0481/−16.5256,
La Tejita 28.0349/−16.5497) show identical data. Not a bug: they sit within ~2.5 km,
inside one model grid cell (~13–25 km resolution). Three identical cards look broken.

1. Collapse the three kite spot cards into ONE card titled **"El Médano area"**.
2. Single ensemble fetch using the El Médano coordinates (28.0436, −16.5388);
   delete the Cabezo and La Tejita fetches (saves 2/3 of the kite API calls).
3. List the three launch names inside the card (e.g., a small line under the stats:
   "Launches: El Médano · El Cabezo · La Tejita") so guests still see their options.
4. Keep everything else as-is: ensemble stats line, confidence phrase, "as of HH:MM",
   visible failure state. Paragliding and Moustache widget groups are untouched —
   their spots are genuinely far apart.
5. If the spot config array drives the card rendering generically, prefer the minimal
   change: one kite entry with a `launches` label field, rather than special-casing
   the render path.

## Acceptance

- [ ] Admin Allowlist + RSVP tables legible: dark text on white, hover state works
- [ ] No other admin element renders light-on-light (click through both tabs, expand
      a notes row, type in the bulk-add textarea)
- [ ] Kite section shows exactly one card, titled "El Médano area", listing all three
      launches; stats + confidence + "as of" all present
- [ ] Network tab confirms one kite fetch, not three
- [ ] 375px pass on the admin tables and the kite card
- [ ] Commit (one commit, message: "folly polish: admin table contrast + El Médano
      area card collapse"), push, Actions green
- [ ] Verify live after hard refresh, signed in
- [ ] change_log.md one-liner + docs/tooling-decisions.md entry
