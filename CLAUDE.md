# CLAUDE.md - Tour Route Planner

## Project Overview

React/TypeScript app for tour route planning and logistics. Uses Firebase for authentication and data persistence.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Firebase (Firestore, Auth)
- **APIs:** OpenRouteService, Weather API

## Firebase Configuration

**Project ID:** `pathfinding-america-ag`
**Console:** https://console.firebase.google.com/project/pathfinding-america-ag

### Collections
- `trips` - User trip data (filtered by `userId`)
- `users/{userId}` - User profiles and settings

### Security Rules
Located in `firestore.rules`. Deploy with:
```bash
firebase deploy --only firestore:rules --project pathfinding-america-ag
```

### Environment Variables
Firebase config is in `.env.local`:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Development

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # Run linters
npm run test      # Run Vitest tests
```

## Key Files

- `src/lib/firebaseConfig.ts` - Firebase initialization & Firestore service
- `src/lib/firebase.ts` - Cloud Functions helpers
- `firebase-backend/` - Cloud Functions (TypeScript)
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes

## Data Flow

1. User authenticates via Firebase Auth
2. Trips saved to Firestore with `userId` field
3. Security rules enforce user can only access own data
4. Falls back to localStorage when offline/unauthenticated
