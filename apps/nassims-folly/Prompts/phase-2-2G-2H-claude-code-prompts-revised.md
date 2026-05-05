# Claude Code Prompts — Phase 2 (Build), 2.G (Domain), 2.H (Custom Sender)

> Revised 2026-05-05. Three prompts now, in execution order. Run each
> in a **separate Claude Code session** with fresh context.
>
> Domain: **follyintenerife.com** (already purchased at Cloudflare ✓).
> Firebase plan: **Blaze (pay-as-you-go)** ✓ — needed for the custom
> sender configuration in Phase 2.H.
>
> Order: 2 (build) → 2.G (URL cutover) → 2.H (sender cutover) → first invite.

---

## What Changed From Yesterday's Plan

| Item | Before | Now |
|---|---|---|
| Domain status | "buy tomorrow" | **Already bought** ✓ |
| Firebase plan | Spark (free) | **Blaze (pay-as-you-go)** ✓ |
| Custom email sender | Deferred (90+ min, complex) | **Phase 2.H** — Firebase's built-in custom domain feature, ~30–45 min |
| Total Phase 2 work | ~3 hours + first invite | ~3.5–4 hours + first invite |

The custom sender is simpler than yesterday's analysis suggested. Firebase has a built-in **Authentication → Templates → Customize domain** feature that lets you send auth emails from `noreply@follyintenerife.com` without any separate SMTP provider (no Brevo, no Resend, no SendGrid). You add a few DNS records at Cloudflare, verify in the Firebase Console, done.

---

## Prompt 1 — Phase 2 Build

**No change from yesterday.** Build runs against the existing github.io URL; domain and sender cutovers happen in 2.G and 2.H separately.

**When to run:** After Phase 1 acceptance is fully passed. Both admins have signed in, both have `/admin/{uid}` records in RTDB, all three live URLs work.

**Expected duration:** 2–3 hours of Claude Code time. Single session.

**Have ready before you start:**
- One throwaway email address for the Phase 2.F.9 acceptance test (signing in as a non-allowlisted user)
- DevTools open in a second browser window — needed for the manual write-attempt tests in §2.E

```
This is the Phase 2 build session for Nassim's Folly with Roberto: RSVP
screen, voyage page skeleton, admin dashboard, and a Firebase rules
update. The full spec is at /apps/nassims-folly/SPEC-PHASE-2.md
(approved 2026-05-04). Build directly from the spec.

The custom domain cutover (SPEC-PHASE-2.md §G) and custom email sender
(Phase 2.H) are OUT OF SCOPE for this session. We build and verify on
the existing github.io URL with the default firebaseapp.com sender first.
Separate sessions handle the domain and sender switches afterward.

REQUIRED READING before any code:
- /CLAUDE.md
- /apps/nassims-folly/CLAUDE.md
- /apps/nassims-folly/SPEC.md (Phase 1 context)
- /apps/nassims-folly/SPEC-PHASE-2.md (this is the build target)
- /apps/nassims-folly/index.html (current state — Phase 1 ships an
  auth-and-allowlist shell)
- /apps/nassims-folly/firebase-rules.json (current rules; we update
  in §2.D)
- /change_log.md
- /.claude/instructions/security-checklist.md (referenced in §2.E)

Drive interactively with checkpoints. There are five build phases (§A
through §E) plus an acceptance phase (§F). After each, summarise what
you did and wait for "done" before proceeding.

If anything in the spec contradicts what's actually in the codebase,
STOP and ASK. Do not guess at the data model or auth flow.

────────────────────────────────────────────────────────────────────────
PRE-FLIGHT — verify before writing any code

Report on these in 5 bullets, max one sentence each:

  a. Phase 1 state: does index.html currently route on auth state, and
     does it call the allowlist check after sign-in? Confirm the
     allowlist code lowercases email before SHA-256 hashing.
  b. Existing data model: what fields does /invitees/{uid} currently
     write on first sign-in?
  c. Rules file state: does /apps/nassims-folly/firebase-rules.json
     match SPEC.md §1.5 verbatim, or has it drifted?
  d. UI scaffold: is there existing CSS structure (design tokens,
     typography choices) we should match for Phase 2's three new surfaces?
  e. Confirm both admins have /admin/{uid} records in RTDB.

If any answer is "no" or "unsure," STOP. Do not start building on a
shaky Phase 1 foundation.

────────────────────────────────────────────────────────────────────────
STEP A — RSVP SCREEN (SPEC §2.A)

State machine:
  - status === 'pending' → RSVP form
  - status === 'yes'      → voyage page (skeleton from §B)
  - status === 'no'       → decline confirmation

Implement per §2.A:
  - Greeting pulls name from /allowlist/{hash} after sign-in
  - Two buttons (Yes / No), optional notes textarea (1024 char cap)
  - Submit handler: optimistic UI, write to /invitees/{uid}, revert on
    failure with a banner
  - Decline screen: warm copy + "changed my mind" link → resets pending
  - Both directions of "change my mind" must work

After this step:
  - Test as Robert: sign out, sign back in, click Yes, see voyage skeleton
  - Click "Change my RSVP", revert to pending
  - Test No path → decline screen → "changed my mind" → revert to pending

Wait for "done" before Step B.

────────────────────────────────────────────────────────────────────────
STEP B — VOYAGE PAGE SKELETON (SPEC §2.B)

Six sections:
  1. Hero with countdown to 25 May 2027 00:00 Atlantic/Canary timezone
     (Intl.DateTimeFormat with explicit timeZone, NOT browser local).
     Tagline placeholder "The chronicler is at sea."
  2. Property placeholder card
  3. Diary placeholder
  4. Activities placeholder
  5. Fun fact footer — hidden if /content/fun_facts is empty
  6. Footer chrome — disclaimer, change RSVP, sign out, admin link
     (admin link visible only to admins; check /admin/{uid} once at
     load, cache, don't re-query)

Countdown updates every 60 seconds, NOT per second.

After this step:
  - Robert with status=yes sees voyage page with live countdown
  - Days/hours/minutes correct
  - Admin link visible to Robert (admin), absent for non-admins
  - All placeholders render without console errors

Wait for "done" before Step C.

────────────────────────────────────────────────────────────────────────
STEP C — ADMIN DASHBOARD (SPEC §2.C)

Hash route #admin. Gate on /admin/{auth.uid} existence.

Tab 1 — RSVP Dashboard:
  - Counts bar (Yes / No / Pending / Total)
  - Table sorted by status then name
  - Click row to expand and see notes
  - Read-only

Tab 2 — Allowlist Management:
  - Table of current allowlist with Remove buttons
  - Paste-CSV textarea for bulk add
  - Preview button parses, validates, shows hash + flagged errors
  - Confirm commits valid rows
  - Hashing must use lowercase + trim, matching sign-in flow exactly

The /invitees collection read needs the rules update in Step D — do NOT
load the dashboard until Step D rules deploy.

After Step D, verify:
  - #admin shows both admin entries in RSVP table
  - Counts correct
  - Allowlist tab shows both admins
  - Add: paste "Test User, test@example.com, 1" → preview → confirm →
    appears in allowlist + RSVP dashboard as pending
  - Remove: click Remove on fake user → disappears from both

Wait for "done" before Step D.

────────────────────────────────────────────────────────────────────────
STEP D — RULES UPDATE (SPEC §2.D)

Update /apps/nassims-folly/firebase-rules.json to match spec §2.D verbatim.

Key changes:
  - /invitees collection-level read: admin only (was: not present)
  - /allowlist collection-level read: admin only (Phase 1 §1.5 hardening)
  - /allowlist/$emailHash per-hash read: any signed-in user

Deploy via Firebase CLI if available; RTDB Console paste otherwise.
Tell me which.

Sanity-check by reading rules back from the Console after deploy.

Verify the admin dashboard from Step C now loads correctly.

Wait for "done" before Step E.

────────────────────────────────────────────────────────────────────────
STEP E — SECURITY PASS (SPEC §2.E)

Six manual write-attempt tests in DevTools as a non-admin signed-in
user. ALL must reject:

  1. Write status: "maybe" to own invitee record
  2. Write to another user's invitee record (fake UID)
  3. Read /invitees as a collection
  4. Read /allowlist as a collection
  5. Read /content/diary while own status is pending
  6. Write to /admin/<own-uid>

Print the DevTools snippet for each. I run, report.

If any test SUCCEEDS where it should reject, STOP and fix rules.

Then:
  - grep /apps/nassims-folly/ for console.log of user data, hashes, tokens
  - Confirm $0.01 budget alert active in Google Cloud Billing
    (especially important now that we're on Blaze — set if not set)
  - Confirm /apps/nassims-folly/README.md has no-warranty disclaimer

Wait for "done" before §F.

────────────────────────────────────────────────────────────────────────
STEP F — ACCEPTANCE (SPEC §2.F)

Run the 13-item acceptance checklist. Print each, I verify, you mark.

The "first invite to test couple" item is OUT OF SCOPE. We send the
first invite AFTER Phases 2.G and 2.H, so the test couple receives an
invite from noreply@follyintenerife.com pointing at follyintenerife.com.

────────────────────────────────────────────────────────────────────────
CLOSING

Once acceptance passes:
  - Append to /change_log.md (today's date): "Phase 2 — Build: RSVP
    screen, voyage page skeleton, admin dashboard, rules tightened.
    Domain and sender cutovers deferred to Phases 2.G and 2.H."
  - Note any deviations from SPEC-PHASE-2.md
  - Tell me to paste Phase 2.G prompt in a fresh session

DO NOT in this session:
  - Touch the custom domain or sender (Phases 2.G, 2.H)
  - Send any real invites
  - Write diary entries, fun facts, activities (Phases 3–4)

Begin with required reading and the 5-bullet pre-flight report.
```

---

## Prompt 2 — Phase 2.G (Custom Domain URL Cutover)

**When to run:** After Phase 2 acceptance passes.

**Expected duration:** 30–45 min including DNS verification waits.

**Pre-work — browser, ~10 min plus DNS propagation:**

1. ✓ Domain `follyintenerife.com` already purchased at Cloudflare
2. **Configure DNS records at Cloudflare** for GitHub Pages:
   - Four `A` records at apex (`@`) pointing at GitHub Pages IPs (current IPs in GitHub's docs — verify before adding; they update occasionally)
   - **Set "Proxy status" to DNS only (gray cloud)** for these A records — orange-cloud proxying interferes with GitHub Pages cert provisioning
3. **Add CNAME file to repo root:** create `/CNAME` containing exactly `follyintenerife.com` (one line, no trailing whitespace), commit, push
4. **GitHub Pages settings:** Settings → Pages → Custom domain → enter `follyintenerife.com` → Save → wait for DNS check to pass (5–10 min) → tick "Enforce HTTPS" once available (5–60 min after DNS check)
5. **Firebase Auth authorized domains:** Console → Authentication → Settings → Authorized domains → **Add** `follyintenerife.com`. **Do not remove** the github.io domain (keep as fallback).

When `https://follyintenerife.com/apps/nassims-folly/` loads with a valid HTTPS cert, you're ready for the Claude Code session.

```
This is the Phase 2.G session: custom domain URL cutover for Nassim's
Folly with Roberto. Domain is follyintenerife.com. The custom email
sender (Phase 2.H) comes after this — only the URL is changing here.

REQUIRED READING:
- /apps/nassims-folly/SPEC-PHASE-2.md §G
- /.claude/instructions/github-pages-setup.md §4
- /apps/nassims-folly/index.html (find current actionCodeSettings.url)

Drive interactively. Three steps. Wait for "done" between each.

────────────────────────────────────────────────────────────────────────
PRE-FLIGHT — confirm browser work is done

Verify by visiting URLs and reporting:

  a. https://follyintenerife.com/apps/nassims-folly/ — loads?
  b. https://rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/ —
     still works as fallback?
  c. https://rchalanc-crypto.github.io/APP_Dev/ — still redirects to
     ride-tracker?
  d. HTTPS cert on follyintenerife.com valid (padlock visible)?

Then ask me to confirm:
  - Firebase authorized domains: follyintenerife.com added,
    rchalanc-crypto.github.io still listed (both present)

If any pre-flight fails, STOP. DNS and Firebase Console work are my
problems, not yours.

────────────────────────────────────────────────────────────────────────
STEP 1 — UPDATE actionCodeSettings.url

Find current value in /apps/nassims-folly/index.html:

  url: 'https://rchalanc-crypto.github.io/APP_Dev/apps/nassims-folly/'

Change to:

  url: 'https://follyintenerife.com/apps/nassims-folly/'

After:
  - grep file for remaining github.io references in auth/routing logic
  - git status: only index.html changed
  - Commit: "nassims-folly: switch actionCodeSettings.url to follyintenerife.com"
  - Push

Wait for workflow green. Print Actions URL.

Wait for "done" before Step 2.

────────────────────────────────────────────────────────────────────────
STEP 2 — END-TO-END VERIFICATION

Guide me through, in fresh incognito:

  a. Navigate to https://follyintenerife.com/apps/nassims-folly/
  b. Sign out if cached
  c. Enter rchalanc@gmail.com, request magic link
  d. Open the email. BEFORE CLICKING — hover the link, report URL
       - Expected: https://follyintenerife.com/apps/nassims-folly/?...
       - github.io URL = code change didn't deploy

  Note: in this Phase 2.G test, the email sender is still
  noreply@<project>.firebaseapp.com — we'll change that in Phase 2.H.
  Do not flag the sender as a problem here.

  e. Click link → lands on follyintenerife.com, sign in succeeds,
     voyage page loads.

If (e) fails with "domain not authorized" → Firebase authorized
domains missing follyintenerife.com. I add it.

Wait for "done" before Step 3.

────────────────────────────────────────────────────────────────────────
STEP 3 — README UPDATES AND CLOSING

  a. /apps/nassims-folly/README.md: live URL → https://follyintenerife.com/apps/nassims-folly/
  b. Root /README.md app index: same update for nassims-folly row
  c. Commit + push: "docs: update live URL to follyintenerife.com"

Append to /change_log.md: "Phase 2.G — URL cutover: follyintenerife.com
live, actionCodeSettings.url updated, Firebase authorized domains
updated. github.io retained as fallback. Email sender still default
firebaseapp.com — addressed in Phase 2.H."

Print final summary:
  - Custom domain: live, HTTPS, valid cert
  - Magic link URLs point at follyintenerife.com
  - Sender still noreply@<project>.firebaseapp.com (Phase 2.H)
  - Sign-in works end-to-end on the new domain
  - github.io URL: still functional
  - ride-tracker URL: untouched

Tell me to paste Phase 2.H prompt in a fresh session.

DO NOT in this session:
  - Touch email sender configuration (Phase 2.H)
  - Send invites
  - Modify Firebase Console settings beyond what I do in pre-flight

Begin with pre-flight check.
```

---

## Prompt 3 — Phase 2.H (Custom Email Sender)

**When to run:** After Phase 2.G acceptance. Before the first invite.

**Expected duration:** ~45 min including DNS propagation wait. The Claude Code session itself is short — most work is browser-side at Firebase Console and Cloudflare DNS panel.

**This phase is mostly a runbook, not a Claude Code session.** Firebase's built-in custom domain feature handles SPF/DKIM automatically — you don't need a separate SMTP provider. The Claude Code session at the end is just verification + documentation.

### Pre-work runbook (browser, ~30 min plus propagation wait)

#### H.1 — Initiate custom domain in Firebase Console

1. Firebase Console → Authentication → **Templates** tab
2. Click any email template (e.g., "Email address verification") to edit it. The "from" address customization applies across all auth email templates, so it doesn't matter which one you start in.
3. Click **Customize domain** (button or link near the From address field)
4. Enter `follyintenerife.com` and proceed
5. Firebase displays a table of DNS records to add. Typically:
   - **1× TXT** record at apex (`@`) — domain ownership verification (looks like `firebase=...`)
   - **1× TXT** record at apex (`@`) — SPF (looks like `v=spf1 include:_spf.firebasemail.com ~all` or similar). **If you already have an SPF record, you must merge — only one SPF record per domain is allowed.** Robert: you don't have one because you haven't set up email on this domain before.
   - **2× CNAME** records at subdomains like `firebase1._domainkey.follyintenerife.com` and `firebase2._domainkey.follyintenerife.com` — DKIM
   - Possibly a DMARC TXT record at `_dmarc.follyintenerife.com`

   The exact records vary. **Trust what Firebase shows you** rather than what's in this runbook.

6. **Leave the Firebase Console tab open** — you'll come back to verify after DNS propagates.

#### H.2 — Add DNS records at Cloudflare

1. Cloudflare dashboard → `follyintenerife.com` → **DNS** → **Records**
2. For each record from Firebase Console, click **Add record**:
   - Match Type, Name, and Content/Target exactly
   - **Proxy status: DNS only (gray cloud) for ALL these records.** Orange-cloud proxying breaks email auth — Cloudflare can't proxy SPF/DKIM/TXT records meaningfully and CNAME proxying mangles DKIM signatures.
   - TTL: Auto is fine
3. Save each record.

**Verify via terminal (optional but useful):**
```bash
dig TXT follyintenerife.com +short              # should show SPF + verification
dig CNAME firebase1._domainkey.follyintenerife.com +short
dig CNAME firebase2._domainkey.follyintenerife.com +short
```

If `dig` shows the values you added, propagation is done locally. Cross-check with `whatsmydns.net` to see global propagation.

#### H.3 — Verify domain in Firebase Console

1. Back in the Firebase Console tab from H.1, click **Verify** (or refresh the table — Firebase re-checks DNS automatically every few minutes)
2. Wait until all records show ✓ Verified. **This can take 5 minutes or 4 hours.** If you've waited an hour and records still aren't verified, double-check that:
   - DNS records at Cloudflare match Firebase's table exactly (no extra spaces, no quote marks where they shouldn't be)
   - Cloudflare proxy is OFF (gray cloud) for all four records
   - You added them at the right zone (`follyintenerife.com`, not a different domain)

#### H.4 — Customize the From address and From name

Once domain is verified:

1. Firebase Console → Authentication → Templates
2. Click **Email link sign-in** (or whichever template — applies to all)
3. Edit:
   - **From name:** "Nassim's Folly with Roberto" (this shows in the email client's sender display alongside the email address)
   - **From address:** `noreply@follyintenerife.com` (or `hello@follyintenerife.com` — your call. `noreply@` is conventional but `hello@` reads warmer for a friends-only event)
   - **Reply-to:** your real email (`rchalanc@gmail.com`) — so if a guest hits Reply with a question, it reaches you, not a void
4. **Edit the email body** while you're here. The default Firebase email link template is bland. Suggested replacement (J.D.M. voice, brief):

```
Hello,

You've been invited to take part in something a bit absurd. Click below
to confirm you exist:

[%LINK%]

— J.D.M., chronicler
   on behalf of Robert and Nassim

(If you didn't request this, ignore. The link expires in an hour.)
```

The `%LINK%` placeholder is Firebase's syntax — it gets replaced with the actual magic link.

5. Save.

### Then run this Claude Code prompt for verification + docs

```
This is the Phase 2.H verification session: confirm the custom email
sender configuration works end-to-end and update documentation.

REQUIRED READING:
- /apps/nassims-folly/SPEC-PHASE-2.md (full spec for context)
- /change_log.md (audit log pattern)

I have already done all the browser work:
  - Added DNS records at Cloudflare (TXT + CNAMEs for SPF/DKIM)
  - Verified the domain in Firebase Console
  - Customized From name, From address, Reply-to, and email body

Drive interactively. Two steps.

────────────────────────────────────────────────────────────────────────
STEP 1 — END-TO-END VERIFICATION

Guide me through in a fresh incognito window:

  a. Navigate to https://follyintenerife.com/apps/nassims-folly/
  b. Sign out if cached
  c. Enter rchalanc@gmail.com, request magic link
  d. Open the email. Verify ALL of:
       - Sender display name: "Nassim's Folly with Roberto" (or whatever
         I set as From name)
       - Sender address: noreply@follyintenerife.com (or hello@,
         whatever I configured)
       - Reply-to: rchalanc@gmail.com (verify by clicking Reply in the
         email client and checking the To: field — should be my real
         address, not noreply@...)
       - Magic link in body points at follyintenerife.com
       - Email body has the customized J.D.M. copy, not the default
         Firebase template
  e. Click link → sign-in succeeds, voyage page loads

If sender shows as noreply@<project>.firebaseapp.com:
  - Domain verification not complete in Firebase Console. Check H.3.

If email body is the default Firebase template ("Click the link below
to sign in..."):
  - Template wasn't saved. I go back to H.4 and re-save.

If email goes to spam:
  - Note it but don't panic. Most likely SPF/DKIM are still propagating.
    Wait an hour, send another, retest.

Wait for "done" before Step 2.

────────────────────────────────────────────────────────────────────────
STEP 2 — DOCS + CHANGE LOG

  a. Update /apps/nassims-folly/README.md:
     - Add note under "Setup" or similar: "Auth emails sent from
       noreply@follyintenerife.com via Firebase Auth's built-in
       custom domain configuration. SPF/DKIM records configured at
       Cloudflare DNS."
     - Update any references to firebaseapp.com sender if they exist

  b. Append to /change_log.md (today's date): "Phase 2.H — Custom email
     sender: configured Firebase Auth custom domain for follyintenerife.com.
     Auth emails now send from noreply@follyintenerife.com (was:
     noreply@<project>.firebaseapp.com). Custom email body in J.D.M.
     voice. Required Blaze plan upgrade (already done) and DNS records
     at Cloudflare (TXT for SPF + verification, 2× CNAME for DKIM)."

  c. Commit + push: "docs: document custom email sender configuration"

Print final summary:
  - Domain: follyintenerife.com ✓
  - Sender: noreply@follyintenerife.com (or whatever I configured)
  - Email body: customized in J.D.M. voice
  - SPF/DKIM: configured and verified
  - Reply-to: rchalanc@gmail.com routes to my inbox

Tell me what's next: send the first invite to a test couple. The
invite should NO LONGER need to frame the firebaseapp.com sender
(that was yesterday's plan with the default sender). New invite
copy can be much cleaner since the sender is now follyintenerife.com.

DO NOT in this session:
  - Send invites
  - Modify Firebase Console (browser work I do)
  - Touch other apps

Begin with Step 1 verification.
```

---

## Updated invite email copy (for after Phase 2.H)

Yesterday's framing was *"You'll get a link from `noreply@firebaseapp.com` — that's our system, not spam."*

After Phase 2.H, the sender is `noreply@follyintenerife.com` and you don't need that disclaimer. Cleaner version:

> Hello,
>
> Robert is turning 60. Robert and Nassim are turning 25 years married. We're taking over a place in Tenerife from late May to early June 2027 and we want you in it.
>
> Click below to RSVP privately. Only Robert and Nassim see who said yes.
>
> **https://follyintenerife.com/apps/nassims-folly/**
>
> You'll be asked for your email and sent a one-click magic link from `noreply@follyintenerife.com` — that's how we keep the guest list private.
>
> If anything's broken, text Robert.
>
> J.D.M. (the chronicler) sends his regards. He has been at sea for some time and apologises for any inconvenience.

The "noreply@follyintenerife.com" mention is now framing convenience (telling people what to look for), not anti-spam disclaimer. Reads completely different.

---

## Why Three Sessions, Not Two or One

Three independent failure surfaces:

- **Phase 2 build:** code bugs in the app
- **Phase 2.G:** DNS, GitHub Pages settings, Firebase authorized domains — URL plumbing
- **Phase 2.H:** SPF/DKIM, Firebase custom domain feature, email template config — sender plumbing

Mixing any two means a failure could be in either system, and you waste time bisecting. Separate sessions = clean diagnosis when something inevitably hiccups.

DNS work in 2.H is also async (propagation wait) — keeping it isolated lets you do other things during the wait without abandoning a Claude Code session mid-flight.

## Three things worth knowing before you start

**1. Cloudflare proxy must be OFF for all email-related DNS records.** This is the #1 thing that goes wrong with custom email senders behind Cloudflare. Orange cloud breaks SPF/DKIM. Gray cloud (DNS only) is correct. The runbook flags this in H.2 but I'm flagging it again because it costs an hour to debug if missed.

**2. Don't add a competing SPF record.** Firebase will give you an SPF TXT record. **Only one SPF record is allowed per domain.** If you already have one (you don't, since this is a fresh domain), you'd need to merge them. For you: just add what Firebase gives you, no merge needed. But verify there's not an existing one before adding by running `dig TXT follyintenerife.com +short` first.

**3. Spam folder on first send is normal.** New domains have no sending reputation. The first few magic-link emails may land in spam even with perfect SPF/DKIM. By the time you send the wider invite list (after the test couple confirms), reputation will have warmed up. Tell your test couple to check spam if the email doesn't appear within 2 minutes.

When all three phases are done and the test couple has successfully RSVP'd, ping me and I'll write the Phase 3 spec (diary feed + fun facts seeded into RTDB + admin compose UI). Content seed v2 is already written and waiting.
