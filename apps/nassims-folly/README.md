# Nassim's Folly with Roberto

A private invite-only web app for Robert and Nassim's Tenerife trip (25 May – 8 June 2027).
Handles RSVP, a voyage countdown, the Captain's Diary, and trip activities.

**Live URL:** https://rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/ _(live after Phase 1 deploy)_

**Status:** Phase 1 — auth skeleton deployed; RSVP and content in Phase 2+.

---

## Setup

1. Create Firebase project `wal-nassims-folly` (region `us-west1`).
   Follow `.claude/instructions/firebase-setup.md` §1–4.
2. Enable **Authentication → Email/Password** with **Email link** toggle ON.
   Add `rchalanc-crypto.github.io` to Authorized domains.
3. Create a Realtime Database instance (test mode, tighten rules per `firebase-rules.json`).
4. Replace `{{FIREBASE_API_KEY}}`, `{{FIREBASE_MESSAGING_SENDER_ID}}`, and `{{FIREBASE_APP_ID}}`
   in `index.html` with values from Firebase Console → Project settings.
5. Seed the allowlist for both admins in the RTDB Console (see `CLAUDE.md` for details).
6. Apply database rules from `firebase-rules.json` in the RTDB Console.

## Data model summary

```
/allowlist/{sha256(email)}    invite gate — name, email, party_size
/invitees/{uid}               per-user state — email, name, status, party_size
/admin/{uid}                  admin role — set manually, never written by client
/content/...                  voyage content — admin-write only (Phase 3+)
```

## No-warranty disclaimer

_This is a personal project with no uptime guarantee. Data may be lost._
