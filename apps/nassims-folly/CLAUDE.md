# CLAUDE.md — nassims-folly

Inherits from root `CLAUDE.md`. Overrides and app-specific notes below.

## Auth model

Firebase Email Link (passwordless) — no password sign-in, no anonymous auth.
The name-based login from the static-firebase template has been replaced entirely.

Two-step gate after sign-in:
1. `/allowlist/{sha256(email)}` must exist — if not, user is signed out and shown a rejection screen.
2. `/invitees/{uid}` is provisioned on first sign-in with data from the allowlist entry.

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
- Region: `us-west1`
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
- **Phase 3 (next):** Content — fun facts seed (~50 entries), diary seeding (J.D.M. voice + Gnatalee McCringleberry, Keeper of the Sanity), admin compose UI.
- **Phase 4:** Activities, property gallery.
- **Phase 5:** T-minus-7 mode, post-trip memories mode, admin export.
