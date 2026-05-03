# Firebase Setup

Step-by-step guide for wiring a new Web Apps Lab project into Firebase.
Run a Skeptic-persona pass before sharing any live URL — rules are the gate,
not the config.

---

## 1. Create the project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. Name it `wal-<app-name>` — e.g. `wal-ride-tracker`. The `wal-` prefix keeps
   Web Apps Lab projects identifiable in the Firebase and Google Cloud consoles.
3. **Disable Google Analytics.** These are fun apps; you don't need the data
   pipeline and it adds a consent surface you don't want to think about.
4. Region: pick **us-west1** (Oregon) as the default. It's the closest GCP
   region to Port Coquitlam and has the lowest latency for the expected user base.
   If a future app has users primarily elsewhere, override then.

---

## 2. Pick your database

**Default: Realtime Database (RTDB).** Use it unless you have a concrete reason
not to. It's simpler to reason about, has better offline support for this pattern
(single-file HTML + vanilla JS), and the free tier is more generous for small apps.

**Switch to Firestore only when you need:**
- Complex queries (filtering + sorting on multiple fields simultaneously)
- Offline-first sync with automatic conflict resolution
- A document/collection model that maps cleanly to your data shape

**The tradeoff:** RTDB is a single JSON tree — good for live-sync and simple
key-value shapes, awkward for ad-hoc queries. Firestore is a document store —
better for relational-ish queries, but the free tier is tighter (50K reads/day,
20K writes/day vs. RTDB's bandwidth-based limit) and the SDK is heavier. For
anything ride-tracker-shaped, RTDB is the right call.

**To create an RTDB instance:**

1. Firebase Console → **Realtime Database** → **Create Database**
2. Select region (match your project region: `us-west1` → pick **United States**)
3. Start in **test mode** — you'll tighten rules in section 5 before sharing

---

## 3. Get the web config

1. Firebase Console → gear icon → **Project settings**
2. Under **Your apps**, click the web icon `</>` → **Register app**
3. Give it a nickname (e.g. `ride-tracker-web`); skip Firebase Hosting
4. Copy the `firebaseConfig` object — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "wal-your-app.firebaseapp.com",
  databaseURL: "https://wal-your-app-default-rtdb.firebaseio.com",
  projectId: "wal-your-app",
  storageBucket: "wal-your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**The config is public.** It identifies the project; it does not authorize
access. Anyone who finds it can only do what the database rules allow.
If your rules are tight (section 5), the config being in your repo is fine.
If your rules are open, a leaked config is a real problem — but the fix is
tighter rules, not hiding the config.

The `databaseURL` field is required for RTDB in some SDK versions. Make sure
it's present. If the Firebase Console omits it from the snippet, construct it
manually: `https://<project-id>-default-rtdb.firebaseio.com`.

---

## 4. Wire it into the app

Use `type="module"` imports from the Firebase CDN — no build step, no npm,
works directly in a single-file HTML app. This is the pattern used in all
Web Apps Lab apps as of SDK `10.7.1`:

```html
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
  import { getDatabase, ref, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

  const firebaseConfig = {
    apiKey: "{{FIREBASE_API_KEY}}",
    authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
    databaseURL: "{{FIREBASE_DATABASE_URL}}",
    projectId: "{{FIREBASE_PROJECT_ID}}",
    storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
    messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{FIREBASE_APP_ID}}"
  };

  let app, db;
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (error) {
    console.error('Firebase init failed, using localStorage fallback');
    window.useLocalStorage = true;
  }
</script>
```

Replace the `{{PLACEHOLDER}}` values with your project's config. The
`localStorage` fallback lets the app remain functional when Firebase config
is missing or init throws — useful during development and for offline use.

If you need `set`, `update`, or other database functions, add them to the
import list from `firebase-database.js`. See `shared/snippets/firebase-init.js`
for the annotated reference pattern.

**Do not bump the SDK version speculatively.** Update it when a specific
feature or security fix requires it, test the app, and document it in
`docs/tooling-decisions.md`.

---

## 5. Security rules

Rules are the actual security gate. The Firebase config being in your repo
is fine; open rules are not. Test mode rules expire after 30 days, but
they expose your database to anyone with your project ID during that window.
Tighten rules before the first URL share.

### 5a. Baseline — 1 KB write cap, open read/write

The minimum tightening for any app with user-writable data. Allows open
access (friends-only use case) but prevents runaway writes from filling your
1 GB free-tier storage allocation.

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "$key": {
      ".validate": "newData.isString() && newData.val().length < 1024"
    }
  }
}
```

Appropriate for: internal tools, single-user apps, or apps you're testing
before adding proper structure.

### 5b. Namespaced-by-feature with shape constraints

The production baseline for multi-feature apps like ride-tracker. Each
top-level key maps to a feature; each feature enforces the expected shape.
Prevents a misbehaving client or curious stranger from writing garbage to
arbitrary paths.

```json
{
  "rules": {
    "entries": {
      ".read": true,
      ".write": true,
      "$entryId": {
        ".validate": "newData.hasChildren(['type', 'date', 'user', 'timestamp'])",
        "type":      { ".validate": "newData.isString() && newData.val().length < 64" },
        "date":      { ".validate": "newData.isString() && newData.val().length == 10" },
        "user":      { ".validate": "newData.isString() && newData.val().length < 64" },
        "timestamp": { ".validate": "newData.isString()" },
        "notes":     { ".validate": "newData.isString() && newData.val().length < 1024" },
        "$other":    { ".validate": false }
      }
    }
  }
}
```

The `$other: false` line rejects any field not explicitly listed — prevents
schema drift from a future code change silently persisting unexpected data.

### 5c. When to add Firebase Auth

Add anonymous auth when you need per-user data isolation — i.e., when users
should only be able to write or delete their own records, not anyone else's.
The name-based login pattern in ride-tracker has no enforcement: anyone can
claim any name and delete any record. That's acceptable for a two-person
friends app; it's not acceptable once the user base grows or data is sensitive.

**Anonymous auth gate pattern:**

```json
{
  "rules": {
    "entries": {
      ".read": "auth != null",
      "$entryId": {
        ".write": "auth != null && (!data.exists() || data.child('uid').val() == auth.uid)",
        ".validate": "newData.hasChildren(['type', 'date', 'uid', 'timestamp'])",
        "uid": { ".validate": "newData.val() == auth.uid" }
      }
    }
  }
}
```

With anonymous auth: users get a persistent `auth.uid` without signing up.
The rule above lets any authenticated user read all entries, but each user
can only write/delete records where `uid` matches their own.

Enable in Firebase Console → **Authentication** → **Sign-in method** →
**Anonymous** → Enable. Then call `signInAnonymously(auth)` at app init.

---

## 6. Free-tier ceilings (Spark plan)

**Realtime Database:**

| Limit | Value |
|---|---|
| Storage | 1 GB |
| Simultaneous connections | 100 |
| Download | 10 GB / month |

Friends-only apps with a handful of users will not come close to these
limits. A session log app with two users active daily will use well under
1 MB of storage and a few MB of download per month.

That said: set a **$0.01 budget alert** in Google Cloud Billing so you get
an email if anything unexpected happens (a traffic spike, a misconfigured
listener that polls repeatedly, or the free tier being restructured).

**How to set the alert:**
1. Google Cloud Console → **Billing** → your billing account →
   **Budgets & alerts** → **Create budget**
2. Scope: the Firebase project
3. Amount: $0.01
4. Alert threshold: 100%

This is a canary, not a spend cap. It fires before you'd ever owe anything,
giving you time to investigate.

Monitor storage and connections in Firebase Console → **Realtime Database** →
**Usage** tab. Check it the first week after sharing a new URL.

---

## 7. Pre-share checklist

Run this before sending the live URL to anyone.

- [ ] Database rules tightened from test mode (at minimum: section 5a baseline applied)
- [ ] Per-write payload cap in rules (`length < 1024` or equivalent)
- [ ] Malformed-write test passed: sent a write missing required fields; confirm Firebase rejected it
- [ ] Rapid-write test passed: hammered the submit button 20 times; confirm app didn't crash or create duplicate junk entries
- [ ] $0.01 budget alert set in Google Cloud Billing
- [ ] No real user data seeded in the database (use synthetic test data only)
- [ ] README includes no-warranty disclaimer: *"This is a personal project with no uptime guarantee. Data may be lost."*
