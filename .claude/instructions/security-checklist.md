# Security Checklist

> Run this as the Skeptic / CRO persona pass before sharing any live URL.
> Work through every section. Leave no box unchecked.

---

## 1. Secrets

- [ ] No API keys, service account JSON, or `.env` files committed to the repo
- [ ] `.gitignore` covers `.env`, `.env.*`, and any credential files
- [ ] `.env.example` exists with placeholder values only — no real values committed
- [ ] Firebase client config (`apiKey`, `projectId`, etc.) is acknowledged as public-safe: it identifies the project, not authorizes access; rules protect data
- [ ] Spot-check git history: `git log --all -p | grep -iE 'apikey|secret|password|token'` returns nothing sensitive

---

## 2. Firebase / Backend Rules

- [ ] Rules explicitly reviewed and tightened from test mode (`allow read, write: if true` with expiry window)
- [ ] Payload size cap enforced in rules (e.g. `newData.val().length <= 1024` on string fields)
- [ ] Attempted malformed write (wrong type, oversized field) is rejected by rules — tested manually in the Firebase console
- [ ] Rapid writes (10 in 5 seconds) do not crash the app or spike toward free-tier limits — tested manually
- [ ] Per-user data is isolated where applicable (`$uid` path segments or name-keyed paths scoped to the authenticated identity)
- [ ] No `allow read, write: if true` in Firestore outside of initial scaffolding or template files
- [ ] Auth gate considered: if the app accepts free-form text or file uploads visible to other users, anonymous Firebase Auth is wired in as a minimum gate

---

## 3. User Input

- [ ] All text inputs have `maxlength` attributes matching the rules-side cap
- [ ] Server/rules-side enforcement is the real gate — client-side length attributes are UX, not security
- [ ] No `innerHTML` assignment with unsanitized user content (XSS vector — use `textContent` instead)
- [ ] No `eval()`, `new Function()`, or `setTimeout(string)` with user-supplied strings
- [ ] File uploads (if any) enforce both a type allowlist and a size cap on the client and in rules
- [ ] URL parameters used in logic are validated before use and never reflected raw into the DOM

---

## 4. Third-Party / Supply Chain

- [ ] All CDN URLs pinned to explicit versions (e.g. `firebasejs/10.7.1`, not `latest` or an unversioned path)
- [ ] No unfamiliar CDN domains — expected domains are `gstatic.com`, `googleapis.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, and explicitly chosen packages
- [ ] Analytics (if present) disclosed in README; no PII sent in event properties or user-ID fields
- [ ] No copy-pasted script blocks from unknown sources without reading and understanding what they do

---

## 5. Logging and Observability

- [ ] No `console.log` of user data, Firebase config values, or auth tokens anywhere in committed code
- [ ] No leftover debug `console.log` calls — grep the source before shipping: `grep -r 'console\.log' apps/`
- [ ] Any `console.error` calls are PII-free (log the error type and code path, not the user's input)
- [ ] Analytics events (if any) contain no PII — no names, emails, or user-identifiable strings in event properties

---

## 6. Free-Tier Limits and Abuse

- [ ] Google Cloud billing budget alert set at $0.01 — see `firebase-setup.md §6` for steps
- [ ] Traffic estimate checked against free-tier ceilings with 10× headroom: RTDB 10 GB/mo download, 1 GB storage, 100 simultaneous connections
- [ ] Per-user or per-IP rate limiting considered — Firebase rules can enforce write frequency; if intentionally skipped, that decision is noted
- [ ] "500 visitors in one day" thought experiment completed — no single event or shared data path would corrupt state or spike costs

---

## 7. Privacy and Disclosure

- [ ] No real user data seeded in the database — use synthetic test data before sharing any URL
- [ ] README includes a no-warranty / personal-use disclaimer
- [ ] App UI has a brief "what we store" note where applicable (e.g. "Your name and session data are stored in Firebase Realtime Database")
- [ ] PII collection is minimal — only what the app needs to function
- [ ] A "delete my data" path exists, or the decision to omit it is explicit and noted in the README

---

## 8. Accessibility (Security-Adjacent)

These are non-negotiable minimums per `CLAUDE.md`, not optional polish.

- [ ] Color contrast passes WCAG AA: 4.5:1 for normal text, 3:1 for large text — check with browser DevTools or a contrast analyzer
- [ ] All interactive elements are reachable by keyboard (`Tab` to reach, `Enter`/`Space` to activate)
- [ ] Focus ring is visible on all focusable elements — `focus-visible` styles are in place, not suppressed with `outline: none` without a replacement
- [ ] All form inputs have associated `<label>` elements — placeholder text alone does not count
- [ ] Error messages are accessible to screen readers (`role="alert"` or `aria-live` region where applicable)

---

## 9. Pre-Share Final Pass

- [ ] Tested end-to-end in an incognito window (no cached state, no stored credentials, no autofill)
- [ ] Tested on a real mobile device or responsive DevTools at 375px width
- [ ] Tested in at least one browser besides your primary (Safari, Firefox, or Chrome — whichever you don't normally use)
- [ ] Rollback path confirmed: `git revert <sha>` + push recovers the previous deploy within ~1 minute

---

## Hard Stop / Redesign

Stop and redesign rather than ship-with-fixes if any of these apply:

- The app stores data you would be embarrassed to have publicly leaked
- Free-form user content is rendered to other users without moderation (stored XSS risk — needs sanitization or a content policy)
- The app handles money, real-name identity, or healthcare data — out of scope for fun apps; this stack is not the right foundation
- Authentication relies on "type your name/email and we'll trust it" for anything beyond casual identity — use Firebase Auth instead

---

**Skeptic persona has veto power.**
