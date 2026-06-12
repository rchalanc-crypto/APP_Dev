// ─────────────────────────────────────────────────────────────────────────────
// weather-ensemble.js — Open-Meteo multi-model ensemble fetch + confidence
//
// REFERENCE PATTERN, NOT A LIVE MODULE. Both consuming apps are single-file
// HTML; copy this block into the app's <script> and tune the constants.
// Do not import this file at runtime.
//
// Used by:
//   - apps/nassims-folly  (Tenerife kite widget — trade-wind regime)
//   - apps/ride-tracker   (Squamish/Coquitlam cards + activity ranker —
//                          thermal regime; adds gradient logic on top)
//
// Per repo convention (root CLAUDE.md), divergence between apps lives ONLY in
// the constants block. The fetch/cache/median/spread logic below is identical
// in both apps. If you fix a bug here, port it to both copies and update this
// reference.
//
// API notes (verified 2026-06-12):
//   - Open-Meteo is free, keyless, CORS-open (access-control-allow-origin: *).
//   - wind_speed_unit must be "kn" — "knots" is rejected with HTTP 400.
//     (This was the original folly widget bug; see commit 3e0ce43.)
//   - With &models=a,b,c every requested variable comes back suffixed per
//     model: hourly.wind_speed_10m_gfs_seamless, etc.
//   - A model with no coverage at the point returns null-filled arrays —
//     filter before computing stats.
// ─────────────────────────────────────────────────────────────────────────────

// ── Constants block — the ONLY part that should differ between apps ─────────
const WX_ENS = {
  // Multi-model set. "seamless" variants let Open-Meteo pick the best
  // resolution member of each family for the location.
  MODELS: ['gfs_seamless', 'ecmwf_ifs025', 'icon_seamless', 'gem_seamless'],
  CACHE_TTL_MS: 2 * 60 * 60 * 1000,   // 2 hours
  FORECAST_DAYS: 4,                   // today + 3
  // Daily stats window, local hours [start, end). Squamish: thermal window
  // 11–17. Tenerife: trade winds peak early-to-mid afternoon; same default.
  WINDOW_START_H: 11,
  WINDOW_END_H: 17,
  // Confidence from model spread (max−min of per-model window medians, kn).
  SPREAD_HIGH_KN: 5,                  // spread < 5  → high confidence
  SPREAD_MODERATE_KN: 10              // spread < 10 → moderate; else disagree
};

// ── Fetch + cache ────────────────────────────────────────────────────────────
// Returns { hourly, asOf, fromCache }.
//   hourly: { time: [...iso strings...], models: { <model>: { speed: [], gusts: [], dir: [] } } }
//   asOf:   Date the data was fetched (cache age must be SHOWN in the UI —
//           render "as of HH:MM" next to the data, never serve stale silently).
async function fetchEnsembleWind(lat, lon, C = WX_ENS) {
  const cacheKey = `wxens_${lat}_${lon}_${C.MODELS.join('-')}`;
  const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
  if (cached && Date.now() - cached.ts < C.CACHE_TTL_MS) {
    return { ...cached.data, asOf: new Date(cached.ts), fromCache: true };
  }

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
    `&models=${C.MODELS.join(',')}` +
    `&wind_speed_unit=kn&timezone=auto&forecast_days=${C.FORECAST_DAYS}`
  );
  if (!res.ok) throw new Error(`Ensemble API ${res.status} for ${lat},${lon}`);
  const raw = await res.json();
  if (!raw.hourly || !raw.hourly.time) {
    throw new Error(`Ensemble API bad payload: ${JSON.stringify(raw).slice(0, 200)}`);
  }

  const models = {};
  for (const m of C.MODELS) {
    const speed = raw.hourly[`wind_speed_10m_${m}`];
    // Skip models with no coverage at this point (null-filled or absent).
    if (!speed || !speed.some(v => v != null)) continue;
    models[m] = {
      speed,
      gusts: raw.hourly[`wind_gusts_10m_${m}`] || [],
      dir:   raw.hourly[`wind_direction_10m_${m}`] || []
    };
  }
  const data = { hourly: { time: raw.hourly.time, models } };

  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  return { ...data, asOf: new Date(), fromCache: false };
}

// ── Stats helpers ────────────────────────────────────────────────────────────
function median(values) {
  const v = values.filter(x => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

// Per-day window stats across models.
//   dayIndex: 0 = today (API returns local-midnight-aligned hourly arrays).
// Method: for each model, take the MEDIAN of its in-window hours (sustained
// and gusts separately); then take the median of those per-model values.
// Spread = max − min of the per-model sustained medians.
// Returns { medianWind, medianGust, spreadKn, modelCount } or null if no data.
function windowStats(ens, dayIndex, C = WX_ENS) {
  const idx = [];
  ens.hourly.time.forEach((t, i) => {
    const h = parseInt(t.slice(11, 13), 10);
    const d = Math.floor(i / 24); // 24 hourly rows per local day
    if (d === dayIndex && h >= C.WINDOW_START_H && h < C.WINDOW_END_H) idx.push(i);
  });
  if (!idx.length) return null;

  const perModelWind = [], perModelGust = [];
  for (const m of Object.values(ens.hourly.models)) {
    const w = median(idx.map(i => m.speed[i]));
    const g = median(idx.map(i => m.gusts[i]));
    if (w != null) perModelWind.push(w);
    if (g != null) perModelGust.push(g);
  }
  if (!perModelWind.length) return null;

  return {
    medianWind: median(perModelWind),
    medianGust: median(perModelGust),
    spreadKn:   Math.max(...perModelWind) - Math.min(...perModelWind),
    modelCount: perModelWind.length
  };
}

// Confidence band from spread. label is plain UI copy — apps may reword
// (ride-tracker points "disagree" at its second-opinion embeds).
function confidenceBand(spreadKn, C = WX_ENS) {
  if (spreadKn < C.SPREAD_HIGH_KN)     return { band: 'high',     label: 'models agree' };
  if (spreadKn < C.SPREAD_MODERATE_KN) return { band: 'moderate', label: 'models mostly agree' };
  return { band: 'disagree', label: 'models disagree — low confidence' };
}

// ── Usage sketch ─────────────────────────────────────────────────────────────
// const ens   = await fetchEnsembleWind(spot.lat, spot.lon);
// const stats = windowStats(ens, 0);                  // today
// const conf  = stats && confidenceBand(stats.spreadKn);
// render(`${Math.round(stats.medianWind)} kn (gusts ${Math.round(stats.medianGust)})
//         · ${conf.label} · as of ${ens.asOf.getHours()}:${...}`);
//
// Failure handling: ALWAYS catch and render a visible error state in the
// card ("weather unavailable"); never leave a spinner/"Loading…" forever.
// The ensemble layer failing must not block anything else from rendering.
