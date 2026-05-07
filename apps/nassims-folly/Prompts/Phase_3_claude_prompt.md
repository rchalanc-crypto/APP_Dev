Read these files before touching anything:
- CLAUDE.md
- apps/nassims-folly/CLAUDE.md
- apps/nassims-folly/SPEC-PHASE-3.md
- apps/nassims-folly/SPEC.md
- change_log.md

Execute in this order. After each section, summarise what changed and wait 
for "go" before proceeding.

---

## Part 1 — Doc updates (no code, small commit)

1. apps/nassims-folly/CLAUDE.md
   - Replace the Phase map section with the updated version (Phase 1+2 
     complete, Phase 3 in progress, Phase 4+5 planned)
   - Add a new "Character canon" section below the Phase map:

     J.D. Morgoone embraces golf and pickleball with great enthusiasm and no 
     aptitude. His accounts feature confident misuse of terminology, equipment 
     difficulties presented as strategic choices, and scores he declines to 
     specify. He considers himself a natural athlete and has no evidence for this.

     Gnatalee McCringleberry has never played golf or pickleball. She is better 
     than the Captain at both on first attempt. She does not gloat. She reports. 
     Her actual preferences are kitesurfing, rally driving, and MTB — all pursued 
     with quiet competence and no drama. She finds the Captain's enthusiasm for 
     gentler sports baffling but professionally manageable.

2. docs/tooling-decisions.md — append these four entries:
   2026-05-03 | nassims-folly | Firebase bootstrap, allowlist seed, auth flow, Phase 1 scaffold | Claude Code | Plan drafted in Claude.ai chat. See apps/nassims-folly/SPEC.md.
   2026-05-04 | nassims-folly | Phase 2: RSVP, voyage skeleton, admin dashboard, Firebase rules | Claude Code | Custom domain + email sender followed in Phase 2.G/H.
   2026-05-05 | nassims-folly | Custom domain follyintenerife.com + noreply@follyintenerife.com | Claude Code | Blaze plan, Cloudflare DNS, Firebase Auth custom domain.
   2026-05-06 | nassims-folly | Phase 3 spec + content seed v2 approved | Claude.ai chat | Gnatalee McCringleberry character finalised. keeper_note field added to diary data model. 50 fun facts, 3 diary entries, 25 activities (including motor category) drafted. Wind/weather feature (Open-Meteo) and Required Viewing video section planned for Phase 4.

3. README.md (root) — add nassims-folly row to the apps table:
   | [nassims-folly](apps/nassims-folly/) | Private invite-only voyage app for Robert & Nassim's Tenerife trip, May–June 2027 | https://follyintenerife.com/apps/nassims-folly/ |

4. change_log.md — prepend this entry (newest-first order):

   ## [2026-05-06] — nassims-folly Phase 3: Spec Approved [PENDING BUILD]
   
   [SPEC] Phase 3 spec drafted in Claude.ai chat. Content seed v2 finalised.
   
   - SPEC-PHASE-3.md added to apps/nassims-folly/
   - Deadpan First Mate replaced by Gnatalee McCringleberry, Keeper of the Sanity
   - Data model update: keeper_note optional field on /content/diary/{id}
   - Seed content: 3 diary entries (dep-001, voy-014, arr-001), 50 fun facts, 
     25 activities (20 original + 5 motor category)
   - Character canon locked: J.D.M. plays golf and pickleball badly; Gnatalee 
     beats him at both first try; her real sports are kitesurfing, rally, MTB
   - Phase 4 planned: activities UI, kite weather (Open-Meteo, 3 spots), 
     Required Viewing video section (Ken Block + Travis Pastrana Gymkhana), 
     property gallery

5. apps/nassims-folly/SPEC.md — in the Deferred Items table, update the 
   "Deadpan First Mate" row: rename to "Gnatalee McCringleberry, Keeper of 
   the Sanity" and mark as resolved in content-seed-v2.

Commit: "docs: update CLAUDE.md, change_log, tooling-decisions, root README 
for Phase 3 planning session 2026-05-06"

---

## Part 2 — Phase 3 build

Execute SPEC-PHASE-3.md §A through §D in order:

§A — Fun facts rotation logic (index.html) + seed 50 facts to Firebase
§B — Diary feed render on voyage page + CSS additions
§C — Admin diary compose UI (third tab in admin dashboard)
§D — Seed content via Firebase:
     - 3 diary entries using set() at named paths (dep-001, voy-014, arr-001)
     - 50 fun facts using push() to /content/fun_facts/
     - 25 activities using push() to /content/activities/ — the original 20 
       from the spec PLUS these 5 additional motor category entries:

       { title: "Rally Ciudad de La Laguna", description: "Part of the Canary 
         Islands Asphalt Rally Championship. Held in July — spectating is free 
         and the stages through La Laguna's streets are exceptional. Check the 
         calendar for 2027 dates.", category: "motor", order: 21 }

       { title: "Rally Isla de Tenerife", description: "Major local rally, part 
         of the island championship calendar. Dates vary — worth checking if it 
         falls during the trip window.", category: "motor", order: 22 }

       { title: "Clásica de Tenerife", description: "Regularity rally for 
         historic classic cars, October/November. International teams. Not during 
         our window but worth knowing about for the next visit.", category: 
         "motor", order: 23 }

       { title: "Subida al Boquerón", description: "Recognised mountain hill 
         climb organised by Sport Eventos Tenerife, typically March. The road is 
         open to civilian vehicles at other times. The Keeper does not recommend 
         attempting it in a standard rental.", category: "motor", order: 24 }

       { title: "Karting Club Tenerife", description: "Go-kart circuit for when 
         the urge to go fast meets the wisdom of not doing it on a public road. 
         All skill levels. The Keeper has reviewed the safety record. It is 
         acceptable.", category: "motor", order: 25 }

Run the §F acceptance checklist from SPEC-PHASE-3.md before marking done.

Commit: "feat(nassims-folly): Phase 3 — diary feed, fun facts, admin compose, 
content seed"

---

## Part 3 — change_log entry for Phase 3 build

After Phase 3 build is confirmed working, append a [COMPLETED] entry to 
change_log.md documenting what was built and any deviations from SPEC-PHASE-3.md.

---

## Out of scope today

- Required Viewing video section (Phase 4)
- Activities render UI (Phase 4)  
- Kite weather widget (Phase 4)
- Golf and pickleball diary entries (add via admin compose UI — not seeded by code)
- Property gallery (Phase 4)