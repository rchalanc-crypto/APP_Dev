# Ride-Tracker v2 — Weather, Activity Ranker, Availability Slots [FINAL]

> Decisions locked 2026-06-12. Lands at `apps/ride-tracker/SPEC-V2.md`.
> PREREQUISITE SESSIONS: (1) housekeeping cutover (Session 1 of the Friday plan);
> (2) folly weather-widget debug + shared-pattern extraction (see §0).
> Build executes in Claude Code from here.

## Locked decisions

| | |
|---|---|
| Weather data | **Open-Meteo multi-model ensemble** (GFS, ECMWF, ICON, GEM) — free, keyless, CORS-open |
| Named kite sites | Not fetched (no free APIs / CORS). **Windy + Windfinder free embeds** as eyeball layer |
| Live local data | **Squamish Windsports Society link-out buttons** (no embed, no fetch): "Live wind → SWS" → `https://squamishwindsports.com/conditions/wind/` and "Spit webcam → SWS" → `https://squamishwindsports.com/conditions/webcams/`. Replaces the iKitesurf deep link (no simple URL available; SWS shows the same Spit sensor, no login). SWS data/imagery is never fetched or hotlinked — their feed, their bandwidth; ask SWS before any future embed. Webcam streams 11:00–19:00 daily. |
| Thermal gradient signal | **Computed from Open-Meteo** (no new API): interior temp − coastal temp = gradient driving the Spit's inflow. Default points: Pemberton (50.32, −122.80) vs Vancouver coast (49.29, −123.12) — starting defaults, tunable constants. Environment Canada GeoMet (api.weather.gc.ca) noted as the alternative source if the Open-Meteo gradient proves unfaithful; not built in v1. |
| Availability granularity | **AM / PM / EVE** × 14 days |
| Cross-app strategy | Weather fetch/cache/ensemble logic is **one shared pattern** used by both ride-tracker and nassims-folly (Tenerife kite weather). Reference copy at `shared/snippets/weather-ensemble.js`. |

## §0 Prerequisite — shared pattern comes from the folly debug session

The folly Phase 4 widgets (Open-Meteo, 2h cache, traffic-light) are live but returning
no data — suspected fetch/CORS. That session, run BEFORE this build:

1. Diagnose + fix the folly widget fetch.
2. Upgrade the fixed code to the 4-model ensemble + confidence logic defined in §2.
3. Extract to `shared/snippets/weather-ensemble.js` (annotated reference snippet,
   not a live module — both apps are single-file; copy in, per repo convention).
4. Folly keeps its spots (El Médano etc.); ride-tracker copies the same snippet with
   its own spots/thresholds. One pattern, two apps, divergence only in constants.

This build then COPIES the proven snippet. If this spec is executed before the folly
debug, stop and do that first — do not debug the same fetch twice in parallel.

## §1 Weather cards

- **Coquitlam (MTB context)**: Open-Meteo daily — temp hi/lo, precip probability +
  amount, conditions icon. Today + 3 days. Coordinates: 49.28, −122.79.
- **Squamish (kite context)**: Open-Meteo hourly wind — speed / gusts / direction —
  across the 4 models, for the Spit: 49.70, −123.155. Thermal window 11:00–17:00
  visually highlighted. Today + 3 days. One-line gradient readout per day:
  "Thermal gradient: 9°C — strong" (bands: strong ≥ 8°C / moderate 4–8°C / weak < 4°C,
  computed at the 14:00 forecast hour; named constants).
- Fetch layer: the shared snippet. 2h localStorage cache keyed by spot+model-set;
  cache surfaces "as of HH:MM" so stale data is visible, not silent.
- **Second-opinion section (collapsible, lazy-loaded on expand)**:
  - Windy embed (wind layer, centered on the Spit)
  - Windfinder widget (Squamish)
  - SWS link-out buttons: "Live wind → SWS" and "Spit webcam → SWS" (open in new
    tab; webcam note: "streams 11am–7pm")
  - Lazy-load is mandatory — iframes must not block first paint.

## §2 Activity Ranker — "Today's Call: MTB or Kite"

Per day, today + 3, computed from the ensemble:

- Median sustained wind + gusts across the 4 models within the 11:00–17:00 window.
- **KITE**: median ≥ 18 kn sustained in-window, day precip < 5 mm.
- **MTB**: median < 12 kn, day precip < 5 mm.
- **EITHER**: 12–18 kn band, dry.
- **NEITHER**: day precip ≥ 5 mm ("garage day" — copy may editorialize).
- **Confidence** from model spread in-window: < 5 kn spread = "high confidence";
  5–10 kn = "moderate"; ≥ 10 kn = "models disagree — check the second opinions."
- **Thermal signal** (replaces the static caveat): compute the day's gradient
  (interior − coastal at 14:00). If the call is EITHER or a marginal KITE-miss
  (median within 3 kn below threshold) AND gradient is strong (≥ 8°C) AND day is
  forecast dry → upgrade the day's tag to "KITE (thermal likely)" and say why:
  "gradient 9°C — models underpredict the Spit on days like this."
- If the gradient fetch fails, fall back to the static caveat on forecast-sunny
  days: "Squamish inflow often beats the models — marginal KITE days may deliver."
  Never let the gradient call block the ranker from rendering.
- All thresholds (18/12 kn, 5 mm, window hours, spread bands, gradient bands and
  points) are NAMED CONSTANTS in one block at the top of the script. Robert + Glenn
  tune after a few weeks of reality.

## §3 Availability time slots

- UI: next 14 days × three toggle chips (AM / PM / EVE) per user. Tap toggles own
  slots; everyone's chips visible per day. Thumbable at 375px — this is the primary
  mobile interaction, design it first.
- Data: `availability/{date}/{user}` = `{ am: bool, pm: bool, eve: bool }`.
- **Legacy tolerance**: existing boolean `true` renders as all-day (all three slots
  on); converts to object shape on that user's first edit of that date. No migration
  script.
- Rules (deploy via `firebase deploy --only database` from the repo file — Session 1's
  CLI path; no Console paste):

```json
"availability": {
  ".read": true,
  ".write": true,
  "$date": {
    "$user": {
      ".validate": "newData.isBoolean() || newData.hasChildren()",
      "am":  { ".validate": "newData.isBoolean()" },
      "pm":  { ".validate": "newData.isBoolean()" },
      "eve": { ".validate": "newData.isBoolean()" },
      "$other": { ".validate": false }
    }
  }
}
```

- 14-day forward cap enforced client-side (rules can't cheaply compare date-string
  keys to now; accepted tradeoff, documented here).

## §4 Folly backport (same session or immediate follow-up, small)

Tenerife kite weather adopts the identical ensemble + confidence display via the
shared snippet — spots stay El Médano / folly's Phase 4 set; thresholds may differ
(trade-wind regime, not thermal — drop the thermal caveat, keep the spread-based
confidence). One constants block per app is the only divergence.

## Acceptance

- [ ] Both cards render live data; cache persists within 2h and shows its timestamp
- [ ] Ranker outputs call + confidence for today + 3; constants block present
- [ ] Gradient readout renders per day; thermal upgrade fires only on EITHER/marginal
      + strong gradient + dry; ranker still renders if gradient fetch fails
- [ ] Embeds lazy-load; first paint unaffected (verify in DevTools network tab)
- [ ] SWS buttons open the wind and webcam pages in a new tab
- [ ] Slot chips write object shape; legacy booleans render all-day and convert on edit
- [ ] Rules deployed from repo file via CLI; malformed slot write rejected (test one)
- [ ] 375px pass; second browser pass
- [ ] Folly kite widget confirmed running the same snippet (backport done or ticketed)
- [ ] change_log + tooling-decisions entries

## Out of scope

- Fetching/scraping TheWeatherNetwork, iKitesurf, Windfinder, Windy APIs
- Fetching SWS wind data or hotlinking SWS webcam imagery (link-out only; ask SWS
  before any future embed)
- Credentials of any kind in client code (incl. iKitesurf session)
- Wind-alert notifications (needs backend; parked)
- Hourly availability granularity
