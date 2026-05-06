# Nassim's Folly with Roberto — Build Spec

> Approved 2026-05-03. Supersedes the draft plan.
> Lands at `apps/nassims-folly/SPEC.md` once the folder exists.
> Build executes in Claude Code from here.

---

## Locked Decisions

| | |
|---|---|
| **App name** | Nassim's Folly with Roberto |
| **Folder slug** | `nassims-folly` |
| **Folder path** | `apps/nassims-folly/` |
| **Firebase project ID** | `wal-nassims-folly` |
| **Firebase region** | `us-west1` |
| **Database** | Realtime Database |
| **Auth** | Firebase Email Link sign-in **only** (no URL token fallback) |
| **Admin: Robert** | `rchalanc@gmail.com` |
| **Admin: Nassim** | `nassim.rowhani@icloud.com` |
| **Invitee target** | up to 9 couples (likely 8) → ~16–18 individual UIDs |
| **Trip window** | 25 May 2027 – 8 June 2027 |
| **Countdown target** | 25 May 2027, 00:00 local Tenerife time (WEST, UTC+1) |
| **Hosting** | GitHub Pages, **Pattern B** (this is app #2) |
| **Live URL (target)** | `https://rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/` |

---

## Phase 1 — Skeleton & Auth

### 1.1 Scaffold

```bash
cp -r templates/static-firebase apps/nassims-folly/
cd apps/nassims-folly/
```

Create:
- `apps/nassims-folly/CLAUDE.md` — app overrides only (auth model, content surface deferred to Phases 3–4)
- `apps/nassims-folly/README.md` — one-line description, "live URL TBD", setup notes
- Replace `{{PLACEHOLDER}}` values in `index.html` per `templates/static-firebase/TEMPLATE_README.md`. Suggested values:
  - `{{APP_TITLE}}` → `Nassim's Folly with Roberto`
  - `{{APP_NAME}}` → `Nassim's Folly`
  - `{{APP_TAGLINE}}` → `with Roberto`
  - The login template's name-input UI gets **replaced** with the email-link auth flow (1.3), not customized in place.

### 1.2 Firebase project

Follow `.claude/instructions/firebase-setup.md` §1–4 with these specifics:
- Project ID: `wal-nassims-folly`
- Region: `us-west1`
- Disable Google Analytics
- Enable **Authentication → Sign-in method → Email/Password** with the **Email link (passwordless sign-in)** toggle ON. Do NOT enable password-based sign-in.
- Authorized domains: add `rchalanc-crypto.github.io`
- Create RTDB instance, start in test mode (will tighten in 1.5)

### 1.3 Auth flow

Replace the template's name-based login with Firebase Email Link sign-in:

**Landing state (unauthenticated):**
- Single email input + "Send me a link" button
- On submit: call `sendSignInLinkToEmail()` with `actionCodeSettings.url` set to the live URL and `handleCodeInApp: true`
- Store the email in `localStorage` (`emailForSignIn`) so completion flow can recover it
- Show a "Check your email — link sent from `noreply@wal-nassims-folly.firebaseapp.com`" confirmation

**Sign-in completion (when user lands via magic link):**
- On page load, check `isSignInWithEmailLink(window.location.href)`
- If true, retrieve email from localStorage (or prompt if missing — handles cross-device clicks)
- Call `signInWithEmailLink()`
- Strip the link params from URL via `history.replaceState`

**Allowlist check (post-sign-in, blocking):**
- After successful auth, look up `/allowlist/{sha256(email)}` in RTDB
- If not present: sign the user out, show "This email isn't on the invite list — text Robert if you think this is a mistake"
- If present: ensure `/invitees/{uid}` exists (create with `status: "pending"` and the name from allowlist if first sign-in)

### 1.4 Admin role bootstrap

After Robert and Nassim each sign in once:
1. Look up their UIDs in Firebase Console → Authentication → Users
2. Set `/admin/{uid} = { role: "admin" }` directly in RTDB Console
3. Document this one-time bootstrap step in `apps/nassims-folly/CLAUDE.md`

### 1.5 Apply baseline Firebase rules

```json
{
  "rules": {
    "invitees": {
      "$uid": {
        ".read":  "auth != null && (auth.uid == $uid || root.child('admin/' + auth.uid).exists())",
        ".write": "auth != null && (auth.uid == $uid || root.child('admin/' + auth.uid).exists())",
        ".validate": "newData.hasChildren(['email', 'status'])",
        "email":        { ".validate": "newData.isString() && newData.val().length < 256" },
        "name":         { ".validate": "newData.isString() && newData.val().length < 128" },
        "party_size":   { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 2" },
        "status":       { ".validate": "newData.isString() && (newData.val() == 'pending' || newData.val() == 'yes' || newData.val() == 'no')" },
        "responded_at": { ".validate": "newData.isString() && newData.val().length < 32" },
        "notes":        { ".validate": "newData.isString() && newData.val().length < 1024" },
        "$other":       { ".validate": false }
      }
    },
    "allowlist": {
      ".read":  "auth != null",
      ".write": "auth != null && root.child('admin/' + auth.uid).exists()",
      "$emailHash": {
        "name":  { ".validate": "newData.isString() && newData.val().length < 128" },
        "email": { ".validate": "newData.isString() && newData.val().length < 256" },
        "party_size": { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 2" },
        "$other": { ".validate": false }
      }
    },
    "content": {
      ".read":  "auth != null && root.child('invitees/' + auth.uid + '/status').val() == 'yes'",
      ".write": "auth != null && root.child('admin/' + auth.uid).exists()"
    },
    "admin": {
      ".read":  "auth != null && root.child('admin/' + auth.uid).exists()",
      ".write": false
    }
  }
}
```

**Note on the allowlist:** The current sketch lets any signed-in user read the full allowlist (needed so the sign-in flow can check membership). If we later want to hide guest names from each other entirely, switch to per-hash reads only:
```
".read": "auth != null && $emailHash == /* sha256 of auth.token.email */"
```
Firebase rules can hash via `auth.token.email` directly. Defer this hardening to Phase 2's security checklist pass.

### 1.6 GitHub Pages — switch to Pattern B

Follow `.claude/instructions/github-pages-setup.md` §3 exactly. This is the one-time switch. The fallback redirect in the workflow keeps `https://rchalanc-crypto.github.io/APP_Dev/` pointing at ride-tracker — do not break that.

### 1.7 Phase 1 acceptance

- [ ] Robert and Nassim can each sign in via magic link from a fresh incognito window
- [ ] An unlisted email gets a clean "not on the list" rejection with no console errors
- [ ] Both admins have `/admin/{uid}` records set
- [ ] Live URL serves the app at the new path; ride-tracker still works at the old URL
- [ ] Append entry to `docs/tooling-decisions.md` (date, app, what was decided, which AI tool did what)

---

## Phase 2 — RSVP & Voyage Page Skeleton

### 2.1 RSVP screen

Three states driven by `/invitees/{uid}/status`:

| Status | UI |
|---|---|
| `pending` | Two big buttons: **Yes, we're in** / **Sadly, we can't**. Optional notes textarea (1024 char cap). |
| `yes` | Auto-redirect to voyage page. Footer link: "Change my mind" → reverts to pending |
| `no` | Warm decline screen with a J.D.M. quote. Footer link: "Wait, I changed my mind" → pending |

On submit: write `{ status, responded_at, notes }` to `/invitees/{uid}`. Optimistic UI update; Firebase round-trip in background.

### 2.2 Voyage page (skeleton only)

Sections, top to bottom:
1. **Hero** — countdown timer to 25 May 2027 00:00 WEST. Live updates every second. Days/hours/minutes display.
2. **The Property** — placeholder card: "Our chronicler is still scouting. Watch this space." Reads `/content/property/status`; renders gallery once `confirmed`.
3. **The Diary** — placeholder: "No entries yet. J.D.M. has not yet found a quill that doesn't leak." Phase 3 fills this.
4. **Activities** — placeholder. Phase 4 fills this.
5. **Footer** — "A fact about Tenerife: ..." pulls one entry from `/content/fun_facts` at random; rotates per visit, avoids the last 30 IDs via localStorage. Phase 3 seeds the pool.

### 2.3 Admin screen (`/admin` route in-app, gated by `/admin/{uid}` check)

Two tabs:

**Allowlist management:**
- Table of allowlist entries (name, email, party_size, RSVP status if signed in)
- Add row form: name + email + party_size → writes to `/allowlist/{sha256(email)}`
- Remove row button per entry
- Bulk paste: paste CSV `name, email, party_size` → batch write

**RSVP dashboard:**
- Same table with status counts at top: `Yes: N · No: N · Pending: N`
- Click an invitee → see their notes (optional field from RSVP submission)

### 2.4 Pre-share security pass

Run `.claude/instructions/security-checklist.md` end to end. **Skeptic has veto power.** Don't send a single invite until every box is checked.

Specific gates from §5b/c of `firebase-setup.md`:
- [ ] Allowlist read-scope reviewed (the open-read-to-any-signed-in-user note in 1.5 — decide: harden now or defer)
- [ ] Test malformed write: try writing `status: "maybe"` → Firebase must reject
- [ ] Test foreign-write: signed in as User A, try writing to `/invitees/<User B's uid>` → must fail
- [ ] $0.01 budget alert active in Google Cloud Billing

### 2.5 Phase 2 acceptance

- [ ] All Phase 1 + 2 acceptance items pass
- [ ] Send invite to one friendly test couple (someone who'll tolerate breakage). Get their RSVP. Confirm admin dashboard shows it.
- [ ] Then send the real invites.

---

## Deferred to Later Sessions (Not Blocking Phase 1+2 Ship)

These are tracked here so they don't get lost. None are needed before the first invite goes out — the voyage page works with placeholders.

| Item | Phase | Owner | Notes |
|---|---|---|---|
| Activities draft (15–20 entries: kiteboarding, golf, hiking, kayaking, restaurants, culture) | 4 | Claude.ai chat (next session) | Robert + Glenn = kiteboarders. Categories: `wind`, `wheels` (golf), `feet` (hiking), `water`, `food`, `culture`. |
| Fun facts seed pool (~50 entries: history, geography, things to do) | 3 | Claude.ai chat | Mix of "useful" and "absurd." Bias toward absurd. |
| Diary samples — J.D.M. (3 entries to seed) | 3 | Claude.ai chat | One pre-departure, one mid-voyage, one "arrival." Anchor tone for future entries. |
| Diary samples — Gnatalee McCringleberry, Keeper of the Sanity | 3 | Claude.ai chat | Voice: bone-dry, undermines J.D.M. without ever directly contradicting him. Sample line direction: *"The Captain reports we have built fortifications. We have stacked three rocks. The rocks are not load-bearing."* |
| Property photo gallery wiring | 4 | Claude Code | Activates when `/content/property/status` flips to `confirmed`. |
| T-minus-7-days "intensify" mode | 5 | Claude Code | Voyage page swaps countdown styling; new diary cadence. |
| Post-trip "memories" mode | 5 | Claude Code | Optional. Decide closer to the date. |
| Export-all-content-as-JSON admin button | 5 | Claude Code | So diary entries survive the project being archived. |

---

## Open Items (Non-Blocking)

- **25th anniversary date** — Robert and Nassim's 25-year mark falls inside the trip window (or near it). If Robert wants a special countdown moment for the anniversary specifically, get the exact date and mark it as a "second target" alongside the trip start. Not needed before Phase 1 ship.
- **`noreply@wal-nassims-folly.firebaseapp.com` sender** — flagged as a "tell people in your invite email" item, not a fix.
- **Allowlist read scope** (see 1.5 note) — decide during Phase 2 security pass whether to harden to per-hash reads.

---

## File Map (After Phase 2)

```
apps/nassims-folly/
├── CLAUDE.md              app-specific overrides + admin bootstrap notes
├── README.md              one-line desc, live URL, no-warranty disclaimer
├── SPEC.md                this file
└── index.html             single-file app (auth + RSVP + voyage skeleton + admin)
```

No `src/`, no `dist/`, no build step. The template default holds.
