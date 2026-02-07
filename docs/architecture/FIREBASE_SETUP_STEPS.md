# Firebase + Frontend Integration Setup

## Step 1: Create Firebase Project

```bash
# Go to https://console.firebase.google.com
# Click "Create Project" or select existing

# Project settings:
# - Name: road-trip-app (or your choice)
# - Analytics: Optional
# - Default region: us-central1
```

## Step 2: Enable Firestore

```bash
# In Firebase Console:
# - Go to Build > Firestore Database
# - Click "Create Database"
# - Start in "Production mode"
# - Choose region: us-central1 (or nearest to you)
```

## Step 3: Set up Firebase Functions

```bash
# In project root:
cd firebase-backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
npm run deploy

# This creates your Cloud Functions with these endpoints:
# - getRoutes
# - getPOIs
# - getDashboardStats
# - getTrips
# - createTrip
# - updateTrip
# - getWeather
# - health
```

## Step 4: Configure Frontend

### Create .env.local in project root:

```env
# Firebase Functions URL (from firebase-backend deployment)
REACT_APP_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net

# Or for local testing:
REACT_APP_FIREBASE_FUNCTIONS_URL=http://localhost:5001/your-project-id/us-central1

# Optional: Use sample data (for offline testing)
REACT_APP_USE_SAMPLE_DATA=false
```

### Get your project ID:
```bash
# In Firebase Console > Project Settings
# Or run:
firebase projects:list
```

## Step 5: Add Sample Data to Firestore

### Option A: Upload via Firestore Console (recommended for first-time)

1. Open Firestore in Firebase Console
2. Create these collections:
   - `routes`
   - `pois`
   - `trips`
   - `users`

3. Add documents manually or import JSON

### Option B: Use Firebase SDK (programmatic)

```typescript
// Create a setup script to add sample data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Add sample routes
const sampleRoutes = [
  {
    name: 'California Coast Highway',
    distance: 380,
    duration: 7,
    difficulty: 'moderate',
    scenery: 'coastal',
    highlights: ['Golden Gate Bridge', 'Big Sur'],
    status: 'active'
  },
  // ... more routes
];

for (const route of sampleRoutes) {
  await addDoc(collection(db, 'routes'), route);
}
```

## Step 6: Test the Integration

### Local testing with emulator:

```bash
# Terminal 1: Run Firebase emulator
cd firebase-backend
npm run serve

# Terminal 2: Run frontend with sample data
REACT_APP_USE_SAMPLE_DATA=true npm run dev
```

### Production testing:

```bash
# After deploying functions
REACT_APP_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net npm run dev
```

## Step 7: Firestore Rules (Security)

In Firebase Console > Firestore > Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read routes and POIs (static data)
    match /routes/{document=**} {
      allow read: if true;
    }
    match /pois/{document=**} {
      allow read: if true;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can read/write their own trips
    match /trips/{tripId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    // Weather cache is public read
    match /weatherCache/{document=**} {
      allow read: if true;
    }
  }
}
```

## Step 8: Authentication (Optional but Recommended)

In Firebase Console > Authentication:

1. Click "Get started"
2. Enable: Email/Password
3. Enable: Google (recommended)

Update your frontend auth service to use Firebase Auth:

```typescript
import { Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}
```

## Step 9: API Key Management

### Get Firebase Config:

```bash
# In Firebase Console > Project Settings > Your apps
# Copy your Firebase config object

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Step 10: Monitor and Optimize

### Firebase Console features to use:

1. **Firestore > Indexes**
   - Check for missing indexes (Firebase will suggest)
   - Monitor query performance

2. **Functions > Monitoring**
   - Check execution time
   - Monitor memory usage
   - Review error logs

3. **Analytics** (optional)
   - Track user behavior
   - Monitor crash reports

## Minimal API Strategy Summary

✅ **What's in Firebase:**
- Routes (static, cached 1 year)
- POIs (static, cached 1 year)
- Trip history (user-specific)
- User preferences
- Weather cache (30 min)

✅ **What's NOT fetched repeatedly:**
- Geocoding (pre-geocoded)
- Traffic data (not needed for MVP)
- Complex analytics (monthly aggregates)
- Real-time transit (cached hourly)

✅ **API Call Budget:**
- Routes: 1 call ever (cached forever after)
- POIs: 1 call ever (cached forever after)
- Dashboard: 1 aggregated call per session
- Weather: 1 call per location (cached 30 min)
- Trips: 1 call per page load
- **Total: ~5-10 calls per session** (vs 50+ without optimization)

## Troubleshooting

### Functions not deploying?
```bash
cd firebase-backend
npm run build
firebase deploy --only functions
firebase functions:log
```

### Cloud Function errors?
```bash
# Check logs
firebase functions:log

# View specific error
firebase functions:log --limit 50
```

### CORS errors from frontend?
- Ensure corsHandler is in all functions
- Check that functionsUrl in .env.local is correct

### Cache not working?
- Open DevTools > Application > Local Storage
- Check for routes_cache key
- Clear cache: `localStorage.clear()`

## Next: Connect AI Service

Once Firebase is working, add AI features:
- OpenAI API for itinerary generation
- Google Cloud Speech-to-Text (optional)
- Claude/Gemini for narration

Start simple with Firebase first, add AI later! 🚀
