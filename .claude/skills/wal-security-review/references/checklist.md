# Security Checklist (full reference)

> Loaded on demand by the `wal-security-review` skill. Work top to bottom; leave no box
> unchecked. Note deliberate skips with a one-line justification. Ranks: Critical / Important / Nit.

## 1. Secrets

- [ ] No API keys, service account JSON, or `.env` files committed to the repo
- [ ] `.gitignore` covers `.env`, `.env.*`, and any credential files
- [ ] `.env.example` exists with placeholder values only
- [ ] Firebase client config (`apiKey`, `projectId`, etc.) acknowledged as public-safe — it
      identifies the project, does not authorize access; rules protect data
- [ ] Spot-check git history: `git log --all -p | grep -iE 'apikey|secret|password|token'`
      returns nothing sensitive

## 2. Firebase / Backend Rules

- [ ] Rules tightened from test mode (no bare `allow read, write: if true` with expiry)
- [ ] Payload size cap enforced in rules (e.g. `newData.val().length <= 1024`)
- [ ] Malformed write (wrong type / oversized field) is rejected — tested in the Firebase console
- [ ] Rapid writes (10 in 5s) don't crash the app or spike toward free-tier limits — tested
- [ ] Per-user data isolated where applicable (`$uid` paths or name-keyed paths scoped to identity)
- [ ] No `allow read, write: if true` in Firestore outside scaffolding/templates
- [ ] Auth gate considered: if free-form text or uploads are visible to other users, anonymous
      Firebase Auth is the minimum gate

## 3. User Input

- [ ] All text inputs have `maxlength` matching the rules-side cap
- [ ] Rules-side enforcement is the real gate; client-side length is UX only
- [ ] No `innerHTML` with unsanitised user content (use `textContent`)
- [ ] No `eval()`, `new Function()`, or `setTimeout(string)` with user-supplied strings
- [ ] File uploads (if any) enforce a type allowlist and size cap, client and rules
- [ ] URL params used in logic are validated before use, never reflected raw into the DOM

## 4. Third-Party / Supply Chain

- [ ] All CDN URLs pinned to explicit versions (e.g. `firebasejs/10.7.1`, not `latest`)
- [ ] No unfamiliar CDN domains (expected: gstatic.com, googleapis.com, fonts.googleapis.com,
      fonts.gstatic.com, and explicitly chosen packages)
- [ ] Analytics (if present) disclosed in README; no PII in event properties
- [ ] No copy-pasted script blocks from unknown sources

## 5. Logging and Observability

- [ ] No `console.log` of user data, Firebase config, or auth tokens in committed code
- [ ] No leftover debug `console.log` — grep: `grep -r 'console\.log' apps/`
- [ ] `console.error` calls are PII-free (error type/path, not user input)
- [ ] Analytics events contain no PII

## 6. Free-Tier Limits and Abuse

- [ ] $0.01 budget alert set in Google Cloud Billing
- [ ] Traffic estimate checked against ceilings with 10× headroom (RTDB: 10 GB/mo download,
      1 GB storage, 100 simultaneous connections)
- [ ] Per-user/per-IP rate limiting considered; if skipped, noted
- [ ] "500 visitors in one day" thought experiment done — no shared path corrupts state or spikes cost

## 7. Privacy and Disclosure

- [ ] No real user data seeded — synthetic only before any share
- [ ] README has a no-warranty / personal-use disclaimer
- [ ] App UI has a brief "what we store" note where applicable
- [ ] PII collection is minimal — only what the app needs
- [ ] A "delete my data" path exists, or its omission is explicitly noted

## 8. Accessibility (security-adjacent, non-negotiable minimums)

- [ ] Contrast passes WCAG AA (4.5:1 normal, 3:1 large)
- [ ] All interactive elements keyboard-reachable (Tab / Enter / Space)
- [ ] Visible focus ring (no bare `outline: none`)
- [ ] All inputs have associated `<label>` elements (placeholder ≠ label)
- [ ] Error messages exposed to screen readers (`role="alert"` / `aria-live`)

## 9. Pre-Share Final Pass

- [ ] Tested end-to-end in an incognito window
- [ ] Tested on real mobile or DevTools at 375px
- [ ] Tested in a second browser
- [ ] Rollback confirmed: `git revert <sha>` + push recovers the previous deploy

---

**Hard stop / redesign** (see SKILL.md): embarrassing-if-leaked data; unsanitised free-form
content shown to others; money/real-identity/healthcare data; "trust the typed name" auth.
The Skeptic has veto power.
