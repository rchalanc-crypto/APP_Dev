# CLAUDE.md — nassims-folly

Inherits from root `CLAUDE.md`. Overrides and app-specific notes below.

## Auth model

Firebase Email Link (passwordless) — no password sign-in, no anonymous auth.
The name-based login from the static-firebase template has been replaced entirely.

Two-step gate after sign-in:
1. `/allowlist/{sha256(email)}` must exist — if not, user is signed out and shown a rejection screen.
2. `/invitees/{uid}` is provisioned on first sign-in with data from the allowlist entry.

## Character canon

**J'Dinklage Morgoone** embraces golf and pickleball with great enthusiasm and
no aptitude. His accounts of both feature confident misuse of terminology,
equipment difficulties presented as strategic choices, and scores he declines
to specify. He considers himself a natural athlete and has no evidence for this.

J.D.M.'s formal sign-off is always: "J'Dinklage Morgoone, Chronicler to the
Expedition" — never abbreviated to "J.D.M." in the sign-off line itself.

**Gnatalee McCringleberry** has never played golf or pickleball. She is better
than the Captain at both on first attempt. She does not gloat. She simply
reports. Her actual preferences are kitesurfing, rally driving, and MTB — all
of which she pursues with quiet competence and no drama whatsoever. She finds
the Captain's enthusiasm for gentler sports baffling but professionally
manageable.

Gnatalee's formal sign-off is always: "Gnatalee McCringleberry, Keeper of the
Sanity" — never abbreviated to "G. McCringleberry" or any other short form.

IMPORTANT FOR FUTURE SESSIONS: Gnatalee calls J.D.M. "the Captain"
throughout her diary notes. This is intentional dry irony — he is not a
captain, he calls himself one, and she documents it faithfully. Do NOT
correct "the Captain" to "the Chronicler" in her voice. The irony is
the point and must be preserved exactly as written.

## Admin bootstrap (one-time, manual)

After Robert (`rchalanc@gmail.com`) and Nassim (`nassim.rowhani@icloud.com`) each sign in once via magic link:

1. Find their UIDs in Firebase Console → Authentication → Users.
2. In RTDB Console, set:
   ```
   /admin/<robert-uid>  = { "role": "admin" }
   /admin/<nassim-uid>  = { "role": "admin" }
   ```
3. Seed the allowlist for both admins before they attempt sign-in:
   ```
   /allowlist/<sha256("rchalanc@gmail.com")>   = { "name": "Robert", "email": "rchalanc@gmail.com", "party_size": 1 }
   /allowlist/<sha256("nassim.rowhani@icloud.com")> = { "name": "Nassim", "email": "nassim.rowhani@icloud.com", "party_size": 1 }
   ```
   SHA-256 values can be computed at e.g. https://emn178.github.io/online-tools/sha256.html
   (lowercase the email before hashing).

## Firebase project

- Project ID: `wal-nassims-folly`
- Region: us-west1 (specified in SPEC.md, but RTDB deployed to us-central1
  — Firebase RTDB US does not offer us-west1. Documented in change_log
  2026-05-04. No code change needed; databaseURL targets us-central1 already.)
- Database: Realtime Database
- Auth: Email/Password with Email link toggle ON; password-based sign-in OFF

## Local development

To test locally:
1. Change `LIVE_URL` in `index.html` to `http://localhost:PORT/`.
2. Add `localhost` to Firebase Console → Authentication → Authorized domains.
3. Revert before committing.

## Phase map

- **Phase 1 (done):** Skeleton + auth. Signed-in users see a placeholder screen.
- **Phase 2 (done):** RSVP flow + voyage page skeleton + admin dashboard. Custom domain Phase 2.G (follyintenerife.com) and custom email sender Phase 2.H (noreply@follyintenerife.com) complete.
- **Phase 3 (in progress):** Content — fun facts seed (~50 entries), diary seeding (J.D.M. voice + Gnatalee McCringleberry, Keeper of the Sanity), admin compose UI.
- **Phase 4:** Activities, property gallery.
- **Phase 5:** T-minus-7 mode, post-trip memories mode, admin export.
