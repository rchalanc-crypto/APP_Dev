# Security Checklist

## Secrets

TODO: fill in — nothing in .env goes in the repo; .env.example shows shape only; Firebase client config is OK to commit, service account JSON is not.

## Firebase rules

TODO: fill in — review and tighten before any live URL is shared; "test mode" rules expire but still expose data during the window; required minimums per app type.

## User input limits

TODO: fill in — max 1 KB per write, max 10 writes/user/min via rules; validate string lengths client-side and enforce in rules.

## Logging

TODO: fill in — no console.log in committed code; console.error for genuine errors only; no PII in logs.

## Pre-share checklist

TODO: fill in — Skeptic-persona pass, rules reviewed, secrets audited, test data cleared, live URL confirmed.
