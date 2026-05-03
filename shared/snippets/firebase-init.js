// shared/snippets/firebase-init.js
//
// Clean Firebase Realtime Database initialization pattern used across apps.
// Copy into your <script type="module"> block; do not import directly from here
// (this is a reference snippet, not a module).
//
// Replace {{FIREBASE_*}} placeholders with your project's values.
// See .claude/instructions/firebase-setup.md for setup steps.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, push, remove, onValue, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "{{FIREBASE_API_KEY}}",
    authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
    databaseURL: "{{FIREBASE_DATABASE_URL}}",
    projectId: "{{FIREBASE_PROJECT_ID}}",
    storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
    messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{FIREBASE_APP_ID}}"
};

// Initialize with graceful localStorage fallback for offline/dev use.
let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
} catch (error) {
    console.error('Firebase init failed, using localStorage fallback');
    window.useLocalStorage = true;
}

export { db, ref, set, push, remove, onValue, update };
