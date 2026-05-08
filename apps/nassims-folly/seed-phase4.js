// seed-phase4.js — Seeds 3 Phase 4 air activities to /content/activities/
//
// Usage (Node.js 18+):
//   FIREBASE_TOKEN=<token> node seed-phase4.js
//
// Get your token from the browser console after signing in:
//   firebase.auth().currentUser.getIdToken().then(t => console.log(t))
// or from any signed-in tab's JS console:
//   await firebase.auth().currentUser.getIdToken()

const DB_URL = 'https://wal-nassims-folly-default-rtdb.firebaseio.com';
const TOKEN  = process.env.FIREBASE_TOKEN;

const activities = [
  {
    title:       "Moustache Soaring — Tenesar / Playa Teneza",
    description: "Flare Moustache parakite along the lava cliffs near Tenesar in 15–25+ knots. Coastal terrain following, barrel rolls, high-speed cliff soaring. Experienced pilots only. Binter Canarias flies Tenerife → Lanzarote in ~55 min, multiple departures daily from TFS and TFN. Verify conditions before crossing.",
    category:    "air",
    order:       28
  },
  {
    title:       "Moustache / Paragliding — Famara Ridge",
    description: "600ft cliffs, 23km of ridge. Works for both traditional paragliding and Moustache depending on wind strength. NNW–NW wind for the full ridge run. Season peaks Oct–March; May/June flyable on the right day — verify conditions before booking the flight. Binter Canarias ~55 min from TFS/TFN.",
    category:    "air",
    order:       29
  },
  {
    title:       "Moustache / Parakite — Fuerteventura",
    description: "Sandy dunes and consistent coastal wind — the most forgiving Moustache terrain in the Canaries. 13m and 18m wings in 15–25 knot conditions. Binter Canarias flies Tenerife → Fuerteventura in ~45 min. Further than Lanzarote but worth it for ideal conditions.",
    category:    "air",
    order:       30
  }
];

async function seed() {
  if (!TOKEN) {
    console.error('Set FIREBASE_TOKEN env var first.');
    console.error('Get it from browser console: await firebase.auth().currentUser.getIdToken()');
    process.exit(1);
  }

  for (const activity of activities) {
    const res  = await fetch(`${DB_URL}/content/activities.json?auth=${TOKEN}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(activity)
    });
    const data = await res.json();
    if (data.name) {
      console.log(`✓ Seeded: ${activity.title} → ${data.name}`);
    } else {
      console.error(`✗ Failed: ${activity.title}`, data);
    }
  }
}

seed().catch(console.error);
