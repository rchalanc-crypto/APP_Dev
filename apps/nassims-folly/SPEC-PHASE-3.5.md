# Nassim's Folly — Phase 3.5 Spec: UI Redesign + Expedition Briefs

> Drafted 2026-05-06. Lands at `apps/nassims-folly/SPEC-PHASE-3.5.md`.
> Build executes in Claude Code after Phase 3 is confirmed complete.
> Priority: ships before Phase 4 (weather widgets, activities UI) because
> the aesthetic baseline and Briefs feature are needed first.

---

## REQUIRED READING before any code

- `/CLAUDE.md`
- `/apps/nassims-folly/CLAUDE.md` (character canon — read the Captain irony note)
- `/apps/nassims-folly/SPEC.md`
- `/apps/nassims-folly/SPEC-PHASE-3.md` (Phase 3 must be complete and accepted first)
- `/apps/nassims-folly/index.html` (current state)
- `/apps/nassims-folly/firebase-rules.json`

---

## Context

Phase 3 shipped the diary feed, fun facts rotation, and admin compose UI.
The app still uses the static-firebase template aesthetic (cream, trail-green,
Bebas Neue). This phase replaces that entirely with a new visual system and
adds the Expedition Briefs broadcast feature.

**Build order within this phase:**
§A (design tokens + fonts) → §B (global layout + nav) → §C (RSVP transition)
→ §D (voyage page section redesign) → §E (Expedition Briefs) → §F (acceptance)

Drive interactively. Summarise each section and wait for "go" before proceeding.

---

## §A — Design Tokens: Replace the Colour and Type System

### A.1 Font imports

Replace the existing Google Fonts import with:

```html
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;1,400&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

Three families:
- **Barlow Condensed 600/700** — all headers, nav labels, section titles, countdown, badges, button text
- **Cormorant Garamond 400 italic / 600** — J.D.M. diary prose only
- **DM Sans 400/500** — all body copy, Gnatalee's notes, UI labels, data text

Remove: Bebas Neue (replaced entirely by Barlow Condensed).

### A.2 CSS custom properties

Replace the existing `:root` block with:

```css
:root {
  /* Core palette */
  --asphalt:      #1C1C1C;   /* primary page background */
  --charcoal:     #2D2D2D;   /* card surfaces */
  --concrete:     #3D3D3D;   /* elevated / hover surfaces */
  --iron:         #555555;   /* borders, dividers */
  --smoke:        #A8A49C;   /* secondary text on dark */
  --parchment:    #F2EFE8;   /* primary text on dark */

  /* Accents */
  --neon:         #C8FF00;   /* Fairway Neon — primary accent, J.D.M. diary, wind/air */
  --terracotta:   #C4683E;   /* secondary accent — Expedition Briefs, feet/motor */
  --ocean:        #1A6B9A;   /* water category */

  /* Category coding */
  --cat-wind:     #C8FF00;
  --cat-air:      #C8FF00;
  --cat-water:    #1A6B9A;
  --cat-motor:    #C4683E;
  --cat-feet:     #C4683E;
  --cat-wheels:   #888888;
  --cat-food:     #888888;
  --cat-culture:  #888888;

  /* Type */
  --font-display: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  --font-diary:   'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  /* Retained for RSVP screen (light) */
  --rsvp-bg:      #F5F1E8;
  --rsvp-text:    #1a1a1a;
  --rsvp-accent:  #2d5a3d;
}
```

### A.3 Base styles

```css
body {
  font-family: var(--font-body);
  background: var(--asphalt);
  color: var(--parchment);
  min-height: 100vh;
  margin: 0;
}

/* Section headers */
.section-label {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--smoke);
  margin-bottom: 16px;
}

/* Card baseline */
.card {
  background: var(--charcoal);
  border-radius: 10px;
  padding: 20px;
}
```

---

## §B — Global Layout + Sticky Nav

### B.1 Page structure

The voyage page wraps all sections in a `max-width: 1200px; margin: 0 auto;`
container with `padding: 0 20px`. Each section has `padding: 60px 0` on
desktop, `padding: 40px 0` on mobile.

### B.2 Sticky nav

Fixed bar. Bottom of screen on mobile (≤768px), top of screen on tablet+.
Z-index: 100.

```html
<nav class="sticky-nav" id="stickyNav" aria-label="Page sections">
  <a class="nav-item" href="#countdown"  data-section="countdown">
    <i class="ti ti-clock" aria-hidden="true"></i>
    <span>Days</span>
  </a>
  <a class="nav-item" href="#watch"      data-section="watch">
    <i class="ti ti-player-play" aria-hidden="true"></i>
    <span>Watch</span>
  </a>
  <a class="nav-item" href="#briefs"     data-section="briefs" id="briefsNavItem">
    <span class="nav-icon-wrap">
      <i class="ti ti-speakerphone" aria-hidden="true"></i>
      <span class="unread-dot" id="briefsDot" style="display:none;"></span>
    </span>
    <span>Briefs</span>
  </a>
  <a class="nav-item" href="#diary"      data-section="diary">
    <i class="ti ti-notebook" aria-hidden="true"></i>
    <span>Log</span>
  </a>
  <a class="nav-item" href="#conditions" data-section="conditions">
    <i class="ti ti-wind" aria-hidden="true"></i>
    <span>Wind</span>
  </a>
  <a class="nav-item" href="#ranker"     data-section="ranker">
    <i class="ti ti-trophy" aria-hidden="true"></i>
    <span>Today</span>
  </a>
  <a class="nav-item" href="#activities" data-section="activities">
    <i class="ti ti-map" aria-hidden="true"></i>
    <span>Do</span>
  </a>
</nav>
```

CSS:

```css
.sticky-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: rgba(28, 28, 28, 0.96);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: space-around;
  padding: 8px 0 12px;
  z-index: 100;
  border-top: 0.5px solid var(--iron);
}

@media (min-width: 769px) {
  .sticky-nav {
    top: 0; bottom: auto;
    padding: 0 40px;
    justify-content: flex-start;
    gap: 0;
    border-top: none;
    border-bottom: 0.5px solid var(--iron);
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--smoke);
  padding: 8px 12px;
  transition: color 0.2s ease;
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.nav-item i { font-size: 18px; }

.nav-item.active,
.nav-item:hover { color: var(--neon); }

.nav-icon-wrap { position: relative; display: inline-flex; }

.unread-dot {
  position: absolute;
  top: -2px; right: -4px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--terracotta);
}
```

Scroll spy — active section updates nav highlight:

```javascript
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(`.nav-item[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}
```

Add `padding-bottom: 70px` to `body` on mobile so sticky nav doesn't
obscure content. On tablet+ add `padding-top: 56px`.

---

## §C — RSVP Screen: Light Until Committed

The RSVP screen retains a warm, light aesthetic. It should feel calm and
welcoming — the dark reveal happens only once they say yes.

```css
.rsvp-screen {
  background: var(--rsvp-bg);
  color: var(--rsvp-text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rsvp-title {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  color: var(--rsvp-accent);
  letter-spacing: 2px;
  text-transform: uppercase;
}
```

**The reveal moment:** When a user submits "Yes, we're in" and the app
routes to the voyage page, add a one-time CSS class `voyage-reveal` to
`body` that runs a brief fade-in on the dark background:

```css
@keyframes darkReveal {
  from { background-color: var(--rsvp-bg); }
  to   { background-color: var(--asphalt); }
}

body.voyage-reveal {
  animation: darkReveal 0.8s ease-out forwards;
}
```

Apply the class in the JS routing function when transitioning from RSVP yes
to the voyage page. Remove it after 1 second so it doesn't re-run.

---

## §D — Voyage Page Section Redesign

Redesign each existing section to use the new token system.
Do NOT change any Firebase logic — only HTML structure and CSS.

### D.1 Hero — countdown

```html
<section id="countdown" class="hero-section">
  <div class="section-label">Departure in</div>
  <div class="countdown-display">
    <div class="countdown-unit">
      <span class="countdown-number" id="days">383</span>
      <span class="countdown-label">days</span>
    </div>
    <span class="countdown-sep">:</span>
    <div class="countdown-unit">
      <span class="countdown-number countdown-secondary" id="hours">14</span>
      <span class="countdown-label">hrs</span>
    </div>
    <span class="countdown-sep">:</span>
    <div class="countdown-unit">
      <span class="countdown-number countdown-secondary" id="minutes">22</span>
      <span class="countdown-label">min</span>
    </div>
    <span class="countdown-sep">:</span>
    <div class="countdown-unit">
      <span class="countdown-number countdown-secondary" id="seconds">08</span>
      <span class="countdown-label">sec</span>
    </div>
  </div>
  <h1 class="hero-title">Nassim's Folly <span class="hero-cross">×</span> Roberto</h1>
  <div class="hero-sub">25 May – 8 June 2027 · Tenerife</div>
</section>
```

```css
.hero-section {
  padding: 80px 0 60px;
  text-align: center;
}

.countdown-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.countdown-number {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 700;
  color: var(--neon);
  line-height: 1;
}

.countdown-secondary { color: var(--parchment); }

.countdown-label {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--iron);
  display: block;
  margin-top: 4px;
}

.countdown-sep {
  font-size: 48px;
  color: var(--iron);
  font-weight: 300;
  line-height: 1;
  padding-bottom: 16px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--parchment);
  margin: 16px 0 8px;
}

.hero-cross { color: var(--neon); }

.hero-sub {
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--smoke);
  text-transform: uppercase;
}

@media (max-width: 480px) {
  .countdown-number { font-size: 48px; }
  .countdown-sep { font-size: 32px; padding-bottom: 10px; }
}
```

### D.2 Required Viewing section (Phase 4 placeholder)

Add the section anchor and a one-line placeholder. Phase 4 fills the content.

```html
<section id="watch" class="page-section">
  <div class="section-label">Required Viewing</div>
  <p style="color: var(--iron); font-size: 14px;">Briefing materials loading...</p>
</section>
```

### D.3 Diary section

The section container and card styles from Phase 3 get updated to the
new token system. Update the existing CSS class names:

- `.diary-entry` background: `var(--charcoal)` (was `var(--cream)`)
- `.diary-entry` border-left: `3px solid var(--neon)` (was `var(--trail-green)`)
- `.diary-author` color: `var(--neon)` (was `var(--trail-green)`)
- `.diary-date` color: `var(--smoke)` (was `var(--dirt)`)
- `.diary-title` color: `var(--parchment)` (was `var(--dark)`)
- `.diary-body p` color: `var(--parchment)` (was `var(--dark)`)
- `.diary-title` font-family: `var(--font-display)` (was Bebas Neue reference)
- `.diary-body` font-family: `var(--font-diary)` — NEW, wrap in this
- `.keeper-addendum` background: `#222` (was `#f0ede6`)
- `.keeper-addendum` border-left: `2px solid var(--iron)` (was `var(--moss)`)
- `.keeper-label` color: `var(--neon)` (was `var(--moss)`)
- `.keeper-body p` color: `#888` (was `#3a3a3a`)
- `.keeper-sig` color: `#555` (was `var(--moss)`)

Section header:
```html
<div class="section-label">Dispatches from the Expedition</div>
```

### D.4 Conditions section (Phase 4 placeholder)

```html
<section id="conditions" class="page-section">
  <div class="section-label">Conditions</div>
  <p style="color: var(--iron); font-size: 14px;">Weather data loading in Phase 4.</p>
</section>
```

### D.5 Activity Ranker section (Phase 4 placeholder)

```html
<section id="ranker" class="page-section">
  <div class="section-label">Today's Call</div>
  <p style="color: var(--iron); font-size: 14px;">Activity ranker loading in Phase 4.</p>
</section>
```

### D.6 Activities section (Phase 4 placeholder)

```html
<section id="activities" class="page-section">
  <div class="section-label">What to do</div>
  <p style="color: var(--iron); font-size: 14px;">Activities loading in Phase 4.</p>
</section>
```

### D.7 Footer fun fact

Update colours:
- Background: `var(--asphalt)` (no change, it's the page bg)
- Fun fact text: `var(--smoke)`
- Border-top: `0.5px solid var(--iron)`

---

## §E — Expedition Briefs Feature

### E.1 Data model

New node: `/content/announcements/{pushId}`

```json
{
  "title":      "string, max 128 chars",
  "body":       "string, max 2048 chars (markdown)",
  "author":     "Robert | Nassim | Robert & Nassim",
  "category":   "logistics | news | reminder | important",
  "pinned":     true | false,
  "created_at": "ISO timestamp"
}
```

No Firebase rules change needed — `/content` already allows admin write
and confirmed-yes read.

### E.2 Voyage page section

Insert between hero and watch sections:

```html
<section id="briefs" class="page-section">
  <div class="section-label" style="color: var(--terracotta);">
    Expedition Briefs
    <span id="briefsUnreadLabel" style="display:none; margin-left: 8px;
      font-size: 10px; color: var(--terracotta);">● unread</span>
  </div>
  <div id="briefsFeed">
    <p style="color: var(--iron); font-size: 14px;">No briefs yet. Watch this space.</p>
  </div>
</section>
```

Render function:

```javascript
function renderBriefs(briefs) {
  const seenIds  = JSON.parse(localStorage.getItem('seenBriefIds') || '[]');
  const feed     = document.getElementById('briefsFeed');
  const dot      = document.getElementById('briefsDot');
  const label    = document.getElementById('briefsUnreadLabel');

  if (briefs.length === 0) {
    feed.innerHTML = '<p style="color:var(--iron);font-size:14px;">No briefs yet. Watch this space.</p>';
    return;
  }

  const unread = briefs.filter(b => !seenIds.includes(b.id));
  if (unread.length > 0) {
    dot.style.display   = 'block';
    label.style.display = 'inline';
  }

  // Mark as seen when section scrolls into view
  const section = document.getElementById('briefs');
  const seenObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const allIds = briefs.map(b => b.id);
      localStorage.setItem('seenBriefIds', JSON.stringify(allIds));
      dot.style.display   = 'none';
      label.style.display = 'none';
      seenObserver.disconnect();
    }
  }, { threshold: 0.3 });
  seenObserver.observe(section);

  const sorted = [...briefs].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return  1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  feed.innerHTML = sorted.map(brief => {
    const isUnread    = !seenIds.includes(brief.id);
    const borderColor = isUnread ? 'var(--terracotta)' : 'var(--iron)';
    const date        = new Date(brief.created_at).toLocaleDateString(
                          'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <div class="brief-card card" style="border-left: 3px solid ${borderColor}; margin-bottom: 12px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div style="font-family:var(--font-display); font-size:10px; font-weight:700;
                      letter-spacing:3px; color:var(--terracotta); text-transform:uppercase;">
            ${brief.category} · ${date}
            ${brief.pinned ? ' · 📌' : ''}
          </div>
          ${isUnread ? '<span style="background:var(--terracotta); color:#fff; font-size:9px; font-weight:700; letter-spacing:2px; padding:3px 8px; border-radius:3px; text-transform:uppercase;">NEW</span>' : ''}
        </div>
        <div style="font-family:var(--font-display); font-size:20px; font-weight:700;
                    color:var(--parchment); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
          ${brief.title}
        </div>
        <div style="font-size:14px; color:var(--smoke); line-height:1.7;">
          ${renderMarkdown(brief.body)}
        </div>
        <div style="font-size:12px; color:var(--iron); margin-top:10px;">— ${brief.author}</div>
      </div>
    `;
  }).join('');
}

function initBriefsFeed() {
  const briefsRef = query(
    ref(db, 'content/announcements'),
    orderByChild('created_at'),
    limitToLast(20)
  );
  onValue(briefsRef, (snapshot) => {
    const briefs = [];
    snapshot.forEach(child => briefs.push({ id: child.key, ...child.val() }));
    briefs.reverse();
    renderBriefs(briefs);
  });
}
```

### E.3 Admin compose — Briefs tab

Add a fourth tab "Briefs" to the admin dashboard alongside Allowlist,
RSVP, and Diary.

```html
<button class="admin-tab" onclick="switchAdminTab('briefs')">Briefs</button>
```

Panel:

```html
<div id="adminBriefs" class="admin-panel" style="display:none;">
  <h3>Expedition Briefs</h3>

  <div class="brief-compose">
    <input type="hidden" id="editBriefId">

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div class="form-group">
        <label>Category</label>
        <select id="composeCategory">
          <option value="logistics">Logistics</option>
          <option value="news">News</option>
          <option value="reminder">Reminder</option>
          <option value="important">Important</option>
        </select>
      </div>
      <div class="form-group">
        <label>Author</label>
        <select id="composeAuthorBrief">
          <option value="Robert">Robert</option>
          <option value="Robert &amp; Nassim">Robert &amp; Nassim</option>
          <option value="Nassim">Nassim</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Title</label>
      <input type="text" id="composeBriefTitle" placeholder="Airport transfers — confirm your arrival time">
    </div>

    <div class="form-group">
      <label>Message <span style="font-weight:400;font-size:0.85rem;">(**bold**, *italic*, blank line = paragraph)</span></label>
      <textarea id="composeBriefBody" rows="6" placeholder="We're coordinating a group transfer from Tenerife South on the 25th…"></textarea>
    </div>

    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
      <label style="display:flex; align-items:center; gap:8px; font-size:14px; cursor:pointer;">
        <input type="checkbox" id="composePinned"> Pin to top
      </label>
      <div style="display:flex; gap:10px;">
        <button class="btn" id="cancelBriefEditBtn" onclick="cancelBriefEdit()" style="display:none; background:var(--light-gray);">Cancel edit</button>
        <button class="btn btn-primary" onclick="publishBrief()">Post brief</button>
      </div>
    </div>
  </div>

  <div style="margin-top:32px;">
    <h4 style="font-family:'Bebas Neue',sans-serif; font-size:1.2rem; color:var(--terracotta); margin-bottom:12px;">POSTED BRIEFS</h4>
    <div id="adminBriefsList"></div>
  </div>
</div>
```

Compose logic:

```javascript
async function publishBrief() {
  const editId = document.getElementById('editBriefId').value;

  const brief = {
    title:      document.getElementById('composeBriefTitle').value.trim(),
    body:       document.getElementById('composeBriefBody').value.trim(),
    author:     document.getElementById('composeAuthorBrief').value,
    category:   document.getElementById('composeCategory').value,
    pinned:     document.getElementById('composePinned').checked,
    created_at: editId
                  ? (await get(ref(db, `content/announcements/${editId}/created_at`))).val()
                  : new Date().toISOString()
  };

  if (!brief.title || !brief.body) {
    alert('Title and message are required.');
    return;
  }

  const targetRef = editId
    ? ref(db, `content/announcements/${editId}`)
    : push(ref(db, 'content/announcements'));

  await set(targetRef, brief);
  clearBriefForm();
  loadAdminBriefsList();
}

function loadAdminBriefsList() {
  const briefsRef = query(
    ref(db, 'content/announcements'),
    orderByChild('created_at')
  );
  onValue(briefsRef, (snapshot) => {
    const briefs = [];
    snapshot.forEach(c => briefs.unshift({ id: c.key, ...c.val() }));
    const list = document.getElementById('adminBriefsList');
    if (briefs.length === 0) {
      list.innerHTML = '<p style="color:var(--smoke);">No briefs posted yet.</p>';
      return;
    }
    list.innerHTML = briefs.map(b => `
      <div style="background:var(--charcoal); border-radius:8px; padding:14px;
                  margin-bottom:10px; display:flex; justify-content:space-between;
                  align-items:start; gap:12px;">
        <div>
          <strong style="font-family:var(--font-display); color:var(--parchment);
                         font-size:1rem; text-transform:uppercase; letter-spacing:1px;">
            ${b.title}
          </strong>
          <span style="color:var(--terracotta); font-size:0.8rem; margin-left:8px;">
            ${b.category}${b.pinned ? ' · pinned' : ''}
          </span>
        </div>
        <div style="display:flex; gap:8px; flex-shrink:0;">
          <button class="btn" onclick="editBrief('${b.id}')"
                  style="padding:6px 12px; font-size:0.85rem;">Edit</button>
          <button class="delete-btn" onclick="deleteBrief('${b.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }, { onlyOnce: true });
}

function editBrief(id) {
  get(ref(db, `content/announcements/${id}`)).then(snap => {
    const b = snap.val();
    document.getElementById('editBriefId').value        = id;
    document.getElementById('composeBriefTitle').value  = b.title;
    document.getElementById('composeBriefBody').value   = b.body;
    document.getElementById('composeAuthorBrief').value = b.author;
    document.getElementById('composeCategory').value    = b.category;
    document.getElementById('composePinned').checked    = b.pinned || false;
    document.getElementById('cancelBriefEditBtn').style.display = 'inline-block';
    document.querySelector('.brief-compose').scrollIntoView({ behavior: 'smooth' });
  });
}

function cancelBriefEdit() { clearBriefForm(); }

function clearBriefForm() {
  ['editBriefId','composeBriefTitle','composeBriefBody'].forEach(
    id => { document.getElementById(id).value = ''; }
  );
  document.getElementById('composeAuthorBrief').value = 'Robert';
  document.getElementById('composeCategory').value    = 'logistics';
  document.getElementById('composePinned').checked    = false;
  document.getElementById('cancelBriefEditBtn').style.display = 'none';
}

window.deleteBrief = function(id) {
  if (confirm('Delete this brief?')) {
    remove(ref(db, `content/announcements/${id}`));
    loadAdminBriefsList();
  }
};
```

Call `initBriefsFeed()` in the voyage page init alongside `initDiaryFeed()`.
Call `loadAdminBriefsList()` when the Briefs admin tab is opened.

---

## §F — Acceptance Checklist

- [ ] Fonts: Barlow Condensed rendering for all headers, Cormorant Garamond rendering for diary body, DM Sans for body/UI — verify in browser at 375px and 1200px
- [ ] Countdown hero: days in neon lime, hours/min/sec in parchment, correct font scale on mobile
- [ ] Sticky nav: fixed to bottom on phone, top on tablet+; active section highlights lime; scroll spy works across all 7 sections
- [ ] Briefs dot appears on nav when localStorage has no seenBriefIds; disappears when Briefs section scrolls into view
- [ ] RSVP screen is visually light (cream/green) and unchanged from Phase 2 behaviour
- [ ] Yes → voyage transition: `darkReveal` animation fires once; body background is `var(--asphalt)` after
- [ ] Diary cards: dark charcoal background, neon left border, Cormorant Garamond prose, Keeper addendum with iron border and neon "NOTES FOR ACCURACY" label
- [ ] Briefs feed: terracotta accent, unread badge, pinned posts sort to top, read posts dim to iron border
- [ ] Admin → Briefs tab: post a brief → appears in voyage feed in real time; edit and delete work
- [ ] No `console.log` of user data: `grep -r 'console\.log' apps/nassims-folly/`
- [ ] All placeholder sections (Watch, Conditions, Today, Do) have section anchors and scroll correctly from nav
- [ ] Append entry to `/change_log.md` and `/docs/tooling-decisions.md`

---

## Open Items (Not Blocking Phase 3.5)

| Item | Phase |
|---|---|
| Required Viewing — 3 video cards (Watch section) | 4 |
| Kite weather widget | 4 |
| Paragliding conditions widget | 4 |
| Moustache/parakite conditions widget | 4 |
| Activity ranker widget | 4 |
| Activities section UI (data already seeded) | 4 |
| Property photo gallery | 4 |
| Property card in hero/section (once confirmed) | 4 |
