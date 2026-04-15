# MatchMitra — Because Every Match Matters

A full-stack marriage bureau platform built with:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database/Auth/Storage: Firebase (Firestore, Authentication, Storage)

## Features

- Email/password + Google authentication
- Profile creation with completion percentage
- Match discovery with filters
- Interest workflow (pending/accepted/rejected)
- Chat unlocked only for accepted interests
- Trust & safety reporting with trust score and verified badge fields
- Dashboard with profile views/interests/matches/messages metrics
- Rule-based chatbot for common help queries

## Project Structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ Navbar.jsx
│  │  ├─ ProfileCard.jsx
│  │  ├─ FilterBar.jsx
│  │  ├─ ChatBox.jsx
│  │  ├─ ChatbotWidget.jsx
│  │  └─ ProtectedRoute.jsx
│  ├─ context/
│  │  └─ AuthContext.jsx
│  ├─ pages/
│  │  ├─ Login.jsx
│  │  ├─ Signup.jsx
│  │  ├─ Profile.jsx
│  │  ├─ Matches.jsx
│  │  ├─ Chat.jsx
│  │  └─ Dashboard.jsx
│  ├─ services/
│  │  ├─ firebase.js
│  │  ├─ firestoreService.js
│  │  └─ api.js
│  ├─ firebase/
│  │  └─ config.js
│  ├─ App.jsx
│  └─ main.jsx
├─ server/
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ routes/
│  │  ├─ users.js
│  │  ├─ interests.js
│  │  ├─ chat.js
│  │  └─ reports.js
│  ├─ firebaseAdmin.js
│  ├─ index.js
│  ├─ package.json
│  └─ .env.example
├─ .env
└─ .env.example
```

## Firebase Setup Instructions

1. Create a Firebase project.
2. Enable Authentication providers:
	- Email/Password
	- Google
3. Create Firestore database in production or test mode.
4. Enable Firebase Storage.
5. Add a web app in Firebase and copy config values.
6. Fill frontend environment variables in root `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=http://localhost:5000/api
```

7. For backend admin access, set `server/.env` based on `server/.env.example`:
	- Either set `FIREBASE_SERVICE_ACCOUNT_JSON` (single-line JSON)
	- Or set `GOOGLE_APPLICATION_CREDENTIALS` to your service account file path

## Run the App

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on Vite default (`http://localhost:5173`).

## Firestore Collections Used

- `profiles`
- `interests`
- `chats/{chatId}/messages`
- `reports`

## Notes

- `trustScore` and `verified` are profile fields managed by moderation/admin workflow.
- Direct user rating is intentionally not implemented.
