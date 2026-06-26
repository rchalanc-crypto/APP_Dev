# SPEC — ride-tracker: Diary Reconcile + Edit-Gate Hotfix

> Claude Code session, fresh. Lands at `apps/ride-tracker/SPEC-reconcile-hotfix.md`.
> Code changes in `apps/ride-tracker/index.html`. Rules change via **CLI deploy only**
> from the repo file — `cd apps/ride-tracker && firebase deploy --only database`
> (project `bigwhinybabyteartracker`). No Console paste — that drift caused the May outage.
> Checkpointed. **Wait for Robert's "done" at each gate before proceeding.**

---

## Locked facts (from change_log, do not re-derive)

- **RTDB path for entries is `sessions`** (NOT `entries` — the template lies; that mismatch
  caused the May 31–Jun 12 outage). Also live: `availability`.
- **Live rules file:** `apps/ride-tracker/database.rules.json` — default-deny, shape-validated,
  *reconstructed from the app's actual write shapes* (so it may not perfectly match real writes).
  As of the v2 CLI deploy (2026-06-12) repo == live; do a quick confirm, don't belabour.
- **Session notes/location/user are already HTML-escaped via `esc()`** (added in v2).
  Do NOT add escaping. The `$...\text{ kph}$` LaTeX is corrupted *data*, not a render bug.
- **Firebase env:** nvm Node 22 (system Node 18 is too old for firebase-tools 15);
  `firebase login` needs `--no-localhost` in WSL.
- Location dropdown is Squamish / Eagle Mountain / Other(+specify). Coquitlam & Port Moody
  go in via Other → specify (free-text string in `location`).

---

## Assumptions — override BEFORE running if any are wrong

- **A1.** Logger = **in-world narrative log**. Use the diary dates as written below.
  Garmin is **cross-reference only** — do NOT create 10 ride rows from it.
  (If Robert wants Garmin-matched entries, STOP — §3 is wrong.)
- **A2.** The kite entry dated **6/22 maps to the 14 June session** (Justice is in the prose;
  the 16 June day was Robert/Ken only). The **16 June** day has no chronicle → stubbed (E8).
- **A3.** Editor-gate is **soft (name-match)**, not server-enforced. Anyone typing the editor
  handle can edit. Acceptable for a 2-person private app; real auth is a separate spec.
- **A4.** `MD` / `MD+ N` tags and `Ref:` lines preserved as trailing text in `notes`.
- **A5.** Operator normalized to canon **"J'Dinklage Morgoone"** (source typed "J'Dinkalage").
- **A6.** `EDITOR_HANDLE = "J'Dinklage"` — the screenshot shows Robert logged in under that
  name while viewing the diary. **Confirm exact string before Step 2.**

---

## Step 0 — Diagnose the silent-drop bug (WAIT for done)

Read `apps/ride-tracker/index.html` and `apps/ride-tracker/database.rules.json`. Report:

1. The `sessions/$id` rule in full: any `notes` length cap (suspected `< 1024`; longest entry
   below is ~1010 chars of body), the required/allowed field set, and `$other` handling.
2. Whether default-deny + that shape would reject (a) a ~1000-char `notes` write, or
   (b) a write carrying any field beyond `type/date/location/notes/user/timestamp`.
3. The notes textarea `maxlength` (suspected 1024 or unset).
4. Whether an **edit** path exists, or only add + delete.
5. Reproduce one failing write in devtools; capture the exact `permission_denied` / validation
   error. State which hypothesis it confirms: **H1** notes length cap, or **H2** shape/default-deny.

→ **WAIT.** Robert confirms the cause before you touch rules.

---

## Step 1 — Rules: raise cap, redeploy via CLI (WAIT)

In `apps/ride-tracker/database.rules.json`:

- Raise the `sessions` `notes` cap to `< 8192` (diary prose is long-form now). If no cap exists,
  the bug is H2 — instead confirm the `sessions/$id` rule permits the standard diary shape
  (`type`, `date`, `location`, `notes`, `user`, `timestamp`) and that nothing in §3's writes
  trips default-deny.
- **Preserve** the existing default-deny posture and `$other: false`. Do not loosen `availability`.
- Deploy: `cd apps/ride-tracker && firebase deploy --only database`. No Console paste.
- Verify: write one ~1000-char `sessions` entry; confirm it persists.

→ **WAIT.** Robert confirms a long entry saves.

---

## Step 2 — Client: edit capability + editor soft-gate + kill the silent failure (WAIT)

1. **Edit action** on each History card: inline edit of `type`, `date`, `location`, `notes`.
   Wire up the already-imported-but-unused `update` (index.html:900) — write back to the same
   `sessions/$id` key (never `push`).
2. **Editor constant** near the top of the script:
   ```js
   const EDITOR_HANDLE = "J'Dinklage"; // confirm — the handle Robert logs in under to chronicle
   ```
   Gate composition (keep coherent with the existing delete-own at index.html:1522):
   - **Edit** visible iff `currentUser === EDITOR_HANDLE && session.user === EDITOR_HANDLE`
     (only the editor, only on editor-authored = diary entries).
   - **Delete** unchanged: `session.user === currentUser`. For diary entries (`user` = the
     editor handle) this already means only the editor can delete them; Glenn keeps delete-own
     on his own sessions. Add NO new delete logic.
3. **Kill the silent-drop mode** (the real defect, not just its trigger): the drop was invisible
   because `push()` has no `.catch` (index.html:1493). Add `.then/.catch` to BOTH the add and the
   new edit write; on rejection surface a visible error (reuse the app's existing notice pattern
   or a simple inline message). After this a future rule rejection is loud, not silent — the cap
   raise only removes today's trigger.
4. Bump the log-notes textarea AND the new edit-mode textarea `maxlength` to `8192`
   (the textarea at index.html:866 currently has none).
5. **Reuse the existing `esc()`** on the edit render path. Do NOT add new escaping and do NOT
   double-escape — notes/location/user are already escaped. Confirm the LaTeX cannot recur once
   §3 fixes the data.

→ **WAIT.** Robert confirms gate + edit + error-surfacing behave, and confirms `EDITOR_HANDLE`.

---

## Step 3 — Data load: reconcile entries (WAIT)

Read the current `sessions` node first. Surgically **update** the 3 corrupted records in place
(match by current text), then **add** the 5 missing. Do NOT wipe `sessions` (it also holds
non-diary sessions) and do not touch `availability`.

`type` uses the stored enum **`mtb` / `kite`** (NOT the display labels). `date` is regex-pinned
to `^\d{4}-\d{2}-\d{2}$` — use the ISO dates below exactly (a wrong format is another silent-drop
vector). For the 3 corrected records keep their existing `user`; for the 5 new entries set
`user = EDITOR_HANDLE` ("J'Dinklage") so the gate and the data stay coherent. In-prose operator
normalized to "J'Dinklage Morgoone".

ISO dates: E1 `2026-04-25` · E2 `2026-05-12` · E3 `2026-06-02` · E4 `2026-05-02` ·
E5 `2026-06-20` · E6 `2026-06-11` · E7 `2026-06-22` · E8 `2026-06-16`.

### Correct (update in place)

**E1 — was 6/23 Squamish → 4/25 Squamish (Mashater Sector), MTB**
> Dear Diary: The march up the Mashater incline was grueling on the joints, and the humidity has made my neckbeard exceptionally damp. The Rebels were spotted hiding behind a massive, moss-covered old-growth cedar, hurling insults and small pinecones at our flank. Ken, overwhelmed by the psychological warfare, attempted to seek refuge inside a hollowed-out log, claiming it was a tactical bunker. I had to bribe him with three drops of Squirrel Oil just to get him to mount his steed again. My burden is immense, but my sidearm remains polished. Mother would weep if she saw the state of our socks.
>
> — J'Dinklage Morgoone · MD+ 2

**E2 — was 6/17 Eagle Mountain → 5/12 Coquitlam (Physio / Dentist Lines), MTB**
> Dear Diary: The Dentist trail was a toothy affair today, Mother. The Rebels have lined the trenches with what appear to be laminated construction paper lists detailing our past tactical failures. Ken forgot his dry powder once again, opting instead to pack a heavy bag of wet baby carrots. When a local black bear crossed our path near the Physio drop, Ken did not play dead as our Scoutmaster strictly taught us. Instead, he tried to feed the beast a carrot out of his own mouth like a romantic gesture. We escaped by the grace of God and a swift downhill sprint. Tomorrow we march eastbound.
>
> — J'Dinklage Morgoone · Ref: cross-referenced with the 12.96 km baseline from May 8. · MD+ 4

**E3 — was 6/3 Eagle Mountain → 6/2 Port Moody (Eastbound and Down / Three Little Pigs), MTB**
> Dear Diary: We took a sharp left turn into the Three Little Pigs skirmish site. The Rebel presence off the trail was thick; they have established a sophisticated network of lookouts disguised as giant, unblinking mermaids. Ken has insisted on wearing his helmet backwards today, claiming it improves his "vertical integration" during high-speed descents. He crashed into a berry patch at 3.3 kph—a performance identical to a food delivery guy hitting a stationary pedestrian. He spent the remainder of the evening in the fetal position, singing the K-Pop Demon Hunters theme song until the local owls began to mimic him.
>
> — J'Dinklage Morgoone · MD+ 4

> **NOTE:** "3.3 kph" must be plain text. Strip any `$...\text{ kph}$` LaTeX from the existing record.

### Add (new)

**E4 — 5/2 Squamish (Mad Hatter / Rupert Bypass), MTB**
> Dear Diary: Dearest Mother, the quill is heavy tonight. We breached the Rupert sector under a canopy of thick fog, looking exactly like a pair of maritime ghosts holding rusted lanterns. The Rebel forces have heavily fortified the rock slabs. Ken suffered a mild cardiac event on the climb, not unlike the time he over-indexed on street-grade Cialis. He wept openly near a particularly damp patch of ferns and begged me to rub his calves with peppered chipmunk feet. I told him such luxuries are reserved for victorious units. The line held, but only barely.
>
> — J'Dinklage Morgoone · MD+ 4

**E5 — 6/20 Port Moody (Bad Blood / Manhandler), MTB**
> Dear Diary: The Manhandler trail lived up to its unconscionable title. The dirt was feral. We encountered a rogue Rebel Shaman near the clearing, heavily painted in red, white, and blue, screaming about corporate synergies and the Hollywood elite. Ken became deeply confused by the political rhetoric and attempted to surrender his multi-factor alpha pipeline to a nearby squirrel. I had to pistol-whip his handlebars just to break the spell. My sidearm is clean, but my soul is weary. Send more braised pigeon shins if the courier can pass the checkpoint.
>
> — J'Dinklage Morgoone · Ref: executed forty-eight hours post the validated June 18 deployment. · MD+ 4

**E6 — 6/11 Squamish Spit, Kite (Robert · Ken · Justice)**
> Dear Diary: The thermal winds from the sound were relentless today, Mother, blowing at a steady 22 knots. Robert deployed his heavy ordnance—the XR9 9-meter canopy—with the seasoned grace of a veteran blockade runner. Beside him, young Justice took to the skies on her Nexus4 8-meter, executing magnificent vertical ascents and flawless starboard-to-port transitions that filled the unit with pride. Then there is Ken. Still bitter that his progress was halted by last winter's devastating lower-abdominal tissue rupture, he strapped himself into his Pace 12-meter with the unearned confidence of an international mercenary. He strutted across the gravel as if he were a fully compensated, factory-sponsored professional. Moments later, he face-planted into a shallow tide pool, losing his footwear and a significant amount of dignity. He spent the evening resting on a pile of damp driftwood, demanding I treat his wounded pride with three drops of Squirrel Oil and a bowl of cold braised pigeon shins. My sidearm remains true, but my patience is thin.
>
> — J'Dinklage Morgoone

**E7 — 6/22 Squamish Spit, Kite (Robert · Ken · Justice)** *(narrates the 14 Jun session — see A2)*
> Dear Diary: the squalls were fierce today, forcing the unit to downsize our sails. Robert downshifted to his XR9 9-meter, while young Justice commanded her nexus4 8-meter rig with such tactical precision that she seemed to defy gravity entirely, floating above the chop like a graceful woodland sparrow. Ken, operating on his Pace Pro 9-meter, insisted on shouting instructions to the local fishermen, speaking loudly about his fictitious "global brand ambassadorship." His internal moral compass has completely dissolved into the fundamental absurdity of the human condition. He attempted a radical aerial maneuver directly in front of the public launch, only to be violently dragging through the salty brine like a sack of unwashed potatoes. When we hauled his shivering frame onto the rocky shore, his helmet was filled with kelp and he was weeping in the fetal position. He claims the gustiness was a targeted Rebel conspiracy. Tomorrow we dry our powder.
>
> — J'Dinklage Morgoone

**E8 — 6/16 Squamish Spit, Kite (Robert · Ken only) — STUB**
> Dear Diary: No chronicle filed. Robert and Ken on the water; young Justice stood down.
>
> — J'Dinklage Morgoone

> If Robert says "skip the 16th", delete E8.

→ **WAIT.** Robert eyeballs History (correct dates, locations, no LaTeX, kite entries present).

---

## Step 4 — Verify + close

- [ ] All 8 entries render with correct date + location; no `$...$` LaTeX anywhere.
- [ ] Long kite entries (~1000 chars) save and persist (the original bug).
- [ ] Edit + Delete visible only to `EDITOR_HANDLE`; hidden for other names.
- [ ] Edit writes back to the same `sessions/$id` key (no duplicate rows).
- [ ] Rules deployed from `database.rules.json` via CLI; a malformed/oversized write is rejected.
- [ ] `availability` rules untouched; `esc()` not double-applied.
- [ ] 375px pass on History cards + edit mode; one second-browser pass.
- [ ] `change_log.md` one-liner + `docs/tooling-decisions.md` entry (date · app · decision · tool).

---

## Out of scope (park unless asked)

- Real auth-enforced editor lock (separate spec if A3 soft-gate isn't enough).
- Logging the full 10 Garmin rides as entries (only if A1 is overridden).
- Adding Coquitlam / Port Moody to the location dropdown (works via Other → specify).
- A `participants` field on the data model (rosters live in prose).
