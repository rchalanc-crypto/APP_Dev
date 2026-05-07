# Nassim's Folly — Phase 3 Spec: Diary, Fun Facts & Admin Compose

> Revised 2026-05-06. Supersedes the draft Phase 3 spec.
> Incorporates `nassims-folly-content-seed-v2.md` — character, data model,
> and all seed content updated. Build executes in Claude Code.
> Lands at `apps/nassims-folly/SPEC-PHASE-3.md`.
>
> **Priority order: §A (fun facts) → §B (diary feed + CSS) → §C (admin compose) → §D (seed push).**
> Invites are out. Guests will be clicking through.

---

## REQUIRED READING before any code

- `/CLAUDE.md`
- `/apps/nassims-folly/CLAUDE.md`
- `/apps/nassims-folly/SPEC.md` (data model, rules)
- `/apps/nassims-folly/index.html` (current state — find the three placeholders)
- `/apps/nassims-folly/firebase-rules.json` (confirm content write rule is live)
- `/change_log.md`

---

## Characters

### J'Dinklage Morgoone
Chronicler to the Expedition. Author of all diary entries. Voice: florid,
confident, wrong about roughly 30% of facts, never in doubt.
`author_slug: "jdm"`

### Gnatalee McCringleberry, Keeper of the Sanity
*Pronunciation: Natalie. The G is silent.*
Not a separate author. Her voice appears as an optional `keeper_note` field on
J.D.M.'s entries — rendered as a visually distinct addendum to the same card.
Never contradicts the Captain directly. Uses footnoted NOTES FOR ACCURACY. Clinical,
precise, slightly weary at the end (never the start). Has done the research J.D.M.
has not done.

---

## Data Model Change (vs. original SPEC.md)

`/content/diary/{id}` adds an optional `keeper_note` field:

```json
{
  "slug":          "dep-001",
  "author":        "J'Dinklage Morgoone",
  "author_slug":   "jdm",
  "in_world_date": "Year of Our Voyage, Day Negative-Three-Hundred-and-Sixty-One",
  "title":         "I Have Purchased a Ship",
  "body":          "Markdown string — J.D.M.'s entry",
  "keeper_note":   "Optional markdown — Gnatalee's addendum. Omit if absent.",
  "image_url":     null,
  "created_at":    "ISO timestamp"
}
```

`keeper_note` is optional — entry voy-014 has none. When absent, the
Keeper's addendum section does not render at all.

The `slug` field is for human readability in Firebase Console. It is not used
in routing or lookups. Seed entries use `set()` at `/content/diary/{slug}`
so the Console is readable.

No Firebase rules change needed — `/content` write is already admin-only and
read is already gated on `status === 'yes'`.

---

## §A — Fun Facts: Seed + Rotation Logic

**Ship first. Footer visible to all confirmed-yes guests immediately.**

### A.1 Rotation logic (code change to index.html)

```javascript
async function initFunFact() {
  const snapshot = await get(ref(db, 'content/fun_facts'));
  if (!snapshot.exists()) return;

  const allFacts = Object.entries(snapshot.val()).map(([id, f]) => ({ id, ...f }));
  const seenIds  = JSON.parse(localStorage.getItem('seenFactIds') || '[]');

  let unseen = allFacts.filter(f => !seenIds.includes(f.id));
  if (unseen.length === 0) {
    localStorage.removeItem('seenFactIds');
    unseen = allFacts;
  }

  const pick    = unseen[Math.floor(Math.random() * unseen.length)];
  const newSeen = [...seenIds, pick.id].slice(-30);
  localStorage.setItem('seenFactIds', JSON.stringify(newSeen));

  document.getElementById('funFactText').textContent = pick.text;
}
```

Footer HTML — replace the placeholder `<p>` with:
```html
<p id="funFactText" style="font-style:italic; color:var(--moss);">Loading a fact about Tenerife…</p>
```

Add `get` to the Firebase database SDK import list.
Call `initFunFact()` after auth + status check, only when status is `'yes'`.

### A.2 Fun facts seed (50 entries)

Push to `/content/fun_facts/` using push() — auto-keyed. Each: `{ text, category }`.

> **VERIFY BEFORE SHIPPING:** spot-check 5 random facts; verify Masca Gorge
> access status; confirm IGIC rate; check DST offset around the trip dates.
> See §E verification checklist.

```json
[
  { "text": "Mount Teide is 3,718 metres tall — the highest point in Spain and the third-largest volcano in the world by volume from its base on the ocean floor.", "category": "geography" },
  { "text": "From the summit of Teide on a clear day, you can see all the other Canary Islands.", "category": "geography" },
  { "text": "Tenerife is roughly the size of London by area but has about one-eighth the population.", "category": "geography" },
  { "text": "The island has 43 microclimates. You can drive from sun into fog in ten minutes.", "category": "geography" },
  { "text": "The black-sand beaches in the north are black because the sand is volcanic. The yellow-sand beaches in the south were imported from the Sahara.", "category": "geography" },
  { "text": "Mount Teide last erupted in 1909. Its summit averages snow most winters.", "category": "geography" },
  { "text": "The waters around Tenerife host 28 species of whale and dolphin — one of the most diverse cetacean populations in Europe.", "category": "nature" },
  { "text": "The Anaga rural park in the northeast is a UNESCO Biosphere Reserve. Its laurel forest is a living relic of forests that covered Europe millions of years ago.", "category": "nature" },
  { "text": "There are no native land mammals on Tenerife. Every furry thing arrived by boat or by plane.", "category": "nature" },
  { "text": "Tenerife is roughly 12 million years old — younger than the dinosaurs by about 60 million.", "category": "geography" },
  { "text": "The dragon trees of Tenerife can live for centuries; the Drago Milenario in Icod de los Vinos is estimated at 800-plus years old, though the local legend claims a thousand.", "category": "nature" },
  { "text": "The Canary Islands are named after dogs, not birds. From the Latin canariae insulae — 'islands of dogs.'", "category": "etymology" },
  { "text": "Canary birds are named after the islands, which are named after the dogs.", "category": "etymology" },
  { "text": "Tenerife, in the Guanche language, is generally translated as 'snow mountain' or 'mountain of fire.' The Keeper has views on which is correct. The Captain has different views.", "category": "etymology" },
  { "text": "The Guanches were the indigenous people of Tenerife — tall, often fair-haired, likely descended from Berber peoples of North Africa.", "category": "history" },
  { "text": "The Guanches mummified their dead. Hundreds of mummies have been found in volcanic caves.", "category": "history" },
  { "text": "The Spanish conquest of Tenerife took until 1496 — it was the last Canary Island to fall.", "category": "history" },
  { "text": "The Guanches communicated across deep valleys using a whistled language. A modern descendant, Silbo Gomero, is still taught in schools on neighbouring La Gomera and is recognised by UNESCO.", "category": "history" },
  { "text": "Silbo can carry up to 5 km across a canyon.", "category": "history" },
  { "text": "Christopher Columbus stopped in the Canaries on every one of his voyages to the Americas.", "category": "history" },
  { "text": "Tenerife's flag is blue with a white saltire — the same as Scotland's. The reason is debated; the most romantic explanation involves 18th-century Scottish merchants.", "category": "history" },
  { "text": "La Laguna, the old capital, is a UNESCO World Heritage city and is said to be the historical model for the colonial grids of Havana, Lima, and San Juan.", "category": "history" },
  { "text": "Carnival in Santa Cruz de Tenerife is one of the largest in the world after Rio.", "category": "culture" },
  { "text": "Papas arrugadas — Canarian 'wrinkled potatoes' — are boiled in seawater so concentrated the salt crystallises on the skin.", "category": "food" },
  { "text": "Papas arrugadas are served with mojo: red mojo (paprika, garlic, oil) for meat; green mojo (cilantro, garlic, oil) for fish.", "category": "food" },
  { "text": "Tenerife produces wine. The vines on the slopes of Teide grow in volcanic ash and are some of the highest-elevation vineyards in Europe.", "category": "drink" },
  { "text": "Malvasia wine from the Canaries is the wine Shakespeare references as 'Canary sack.' Falstaff drinks it.", "category": "drink" },
  { "text": "The Canary Islands were the first place outside Asia where bananas were commercially grown for European markets, starting in the 15th century.", "category": "food" },
  { "text": "The local goat cheese, queso de cabra, comes in three forms: fresh, semi-cured, and smoked over wood.", "category": "food" },
  { "text": "There is a fish here called vieja — 'old woman.' It is delicious. The name's origin is contested; nobody can satisfactorily explain it.", "category": "food" },
  { "text": "The Auditorio de Tenerife in Santa Cruz, designed by Santiago Calatrava, looks like a wave or a fin depending on your mood.", "category": "architecture" },
  { "text": "There is a working observatory near Teide because the air is so clear; the European Solar Telescope is being built there.", "category": "science" },
  { "text": "The town of Garachico was almost wiped off the map by the 1706 lava flow. The lava reshaped the coastline; the town rebuilt on top of the new ground.", "category": "history" },
  { "text": "The lava pools at El Caleton in Garachico are now natural swimming pools. You swim where the lava cooled.", "category": "things-to-do" },
  { "text": "The Pyramids of Güímar are six stepped stone structures of debated origin. Thor Heyerdahl championed an Atlantean theory. The current archaeological consensus is more prosaic. The Keeper agrees with the consensus. The Captain has not been consulted.", "category": "history" },
  { "text": "The currency is the euro.", "category": "practical" },
  { "text": "The Canary Islands run on Western European Time, UTC+0 — one hour behind mainland Spain.", "category": "practical" },
  { "text": "The Canaries have a special low-VAT regime called IGIC, generally lower than mainland Spanish VAT. Robert's wallet will notice.", "category": "practical" },
  { "text": "The sun on Tenerife is no joke — UV index regularly hits 9–11 even in winter. SPF 50, hat, the works.", "category": "practical" },
  { "text": "Most beaches have free public showers and changing facilities.", "category": "practical" },
  { "text": "The driving distance from one end of Tenerife to the other is about 80 km, but it can take three hours due to mountains.", "category": "practical" },
  { "text": "The public bus system, TITSA, is reliable, inexpensive, and goes most places worth going. The Keeper has tested seven routes. The Captain refuses to use it on principle. The principle has not been disclosed.", "category": "practical" },
  { "text": "El Médano on the south coast is one of Europe's most consistent kiteboarding and windsurfing spots and hosts world-tour events.", "category": "wind" },
  { "text": "The wind at El Médano is reliable because Mount Teide creates a venturi effect that funnels Atlantic trade winds through specific bays on the south coast.", "category": "wind" },
  { "text": "The most important kite-related fact: bring booties; the entry to the water is rocky.", "category": "wind" },
  { "text": "J.D.M. notes: 'I am told there is a beach made of green sand. I have not yet found it. I suspect it of being a rumour propagated by men who own boats.' The Keeper appends: the green-sand beach is on Hawaii. The Captain has been told this. He chooses to believe Tenerife has one too.", "category": "chronicler" },
  { "text": "The Keeper reports: 'The Captain has, this week, declared three separate locations to be the spiritual centre of the island. I have catalogued them. They are not adjacent.'", "category": "chronicler" },
  { "text": "J.D.M.: 'The locals here have a saying — no hay mal que por bien no venga — there is no bad from which good does not eventually come. I have adopted this as our voyage motto.'", "category": "culture" },
  { "text": "The Keeper: 'The Captain's voyage motto, adopted yesterday, has already been replaced. The new motto is de noche todos los gatos son pardos — at night all cats are grey. He has not yet explained the relevance.'", "category": "chronicler" },
  { "text": "J.D.M.: 'I am informed that Tenerife sits on the edge of where the medieval mapmakers wrote here be dragons. I find this entirely fitting.' The Keeper: 'I am the Keeper of the Sanity, not of the Dragons. The distinction is important to me.'", "category": "chronicler" }
]
```

---

## §B — Diary Feed: Render on Voyage Page

### B.1 Code changes — voyage page

Replace the diary placeholder. Import `query`, `orderByChild`, `limitToLast`
from the Firebase SDK (add to existing import list if missing).

```javascript
function initDiaryFeed() {
  const diaryRef = query(
    ref(db, 'content/diary'),
    orderByChild('created_at'),
    limitToLast(10)
  );
  onValue(diaryRef, (snapshot) => {
    const entries = [];
    snapshot.forEach(child => entries.unshift({ id: child.key, ...child.val() }));
    renderDiary(entries);
  });
}

function renderDiary(entries) {
  const container = document.getElementById('diaryFeed');
  if (entries.length === 0) {
    container.innerHTML = `
      <p style="text-align:center;color:var(--moss);font-style:italic;padding:40px 0;">
        No entries yet. J.D.M. has not yet found a quill that doesn't leak.
      </p>`;
    return;
  }
  container.innerHTML = entries.map(entry => `
    <div class="diary-entry">
      <div class="diary-meta">
        <span class="diary-author">${entry.author}</span>
        <span class="diary-date">${entry.in_world_date}</span>
      </div>
      <h3 class="diary-title">${entry.title}</h3>
      <div class="diary-body">${renderMarkdown(entry.body)}</div>
      ${entry.image_url ? `<img class="diary-image" src="${entry.image_url}" alt="">` : ''}
      ${entry.keeper_note ? `
        <div class="keeper-addendum">
          <div class="keeper-label">NOTES FOR ACCURACY</div>
          <div class="keeper-body">${renderMarkdown(entry.keeper_note)}</div>
          <div class="keeper-sig">G. McCringleberry, Keeper of the Sanity</div>
        </div>` : ''}
    </div>
  `).join('');
}
```

Add `renderMarkdown()` — minimal inline converter. Support only:
- `**text**` → `<strong>`
- `*text*` → `<em>`
- `\n\n` → new paragraph (`</p><p>`)
- `\n` → `<br>`

Do NOT import a markdown library.

### B.2 CSS additions

```css
.diary-entry {
  background: var(--cream);
  border-left: 4px solid var(--trail-green);
  border-radius: 8px;
  padding: 28px 32px;
  margin-bottom: 28px;
  line-height: 1.7;
}

.diary-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.diary-author {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: var(--trail-green);
}

.diary-date {
  font-size: 0.85rem;
  color: var(--dirt);
  font-style: italic;
}

.diary-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  color: var(--dark);
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.diary-body p { margin-bottom: 12px; color: var(--dark); }

.diary-image {
  width: 100%;
  border-radius: 6px;
  margin-top: 16px;
}

/* Keeper's addendum — distinct from Captain's voice */
.keeper-addendum {
  margin-top: 24px;
  padding: 18px 22px;
  background: #f0ede6;
  border-left: 3px solid var(--moss);
  border-radius: 0 6px 6px 0;
  font-size: 0.93rem;
}

.keeper-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 2px;
  color: var(--moss);
  margin-bottom: 10px;
}

.keeper-body p { margin-bottom: 10px; color: #3a3a3a; }

.keeper-sig {
  margin-top: 14px;
  font-style: italic;
  font-size: 0.85rem;
  color: var(--moss);
}
```

---

## §C — Admin Diary Compose UI

New third tab in the admin dashboard. Author is always J'Dinklage Morgoone — no
dropdown needed. The Keeper signature line is automatic; Robert only writes
the `keeper_note` body text.

### C.1 Tab addition

```html
<button class="admin-tab" onclick="switchAdminTab('diary')">Diary</button>
```

### C.2 Compose panel

```html
<div id="adminDiary" class="admin-panel" style="display:none;">
  <h3>Diary Entries</h3>

  <div class="diary-compose">
    <input type="hidden" id="editEntryId">

    <div class="form-group">
      <label>In-World Date
        <span style="font-weight:400;font-size:0.85rem;">(free text — "Day 14 at Sea", not a date picker)</span>
      </label>
      <input type="text" id="composeInWorldDate" placeholder="e.g. Day 41 — Arrival at Tenerife">
    </div>

    <div class="form-group">
      <label>Title</label>
      <input type="text" id="composeTitle" placeholder="Entry title">
    </div>

    <div class="form-group">
      <label>J.D.M.'s Entry
        <span style="font-weight:400;font-size:0.85rem;">(**bold**, *italic*, blank line = paragraph)</span>
      </label>
      <textarea id="composeBody" rows="10" placeholder="Dear Roberto, …"></textarea>
    </div>

    <div class="form-group">
      <label>Keeper's Notes
        <span style="font-weight:400;font-size:0.85rem;">(optional — renders as a distinct addendum. Signature added automatically. Leave blank for no addendum.)</span>
      </label>
      <textarea id="composeKeeperNote" rows="6" placeholder="Re: the above. …"></textarea>
    </div>

    <div class="form-group">
      <label>Image URL <span style="font-weight:400;font-size:0.85rem;">(optional)</span></label>
      <input type="text" id="composeImageUrl" placeholder="https://…">
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
      <button class="btn btn-primary" onclick="publishEntry()">Publish</button>
      <button class="btn" onclick="previewEntry()" style="background:var(--cream);">Preview</button>
      <button class="btn" id="cancelEditBtn" onclick="cancelEdit()"
              style="display:none;background:var(--light-gray);">Cancel edit</button>
    </div>
  </div>

  <div id="diaryPreviewPane" style="display:none;margin-top:24px;">
    <h4 style="font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:var(--moss);margin-bottom:12px;">PREVIEW</h4>
    <div id="diaryPreviewContent" class="diary-entry"></div>
  </div>

  <div style="margin-top:32px;">
    <h4 style="font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:var(--trail-green);margin-bottom:12px;">PUBLISHED ENTRIES</h4>
    <div id="adminDiaryList"></div>
  </div>
</div>
```

### C.3 Compose logic

```javascript
async function publishEntry() {
  const editId     = document.getElementById('editEntryId').value;
  const keeperNote = document.getElementById('composeKeeperNote').value.trim();

  const entry = {
    author:        'J'Dinklage Morgoone',
    author_slug:   'jdm',
    in_world_date: document.getElementById('composeInWorldDate').value.trim(),
    title:         document.getElementById('composeTitle').value.trim(),
    body:          document.getElementById('composeBody').value.trim(),
    image_url:     document.getElementById('composeImageUrl').value.trim() || null,
    created_at:    editId
                     ? (await get(ref(db, `content/diary/${editId}/created_at`))).val()
                     : new Date().toISOString()
  };

  if (keeperNote) entry.keeper_note = keeperNote;

  if (!entry.in_world_date || !entry.title || !entry.body) {
    alert('In-world date, title, and body are required.');
    return;
  }

  const targetRef = editId
    ? ref(db, `content/diary/${editId}`)
    : push(ref(db, 'content/diary'));

  await set(targetRef, entry);
  clearComposeForm();
  loadAdminDiaryList();
}

function previewEntry() {
  const keeperNote = document.getElementById('composeKeeperNote').value.trim();
  document.getElementById('diaryPreviewPane').style.display = 'block';
  document.getElementById('diaryPreviewContent').innerHTML = `
    <div class="diary-meta">
      <span class="diary-author">J'Dinklage Morgoone</span>
      <span class="diary-date">${document.getElementById('composeInWorldDate').value}</span>
    </div>
    <h3 class="diary-title">${document.getElementById('composeTitle').value}</h3>
    <div class="diary-body">${renderMarkdown(document.getElementById('composeBody').value)}</div>
    ${keeperNote ? `
      <div class="keeper-addendum">
        <div class="keeper-label">NOTES FOR ACCURACY</div>
        <div class="keeper-body">${renderMarkdown(keeperNote)}</div>
        <div class="keeper-sig">G. McCringleberry, Keeper of the Sanity</div>
      </div>` : ''}
  `;
}

function loadAdminDiaryList() {
  const diaryRef = query(ref(db, 'content/diary'), orderByChild('created_at'));
  onValue(diaryRef, (snapshot) => {
    const entries = [];
    snapshot.forEach(c => entries.unshift({ id: c.key, ...c.val() }));
    const list = document.getElementById('adminDiaryList');
    if (entries.length === 0) {
      list.innerHTML = '<p style="color:var(--moss);">No entries yet.</p>';
      return;
    }
    list.innerHTML = entries.map(e => `
      <div style="background:var(--cream);border-radius:8px;padding:16px;margin-bottom:12px;
                  display:flex;justify-content:space-between;align-items:start;gap:12px;">
        <div>
          <strong style="font-family:'Bebas Neue',sans-serif;">${e.title}</strong>
          <span style="color:var(--moss);font-size:0.85rem;margin-left:10px;">${e.in_world_date}</span>
          ${e.keeper_note ? '<span style="color:var(--dirt);font-size:0.8rem;margin-left:6px;">+ Keeper</span>' : ''}
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0;">
          <button class="btn" onclick="editEntry('${e.id}')"
                  style="padding:6px 12px;font-size:0.85rem;background:var(--light-gray);">Edit</button>
          <button class="delete-btn" onclick="deleteEntry('${e.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }, { onlyOnce: true });
}

function editEntry(id) {
  get(ref(db, `content/diary/${id}`)).then(snap => {
    const e = snap.val();
    document.getElementById('editEntryId').value        = id;
    document.getElementById('composeInWorldDate').value = e.in_world_date;
    document.getElementById('composeTitle').value       = e.title;
    document.getElementById('composeBody').value        = e.body;
    document.getElementById('composeKeeperNote').value  = e.keeper_note || '';
    document.getElementById('composeImageUrl').value    = e.image_url || '';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    document.querySelector('.diary-compose').scrollIntoView({ behavior: 'smooth' });
  });
}

function cancelEdit() { clearComposeForm(); }

function clearComposeForm() {
  ['editEntryId', 'composeInWorldDate', 'composeTitle',
   'composeBody', 'composeKeeperNote', 'composeImageUrl']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('cancelEditBtn').style.display = 'none';
  document.getElementById('diaryPreviewPane').style.display = 'none';
}
```

Import `set`, `get`, `push`, `query`, `orderByChild`, `limitToLast` — add any
missing from the existing SDK import list.

---

## §D — Seed Content

**Diary entries:** use `set()` at named paths so Firebase Console is readable.
**Fun facts + activities:** use `push()` — auto-keyed, order doesn't matter.

### D.1 Diary entries

> **Character note:** In dep-001 and arr-001, Gnatalee's keeper_note uses
> "the Captain" to refer to J.D.M. This is intentional irony — he is not a
> captain, he calls himself one, she documents it faithfully. Do NOT change
> "the Captain" to "the Chronicler" in her voice. Preserve exactly as written.

#### `set(ref(db, 'content/diary/dep-001'), { … })`

```json
{
  "slug": "dep-001",
  "author": "J'Dinklage Morgoone",
  "author_slug": "jdm",
  "in_world_date": "Year of Our Voyage, Day Negative-Three-Hundred-and-Sixty-One",
  "title": "I Have Purchased a Ship",
  "body": "*Dear Roberto,*\n\nI have purchased a ship.\n\nIt is not the ship I was sent to purchase. The ship I was sent to purchase had two masts and was, by the broker's account, \"seaworthy in most weathers.\" This ship has one mast and is, by the new broker's account, \"honest about its limitations.\"\n\nI have named her *Patience,* in the hope that she will demand it of me rather than possess it herself.\n\nThe crew has been assembled. There is a cook, a navigator, and an assistant chronicler named Natalie, who has accepted the post with admirable composure and has already begun making lists.\n\nWe sail at dawn, weather permitting, and on the following dawn, weather not permitting. The destination is Tenerife. The route is the route. I trust the stars.\n\nFaithfully,\nJ.D.M.",
  "keeper_note": "Re: my name.\n\nIt is **Gnatalee.** With a G. The G is silent. I have answered this question.\n\nRe: the vessel.\n\nThe keel is of concern. The Captain's reassurance was not based on inspection. The vessel has one mast because the second was sold by the previous owner to settle a debt. The debt remains unsettled and is unrelated to the vessel.\n\n*Patience* is a serviceable name. I would have preferred *Prudence.*",
  "image_url": null,
  "created_at": "2026-05-06T10:00:00.000Z"
}
```

#### `set(ref(db, 'content/diary/voy-014'), { … })`

```json
{
  "slug": "voy-014",
  "author": "J'Dinklage Morgoone",
  "author_slug": "jdm",
  "in_world_date": "Day 14 at Sea",
  "title": "Shipwrecked, Pleasantly",
  "body": "*Dear Roberto,*\n\nThe stars were obscured today. We took a wrong turn somewhere east of the trade winds. Cook claims he saw the Canaries on the horizon at dawn but Cook also claims many things, including parentage by a duchess and a working knowledge of French.\n\nFortune is shining upon us. We find ourselves shipwrecked. It appears to be a pleasant beach. We have an abundance of fruits — papaya, banana, a small green thing the men are arguing about. I have tasked the crew with beginning fortifications for your arrival.\n\nNassim will, I trust, find the wine cellar acceptable. I have buried the better bottles for safekeeping.\n\n— J.D.M.",
  "keeper_note": null,
  "image_url": null,
  "created_at": "2026-05-06T10:00:01.000Z"
}
```

#### `set(ref(db, 'content/diary/arr-001'), { … })`

```json
{
  "slug": "arr-001",
  "author": "J'Dinklage Morgoone",
  "author_slug": "jdm",
  "in_world_date": "Day 41 — Arrival at Tenerife",
  "title": "We Have Arrived",
  "body": "*Dear Roberto,*\n\nWe have arrived. The locals call this place Tenerife, which I'm told means \"white mountain\" in the old tongue and refers to the volcano which dominates the centre of the island. The volcano is currently dormant, which is, for our purposes, ideal.\n\nI have secured what I believe will be your residence. It overlooks the sea. There are rooms enough for everyone, and a kitchen the cook has already declared \"operationally adequate,\" which from him is unusually positive.\n\nThe wine situation is favourable. I will say no more, in case this letter is intercepted.\n\nI begin scouting activities. There is, I am told, a sport here in which men strap themselves to large kites and are dragged across the water at high speed. I have not yet ascertained whether this is a sport or a punishment. Glenn will know.\n\nUntil your arrival,\nJ.D.M.",
  "keeper_note": "Re: the above.\n\n*Tenerife* does not, to the best of my research, mean \"white mountain.\" It is from the Guanche language, and the consensus translation is closer to \"snow mountain\" or \"mountain of fire,\" depending on the source. The Captain has not consulted any sources. He has consulted a man at the dock who appeared knowledgeable.\n\nThe volcano is named Teide. It is not \"currently dormant.\" It is *dormant.* The distinction is important to those of us standing at its base.\n\nThe residence the Captain refers to as \"secured\" has been viewed, not rented. The viewing was conducted from a distance of approximately 200 metres, on foot, while the property's owner was not present. I have begun separate inquiries.\n\nThe kitchen has not been entered.\n\nGlenn does indeed know about kiteboarding. The Captain has been told this multiple times.",
  "image_url": null,
  "created_at": "2026-05-06T10:00:02.000Z"
}
```

**Display order:** newest first → arr-001, voy-014, dep-001.

### D.2 Activities (20) — seed now, renders in Phase 4

Push all 20 to `/content/activities/` with push(). Each: `{ title, description, category, order }`.
`image_url` and `external_link` deferred to Phase 4.

> **Verify before Phase 4 renders this:** confirm Masca Gorge access, restaurant
> status, Loro Parque decision. See §E.

```json
[
  { "title": "El Médano", "description": "The headline kite spot on the south coast. Reliable trade winds, world-tour caliber, beach café culture.", "category": "wind", "order": 1 },
  { "title": "Cabezo (north of El Médano)", "description": "For stronger conditions when El Médano is maxed out. Same town, walk over from the main beach.", "category": "wind", "order": 2 },
  { "title": "Playa de las Teresitas", "description": "Calm, golden-sand beach (sand imported from the Sahara). Good for swimming and rest days.", "category": "water", "order": 3 },
  { "title": "Golf Costa Adeje", "description": "Championship course on the south coast with Atlantic views.", "category": "wheels", "order": 4 },
  { "title": "Golf del Sur", "description": "Older course that has hosted European Tour qualifying events.", "category": "wheels", "order": 5 },
  { "title": "Buenavista Golf", "description": "Severiano Ballesteros design. Dramatic clifftop course on the northwest coast.", "category": "wheels", "order": 6 },
  { "title": "Mount Teide Summit", "description": "Cable car most of the way; permit-required final ascent on foot to the crater. Book the permit weeks ahead.", "category": "feet", "order": 7 },
  { "title": "Anaga Mountains — Sendero de los Sentidos", "description": "Short, accessible laurel-forest trail. Cruz del Carmen for longer routes and the viewpoint.", "category": "feet", "order": 8 },
  { "title": "Masca Gorge", "description": "Iconic steep canyon descent to a beach with boat pickup. Access heavily regulated — verify current permit status before recommending.", "category": "feet", "order": 9 },
  { "title": "Barranco del Infierno (Adeje)", "description": "Book-ahead permit hike with a waterfall finish.", "category": "feet", "order": 10 },
  { "title": "Los Gigantes Cliffs by Sea Kayak", "description": "Towering cliffs on the west coast; whale and dolphin sightings common from the water.", "category": "water", "order": 11 },
  { "title": "La Caleta (Adeje) Coves", "description": "Calm water, easy paddling, snorkel stops.", "category": "water", "order": 12 },
  { "title": "La Tasquita de Min", "description": "Modern Canarian, Santa Cruz. Reservation essential.", "category": "food", "order": 13 },
  { "title": "El Rincón de Juan Carlos", "description": "Fine-dining tasting menu, La Caleta. Verify current Michelin status and booking lead time before publishing.", "category": "food", "order": 14 },
  { "title": "Bodegón Campestre", "description": "Classic Canarian roadside grill near La Esperanza. No reservations; queue with the locals.", "category": "food", "order": 15 },
  { "title": "Tasca Silbo Gomero", "description": "Traditional Canarian, La Laguna. Named after the whistled language.", "category": "food", "order": 16 },
  { "title": "La Laguna Old Town", "description": "UNESCO World Heritage city. Half-day wander, lunch in the old quarter.", "category": "culture", "order": 17 },
  { "title": "Garachico", "description": "The town the 1706 lava flow reshaped. Lava pools at El Caleton, lunch in the square. Easy half-day.", "category": "culture", "order": 18 },
  { "title": "Pyramids of Güímar", "description": "Six stepped stone structures of debated origin. Small museum and gardens; the full Heyerdahl story.", "category": "culture", "order": 19 },
  { "title": "Loro Parque", "description": "Large aquarium and zoo in Puerto de la Cruz. Note: controversial animal-welfare history (orca captivity in particular). Listed for completeness — decide as a group.", "category": "culture", "order": 20 }
]
```

### D.3 Motor category activities (5) — seed alongside D.2

Push to /content/activities/ with push(). These extend the 20 above.

```json
[
  { "title": "Rally Ciudad de La Laguna", "description": "Part of the Canary Islands Asphalt Rally Championship. Held in July — spectating is free and the stages through La Laguna's streets are exceptional. Check the calendar for 2027 dates.", "category": "motor", "order": 21 },
  { "title": "Rally Isla de Tenerife", "description": "Major local rally, part of the island championship calendar. Dates vary — worth checking if it falls during the trip window.", "category": "motor", "order": 22 },
  { "title": "Clásica de Tenerife", "description": "Regularity rally for historic classic cars, October/November. International teams. Not during our window but worth knowing about for the next visit.", "category": "motor", "order": 23 },
  { "title": "Subida al Boquerón", "description": "Recognised mountain hill climb organised by Sport Eventos Tenerife, typically March. The road is open to civilian vehicles at other times. The Keeper does not recommend attempting it in a standard rental.", "category": "motor", "order": 24 },
  { "title": "Karting Club Tenerife", "description": "Go-kart circuit for when the urge to go fast meets the wisdom of not doing it on a public road. All skill levels. The Keeper has reviewed the safety record. It is acceptable.", "category": "motor", "order": 25 }
]
```

---

## §E — Verification Checklist (run before Phase 3 ships)

- [ ] Spot-check 5 random fun facts against current sources; audit the category if any are wrong
- [ ] Confirm Mount Teide permit booking process and current lead time
- [ ] Confirm Masca Gorge access status — activity description already flags it
- [ ] Re-verify each restaurant: open? same chef? Michelin status if claimed?
- [ ] Decide on Loro Parque given welfare context — adjust description or remove
- [ ] Confirm IGIC rate is current (changes occasionally with Spanish budget cycles)
- [ ] Confirm UTC+0 timezone offset is correct for late May 2027 (check DST)
- [ ] Designer-persona check: diary entries readable on 375px phone; Keeper's addendum visually distinct at mobile widths

---

## §F — Acceptance Checklist

- [ ] Voyage page diary feed loads with all 3 seed entries, newest-first (arr-001, voy-014, dep-001)
- [ ] voy-014 has **no** Keeper's addendum — confirm that section is absent on that card
- [ ] dep-001 and arr-001 show Keeper's addendum with distinct visual treatment (off-white background, moss border, NOTES FOR ACCURACY label, signature line)
- [ ] Fun fact appears in footer; different fact on reload; `seenFactIds` in localStorage updates
- [ ] After seeing all 50 facts, cycle resets cleanly (no blank, no infinite loop)
- [ ] Admin → Diary tab: compose a new entry with Keeper's note → Publish → appears on voyage page without page refresh
- [ ] Admin → Diary tab: edit entry → save → feed updates; Keeper note can be added or cleared
- [ ] Admin → Diary tab: delete entry with confirm dialog → feed updates
- [ ] Preview renders both Captain body and Keeper note correctly
- [ ] Confirmed-yes non-admin cannot see admin tab or write to `/content/diary`
- [ ] `grep -r 'console\.log' apps/nassims-folly/` — no user data in output
- [ ] Append entry to `/change_log.md`

---

## Open Items (Not Blocking Phase 3)

| Item | Notes |
|---|---|
| More diary entries | Monthly cadence going forward; add via admin compose UI |
| Keeper's origin-story entry | Mid-2026: the pinned-charter event that coined the title |
| Fun fact second wave | T-minus-30 and T-minus-7 facts, more trip-specific |
| Activities render UI (Phase 4) | Data is seeded; Phase 4 builds the section |
| Property gallery (Phase 4) | Waiting on property confirmation |
| Diary image uploads | Currently accepts `image_url` string; Firebase Storage is Phase 4+ |
| Export-all-content button | Phase 5 — run before archiving post-trip |
| Kite weather widget | Phase 4 | 3 spots: El Médano, Cabezo, Playa de la Tejita. Open-Meteo Weather + Marine APIs. Wind knots + wave height + 7-day forecast. localStorage cache 2hr TTL. |
| Paragliding conditions widget | Phase 4 | Calm-thermal parameters: wind 8–22 km/h, cloud base, thermal index, precipitation. Sites: Tenerife South (tandem), Teide area (XC thermal), Lanzarote Famara (day trip). Traffic light: Fly / Marginal / No-fly. |
| Moustache/parakite conditions widget | Phase 4 | High-wind parameters: 15–25+ knots (share Open-Meteo fetch with kite widget). Sites: Lanzarote Tenesar/Playa Teneza, Lanzarote Famara, Fuerteventura dunes. All day trips via Binter Canarias (~55 min TFS→ACE). Traffic light: Send it / Marginal / Ground day. |
| Activity ranker widget | Phase 4 | Daily/7-day forecast → scores all activity categories (wind/air/water/wheels/feet/motor/food/culture). Ranks by day. Uses shared Open-Meteo fetch. J.D.M. writes good-weather copy; Keeper writes bad-weather copy. |
| Required Viewing section | Phase 4 | 3 video cards (Option B — standalone block, not inline with activities). Steven Akkersdijk (kite), Ken Block Gymkhana (motor), Travis Pastrana Gymkhana (motor). J.D.M. captions on each. Keeper addendum on Pastrana: "Technique." |
| Air activity entries (3) | Phase 4 | Seed to /content/activities/: Moustache Soaring Tenesar (order 28), Moustache/Paragliding Famara (order 29), Moustache/Parakite Fuerteventura (order 30). Binter Canarias ~55 min from TFS/TFN noted in each description. |
