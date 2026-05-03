# Draft Deployment Runbook — Claude Code Prompt

> **Type:** One-time prompt (already executed 2026-05-03 era). Kept as a reference for how to draft a "hub" runbook that orchestrates sibling runbooks without duplicating them.
> **Target tool:** Claude Code, terminal, repo root.
> **Outcome when run:** `.claude/instructions/deployment.md` drafted from stub state, on a feature branch with a single commit and a PR.

## When to reuse this prompt

- You're drafting a new orchestrating document that sits above existing detailed runbooks
- You need a "hub" reference that links rather than duplicates
- The 800–1200 word ceiling and anti-duplication guardrail apply

## How to use

Run after the three sibling runbooks (`firebase-setup.md`, `github-pages-setup.md`, `security-checklist.md`) are filled. Paste the body below into Claude Code at the repo root.

---

## Prompt body

```text
You are working in the web-apps repo. With three of the four instruction
runbooks now filled, the last one — .claude/instructions/deployment.md —
needs to be drafted from its stub.

Before doing anything, discovery pass:

1. Read change_log.md to confirm latest state.
2. Read CLAUDE.md (root), specifically the Deployment section.
3. Read the three sibling runbooks now in .claude/instructions/:
     - firebase-setup.md
     - github-pages-setup.md
     - security-checklist.md
   These define the lower-level mechanics. deployment.md sits ABOVE them
   as the orchestrating runbook — it answers "how do I get an app live"
   end-to-end and points at the others for detail.
4. Read .claude/instructions/deployment.md (the stub) — capture any
   existing section headers.
5. STOP and report what you found, including:
     - Any overlap or conflict between the three filled runbooks and
       what deployment.md should cover
     - The current Pages source state (Pattern A vs B per
       github-pages-setup.md)
   Wait for my confirmation.

After I confirm, write deployment.md on a branch
`docs/draft-deployment-runbook`. Single commit. Conventional message:
`docs: draft deployment runbook`.

=============================================================================
CONTENT REQUIREMENTS
=============================================================================

deployment.md is the END-TO-END deployment runbook for this program. It
orchestrates; it does not duplicate. When a topic is owned by another
runbook, link to it and move on.

Sections, in order:

  1. Purpose and scope
     - One paragraph: this is the orchestrating runbook for getting
       a Web Apps Lab app from local working code to a live public URL.
     - Owners table (one column for topic, one for runbook) pointing to
       firebase-setup.md, github-pages-setup.md, security-checklist.md.

  2. Deployment targets — which to pick
     A short decision table:
       - GitHub Pages (default) — single-file HTML, no build step,
         no preview deploys needed
       - Netlify — build steps (Vite/React), PR preview deploys, form
         handling, light serverless
       - Cloudflare Pages — global edge, Workers for auth/rewrites
     One sentence each on when to pick. Default is GitHub Pages.

  3. The standard deploy flow — GitHub Pages, single-file app
     Numbered steps from "code ready in apps/<name>/" to "live URL
     confirmed":
       a) Pre-deploy checks: run the security-checklist.md pass; confirm
          Firebase rules tightened (link to firebase-setup.md §5);
          confirm no secrets in diff
       b) Commit on a feature branch; PR if change touches >3 files
       c) Merge to main
       d) Pages source check (link to github-pages-setup.md §1 for which
          pattern is active)
       e) Verify live URL within ~1 min of merge
       f) Update apps/<name>/README.md with live URL if first deploy
       g) Update root README.md app index if first deploy
       h) Append to docs/tooling-decisions.md

  4. The standard deploy flow — Netlify, build-step app
     Same numbered shape but for Netlify:
       a) Same pre-deploy checks
       b) First deploy only: Netlify dashboard → New site → connect repo;
          base directory = apps/<name>/; build command + publish dir per
          app's CLAUDE.md
       c) Subsequent deploys: push to main; Netlify auto-builds
       d) PR preview URL appears on the PR; verify before merge
       e) Verify production URL post-merge
       f) README updates same as above

  5. Promoting an app from preview/local to public
     What "going public" means: shared URL beyond a closed group. Trigger
     conditions:
       - Confirm Skeptic-persona pass complete (link to
         security-checklist.md)
       - Confirm Firebase rules are not test-mode if backend exists
       - Confirm budget alert active
       - Add a one-line "fun project, no warranty" disclaimer to README
         and ideally to the app footer
     Until all four conditions hold, the app is private-share only —
     direct link to specific people, not posted publicly.

  6. Rollback
     One paragraph + one code block. `git revert <sha> && git push origin
     main`. Pages republishes within ~1 min; Netlify rolls back via
     dashboard "Publish deploy" on a previous deploy. No GitHub Pages
     native UI for prior-version republish — git revert is the path.

  7. Disaster scenarios — quick reference
     Table with three columns: scenario | first action | followup.
     Rows:
       - Live app down (404 or blank) → check Pages/Netlify build status
         → if green, browser cache; if red, read build log
       - Firebase quota hit → check Google Cloud billing → tighten rules,
         consider Auth gate, see firebase-setup.md
       - Secret accidentally committed → rotate the secret immediately
         (do NOT just `git revert`; the secret is in history) →
         git filter-repo or BFG to scrub history → force-push → notify
         any service whose key leaked
       - Deploy succeeded but live URL serves old content → hard refresh
         first; if persists, check workflow ran on correct branch and
         Pages source is correct

  8. Multi-app coordination notes
     - The repo deploys as a single Pages site (or single Netlify project).
       All apps under apps/ share infrastructure.
     - Adding an app does NOT require new Pages config if Pattern B is
       active — workflow picks it up automatically.
     - Adding an app DOES require a root README app-index update.
     - Removing an app: rm -rf apps/<name>/; remove from root README;
       commit. Existing live URL will 404 — this is expected. Do not
       attempt a redirect for removed apps unless asked.

  9. What goes in this runbook vs. elsewhere
     Short reference list — three bullets:
       - Firebase config / rules / SDK details → firebase-setup.md
       - Pages workflow YAML / Pattern A vs B / cache busting →
         github-pages-setup.md
       - Pre-share checklist / abuse vectors / hard-stop patterns →
         security-checklist.md

Word count target: 800–1200 words. This is a hub document, not an
encyclopedia.

=============================================================================
GUARDRAILS
=============================================================================

- Do NOT duplicate content from the three sibling runbooks. Link to them.
- Do NOT change any file other than:
    .claude/instructions/deployment.md
    change_log.md
- Do NOT recommend changes to existing runbooks. If you find a real
  inconsistency between deployment.md and a sibling, flag it in your
  final report — do not silently fix.
- Append to change_log.md under a new dated heading:
    [YYYY-MM-DD] — Deployment Runbook Drafted
  with [DOCS] tag. Note: "all four .claude/instructions/ runbooks now
  filled; instruction layer complete." Move the open item from the
  2026-05-03 entry to closed by adding a "[CLOSED]" note inline.
- Push the branch and open a PR titled "docs: draft deployment runbook".
  PR body lists what was added and confirms the instruction layer is
  complete.

=============================================================================
WHEN DONE
=============================================================================

Report back with:
  - Branch name and PR link
  - Final word count
  - Any inconsistencies found between deployment.md and the three sibling
    runbooks (do not fix; just flag)
  - Confirmation that change_log.md reflects "instruction layer complete"
  - The four files now ready for upload to the Claude.ai Project per
    docs/PROGRAM_PLAN.md §3
```

---

## Pattern notes for future hub-runbook drafts

- **Anti-duplication guardrail is the most important constraint.** If the resulting doc creeps over the word ceiling, sibling content has bled in. Cut.
- **The "what goes here vs. elsewhere" section** at the bottom is doing work — it's the guard against future drift back into duplication.
- **Inconsistency-flagging not silent-fixing.** Hub docs are written after sibling docs are stable; if the hub disagrees with a sibling, that's a discussion for a human, not a unilateral fix.
- **Change-log entry closes the open item.** When the hub lands, the broader workstream (instruction layer) closes.
