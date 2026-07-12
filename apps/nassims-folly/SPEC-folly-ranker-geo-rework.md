# SPEC A (combined) — nassims-folly: Ranker Geo/Temporal Rework + El Médano Fidelity + Live Wind Embed

> Authored in Claude.ai. Lands at `apps/nassims-folly/SPEC-ranker-geo-rework.md`.
> **Supersedes the earlier Spec A draft** (this folds in El Médano model weighting, a bias hook,
> and a live wind embed — options 1/2/3 from the data-source review).
> Code changes: **`apps/nassims-folly/index.html` only**. Single-file, no build. Pattern B deploy.
> **Prerequisite for Spec B** (`SPEC-folly-activities-dynamic.md`, the Activities surfacing).
> Fresh Claude Code session. **One session, TWO commits** (see Step 4). **Checkpointed — wait for
> Robert's "done" at each gate.**

---

## Why (the flaw this fixes)

The Phase 4 ranker scores all 9 categories against **one weather point** (El Médano cached data).
Tenerife is close to the worst-case island for that: trade winds pile cloud and drizzle on the
north (Anaga, La Laguna) while Costa Adeje sits cloudless the same hour, and Teide at 2,000 m+ is a
third climate — cold, clear, sometimes snow. Golf on the south coast and a hike in Anaga the same
afternoon present completely differently; morning-vs-afternoon shifts are just as real (north
cloud builds through the day, El Médano's wind ramps in the afternoon, Teide is clearest at dawn).

**Plus El Médano specifically:** the spot blows harder than any coarse model says, because the NE
trades funnel and accelerate through the Granadilla gap. No *free* model resolves that — Open-Meteo's
1–2 km high-res models don't cover the Canaries; the best free option there is **ECMWF IFS at 9 km**,
still too coarse to see a sub-km acceleration zone. So El Médano gets two extra levers: weight its
central estimate to ECMWF, and a (default-neutral) local bias hook you calibrate later.

This rework scores **each activity at its own location, elevation, and time window**, rolls up to a
category verdict, sharpens El Médano, and gives guests a **live wind map** to get excited about.

---

## Locked decisions

| | |
|---|---|
| Fidelity | **Per-activity** location + elevation + window (not per-category zones) |
| Fetch cost | Per-activity coords **cluster** by grid cell + elevation band → ~6 real fetches, not ~15 |
| Ranker unit | Score **activities**; roll up to category (best/max) for the `#ranker` hero |
| Geo storage | **Code-side config** (`ACTIVITY_GEO`) in `index.html`. **No Firebase data or rules changes.** (A1 = override path.) |
| Weather-exempt | **food, culture** — no coords, never conditions-scored; float up on a garage day |
| Windows | Default per category type, per-activity override |
| Data source | **Open-Meteo** — keyless, CORS-open, elevation-aware hourly, already wired |
| El Médano central model | **ECMWF IFS (9 km)** as the central estimate for that cluster; **spread still from the full ensemble** (confidence signal preserved) |
| El Médano bias hook | Named constant, **default neutral (×1.0 / +0)**; calibrated later against a live reading. Never invent a non-neutral default. |
| Ensemble | 4-model, **Canary-appropriate set** — NOT the BC/Squamish GEM set from ride-tracker v2 (Step 0 confirms folly's current set; fix if it inherited GEM) |
| Live embed | El Médano **Windguru/Windfinder spot widget** in the kite widget — lazy-loaded, pinned domain, link-out fallback, **no hotlinking their data**. The *only* permitted widget edit. |
| Timezone | `timezone=Atlantic/Canary` on every fetch |
| AEMET | **Parked** (HARMONIE-AROME ~2.5 km is the real Canary high-res upgrade, but keyed → proxy job). Not in this build. |

**API cost note (revises the original capsule's "no new API calls"):** old ranker reused El Médano
for zero extra cost. New ranker: up to ~6 cluster fetches per 2h cache window, minus cache hits
(El Médano and any widget point are hits). Net new: a few fetches per 2h. The embed is an **iframe,
not a fetch** — no data pulled by us. Fine for keyless Open-Meteo; stated, not hidden.

---

## Architecture — three layers, kept separate

1. **Authored geo (per activity).** `ACTIVITY_GEO` maps each weather-sensitive activity →
   `{ lat, lon, elevation_m, window }`. Food/culture absent = exempt. Authored in Step 0.
2. **Fetch layer (clustered).** Cluster coords by `(rounded grid cell, elevation band)`; one
   ensemble fetch per cluster through the **existing** `fetchWeather` + 2h cache (keyed by lat/lon,
   so shared/widget points dedupe). Elevation band is non-negotiable — Teide must never be scored on
   coastal temps. Per-cluster **central model** (ECMWF for El Médano; ensemble median elsewhere).
3. **Scoring (per activity → roll-up).** Score each activity with its category's fn on its cluster's
   window-scoped data; apply the El Médano bias hook; category verdict = best activity; hero names
   the winner.

The live embed (Step 3) is a fourth, independent surface — presentation only, no data path.

---

## Scope boundaries (hard) — READ THE WIDGET EXCEPTION

**Do NOT touch:**
- The weather widgets' **fetch or scoring** (kite / paragliding / moustache). The ranker may
  *share* their cached points (additive, cache-hit), but must not change what a widget fetches or
  how it scores/renders its stats. **SURGICAL EXCEPTION:** the *only* permitted widget edit is
  adding the El Médano live-embed block per **Step 3** — nothing else in the widgets changes.
- Firebase rules or data. **No writes anywhere.**
- Scoring **functions'** internal math beyond accepting window-scoped, cluster-sourced input and the
  El Médano bias multiplier (and adding a fn for any category that only had a coarse heuristic —
  flag those in Step 0).

**Do touch:** the ranker's data-sourcing/unit and the `#ranker` render; the El Médano cluster's
model/bias; and the one embed block in the kite widget.

---

## Step 0 — Read the live activities list + author geo + confirm models (WAIT)

CC reads `/content/activities/` (25 records) and the current ranker/weather/widget code. **Report,
change nothing:**

1. **Activity records:** per record — stable id (push-ID + any slug), exact `name`, `category`,
   `order`, and whether it names a specific place ("Golf del Sur" vs "Golf"). Enumerate the 9
   `CATEGORIES` keys; mark weather-sensitive vs exempt.
2. **Current ranker:** scoring fn name(s) (Phase 4 `scoreCategory()`, plus widget
   `kiteScore/paraScore/moustScore`); the **score scale** (0–1 / 0–100 / points); where the ranked
   result is stored; which categories have a **real** scoring fn vs a coarse heuristic (flag those).
3. **Current fetch layer:** `fetchWeather` signature; the **Open-Meteo params + model set the folly
   widgets request now** (confirm `wind_speed_unit=kn` — `knots` was the HTTP-400 bug fixed in
   3e0ce43; do not reintroduce). **Confirm the ECMWF IFS model slug** and whether `best_match`
   already selects ECMWF for the Canaries. Whether a **marine/wave** endpoint is used and how; cache
   key shape + TTL.
4. **`#ranker` render:** the DOM it builds (hero + chips) and entry point.
5. **Kite widget structure:** where a live-embed block can be inserted **without disturbing** the
   fetch/scoring/stats render (the Step 3 insertion point). Report any existing `<details>`/collapse
   pattern to reuse.

**Then propose `ACTIVITY_GEO`** — per weather-sensitive activity: `lat, lon, elevation_m, window`
and its fetch **cluster**. Use the anchor palette; refine from what the records name. Table for
Robert to red-line.

**Anchor palette (approximate — confirm, not authoritative):**

| Cluster | Area | Elev band | Anchor lat, lon | Typical activities |
|---|---|---|---|---|
| South coast | Costa Adeje / Los Cristianos | sea (0–300 m) | 28.09, −16.74 | golf (Adeje/Américas), beach, kayak |
| El Médano | SE coast | sea | 28.0436, −16.5388 | kite / windsurf (Cabezo 28.0481,−16.5256 · La Tejita 28.0349,−16.5497 — same cell, one fetch) |
| SE golf | Golf del Sur / Amarilla | sea | 28.02, −16.61 | SE golf courses |
| Teide | caldera / summit | high (1200 m+) | 28.27, −16.63 (peak 28.2724,−16.6425 ~3715 m; Parador ~2100 m) | Teide hikes, cable car, stargazing |
| Anaga | NE massif | mid (300–1200 m) | 28.53, −16.23 (Cruz del Carmen ~900 m) | north hiking, laurisilva |
| Barranco del Infierno | Adeje ravine | mid (~350 m) | 28.11, −16.71 | south hiking |
| SW launches | Ifonche / Taucho | mid (~1000 m) | 28.15, −16.75 | paragliding / air |
| (inter-island) | Famara/Fuerteventura day-trips (if seeded) | — | own coords | air — cluster separately; flag distance |

The **hiking split** (Anaga N / Teide altitude / Barranco S) is deliberate: "is hiking good today"
becomes "the best available hike," surfacing which.

→ **WAIT.** Robert red-lines the geo table and confirms the ECMWF slug. Freeze before any code.

---

## Step 1 — Cluster fetch layer + per-cluster central model (WAIT)

1. **Constants block** atop the ranker section:
   ```js
   const GRID_ROUND = 0.1;            // ~11 km: coords rounded to this share a grid cell
   const ELEV_BANDS = [300, 1200];    // sea <300 ≤ mid <1200 ≤ high
   const RANK_MODELS = [/* Canary set from Step 0 — e.g. ecmwf, icon, gfs, meteofrance; NOT gem */];
   const RANK_WX_TZ  = "Atlantic/Canary";
   // Per-cluster central estimate: default = ensemble median; El Médano = ECMWF (best free Canary model)
   const CENTRAL_MODEL = { elmedano: "<ecmwf slug from Step 0>" };
   ```
2. **Clustering:** cluster key = `(round(lat,GRID_ROUND), round(lon,GRID_ROUND), band(elevation_m))`.
   ~15 activities → ~6 clusters.
3. **Fetch per cluster** through the **existing** `fetchWeather` + 2h cache. Pass authored
   `elevation` (critical for Teide/Anaga downscaling). Use `RANK_MODELS`, `wind_speed_unit=kn`,
   `timezone=RANK_WX_TZ`, small `forecast_days`. Widget/coincident points are cache hits.
4. **Central estimate per cluster:** ensemble median by default; for El Médano use `CENTRAL_MODEL`
   (ECMWF) as the central wind value. **Spread/confidence is still computed across the full ensemble
   for every cluster** — weighting the centre does not collapse the confidence signal.
5. **Fallback:** a failed cluster fetch → its activities unscored this cycle, ranker still renders
   from the rest. All fail → static `order`, no verdict, no crash (mirror existing fallback).

→ **WAIT.** Network tab: one fetch per cluster, El Médano a cache hit, elevation passed, ECMWF is
the El Médano central value, spread still ensemble-wide, no `knots`, widgets undisturbed.

---

## Step 2 — Per-activity scoring → El Médano bias → roll-up → render (WAIT)

1. **Window scoping:** score each activity only across its `window` hours (local). Defaults by
   category (kite=afternoon, north-hike=morning, Teide=dawn, golf/beach=morning–midday); per-activity
   override from `ACTIVITY_GEO`.
2. **El Médano bias hook** — add to the constants block:
   ```js
   const ELMEDANO_WIND_BIAS = { mult: 1.0, add: 0 }; // NEUTRAL default. Calibrate vs a live
   // El Médano reading (e.g. iKitesurf/Windguru) during testing/trip: acceleration zone tends to
   // exceed the 9 km model. Do NOT ship a non-neutral guess.
   ```
   Apply to the El Médano cluster's central wind **before** kite scoring. Neutral = no behaviour
   change until Robert tunes it.
3. **Score each activity** with its category fn on window-scoped cluster data. Reuse existing fns;
   add real fns for any heuristic-only category flagged in Step 0 (surface criteria — e.g. golf =
   low precip + moderate wind + comfortable temp).
4. **Roll up to category = best (max) activity** that day (you'd pick the good option; mean wrongly
   punishes a category for having a bad-today option). Record the **winning activity/zone**.
5. **`#ranker` render:** hero shows the top category **and names the winner** — "Hiking — good today,
   head north to Anaga" / "Golf — south coast's clear this morning." Chips below carry winning-zone
   hint + confidence. #1 must be internally consistent with the per-activity scores (Spec B reads
   these too).
6. **Garage day:** define a badness threshold (scale from Step 0). When every weather-sensitive
   category is below it, **food/culture** surface as the honest top. Exempt categories are never
   conditions-flagged and never weather-penalized.
7. **Safety:** rendered text is static config or already-escaped fields — no new unescaped user
   content into the DOM; reuse the app's escape path. No Firebase writes.

→ **WAIT.** On a live signed-in load: hero names a specific winning zone; hiking scores differ by
zone; golf/kite reflect their own coasts; windows visibly matter; El Médano bias constant is present
and neutral; simulated all-fail leaves the ranker gracefully static.

**→ COMMIT 1 here** (after Robert's done): the ranker rework + model weighting + bias hook.
`git add apps/nassims-folly/index.html` (never `-A`). Message e.g.
`folly: ranker geo+temporal rework (per-activity scoring, cluster fetch, El Médano ECMWF+bias)`.

---

## Step 3 — Live El Médano wind embed (kite widget) (WAIT)

The **only** permitted widget edit (see Scope). Presentation only — no data fetched by us.

1. Add a collapsible **live-wind block** to the kite widget (reuse the existing `<details>`/collapse
   pattern if Step 0 found one; else a simple expandable). Title e.g. "El Médano — live wind."
2. **Source:** a **Windguru or Windfinder El Médano spot widget** iframe (windsurf standard). Step 0
   confirms a clean embeddable URL; **if none exists, degrade to a link-out** button (new tab) — same
   posture ride-tracker used for SWS. Optionally add an **iKitesurf spot link-out** for guests who
   have the app.
3. **Embed hygiene (non-negotiable, from ride-tracker v2 §1):**
   - **Lazy-load** — inject the iframe only on first expand; it must **not block first paint**
     (verify in the network tab).
   - **Pin the domain**; no wildcard/unknown third-party origins.
   - Link-outs `target="_blank"` + `rel="noopener"`, new tab.
   - **No fetching or hotlinking of the source's data or imagery** — their feed, their bandwidth.
     Ask before any future non-embed use.
4. Do not alter the widget's Open-Meteo fetch, kite scoring, or stats render — the embed sits
   alongside them.

→ **WAIT.** Robert confirms the block expands, the map/widget renders, first paint is unaffected,
and the link-out opens in a new tab.

**→ COMMIT 2 here:** the embed only. `git add apps/nassims-folly/index.html`. Message e.g.
`folly: live El Médano wind embed in kite widget (lazy-loaded, link-out fallback)`.

Two commits on one file keep the embed's revert boundary separate from the ranker rework.

---

## Step 4 — Verify + close

- [ ] Each weather-sensitive activity scores against **its** cluster + window (not El Médano-for-all).
- [ ] Elevation bands hold: Teide/Anaga never scored on coastal temps (verify passed `elevation`).
- [ ] El Médano central value = ECMWF; **confidence spread still ensemble-wide**; bias constant
      present and **neutral**.
- [ ] Category verdict = best activity; hero **names the winning zone**; hiking split visible on a
      north/south-divergent day.
- [ ] food/culture exempt: never scored/flagged; surface on a garage day.
- [ ] Network tab: **one fetch per cluster (~6)**, El Médano/widget points cache-hit, no `knots`,
      `timezone=Atlantic/Canary`, elevation passed. Widgets' own fetches untouched.
- [ ] All-fail fallback → static `order`, no crash, no error surfaced.
- [ ] **Embed:** lazy-loads on expand, does **not** block first paint, renders (or link-out opens in
      new tab), domain pinned, no hotlinked data/imagery.
- [ ] No Firebase writes; no rules/data changed; widget fetch/scoring untouched (only the embed added).
- [ ] 375px pass on `#ranker` hero + chips **and** the embed block; one second-browser pass.
- [ ] **Two commits**, both path-scoped (`git add apps/nassims-folly/index.html`, never `-A`); push;
      **Actions green** after each (or after both).
- [ ] Verify **live, signed in** (yes-status / admin — `/content/*` is gated) after hard refresh.
- [ ] Pre-share **`wal-security-review`** touch: the new iframe is a third-party surface — confirm the
      supply-chain checklist items (pinned domain, lazy-load, new-tab link-outs, no hotlinking).
- [ ] `apps/nassims-folly/CHANGELOG.md` one-liner + `docs/tooling-decisions.md` entry
      (date · app · decision · tool). **Nothing to root `change_log.md`** — app-scoped. (Exception:
      if the Canary ensemble later gets extracted into `shared/snippets/weather-ensemble.js`, that
      extraction **is** a root `change_log` entry — flag it, don't do it silently or now.)

---

## Assumptions — override BEFORE running if any are wrong

- **A1 — Geo lives in code (`ACTIVITY_GEO`), not on the Firebase records.** Static reference data;
  single-file, zero-migration, one-commit-revert, clear of the rules-drift risk (May outage).
  *Override:* geo on the records adds a seed migration + `firebase-rules.json` shape check + **CLI
  deploy** (never Console paste) — a bigger, Firebase-touching build.
- **A2 — `ACTIVITY_GEO` keyed on the stablest id Step 0 finds.** Missing entry for a scored-category
  activity = Step-0 completeness failure (loud, at authoring). Runtime miss fails **safe** (exempt).
- **A3 — Roll-up = best (max) activity, winner surfaced.** Not mean, not category-level.
- **A4 — Windows default by category, per-activity override.** Say so now if you want explicit
  AM/PM/EVE bands instead of hour ranges.
- **A5 — Canary model set, not BC.** Reuse folly's current set if it's Canary-appropriate; if it
  inherited GEM from the shared snippet, that's a latent widget bug — flag in Step 0, fix here.
- **A6 — El Médano central = ECMWF, spread = full ensemble.** Weight the centre only; keep the
  confidence signal.
- **A7 — Bias default NEUTRAL.** Never a guessed multiplier. Calibrate later against a live reading.
- **A8 — Embed source TBD in Step 0** (Windguru/Windfinder preferred; link-out fallback if no clean
  embed). Live obs is a trip-time bonus, so an embed/link-out — not an integration — is the right
  weight for a 2027 anticipation site.
- **A9 — Two commits, one session.** Ranker rework, then embed. Say so if you'd rather one commit.
- **A10 — "All" = options 1/2/3. AEMET (option 4) stays parked.** Override if you want the AEMET
  high-res proxy in scope — that's a separate, larger, backend-touching build.

---

## Out of scope (park unless asked)

- **AEMET** HARMONIE-AROME 2.5 km via proxy (the real Canary high-res forecast; keyed → proxy).
  Revisit only if the 9 km ECMWF forecast feels off once you're calibrating. (Bonus if pursued:
  AEMET's Izaña observatory sharpens the Teide cluster.)
- Fetching/hotlinking iKitesurf, Windguru, Windfinder, or Windy **data** — embed/link-out only.
  (iKitesurf's usable network is North America; API is Tempest-owner-oriented + paid — not a feed
  for El Médano. Its value here is the eyeball view and manual bias calibration.)
- Poll-biasing the ranking (Spec B future-not-now).
- Extracting the Canary ensemble into `shared/snippets/weather-ensemble.js` — worthwhile later as its
  own root-`change_log` pass; not folded in silently.
- The Activities **grid** reorder + flag — that's **Spec B** (`SPEC-folly-activities-dynamic.md`),
  which now consumes per-activity scores. After this ships, Spec B needs one revision: sort the grid
  by **per-activity** score (a good hike floats above a bad hike even inside the hiking filter — the
  old category-level model couldn't express that) and flag off the same scores. Note it there; don't
  build it here.
