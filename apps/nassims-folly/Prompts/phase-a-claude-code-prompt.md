# Claude Code Prompt — Phase A (Firebase Bootstrap)

> Save as `prompts/phase-a.md` if you want a record. Otherwise just paste
> the block below into Claude Code at the repo root.

---

```
This is the Phase A session for Nassim's Folly with Roberto: Firebase Console
bootstrap, allowlist seed for both admins, and rules deploy. Browser work
mostly; small terminal side (SHA-256 hashes, JSON formatting, rules
verification).

REQUIRED READING before doing anything else:
- /CLAUDE.md
- /apps/nassims-folly/SPEC.md
- /apps/nassims-folly/CLAUDE.md
- /.claude/instructions/firebase-setup.md (sections 1, 3, 4, 5, 6)
- /apps/nassims-folly/firebase-rules.json (should already exist from the
  previous session — verify it matches SPEC §1.5; flag any drift before
  proceeding)
- /apps/nassims-folly/index.html (skim only — confirm the allowlist
  lookup code lowercases the user's email BEFORE hashing it; if it
  doesn't, flag this NOW before we seed mismatched hashes)

Drive this session interactively. I will be in the Firebase Console
clicking. You are the checklist tracker, terminal worker, and verifier.
Three steps. DO NOT proceed to the next step until I confirm the previous
one is complete by replying "done."

If anything in the SPEC, runbook, or codebase contradicts these
instructions or is unclear, STOP and ASK before acting. Do not guess.

────────────────────────────────────────────────────────────────────────
STEP 1 — FIREBASE CONSOLE BOOTSTRAP

Print my browser checklist for the items below. Reference firebase-setup.md
section numbers where applicable. Then wait for "done."

  a. Create project `wal-nassims-folly` (Analytics OFF, region us-west1)
  b. Authentication → Sign-in method → Email/Password:
     - Toggle "Email/Password" provider ON
     - Within it, toggle "Email link (passwordless sign-in)" ON
     - Leave password sign-in OFF
  c. Authentication → Settings → Authorized domains:
     - Add `rchalanc-crypto.github.io`
     - (`localhost` should already be there for local dev)
  d. Realtime Database → Create database, region us-west1, start in test
     mode (we will tighten in Step 3, before any auth is wired)
  e. Project settings → General → Your apps → Add web app
     (nickname: `nassims-folly-web`, skip Firebase Hosting)
     - Save the firebaseConfig object somewhere I can paste it later;
       Phase B will need it

────────────────────────────────────────────────────────────────────────
STEP 2 — ALLOWLIST SEED

Once I confirm Step 1 done:

  a. Compute SHA-256 hashes for both admin emails. Use:

       echo -n "rchalanc@gmail.com" | shasum -a 256 | awk '{print $1}'
       echo -n "nassim.rowhani@icloud.com" | shasum -a 256 | awk '{print $1}'

     Lowercase emails, no trailing newline (-n flag is critical).
     Print both hashes for me to verify.

  b. Produce the JSON snippet to paste at /allowlist in RTDB Console.
     Shape:

       {
         "<sha256-of-robert>": {
           "name": "Robert Chalmers",
           "email": "rchalanc@gmail.com",
           "party_size": 1
         },
         "<sha256-of-nassim>": {
           "name": "Nassim Rowhani",
           "email": "nassim.rowhani@icloud.com",
           "party_size": 1
         }
       }

     party_size is 1 each because Robert and Nassim each manage their own
     RSVP. Couples where only one email is known will be added later with
     party_size 2.

  c. Print my browser instructions: RTDB Console → Data tab → click the
     root node → Add child key `allowlist` → paste the JSON as its value.
     Then wait for "done."

  d. WAIT — confirm before proceeding: did the index.html allowlist
     lookup code lowercase the email before hashing? If not, the seed
     hashes will not match what the runtime computes when Robert and
     Nassim sign in, and they'll get rejected. Surface this now if you
     haven't already.

────────────────────────────────────────────────────────────────────────
STEP 3 — RULES DEPLOY

Once I confirm Step 2 done:

  a. Read /apps/nassims-folly/firebase-rules.json one more time. Confirm
     it matches SPEC §1.5 verbatim. Flag any drift.

  b. Choose the faster deploy path given the current local state:
       - Option 1: RTDB Console → Rules tab → paste → Publish
       - Option 2: Firebase CLI (`firebase deploy --only database`) if
         the CLI is already installed AND the project is initialised
         locally with a `.firebaserc` pointing to wal-nassims-folly
     Tell me which option you recommend and why. If Option 2 needs
     setup work (login, init, .firebaserc), Option 1 is faster for a
     one-shot deploy.

  c. Print the steps for whichever path you picked. Then wait for "done."

  d. After I confirm rules are deployed: do a sanity check by reading
     them back — RTDB Console → Rules tab — and confirm "test mode" is
     gone, replaced by the namespaced rules from SPEC §1.5.

────────────────────────────────────────────────────────────────────────
END-STATE CHECKLIST (verify before declaring Phase A done)

- [ ] Project wal-nassims-folly exists in us-west1, Analytics off
- [ ] Email link sign-in enabled, password sign-in disabled
- [ ] rchalanc-crypto.github.io in Authorized domains
- [ ] RTDB exists in us-west1
- [ ] /allowlist has both admin entries with correct SHA-256 hashes
- [ ] Rules from firebase-rules.json deployed; "test mode" banner gone
- [ ] firebaseConfig captured and ready for Phase B

────────────────────────────────────────────────────────────────────────
CLOSING

Once end-state is verified:
  - Append to /change_log.md (NOT tooling-decisions.md — repo root has
    the change_log.md as primary audit log; check both files first to
    confirm which I'm using). Entry shape per the existing pattern:
    date 2026-05-04, "Phase A — Firebase project bootstrap and allowlist
    seed for nassims-folly", what was decided (Option 1 or 2 for rules
    deploy, any deviations from SPEC).
  - Print a one-line summary of what I need to bring to Phase B (the
    firebaseConfig object values for index.html placeholder replacement).

DO NOT do in this session:
  - Touch /apps/nassims-folly/index.html (Phase B replaces placeholders)
  - Push to main (Phase B does the deploy + Pages switch)
  - Sign in to the app (we sign in AFTER Phase B is live)

Begin with the required reading. After reading, summarise in 3 bullets
what you found in firebase-rules.json and index.html — particularly the
allowlist lookup code — before printing Step 1's browser checklist.
```

---

## Why this prompt is shaped the way it is

- **Three checkpointed blocks, not one autonomous run.** Phase A is mostly Console-clicking, which Claude Code can't verify. Without checkpoints, Claude Code would race ahead and you'd lose track of where the failure happened.
- **The lowercase-before-hash flag in Step 2d is the most important line in the prompt.** If `index.html` hashes the user's email at sign-in time without lowercasing first, and we seed lowercased hashes here, every sign-in will fail with a confusing "not on the manifest" error. Better to catch it now than during the acceptance test.
- **Step 3 forces a CLI-vs-Console choice rather than picking for you.** If Firebase CLI is already set up locally, `firebase deploy --only database` is the right move (rules are version-controlled, deploy is one command). If not, the setup overhead isn't worth it for a one-time deploy.
- **The "do not do in this session" list at the bottom is a hard fence.** Phase A and B are sequenced for a reason — placeholders in `index.html` shouldn't be replaced until you have the firebaseConfig values from the project you're about to create.
- **Change log vs tooling-decisions.md.** Your repo has both. The change_log.md at root looks like the primary audit document for structural changes; tooling-decisions.md is the AI-tool-attribution log. The prompt asks Claude Code to confirm which you're using rather than guess.
