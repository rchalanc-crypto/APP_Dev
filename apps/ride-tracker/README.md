# Ride Tracker

Real-time collaborative MTB / kite session tracker for Robert and Glenn.
Single-file HTML + vanilla JS + Firebase Realtime Database.

**Live URL:** https://follyintenerife.com/apps/ride-tracker/

**Fallback URL:** https://rchalanc-crypto.github.io/APP_Dev/apps/ride-tracker/

**Status:** v2 built 2026-06-12 per `SPEC-V2.md` — weather ensemble cards
(Squamish Spit + Coquitlam), activity ranker with thermal-gradient signal,
AM/PM/EVE availability slots, lazy second-opinion embeds (Windy/Windfinder)
and SWS link-outs. Relocated from repo root to `apps/ride-tracker/` in the
2026-06-12 Session 1 cutover (the bare domain now redirects to nassims-folly).

All tuning thresholds (kite/MTB wind bands, precip cap, thermal window,
gradient points/bands, model spread bands) live in one constants block at the
top of the `<script>` in `index.html`.

---

## Firebase

- Project: `bigwhinybabyteartracker` (Realtime Database, default instance)
- Auth: none — name-based login only, stored in localStorage. Private
  friends-only app; the security rules are the data gate.
- Data model:

```
/sessions/{pushId}            { type: mtb|kite, date, location, notes, user, timestamp }
/availability/{date}/{user}   { am: bool, pm: bool, eve: bool }  (removed when all off)
                              legacy v1 boolean true = all-day; converts to the
                              object shape on that user's first edit of that date
```

Weather (Open-Meteo 4-model ensemble, thermal gradient) is fetched client-side,
keyless, with a 2h localStorage cache — no backend. The fetch/ensemble logic is
a copy of `shared/snippets/weather-ensemble.js`; bug fixes must be ported back
to the snippet and to `apps/nassims-folly`.

## Database rules

Rules live in `database.rules.json` in this folder and deploy via CLI:

```bash
cd apps/ride-tracker
firebase deploy --only database
```

Console paste is for emergencies only and must be back-ported to
`database.rules.json` the same day (root `CLAUDE.md` policy). History note:
the app was dead May 31 – June 12 2026 because test-mode rules expired and
the replacement rules lived only in the Console.

## No-warranty disclaimer

_This is a personal project with no uptime guarantee. Data may be lost._
