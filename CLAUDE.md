# CLAUDE.md - Tour Route Planner (App-V.01)

**Location:** `~/App-V.01/`
**Archived Original:** `Google Drive/Business/Archives/App-V.01-original-2026-02-01/`

## Project Overview

React/TypeScript app for tour route planning and logistics. Uses Firebase for authentication and data persistence.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Firebase (Firestore, Auth) - Direct client access
- **APIs:** OpenRouteService, Weather API

## Firebase Configuration

**Project ID:** `pathfinding-america-ag`
**Plan:** Spark (free tier)
**Console:** https://console.firebase.google.com/project/pathfinding-america-ag

### Architecture: Hybrid (Direct Firestore)

The app uses **direct Firestore calls** from the React frontend instead of Cloud Functions. This works on the free Spark plan.

```
React App → Firebase SDK → Firestore
                ↓
        Security Rules enforce access
```

**Why this approach:**
- Cloud Functions require Blaze (pay-as-you-go) plan
- Direct Firestore with security rules is equally secure
- Reduces latency (no function cold starts)
- `firebase-backend/` is preserved for future Blaze upgrade

### Collections

| Collection | Access | Description |
|------------|--------|-------------|
| `trips` | User-scoped | Trip data (filtered by `userId`) |
| `users/{userId}` | User-scoped | User profiles and settings |
| `routes` | Public read | Static route catalog |
| `pois` | Public read | Points of interest catalog |

### Security Rules

Located in `firestore.rules`. Deploy with:
```bash
firebase deploy --only firestore:rules --project pathfinding-america-ag
```

**Rule summary:**
- `trips` - Only owner can read/write (checks `userId` field)
- `users/{userId}` - Only that user can read/write
- `routes`, `pois` - Anyone can read, no one can write
- Everything else - Denied

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

**Note:** `.env.local` is gitignored. For new setup, get values from Firebase Console → Project Settings → Your Apps → Web App.

## Development

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # Run linters
npm run test      # Run Vitest tests
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/firebaseConfig.ts` | Firebase init, `firestoreService` (direct Firestore calls) |
| `src/lib/firebase.ts` | Cloud Functions helpers (unused on Spark plan) |
| `firebase-backend/` | Cloud Functions code (ready for Blaze upgrade) |
| `firestore.rules` | Security rules (deployed) |
| `firestore.indexes.json` | Firestore indexes |

### firestoreService Methods

```typescript
firestoreService.saveTrip(trip)        // Create trip
firestoreService.getUserTrips(userId)  // Get user's trips
firestoreService.getTripById(tripId)   // Get single trip
firestoreService.updateTrip(id, data)  // Update trip
firestoreService.deleteTrip(tripId)    // Delete trip
firestoreService.getRoutes()           // Get routes (cached 1 year)
firestoreService.getPOIs()             // Get POIs (cached 1 year)
```

## Data Flow

1. User authenticates via Firebase Auth
2. `firestoreService` calls Firestore directly using Firebase SDK
3. Security rules enforce user can only access own data
4. Routes/POIs cached in localStorage for 1 year
5. Falls back to localStorage when offline/unauthenticated

## Future: Upgrading to Blaze

If you need Cloud Functions later (e.g., for server-side weather API, webhooks):

1. Upgrade project to Blaze plan in Firebase Console
2. Set budget alert at $1 to prevent surprises
3. Deploy functions: `cd firebase-backend && npm run deploy`
4. Update frontend to use `callFirebaseFunction()` from `firebase.ts`

The `firebase-backend/` code includes:
- Token-based auth verification
- DEV_MODE for demo users (`X-Demo-User` header)
- Rate-limited weather endpoint with caching
