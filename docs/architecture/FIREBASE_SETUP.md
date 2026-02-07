# Firebase Backend Setup Guide

## Quick Start

You already have a Firebase account, so we'll set it up in minutes.

## 1. Create Firebase Project

```bash
# Go to https://console.firebase.google.com
# Create new project or use existing
# Enable Firestore Database (Start in production mode)
# Enable Authentication (Email/Google)
```

## 2. Firestore Schema (Minimal Design)

### Collections Structure

```
users/
├── {userId}
│   ├── email: string
│   ├── name: string
│   ├── preferences: { theme, units, ... }
│   ├── createdAt: timestamp
│
trips/
├── {tripId}
│   ├── userId: string (for filtering)
│   ├── routeId: string
│   ├── startTime: timestamp
│   ├── endTime: timestamp
│   ├── distanceTraveled: number
│   ├── fuelUsed: number
│   ├── fuelCost: number
│   ├── poisVisited: array of poiIds
│   ├── rating: number (1-5)
│   ├── notes: string
│   ├── status: "active" | "completed"
│
routes/ (STATIC - load once, cache client-side)
├── {routeId}
│   ├── name: string
│   ├── distance: number
│   ├── duration: number
│   ├── difficulty: string
│   ├── scenery: string
│   ├── highlights: array
│   ├── pois: array of poiIds
│   ├── status: string
│
pois/ (STATIC - load once, cache client-side)
├── {poiId}
│   ├── name: string
│   ├── type: "parking" | "attraction" | "roadside_assistance"
│   ├── lat: number
│   ├── lng: number
│   ├── rating: number
│   ├── price: number (if applicable)
│   ├── address: string
│
dashboardStats/ (AGGREGATED DATA - single read!)
└── {userId}
    ├── totalRoutes: number
    ├── totalTrips: number
    ├── totalDistance: number
    ├── averageRating: number
    ├── totalFuelCost: number
    ├── lastUpdated: timestamp
    └── trends: { ... }
```

## 3. Firestore Rules (Security)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Trips - users can only access their own
    match /trips/{tripId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Routes & POIs are public read
    match /routes/{document=**} {
      allow read: if true;
    }
    
    match /pois/{document=**} {
      allow read: if true;
    }
    
    // Dashboard stats - user specific
    match /dashboardStats/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Only Cloud Functions write
    }
  }
}
```

## 4. Cloud Functions Setup

Install Firebase CLI and initialize functions:

```bash
npm install -g firebase-tools
firebase login
firebase init functions

# Choose: Node.js, TypeScript, ESLint yes
```

### Key Functions

**1. GET /dashboardStats** (aggregated single call)
```typescript
// Returns: all stats user needs in ONE call
// Reduces: 3 Firestore reads → 1 read
exports.getDashboardStats = onRequest(async (req, res) => {
  const uid = req.query.uid;
  
  const userDoc = await db.collection('users').doc(uid).get();
  const trips = await db.collection('trips').where('userId', '==', uid).get();
  
  // Aggregate data
  const totalDistance = trips.docs.reduce((sum, doc) => sum + doc.data().distanceTraveled, 0);
  const avgRating = trips.docs.reduce((sum, doc) => sum + doc.data().rating, 0) / trips.size;
  
  return res.json({
    totalRoutes: 0, // from your routes collection
    totalTrips: trips.size,
    totalDistance,
    averageRating: avgRating,
    // ... other aggregated stats
  });
});
```

**2. GET /routes** (static, cache in browser)
```typescript
// Load once, cache forever (only ~50 routes)
// Client-side caching: use localStorage or React Query
exports.getRoutes = onRequest(async (req, res) => {
  // Cache headers: tell browser to keep for 1 year
  res.set('Cache-Control', 'public, max-age=31536000');
  
  const routes = await db.collection('routes').get();
  return res.json(routes.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })));
});
```

**3. POST /trips** (create trip)
```typescript
exports.createTrip = onRequest(async (req, res) => {
  const uid = req.body.userId;
  const tripData = req.body;
  
  const tripRef = await db.collection('trips').add({
    ...tripData,
    createdAt: new Date()
  });
  
  // Update user's dashboardStats
  await updateDashboardStats(uid);
  
  return res.json({ id: tripRef.id, ...tripData });
});
```

**4. GET /weather?lat=X&lng=Y** (external API - only when needed)
```typescript
// Only call when user asks for weather
// Cache result for 30 minutes
exports.getWeather = onRequest(async (req, res) => {
  const { lat, lng } = req.query;
  
  // Check Firebase cache first
  const cacheDoc = await db.collection('weatherCache')
    .doc(`${lat},${lng}`)
    .get();
  
  if (cacheDoc.exists && Date.now() - cacheDoc.data().timestamp < 30 * 60 * 1000) {
    return res.json(cacheDoc.data().weather);
  }
  
  // Call OpenWeather API
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lng=${lng}&appid=${process.env.OPENWEATHER_API_KEY}`
  );
  const weather = await response.json();
  
  // Cache it
  await db.collection('weatherCache').doc(`${lat},${lng}`).set({
    weather,
    timestamp: Date.now()
  });
  
  return res.json(weather);
});
```

## 5. Environment Variables

Create `.env.local` in your functions directory:

```
OPENWEATHER_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your_project_id
```

Get API key: https://openweathermap.org/api (free tier: 5-day forecast)

## 6. Deploy Functions

```bash
cd functions
npm run deploy

# Or deploy everything:
firebase deploy
```

## 7. Connect Frontend

Update `src/services/routeService.ts`:

```typescript
const API_BASE = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL;

export async function getAllRoutes(): Promise<Route[]> {
  // Browser will cache this automatically (1 year)
  const response = await fetch(`${API_BASE}/routes`);
  return response.json();
}

export async function createTrip(data: Trip): Promise<Trip> {
  const response = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

## 8. Data Strategy (Minimal API Calls)

### What We Cache (Never call API again)
- **Routes**: ~50 items, load once, cache in localStorage for a year
- **POIs**: ~100 items, load once, cache forever
- **User preferences**: ~500 bytes, cache locally

### What We Only Get When Needed
- **Weather**: Only when user explicitly views weather, cache for 30 mins
- **Trip history**: Load by user ID with pagination (10 trips per page)
- **Dashboard stats**: One aggregated call instead of 3 separate

### What We Avoid Completely
- Geocoding every address (pre-geocode in setup)
- Traffic data (not needed for MVP)
- Real-time transit updates (cache hourly)
- Complex analytics (aggregate monthly, store results)

## 9. Sample Data Setup

```bash
# Create sample routes and POIs in Firestore Console
# Or use Firebase SDK to seed data

const sampleRoutes = [
  { name: 'California Coast', distance: 380, ... },
  // ... 50 more
];

# Upload to routes collection
```

## 10. Performance Targets

- **Initial load**: < 2 seconds (routes + user data cached)
- **Dashboard**: 1 Firebase read (aggregated stats)
- **Trip creation**: 1 write + 1 update
- **Weather check**: 1 API call (cached for 30 mins)
- **Total API calls per session**: ~5-10 (vs 50+ without optimization)

## Summary

✅ **Minimal API Design**
- Firestore for user-specific data (trips, preferences)
- Static routes/POIs cached locally (load once)
- Aggregated endpoints (1 call = multiple data points)
- Weather only when needed (with caching)

✅ **Zero Unnecessary Data Fetching**
- No geocoding APIs
- No traffic/transit APIs
- No analytics APIs
- No unnecessary refreshes

✅ **Best User Experience**
- Instant route browsing (cached)
- Smooth trip tracking (Firebase real-time)
- Weather on demand (not forced)
- No loading spinners for static data

This approach will give you excellent performance with minimal backend cost! 🚀
