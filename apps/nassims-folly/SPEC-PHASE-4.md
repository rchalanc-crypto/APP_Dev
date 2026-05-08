# Nassim's Folly — Phase 4 Spec: Activities, Weather Widgets & Required Viewing

> Drafted 2026-05-08. Lands at `apps/nassims-folly/SPEC-PHASE-4.md`.
> Build executes in Claude Code after Phase 3.5 is fully closed.
> Phase 3.5 prerequisite: dark aesthetic, sticky nav, and Expedition Briefs all live.

---

## REQUIRED READING before any code

- `CLAUDE.md`
- `apps/nassims-folly/CLAUDE.md` (character canon, Captain irony rule)
- `apps/nassims-folly/SPEC-PHASE-3.5.md` (design tokens, CSS variables — Phase 4 inherits all of these)
- `apps/nassims-folly/index.html` (current state)
- `apps/nassims-folly/firebase-rules.json`

---

## Build Order

§A → §B → §C → §D → §E → §F → §G → §H

**§A** — Required Viewing (Watch section) — standalone, no API, quick win
**§B** — Activities section UI — data already seeded, no API
**§C** — Kite weather widget — Open-Meteo, shared fetch layer
**§D** — Paragliding conditions widget — extends shared fetch
**§E** — Moustache/parakite conditions widget — extends shared fetch
**§F** — Activity ranker widget — consumes cached weather data
**§G** — Seed 3 air activities + property placeholder logic
**§H** — Acceptance checklist + change_log entry

Drive interactively. Checkpoint after each section. Wait for "go" before proceeding.

---

## §A — Required Viewing (Watch Section)

Replaces the `<section id="watch">` placeholder.

### A.1 Video selection

| Slot | Subject | YouTube ID | J.D.M. caption | Keeper addendum |
|---|---|---|---|---|
| 1 | Steven Akkersdijk — King of the Air kite | **[ROBERT: insert video ID from @stevenakkersdijk]** | "The Chronicler has reviewed the literature on kite mastery. This is the literature." | "Wind: 35+ knots. The Chronicler has been advised not to attempt this." |
| 2 | Ken Block — Gymkhana Ten | `m_KBvP0_8Tc` | "The Chronicler has reviewed the literature on hill driving. This is also the literature." | "The verge incident has been omitted from the Chronicler's account. I have not omitted it." |
| 3 | Travis Pastrana — Gymkhana 2022 | `LXzPkkQirnM` | "A second opinion was sought on driving. The Keeper watched this one twice." | "Technique." |

**Note to Robert:** Before Claude Code builds §A, replace `[ROBERT: insert video ID from @stevenakkersdijk]` with the YouTube video ID of your preferred Akkersdijk video. Get the ID from the URL: `youtube.com/watch?v={ID}`.

### A.2 HTML structure

```html
<section id="watch" class="page-section">
  <div class="section-label">Required Viewing</div>
  <p style="color:var(--smoke); font-size:13px; margin-bottom:24px; letter-spacing:1px; text-transform:uppercase;">
    Pre-flight briefing materials. Watch before arrival.
  </p>
  <div class="video-grid" id="videoGrid"></div>
</section>
```

### A.3 Video grid CSS

```css
.video-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .video-grid { grid-template-columns: repeat(3, 1fr); }
}

.video-card {
  background: var(--charcoal);
  border-radius: 10px;
  overflow: hidden;
}

.video-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.video-embed iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
}

.video-caption {
  padding: 14px 16px;
}

.video-caption-jdm {
  font-family: var(--font-diary);
  font-style: italic;
  font-size: 14px;
  color: var(--parchment);
  line-height: 1.6;
  margin-bottom: 8px;
}

.video-caption-keeper {
  font-size: 12px;
  color: var(--smoke);
  border-top: 0.5px solid var(--iron);
  padding-top: 8px;
  margin-top: 8px;
}

.video-caption-keeper::before {
  content: "— Keeper: ";
  color: var(--neon);
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

### A.4 Render function

```javascript
const VIDEOS = [
  {
    id: '[AKKERSDIJK_VIDEO_ID]',
    jdm: "The Chronicler has reviewed the literature on kite mastery. This is the literature.",
    keeper: "Wind: 35+ knots. The Chronicler has been advised not to attempt this."
  },
  {
    id: 'm_KBvP0_8Tc',
    jdm: "The Chronicler has reviewed the literature on hill driving. This is also the literature.",
    keeper: "The verge incident has been omitted from the Chronicler's account. I have not omitted it."
  },
  {
    id: 'LXzPkkQirnM',
    jdm: "A second opinion was sought on driving. The Keeper watched this one twice.",
    keeper: "Technique."
  }
];

function renderRequiredViewing() {
  document.getElementById('videoGrid').innerHTML = VIDEOS.map(v => `
    <div class="video-card">
      <div class="video-embed">
        <iframe
          src="https://www.youtube.com/embed/${v.id}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          title="Required viewing">
        </iframe>
      </div>
      <div class="video-caption">
        <div class="video-caption-jdm">"${v.jdm}"</div>
        <div class="video-caption-keeper">${v.keeper}</div>
      </div>
    </div>
  `).join('');
}
```

Call `renderRequiredViewing()` once on voyage page init — no Firebase dependency.

---

## §B — Activities Section UI

Data is already seeded to `/content/activities/`. This section renders it.

### B.1 Section structure

```html
<section id="activities" class="page-section">
  <div class="section-label">What to Do</div>
  <div class="activity-filters" id="activityFilters"></div>
  <div class="activity-grid" id="activityGrid">
    <p style="color:var(--iron);">Loading activities…</p>
  </div>
</section>
```

### B.2 Category config

```javascript
const CATEGORIES = {
  all:     { label: 'All',     color: 'var(--smoke)' },
  wind:    { label: 'Wind',    color: 'var(--neon)' },
  air:     { label: 'Air',     color: 'var(--neon)' },
  water:   { label: 'Water',   color: 'var(--ocean)' },
  wheels:  { label: 'Wheels',  color: '#888' },
  feet:    { label: 'Feet',    color: 'var(--terracotta)' },
  motor:   { label: 'Motor',   color: 'var(--terracotta)' },
  food:    { label: 'Food',    color: '#888' },
  culture: { label: 'Culture', color: '#888' }
};
```

### B.3 CSS

```css
.activity-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.filter-btn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid var(--iron);
  background: transparent;
  color: var(--smoke);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active,
.filter-btn:hover {
  background: var(--charcoal);
  color: var(--parchment);
  border-color: var(--neon);
}

.activity-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 600px) {
  .activity-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 900px) {
  .activity-grid { grid-template-columns: repeat(3, 1fr); }
}

.activity-card {
  background: var(--charcoal);
  border-radius: 8px;
  padding: 16px;
  border-left: 3px solid var(--iron);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
}

.activity-card-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--parchment);
  margin-bottom: 8px;
}

.activity-card-desc {
  font-size: 13px;
  color: var(--smoke);
  line-height: 1.6;
}

.activity-card-verify {
  font-size: 11px;
  color: #C4A03E;
  margin-top: 8px;
  font-style: italic;
}
```

### B.4 Render function

```javascript
let allActivities = [];
let activeFilter  = 'all';

function initActivities() {
  const activitiesRef = ref(db, 'content/activities');
  onValue(activitiesRef, (snapshot) => {
    allActivities = [];
    snapshot.forEach(child => allActivities.push({ id: child.key, ...child.val() }));
    allActivities.sort((a, b) => (a.order || 0) - (b.order || 0));
    renderActivityFilters();
    renderActivities();
  }, { onlyOnce: true });
}

function renderActivityFilters() {
  const filters = document.getElementById('activityFilters');
  const cats = ['all', ...new Set(allActivities.map(a => a.category))];
  filters.innerHTML = cats.map(cat => {
    const cfg = CATEGORIES[cat] || { label: cat, color: 'var(--smoke)' };
    return `<button class="filter-btn ${cat === activeFilter ? 'active' : ''}"
      onclick="setFilter('${cat}')">${cfg.label}</button>`;
  }).join('');
}

function setFilter(cat) {
  activeFilter = cat;
  renderActivityFilters();
  renderActivities();
}

function renderActivities() {
  const grid = document.getElementById('activityGrid');
  const filtered = activeFilter === 'all'
    ? allActivities
    : allActivities.filter(a => a.category === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--iron);">No activities in this category.</p>';
    return;
  }

  grid.innerHTML = filtered.map(a => {
    const cfg  = CATEGORIES[a.category] || { color: 'var(--iron)' };
    const desc = a.description || '';
    // Split "verify locally" note from main description if present
    const verifyMatch = desc.match(/— verify[^.]+\./i);
    const cleanDesc   = verifyMatch ? desc.replace(verifyMatch[0], '').trim() : desc;
    const verifyNote  = verifyMatch ? verifyMatch[0] : '';

    return `
      <div class="activity-card" style="border-left-color: ${cfg.color}">
        <div class="activity-card-title">${a.title}</div>
        <div class="activity-card-desc">${cleanDesc}</div>
        ${verifyNote ? `<div class="activity-card-verify">⚠ ${verifyNote}</div>` : ''}
      </div>
    `;
  }).join('');
}
```

Call `initActivities()` on voyage page init.

---

## §C — Kite Weather Widget

### C.1 Shared weather fetch layer

All three weather widgets (kite, paragliding, Moustache) share a single fetch function with localStorage caching. Build this once here; §D and §E extend it.

```javascript
const WX_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

async function fetchWeather(lat, lon) {
  const cacheKey = `wx_${lat}_${lon}`;
  const cached   = JSON.parse(localStorage.getItem(cacheKey) || 'null');
  if (cached && Date.now() - cached.ts < WX_CACHE_TTL) return cached.data;

  const [wxRes, marineRes] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=wind_speed_10m,wind_direction_10m,weather_code,temperature_2m` +
      `&daily=weather_code,wind_speed_10m_max,precipitation_sum` +
      `&wind_speed_unit=knots&timezone=auto&forecast_days=7`),
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
      `&current=wave_height&daily=wave_height_max&timezone=auto&forecast_days=5`)
  ]);

  const wx     = await wxRes.json();
  const marine = await marineRes.json();
  const data   = { wx, marine };

  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  return data;
}

function windBearing(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function kiteScore(windKnots, precipMm) {
  if (precipMm > 0.5) return 'red';
  if (windKnots >= 15 && windKnots <= 33) return 'green';
  if (windKnots >= 10 && windKnots <= 40) return 'amber';
  return 'red';
}

const SCORE_LABELS = {
  kite:  { green: 'SEND IT', amber: 'MARGINAL', red: 'GROUND DAY' },
  para:  { green: 'FLY',     amber: 'MARGINAL', red: 'NO-FLY'     },
  moust: { green: 'SEND IT', amber: 'MARGINAL', red: 'GROUND DAY' }
};
```

### C.2 Kite spots

```javascript
const KITE_SPOTS = [
  { name: 'El Médano',       lat: 28.0436, lon: -16.5388 },
  { name: 'Cabezo',          lat: 28.0481, lon: -16.5256 },
  { name: 'Playa de la Tejita', lat: 28.0349, lon: -16.5497 }
];
```

### C.3 Section HTML

```html
<section id="conditions" class="page-section">
  <div class="section-label">Conditions</div>

  <div class="conditions-tabs">
    <button class="cond-tab active" onclick="switchCondTab('kite', this)">🪁 Kite</button>
    <button class="cond-tab" onclick="switchCondTab('para', this)">🪂 Paragliding</button>
    <button class="cond-tab" onclick="switchCondTab('moust', this)">🦅 Moustache</button>
  </div>

  <div id="condKite"  class="cond-panel active"></div>
  <div id="condPara"  class="cond-panel" style="display:none;"></div>
  <div id="condMoust" class="cond-panel" style="display:none;"></div>
</section>
```

```css
.conditions-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.cond-tab {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid var(--iron);
  background: transparent;
  color: var(--smoke);
  cursor: pointer;
  transition: all 0.2s;
}

.cond-tab.active,
.cond-tab:hover {
  background: var(--charcoal);
  color: var(--neon);
  border-color: var(--neon);
}

.wx-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 600px) { .wx-grid { grid-template-columns: repeat(3, 1fr); } }

.wx-card {
  background: var(--charcoal);
  border-radius: 10px;
  padding: 16px;
  position: relative;
}

.wx-score-bar {
  height: 3px;
  border-radius: 2px;
  margin-bottom: 12px;
}
.wx-score-bar.green  { background: var(--neon); }
.wx-score-bar.amber  { background: #C4A03E; }
.wx-score-bar.red    { background: #8B2020; }

.wx-spot-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--parchment);
  margin-bottom: 4px;
}

.wx-verdict {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.wx-verdict.green  { color: var(--neon); }
.wx-verdict.amber  { color: #C4A03E; }
.wx-verdict.red    { color: #8B2020; }

.wx-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--smoke);
}

.wx-stat-wind { color: var(--parchment); font-weight: 500; }

.wx-forecast {
  display: flex;
  gap: 4px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.wx-day {
  flex-shrink: 0;
  text-align: center;
  width: 36px;
}

.wx-day-label {
  font-size: 9px;
  color: var(--iron);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.wx-day-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 auto;
}
.wx-day-dot.green  { background: var(--neon); }
.wx-day-dot.amber  { background: #C4A03E; }
.wx-day-dot.red    { background: #555; }

.wx-day-val {
  font-size: 10px;
  color: var(--smoke);
  margin-top: 3px;
}

.wx-note {
  font-size: 11px;
  color: var(--iron);
  font-style: italic;
  margin-top: 10px;
}
```

### C.4 Kite render function

```javascript
async function initKiteWidget() {
  const panel = document.getElementById('condKite');
  panel.innerHTML = '<div class="wx-grid">' +
    KITE_SPOTS.map(s => `<div class="wx-card" id="kite_${s.name.replace(/\s/g,'_')}">
      <div class="wx-spot-name">${s.name}</div>
      <div style="color:var(--iron);font-size:12px;">Loading…</div>
    </div>`).join('') + '</div>';

  for (const spot of KITE_SPOTS) {
    try {
      const { wx, marine } = await fetchWeather(spot.lat, spot.lon);
      const wind  = Math.round(wx.current.wind_speed_10m);
      const dir   = windBearing(wx.current.wind_direction_10m);
      const wave  = marine.current?.wave_height?.toFixed(1) ?? '—';
      const precip = wx.daily.precipitation_sum[0] ?? 0;
      const score = kiteScore(wind, precip);
      const days  = wx.daily.time.slice(0, 7);
      const dayDots = days.map((d, i) => {
        const s = kiteScore(wx.daily.wind_speed_10m_max[i], wx.daily.precipitation_sum[i] ?? 0);
        const label = new Date(d).toLocaleDateString('en', { weekday: 'short' }).slice(0,2);
        return `<div class="wx-day">
          <div class="wx-day-label">${label}</div>
          <div class="wx-day-dot ${s}"></div>
          <div class="wx-day-val">${Math.round(wx.daily.wind_speed_10m_max[i])}kt</div>
        </div>`;
      }).join('');

      const card = document.getElementById(`kite_${spot.name.replace(/\s/g,'_')}`);
      card.innerHTML = `
        <div class="wx-score-bar ${score}"></div>
        <div class="wx-spot-name">${spot.name}</div>
        <div class="wx-verdict ${score}">${SCORE_LABELS.kite[score]}</div>
        <div class="wx-stats">
          <div class="wx-stat-wind">${wind} kt ${dir}</div>
          <div>Wave: ${wave}m</div>
        </div>
        <div class="wx-forecast">${dayDots}</div>
      `;
    } catch(e) {
      console.error('Kite wx failed for', spot.name, e);
    }
  }
}

function switchCondTab(type, btn) {
  document.querySelectorAll('.cond-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.cond-panel').forEach(p => p.style.display = 'none');
  btn.classList.add('active');
  document.getElementById('cond' + type.charAt(0).toUpperCase() + type.slice(1)).style.display = 'block';
}
```

---

## §D — Paragliding Conditions Widget

### D.1 Spots

```javascript
const PARA_SPOTS = [
  { name: 'Tenerife South',  lat: 28.044,  lon: -16.539, note: 'Tandem available. Thermal conditions.' },
  { name: 'Teide Area',      lat: 28.2723, lon: -16.6421, note: 'XC thermal flying. Cable car access.' },
  { name: 'Famara (Day Trip)', lat: 29.117, lon: -13.533,
    note: 'Lanzarote. Binter ~55min from TFS. Verify conditions before booking flight.' }
];
```

### D.2 Paragliding score function

```javascript
function paraScore(windKnots, weatherCode, precipMm) {
  // Convert knots to km/h for paragliding threshold
  const windKmh = windKnots * 1.852;
  if (precipMm > 0.1) return 'red';
  if (weatherCode >= 51) return 'red'; // rain or worse
  if (windKmh <= 20 && weatherCode <= 2) return 'green';
  if (windKmh <= 28 && weatherCode <= 45) return 'amber';
  return 'red';
}
```

### D.3 Render function

Same pattern as kite widget. Render into `#condPara`. Use `SCORE_LABELS.para` for verdicts. Include spot `note` as `.wx-note` at bottom of each card.

---

## §E — Moustache/Parakite Conditions Widget

### E.1 Spots

```javascript
const MOUST_SPOTS = [
  { name: 'Tenesar / Playa Teneza', lat: 29.017, lon: -13.550,
    note: 'Lanzarote. Lava cliff soaring. Binter ~55min from TFS/TFN.' },
  { name: 'Famara Ridge',    lat: 29.117, lon: -13.533,
    note: 'Lanzarote. 600ft cliffs. NNW–NW required. Same Binter flight.' },
  { name: 'Fuerteventura',   lat: 28.730, lon: -13.867,
    note: 'Corralejo dunes. Most forgiving Moustache terrain. Binter ~45min.' }
];
```

### E.2 Moustache score function

```javascript
function moustScore(windKnots, precipMm) {
  if (precipMm > 0.5) return 'red';
  if (windKnots >= 15 && windKnots <= 28) return 'green';
  if (windKnots >= 12 && windKnots <= 33) return 'amber';
  return 'red';
}
```

### E.3 Render function

Same pattern as kite widget. Render into `#condMoust`. Use `SCORE_LABELS.moust` for verdicts. Include Binter flight note from `MOUST_SPOTS[n].note` as `.wx-note`.

---

## §F — Activity Ranker Widget

The "Today's Call" section. Uses weather data already cached by §C for Tenerife (El Médano coordinates). No additional API calls.

### F.1 Category scoring rules

```javascript
function scoreCategory(cat, windKnots, weatherCode, precipMm, waveM) {
  switch(cat) {
    case 'wind':
      return kiteScore(windKnots, precipMm);
    case 'air':
      return paraScore(windKnots, weatherCode, precipMm);
    case 'water':
      if (precipMm > 2) return 'red';
      if (waveM > 2 || windKnots > 25) return 'amber';
      return 'green';
    case 'wheels':
      if (precipMm > 2) return 'amber';
      return 'green';
    case 'feet':
      if (precipMm > 2) return 'amber';
      if (weatherCode >= 51) return 'amber';
      return 'green';
    case 'motor':
      return 'green'; // always
    case 'food':
    case 'culture':
      // Score bumps on bad weather
      return (precipMm > 2 || weatherCode >= 51) ? 'green' : 'amber';
    default:
      return 'amber';
  }
}
```

### F.2 Section HTML

```html
<section id="ranker" class="page-section">
  <div class="section-label">Today's Call</div>
  <div id="rankerOutput">
    <p style="color:var(--iron);">Loading forecast…</p>
  </div>
</section>
```

### F.3 Ranker render function

```javascript
async function initActivityRanker() {
  // Re-use El Médano cached data — should already be fetched by kite widget
  try {
    const { wx, marine } = await fetchWeather(28.0436, -16.5388);
    const today    = 0; // index into daily arrays
    const windKnots = wx.daily.wind_speed_10m_max[today];
    const weatherCode = wx.daily.weather_code[today];
    const precipMm  = wx.daily.precipitation_sum[today] ?? 0;
    const waveM     = marine.daily?.wave_height_max?.[today] ?? 0;

    const cats = ['wind','air','water','wheels','feet','motor','food','culture'];
    const scored = cats.map(cat => ({
      cat,
      score: scoreCategory(cat, windKnots, weatherCode, precipMm, waveM),
      cfg: CATEGORIES[cat]
    }));

    // Sort: green first, then amber, then red
    const order = { green: 0, amber: 1, red: 2 };
    scored.sort((a, b) => order[a.score] - order[b.score]);

    const top = scored[0];
    const jdmCopy = {
      wind:    "Conditions are optimal. The Chronicler has located his harness. It was under the golf clubs.",
      air:     "The air is behaving. The Keeper has already gone. The Chronicler is considering it.",
      water:   "The sea is reasonable. The Chronicler has been told kayaking is not difficult. He has his doubts.",
      wheels:  "A golf day. The Chronicler approves. The course will receive him.",
      feet:    "Hiking conditions are acceptable. The Chronicler has packed provisions. Mostly provisions.",
      motor:   "The rally circuit awaits. The Chronicler has secured a vehicle. The Keeper has not been told.",
      food:    "Weather for restaurants. The Chronicler considers this a win.",
      culture: "An indoor day. The Chronicler will visit something historical and explain it incorrectly."
    };

    document.getElementById('rankerOutput').innerHTML = `
      <div style="margin-bottom:20px;">
        <div style="font-family:var(--font-display); font-size:28px; font-weight:700;
                    color:${top.cfg.color}; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
          ${top.cfg.label}
        </div>
        <div style="font-family:var(--font-diary); font-style:italic; font-size:15px;
                    color:var(--smoke); line-height:1.7; max-width:600px;">
          "${jdmCopy[top.cat]}"
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${scored.map(s => `
          <div style="background:var(--charcoal); border-radius:6px; padding:8px 14px;
                      border-left:3px solid ${s.score === 'green' ? s.cfg.color : s.score === 'amber' ? '#C4A03E' : '#333'}">
            <div style="font-family:var(--font-display); font-size:11px; font-weight:700;
                        letter-spacing:2px; text-transform:uppercase;
                        color:${s.score === 'green' ? s.cfg.color : s.score === 'amber' ? '#C4A03E' : 'var(--iron)'}">
              ${s.cfg.label}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:11px; color:var(--iron); margin-top:12px; font-style:italic;">
        Based on forecast for Tenerife South · Updates every 2 hours
      </div>
    `;
  } catch(e) {
    document.getElementById('rankerOutput').innerHTML =
      '<p style="color:var(--iron);">Forecast unavailable. Check conditions directly.</p>';
    console.error('Ranker failed:', e);
  }
}
```

**Call order on voyage page init:**
Call `initKiteWidget()` first (populates the cache), then `initActivityRanker()` — it will use the cached data.

---

## §G — Seed 3 Air Activities + Property Placeholder

### G.1 Air activities (seed via Firebase Console or seed script)

Push these three to `/content/activities/` with `push()`:

```json
[
  {
    "title": "Moustache Soaring — Tenesar / Playa Teneza",
    "description": "Flare Moustache parakite along the lava cliffs near Tenesar in 15–25+ knots. Coastal terrain following, barrel rolls, high-speed cliff soaring. Experienced pilots only. Binter Canarias flies Tenerife → Lanzarote in ~55 min, multiple departures daily from TFS and TFN. Verify conditions before crossing.",
    "category": "air",
    "order": 28
  },
  {
    "title": "Moustache / Paragliding — Famara Ridge",
    "description": "600ft cliffs, 23km of ridge. Works for both traditional paragliding and Moustache depending on wind strength. NNW–NW wind for the full ridge run. Season peaks Oct–March; May/June flyable on the right day — verify conditions before booking the flight. Binter Canarias ~55 min from TFS/TFN.",
    "category": "air",
    "order": 29
  },
  {
    "title": "Moustache / Parakite — Fuerteventura",
    "description": "Sandy dunes and consistent coastal wind — the most forgiving Moustache terrain in the Canaries. 13m and 18m wings in 15–25 knot conditions. Binter Canarias flies Tenerife → Fuerteventura in ~45 min. Further than Lanzarote but worth it for ideal conditions.",
    "category": "air",
    "order": 30
  }
]
```

### G.2 Property section — conditional logic

The property section already exists as a placeholder. Add the conditional render:

```javascript
function initPropertySection() {
  const propRef = ref(db, 'content/property');
  onValue(propRef, (snapshot) => {
    const prop = snapshot.val();
    const section = document.getElementById('property');
    if (!section) return;

    if (!prop || prop.status !== 'confirmed') {
      section.innerHTML = `
        <div class="section-label">The Property</div>
        <div class="card" style="text-align:center; padding:40px 20px;">
          <div style="font-family:var(--font-display); font-size:18px; color:var(--smoke);
                      text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
            Scouting in Progress
          </div>
          <div style="font-family:var(--font-diary); font-style:italic; color:var(--iron); font-size:15px;">
            Our chronicler is still scouting. Watch this space.
          </div>
        </div>`;
      return;
    }

    // Property confirmed — render gallery
    const photos = prop.photos ? Object.values(prop.photos) : [];
    section.innerHTML = `
      <div class="section-label">The Property</div>
      <div style="margin-bottom:16px;">
        <div style="font-family:var(--font-display); font-size:24px; font-weight:700;
                    text-transform:uppercase; letter-spacing:2px; color:var(--parchment);">
          ${prop.name || ''}
        </div>
        <div style="color:var(--smoke); font-size:14px; margin-top:4px;">${prop.location || ''}</div>
        <div style="color:var(--smoke); font-size:14px; line-height:1.7; margin-top:12px; max-width:640px;">
          ${prop.description || ''}
        </div>
      </div>
      ${photos.length ? `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:8px; margin-top:16px;">
          ${photos.map(p => `
            <img src="${p.url}" alt="${p.caption || ''}"
                 style="width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:6px;"
                 loading="lazy">
          `).join('')}
        </div>` : ''}
    `;
  });
}
```

Add `id="property"` to the existing property `<section>` element and call `initPropertySection()` on voyage page init.

**To activate once property is confirmed:**
Set in Firebase Console:
```
/content/property/status    = "confirmed"
/content/property/name      = "Villa [name]"
/content/property/location  = "[location], Tenerife"
/content/property/description = "[description]"
/content/property/photos/{key}/url     = "https://..."
/content/property/photos/{key}/caption = "..."
```

---

## §H — Acceptance Checklist

- [ ] Required Viewing: all 3 videos render, captions visible, Akkersdijk video ID replaced with real ID
- [ ] Activities: all 28–30 activities load, category filter buttons work, category color coding correct
- [ ] Kite widget: all 3 spots load with wind/wave data, traffic light updates, 7-day forecast dots visible
- [ ] Paragliding widget: all 3 spots load, Famara shows Binter note, traffic light works
- [ ] Moustache widget: all 3 spots load, Binter flight times in notes, traffic light works
- [ ] Conditions tab switcher works: Kite / Para / Moust toggle cleanly
- [ ] Activity ranker: top category shown with correct J.D.M. copy, ranked list below
- [ ] Ranker uses cached data from kite widget — no duplicate API calls
- [ ] Weather data refreshes after 2-hour cache expiry
- [ ] Property section: shows placeholder when status ≠ "confirmed"
- [ ] Air activities (3) seeded and visible in activities grid under "Air" filter
- [ ] `grep -r 'console\.log' apps/nassims-folly/` — no user data in output
- [ ] All sections scroll correctly from sticky nav
- [ ] Append entry to `/change_log.md` and `/docs/tooling-decisions.md`

---

## Open Items (Phase 5)

| Item | Notes |
|---|---|
| Property gallery content | Add to Firebase once property is confirmed |
| T-minus-7-days intensify mode | Countdown styling change, new diary cadence |
| Post-trip memories mode | Decide closer to the date |
| Export-all-content-as-JSON | Admin button — run before archiving post-trip |
| Diary image uploads | Currently URL string only; Firebase Storage proper upload for Phase 5 |
| More diary entries | Monthly via admin compose. Next: mid-2026 Keeper origin story |
