# Tenerife 2027 — App Plan

> Draft for approval. Once approved, this lands at `apps/tenerife-2027/PLAN.md`
> and the build moves to Claude Code.

**Owner:** Robert Chalmers
**Co-host:** Nassim
**Occasion:** Robert's 60th birthday + Robert & Nassim's 25th anniversary
**Trip dates:** ~25 May – 8 June 2027, Tenerife
**Audience:** small group of couples, all close friends. Likely 6–12 people total.
**Target ship date:** v1 live and emailed to first invitees within 2 working sessions

---

## 1. Strategist — Scope

**What this app is:** a private, invitation-only experience that does two jobs in one URL.
- **Job 1 (RSVP):** invitees confirm yes/no privately. No one sees the guest list or other people's responses except Robert and Nassim.
- **Job 2 (anticipation hub):** confirmed guests get a fun, evolving page that builds excitement over the ~12 months between invite and trip.

**What success looks like:**
- Every invitee responds within ~2 weeks of receiving their email.
- Confirmed guests open the page repeatedly between invite and trip — the rotating fun facts and diary entries are the hook.
- The diary voice (J'Dinklage Morgoone et al.) is the thing people quote back to you in person.

**Explicitly out of scope for v1:**
- Group chat / commenting between guests
- Travel logistics (flights, transfers, packing lists) — could come later
- Public sharing of any kind — this URL is private and unindexed
- Calendar integration, polls, gift coordination
- Anything money-related (deposits, splits)

**Kill-switch:** if the auth flow trips up more than one couple, fall back to per-person URL tokens in v1.1. We do not let "nice tech" block RSVPs.

---

## 2. Designer — UX & Personality

**Two clearly distinct screens** so the transition from "deciding" to "going" feels like crossing a threshold.

| Screen | Vibe | Primary action |
|---|---|---|
| **RSVP page** | Calm, warm, decisive. Minimal copy. One clear question. | Tap **Yes, I'm in** or **Sadly, no** |
| **Voyage page** (post-yes) | Rich, playful, slightly ridiculous. Diary-driven. | Read, scroll, return tomorrow |

**The personality call:** The diary voice is the soul of this app. Everything else is scaffolding. Treat J'Dinklage Morgoone's entries as a hero feature, not a footnote. Suggested visual direction:
- Type pairing: a serif with character (e.g., **Cormorant Garamond** or **Spectral**) for diary body, paired with a punchy display face (**Bebas Neue** or **Abril Fatface**) for headlines.
- Palette: warm parchment / sun-bleached map aesthetic. Cream, ink, weathered teal, faded coral. Think old expedition journal more than tropical vacation poster.
- Microtouches: subtle paper texture, a wax-seal motif on the "Yes" confirmation, a ship-in-bottle SVG somewhere.

**States to handle:**
- RSVP: pending, confirmed-yes, declined, expired (token invalid)
- Voyage page: countdown active, T-minus 1 week (intensify), trip in progress, trip ended (memories mode?)
- Property section: "TBD" placeholder (with a diary entry explaining the search) → photo gallery once locked
- Empty/loading: Firebase is loading, no diary entries yet, no fun facts seeded yet

**Sample diary entry (to anchor the tone):**

> **Day 14 at Sea — J'Dinklage Morgoone, Chronicler**
>
> *Dear Roberto,*
>
> *The stars were obscured today. We took a wrong turn somewhere east of the trade winds. Cook claims he saw the Canaries on the horizon at dawn but Cook also claims many things, including parentage by a duchess.*
>
> *Fortune is shining upon us. We find ourselves shipwrecked. It appears to be a pleasant beach. We have an abundance of fruits — papaya, banana, a small green thing the men are arguing about. I have tasked the crew with beginning fortifications for your arrival.*
>
> *Nassim will, I trust, find the wine cellar acceptable. I've buried the better bottles for safekeeping.*
>
> *— J.D.M.*

The whole app should feel like it lives in the same world as that paragraph.

---

## 3. Architect — Stack & Auth (the meaty part)

**Stack:** template default — single-file HTML + vanilla JS + CSS variables + Firebase Realtime Database + GitHub Pages. Justified: state is simple (invitee records + content lists), no routing beyond two screens, no build step needed.

**Tradeoff called out:** I considered Vite + React for the diary feed (nicer dev ergonomics for a list of cards), but the cost (build step, deploy complexity, two Firebase init paths) isn't worth it for a single feed. If the diary grows to 50+ entries with media-heavy entries and we want pagination + search, revisit.

### Authentication — the real decision

The hard requirement is **secure + easy**, with privacy preserved (no one sees the guest list except admins). Three options, ranked:

**Option A — Firebase Email Link Sign-In (recommended).**
Invitee enters email on the app → Firebase sends a magic link → they click → authenticated. Subsequent visits stay signed in. Firebase rules use `auth.uid` to enforce per-user data access.

- **Pros:** Truly passwordless, secure, free, infrastructure-free (Firebase sends the email). Maps cleanly to Firebase Auth UID → invitee record. Rules can rigorously enforce "you only see your own record."
- **Cons:** Sender appears as `noreply@<project>.firebaseapp.com`. Frame this in your initial email so people don't think it's spam.

**Option B — Per-invitee URL token (lazy alternative).**
You generate `https://app/?t=abc123xyz` for each invitee, email it to them, they click. Token stored in localStorage after first visit.

- **Pros:** Trivial to implement. No Firebase Auth setup. Works offline-friendly.
- **Cons:** Forwarded URL = unauthorized access. Firebase rules can't verify URL tokens server-side, so privacy enforcement is client-side (i.e., not real). Acceptable for "low stakes friends list" but weaker than Option A.

**Option C — Pre-shared codes.**
Email each invitee a 6-character code, they type it on the app.

- **Pros:** Robust against email forwarding (codes can be one-time-use).
- **Cons:** Clunky UX — typing codes is the worst of all worlds.

**Recommendation: Option A.** Negligible extra complexity, real privacy, and the magic-link UX is genuinely delightful on mobile. Document the `noreply@` sender in your invitation email so no one panics.

### Data model (RTDB)

```
/invitees/{uid}
    name:        string         // pre-seeded by admin
    email:       string         // matches auth provider
    party_size:  number         // for couples; 1 or 2
    status:      "pending" | "yes" | "no"
    responded_at: ISO timestamp
    notes:       string         // optional, only invitee + admin can read

/allowlist/{email_hash}         // admin-seeded hash of approved emails
    name:        string         // for greeting before they sign in

/content/property
    status:      "tbd" | "confirmed"
    name:        string
    location:    string
    description: string
    photos:      [{ url, caption }]

/content/activities/{id}
    title, description, category, image_url, external_link, order

/content/fun_facts/{id}
    text, category, source

/content/diary/{id}
    author:      "J.D. Morgoone" | "(future characters)"
    date:        ISO            // in-world date, can be wildly anachronistic
    title:       string
    body:        markdown
    image_url:   optional

/admin/{uid}                    // hard-coded: Robert + Nassim's UIDs
    role: "admin"
```

**State location:**
| State | Lives in |
|---|---|
| Auth session | Firebase Auth (httpOnly cookie + IndexedDB) |
| Invitee profile + RSVP | Firebase RTDB `/invitees/{uid}` |
| Last-seen fun fact IDs | localStorage (so we don't repeat for ~30 visits) |
| Countdown target | Hard-coded constant in `index.html` (one date, one place) |
| Diary draft (admin only) | localStorage until publish |

**The hardest thing to change later** is the auth model and the invitee record schema. Both are getting their attention now. Everything else is a content table.

### Firebase rules sketch

Following the pattern in `.claude/instructions/firebase-setup.md §5b` (namespaced + shape-constrained), with auth gating per `§5c`:

```json
{
  "rules": {
    "invitees": {
      "$uid": {
        ".read":  "auth != null && (auth.uid == $uid || root.child('admin/' + auth.uid).exists())",
        ".write": "auth != null && (auth.uid == $uid || root.child('admin/' + auth.uid).exists())",
        "status": { ".validate": "newData.isString() && (newData.val() == 'pending' || newData.val() == 'yes' || newData.val() == 'no')" },
        "notes":  { ".validate": "newData.isString() && newData.val().length < 1024" }
      }
    },
    "allowlist": {
      ".read":  "auth != null",
      ".write": "auth != null && root.child('admin/' + auth.uid).exists()"
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

Key properties enforced:
- An invitee can only read/write their own record.
- An invitee cannot enumerate the guest list. Rules don't permit reading `/invitees` as a collection.
- Content (diary, photos, activities, facts) is only readable to confirmed-yes guests.
- Admin role is granted out-of-band (you set it directly in the Firebase console).

---

## 4. Shipper — Deploy & Ops

- **Folder:** `apps/tenerife-2027/`
- **Firebase project:** `wal-tenerife-2027` per the naming convention in `firebase-setup.md §1`
- **Region:** `us-west1` (default — closest to you)
- **Hosting:** GitHub Pages, current Pattern A. This is app #2, so we will need to flip to Pattern B per `github-pages-setup.md §3` as part of the build.
- **Live URL (post-flip):** `https://rchalanc-crypto.github.io/APP_Dev/apps/tenerife-2027/`
- **Email sending:** entirely handled by Firebase Auth email link. No SendGrid, no Mailgun, nothing to wire.
- **Initial invite email:** *you* send this manually from your normal email account. It contains the app URL and a single sentence: *"Click, enter your email, watch for a magic link from `noreply@firebaseapp.com`."* Per-couple personalization optional.
- **Rollback:** standard `git revert` + push.

---

## 5. Skeptic — Risks & Pre-Share Gates

Ranked.

**1. (Critical) Email-link friction lockout.** If a couple's email client mangles the magic link or routes it to spam, they can't RSVP. **Mitigation:** clear instructions in your initial email; offer a fallback ("if it doesn't work, text Robert"). Test the flow end-to-end on Gmail, Outlook, iCloud Mail, and at least one mobile email client before sending invites.

**2. (Important) Allowlist drift.** If you add an invitee in conversation but forget to add them to the allowlist, they'll get a confusing "you're not on the list" error. **Mitigation:** allowlist management is a tiny admin screen, not a Firebase Console task. You manage it from the app itself.

**3. (Important) Diary content lives in Firebase, not in git.** This is normally fine but means a cleanup pass after the trip won't capture diary entries unless you export. **Mitigation:** add an "export all content as JSON" admin button. Run it post-trip and commit the JSON to the repo as a memento.

**4. (Nit) `noreply@firebaseapp.com` looks impersonal.** **Mitigation:** acknowledge it in your invite email. Custom sender domain requires Firebase Auth's paid tier and DNS work — not worth it for one event.

**5. (Nit) Free-tier limits.** With 12 invitees checking in 2× per week for 12 months, we're nowhere near RTDB free-tier limits. Set the $0.01 budget alert per `firebase-setup.md §6` anyway.

**Pre-share gate:** Skeptic-persona pass per `.claude/instructions/security-checklist.md` before the first invite goes out. Non-negotiable.

---

## 6. Build Phases

**Phase 1 — Skeleton & Auth (Session 1, ~2 hours)**
- Scaffold `apps/tenerife-2027/` from `templates/static-firebase`
- Create Firebase project `wal-tenerife-2027`, enable Email Link auth
- Implement: landing → email entry → magic link → signed-in shell
- Implement: allowlist check on first sign-in
- Hard-code Robert + Nassim as admin UIDs once you've signed in once each
- Switch GitHub Pages to Pattern B
- Apply baseline Firebase rules
- **Deliverable:** you and Nassim can sign in. Random emails get rejected gracefully.

**Phase 2 — RSVP & Voyage Page Skeleton (Session 2, ~2 hours)**
- RSVP screen with Yes / No
- Confirmation transitions to voyage page
- Voyage page: countdown timer, "property TBD" placeholder, "diary coming soon"
- Admin screen: see RSVP status of all invitees, manage allowlist
- Run security checklist
- **Deliverable:** ship-ready v1. Send to first invitees.

**Phase 3 — Diary & Fun Facts (Session 3)**
- Diary feed with admin compose UI (markdown body)
- Fun facts: seed initial pool of ~50, rotation logic with localStorage
- Sample J.D.M. entries to seed (you'll write more over the year)
- **Deliverable:** the experience starts being delightful.

**Phase 4 — Activities & Property Photos (when content is ready)**
- Activities list with categories
- Property photo gallery (when location is locked)
- **Deliverable:** complete content surface.

**Phase 5 — Personality polish (ongoing)**
- Second chronicler character if you decide on one
- T-minus-7-days "intensify" mode
- Optional: post-trip "memories" mode

---

## 7. Open Questions for You

Before Phase 1 starts, I need answers to these. None are blocking the plan itself.

1. **App name.** "Tenerife 2027" is functional. Suggestions with more personality:
   - **The Tenerife Expedition** (matches J.D.M. voice)
   - **Voyage to Tenerife**
   - **Roberto's Folly** (self-deprecating, intimate)
   - **The Sixtieth Crossing** (ties to your 60th)

2. **Roberto's birthday during the trip?** Specifically what date so the countdown can do something special on it.

3. **Nassim's email** for admin access. (And confirm Robert's preferred email.)

4. **Initial invitee list size estimate.** Affects nothing technically but useful to know if we're talking 6 vs 16.

5. **Activities curation.** Are you assembling these yourself, or do you want me to draft an initial set of 15–20 Tenerife activity recommendations as part of Phase 4?

6. **Is there a couple in the group who is genuinely not tech-comfortable?** If yes, the per-invitee URL token fallback (Option B) becomes a Phase 1 feature, not Phase 5.

7. **Second chronicler character.** Do you want me to draft a candidate now (e.g., a deadpan first mate, a comically pessimistic ship's surgeon) or wait?

---

## 8. What I'm Not Asking You to Decide Yet

- Exact visual design — I'll mock that in Claude.ai once the plan is approved
- Specific fun fact content — you'll write or curate during the year
- Property photos — you don't have them yet
- Trip itinerary — explicitly out of scope for the app

---

**Approve this plan, edit the parts you want changed, or push back on the auth choice.**
Once approved, I'll convert this into a build-ready spec for Claude Code.
