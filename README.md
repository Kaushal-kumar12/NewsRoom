# NewsRoom

Advanced News Publishing and Media Platform built from the SRS with React, Vite and Firebase-ready backend services.

## Local Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Firebase Backend Setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Create Cloud Firestore.
4. Enable Firebase Storage.
5. Copy `.env.example` to `.env` and fill in your Firebase web app values.
6. Restart the dev server.

When `.env` is present, the app uses:

- Firebase Auth for login and registration.
- Cloud Firestore collections: `users`, `roles`, `news`, `categories`, `subcategories`, `tags`, `media`, `comments`, `likes`, `bookmarks`, `notifications`, `advertisements`, `polls`, `auditLogs`, `settings`.
- Firebase Storage-ready helper for media paths like `media/news/{newsId}/images/...`.
- Firebase Analytics when supported by the browser.

## First Admin

Register a user in the app, then in Firebase Console update that user's `users/{uid}` document:

```json
{
  "role": "Super Administrator"
}
```

After that account reloads, it can access `/admin` and manage the newsroom.

## Deploy Rules

Use the included `firestore.rules`, `storage.rules`, and `firebase.json`.

```bash
firebase deploy --only firestore:rules,storage
```

For hosting:

```bash
npm run build
firebase deploy --only hosting
```

## Cloud Functions

The `functions/` folder includes:

- `publishScheduledNews`: publishes `SCHEDULED` articles whose `scheduledAt` time has arrived.
- `notifyBreakingNews`: sends an FCM topic notification and writes user notifications when breaking news is published.

Deploy after installing dependencies inside `functions/`:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```
