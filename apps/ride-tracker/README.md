# Ride Tracker

Real-time collaborative MTB / kite session tracker for Robert and Glenn.
Single-file HTML + vanilla JS + Firebase Realtime Database.

**Live URL:** https://follyintenerife.com/apps/ride-tracker/

**Fallback URL:** https://rchalanc-crypto.github.io/APP_Dev/apps/ride-tracker/

**Status:** v1 live. Relocated from repo root to `apps/ride-tracker/` in the
2026-06-12 Session 1 cutover (the bare domain now redirects to nassims-folly).
v2 (weather ensemble, activity ranker, AM/PM/EVE availability) is specced in
`SPEC-V2.md`.

---

## Firebase

- Project: `bigwhinybabyteartracker` (Realtime Database, default instance)
- Auth: none — name-based login only, stored in localStorage. Private
  friends-only app; the security rules are the data gate.
- Data model:

```
/sessions/{pushId}            { type: mtb|kite, date, location, notes, user, timestamp }
/availability/{date}/{user}   true (toggled; removed when off)
```

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
