# Nassim's Folly with Roberto

A private invite-only web app for Robert and Nassim's Tenerife trip (25 May – 8 June 2027).
Handles RSVP, a voyage countdown, the Captain's Diary, and trip activities.

**Live URL:** https://follyintenerife.com/apps/nassims-folly/

**Fallback URL:** https://rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/

**Status:** Phase 2 complete — RSVP, voyage skeleton, admin dashboard live. Custom domain active. Custom email sender (Phase 2.H) complete.

---

## Setup

1. Create Firebase project `wal-nassims-folly` (region `us-west1`).
   Follow `.claude/instructions/firebase-setup.md` §1–4.
2. Enable **Authentication → Email/Password** with **Email link** toggle ON.
   Add `rchalanc-crypto.github.io` and `follyintenerife.com` to Authorized domains.
3. **Custom email sender**: auth emails send from `noreply@follyintenerife.com` via Firebase Auth's
   built-in custom domain configuration. SPF/DKIM records configured at Cloudflare DNS
   (TXT for SPF + Firebase verification, 2× CNAME for DKIM). Requires Firebase Blaze plan.
   Note: the passwordless sign-in email body and sender display name are not customizable
   through Firebase Console — this is a Firebase platform limitation.
4. Create a Realtime Database instance (test mode, tighten rules per `firebase-rules.json` — deploy via CLI, see below).
5. Replace `{{FIREBASE_API_KEY}}`, `{{FIREBASE_MESSAGING_SENDER_ID}}`, and `{{FIREBASE_APP_ID}}`
   in `index.html` with values from Firebase Console → Project settings.
6. Seed the allowlist for both admins in the RTDB Console (see `CLAUDE.md` for details).
7. Apply database rules from `firebase-rules.json` via CLI (see below).

## Database rules

Rules live in `firebase-rules.json` in this folder and deploy via CLI
(`firebase.json` + `.firebaserc` pin project `wal-nassims-folly`):

```bash
cd apps/nassims-folly
firebase deploy --only database
```

Console paste is for emergencies only and must be back-ported to
`firebase-rules.json` the same day (root `CLAUDE.md` policy).

## Data model summary

```
/allowlist/{sha256(email)}    invite gate — name, email, party_size
/invitees/{uid}               per-user state — email, name, status, party_size
/admin/{uid}                  admin role — set manually, never written by client
/content/...                  voyage content — admin-write only (Phase 3+)
```

## No-warranty disclaimer

_This is a personal project with no uptime guarantee. Data may be lost._
