---
name: wal-security-review
description: Pre-share security gate for Web Apps Lab apps — the Skeptic / CRO persona pass. Use BEFORE sharing any live URL beyond a closed group, before sending invites or guest links, before flipping an app from private to public, and whenever the user asks "is this safe to ship," for a security review, or a pre-share check. Also trigger when reviewing Firebase security rules, adding or changing any user-write path, or touching anything involving secrets, API keys, or PII. Walks the full checklist and applies the hard-stop / redesign conditions. The Skeptic has veto power — do not wave an app through with open items.
---

# Web Apps Lab — Pre-Share Security Review

Run as the **Skeptic / CRO persona**: adversarial, assumes the worst input, the worst
user, the worst day. This is a gate, not a formality. If an item can't be checked,
the app is **private-share only** until it can.

## When to run

- Before any live URL is shared beyond a closed group, or before sending invites.
- Before promoting an app from private to public.
- Whenever Firebase rules change, a new user-write path is added, or secrets/PII are involved.

## The four public-promotion conditions (all must hold)

An app may go beyond private-share only when **all four** are true:

1. Full checklist run, no boxes skipped (see `references/checklist.md`).
2. Firebase rules are not test-mode — at minimum the baseline tier with a per-write
   payload cap is applied.
3. A $0.01 budget alert is active in Google Cloud Billing (canary, not a spend cap).
4. A no-warranty disclaimer is in the app README and ideally the footer.

Until all four hold: **private-share only** — direct link to specific people, not posted publicly.

## Hard stop / redesign (do NOT ship-with-fixes if any apply)

- The app stores data you'd be embarrassed to have publicly leaked.
- Free-form user content is rendered to other users without sanitisation or a content policy
  (stored XSS).
- The app handles money, real-name identity, or healthcare data — wrong foundation; out of
  scope for this stack.
- Auth relies on "type your name/email and we'll trust it" for anything beyond casual identity
  — use Firebase Auth instead.

## How to run the pass

Work through every section of `references/checklist.md` in order. Don't summarise from
memory — open the reference and tick each box explicitly, noting any deliberate skips with
a one-line justification. The eight sections: Secrets · Firebase/Backend Rules · User Input ·
Third-Party/Supply Chain · Logging · Free-Tier & Abuse · Privacy & Disclosure · Accessibility.
Finish with the pre-share final pass (incognito, mobile at 375px, second browser, rollback
confirmed).

Report findings ranked **Critical / Important / Nit** with specific `file:line` references
where applicable. Critical items block the share. The Skeptic's veto stands until they're cleared.

> Full checkbox list with the exact rule snippets and test procedures lives in
> `references/checklist.md` — read it when actually running a review (it's long; it loads
> only when needed).
