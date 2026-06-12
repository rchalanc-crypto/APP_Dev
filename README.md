# Web Apps Lab

| App | Description | Live URL |
|---|---|---|
| [ride-tracker](apps/ride-tracker/) | Real-time collaborative MTB/kite session tracker | https://follyintenerife.com/apps/ride-tracker/ |
| [nassims-folly](apps/nassims-folly/) | Nassim's Folly with Roberto — private invite-only RSVP | https://follyintenerife.com/apps/nassims-folly/ |

The bare domain https://follyintenerife.com/ redirects to nassims-folly.
GitHub Pages fallback URLs: `https://rchalanc-crypto.github.io/APP_Dev/apps/<name>/`.

Each app is self-contained under `apps/<name>/` with its own README, CLAUDE.md,
and (where it has a backend) Firebase rules + CLI deploy config. Firebase rules
changes are commits + `firebase deploy --only database` from the app folder —
see the root `CLAUDE.md` security section.
