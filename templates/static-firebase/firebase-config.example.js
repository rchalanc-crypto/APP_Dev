// firebase-config.example.js
// Copy this shape into your index.html and fill in real values from:
// Firebase Console → Project settings → Your apps → (web icon)
//
// Do NOT commit real values. This file is safe to commit — it is
// a shape reference only. Your live config lives in index.html (Firebase
// client config is public by design; Firebase security rules protect data).

const firebaseConfig = {
    apiKey: "{{FIREBASE_API_KEY}}",
    authDomain: "{{FIREBASE_PROJECT_ID}}.firebaseapp.com",
    databaseURL: "https://{{FIREBASE_PROJECT_ID}}-default-rtdb.firebaseio.com",
    projectId: "{{FIREBASE_PROJECT_ID}}",
    storageBucket: "{{FIREBASE_PROJECT_ID}}.appspot.com",
    messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{FIREBASE_APP_ID}}"
};
