# Template: static-firebase

Single-file HTML app with Firebase Realtime Database and a name-based login.
Derived from the ride-tracker exemplar. Copy the whole folder; do not edit in place.

## What to swap before using

| Placeholder | Where | What to put |
|---|---|---|
| `{{APP_TITLE}}` | `<title>` | Browser tab title |
| `{{APP_NAME}}` | h1 headings | Your app's display name |
| `{{APP_TAGLINE}}` | subtitle div | Short descriptor, e.g. "Real-Time Collaboration" |
| `{{LOGIN_PROMPT}}` | login screen p | The line under the title, e.g. "Enter your name to get started" |
| `{{APP_DESCRIPTION}}` | login screen footnote | One-line description shown at login |
| `{{LOG_HEADING}}` | Log Entry view h2 | e.g. "Log a Ride" |
| `{{TYPE_LABEL}}` | select label | e.g. "Session Type" |
| `{{ITEM_TYPE_1}}` | first select option | e.g. "Mountain Bike" |
| `{{ITEM_TYPE_2}}` | second select option | e.g. "Kite Surf" |
| `{{NOTES_PLACEHOLDER}}` | textarea placeholder | e.g. "Conditions, highlights…" |
| `{{SUBMIT_LABEL}}` | submit button | e.g. "Log Session" |
| `{{HISTORY_HEADING}}` | History view h2 | e.g. "Session History" |
| `{{STATS_HEADING}}` | Stats view h2 | e.g. "Crew Stats" |
| All `{{FIREBASE_*}}` | firebaseConfig object | Your project's Firebase config values |

## Firebase config

Copy your config from Firebase Console → Project settings → Your apps.
See `.claude/instructions/firebase-setup.md` for full setup steps.
See `firebase-config.example.js` in this folder for the config shape.

## After copying

1. `cp -r templates/static-firebase apps/<your-app-name>/`
2. Replace all `{{PLACEHOLDER}}` values in `index.html`
3. Wire in your Firebase config
4. Review Firebase security rules before sharing the live URL
5. Update `apps/<your-app-name>/README.md` with the live URL
6. Add the live URL to the root `README.md` app index
