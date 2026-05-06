# Web Apps Lab

| App | Description | Live URL |
|---|---|---|
| [ride-tracker](apps/ride-tracker/) | Real-time collaborative MTB/kite session tracker | https://rchalanc-crypto.github.io/APP_Dev/ |
| [nassims-folly](apps/nassims-folly/) | Nassim's Folly with Roberto — private invite-only RSVP | https://follyintenerife.com/apps/nassims-folly/ |

---

[SETUP-GUIDE_kite_MTb.md](https://github.com/user-attachments/files/27277754/SETUP-GUIDE_kite_MTb.md)
# Ride Tracker - Real-Time Setup Guide

## 🎯 What You're Getting

A **real-time collaborative** ride tracking app that:
- ✅ Updates instantly for all users
- ✅ Works on ANY device (phone, tablet, PC)
- ✅ Tracks availability, sessions, and stats
- ✅ Free to host (using Firebase free tier)
- ✅ No servers to maintain

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Free Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Name it whatever you want (e.g., "ride-tracker")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Enable Realtime Database

1. In your Firebase project, click "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose your location (pick closest to you)
4. **IMPORTANT**: Select "Start in **test mode**" (allows read/write without auth)
5. Click "Enable"

### Step 3: Get Your Config

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Register your app (name it anything, e.g., "ride-tracker-web")
6. Copy the `firebaseConfig` object that appears

### Step 4: Update Your HTML File

1. Open `ride-tracker-realtime.html` in a text editor
2. Find this section (around line 675):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDemoKey123456789",
    authDomain: "ride-tracker-demo.firebaseapp.com",
    databaseURL: "https://ride-tracker-demo-default-rtdb.firebaseio.com",
    projectId: "ride-tracker-demo",
    storageBucket: "ride-tracker-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

3. Replace it with YOUR config from Firebase
4. Save the file

### Step 5: Use It!

**Option A: Simple (Local Use)**
- Just open the HTML file in your browser
- Share the file with your buddy
- Both open it and enter your names

**Option B: Better (Web Hosting)**
- Upload the HTML file to any web host:
  - GitHub Pages (free)
  - Netlify (free)
  - Firebase Hosting (free)
  - Your own web server
- Share the URL with your buddy
- Both of you can access it from anywhere

## 🔒 Security Note

The current setup uses "test mode" which allows anyone with the link to read/write data. This is fine for a private app between friends, but for added security:

1. In Firebase Console → Realtime Database → Rules
2. Change to:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Or add password protection if you want (more complex setup).

## 📱 How to Share With Your Buddy

**Method 1: Share the HTML File**
- Send them the updated HTML file (email, Dropbox, etc.)
- They open it in their browser
- Real-time sync works instantly!

**Method 2: Host Online (Recommended)**
- Upload to GitHub Pages / Netlify (easiest)
- Share the URL
- Anyone can access from any device

## 🎨 Customization

Want to customize? The file is fully self-contained HTML/CSS/JS. Easy to modify:
- Colors are in CSS variables at the top
- Add more locations in the dropdown
- Change the calendar range (currently 14 days)

## ❓ Troubleshooting

**"Live & Connected" not showing?**
- Check your Firebase config is correct
- Make sure Realtime Database is enabled
- Check browser console for errors (F12)

**Data not syncing between users?**
- Verify both users are using the same Firebase database
- Check database rules allow read/write
- Make sure both are online

**Want to reset all data?**
- Firebase Console → Realtime Database
- Delete the data manually
- Or click the trash icon on specific entries

## 💰 Cost

Firebase free tier includes:
- 10GB data storage
- 100 simultaneous connections
- 1GB data transfer/month

More than enough for tracking rides between friends! You won't hit these limits.

## 🔄 Updates

If I give you an updated version of the HTML file:
1. Your data is safe in Firebase (not in the HTML)
2. Just replace the old HTML file with the new one
3. Keep your Firebase config in the new file
4. All your data remains intact

---

Need help? The file has a localStorage fallback if Firebase isn't configured, so it'll work either way (just won't be real-time without Firebase).
