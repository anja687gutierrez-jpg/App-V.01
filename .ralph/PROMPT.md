# Iconic Pathways USA - Phase 1: Core Trip Planning

## Context
You are Ralph, an autonomous AI agent working on "Iconic Pathways USA" - a React + TypeScript tour planning app for Tesla road trips. The app helps users plan routes through national parks with EV charging stops.

Tech stack:
- React 18 + TypeScript + Vite
- Firebase (auth, Firestore, functions)
- shadcn/ui components
- Tailwind CSS
- Mapbox or Google Maps (check existing code)

## Objectives
Complete these features in order. After each task, commit your changes and update progress.

## Tasks

### 1. Route Planner - Map Display
- [ ] Ensure map renders correctly on Route Planner page (`src/pages/RoutePlanner.tsx`)
- [ ] Add ability to set START location (search box or click on map)
- [ ] Add ability to set END location (search box or click on map)
- [ ] Display route line between start and end on the map
- [ ] Show estimated distance and drive time

**Acceptance Criteria:** User can enter start/end locations and see a route drawn on the map with distance/time.

### 2. Route Planner - Waypoints
- [ ] Allow adding waypoints (stops) between start and end
- [ ] Waypoints can be dragged to reorder
- [ ] Waypoints can be deleted
- [ ] Route recalculates when waypoints change

**Acceptance Criteria:** User can add multiple stops, reorder them, and see route update.

### 3. Charging Planner - Tesla Superchargers
- [ ] Fetch Tesla Supercharger locations (use NREL API or OpenChargeMap API)
- [ ] Display Superchargers along the planned route (within 10 miles of route)
- [ ] Show charger details on click (name, address, number of stalls)
- [ ] Calculate estimated battery level at each stop based on Tesla Model Y (280mi range)
- [ ] Warn if a leg exceeds comfortable range (suggest adding charging stop)

**Acceptance Criteria:** Route shows Superchargers nearby, with battery estimates at each leg.

### 4. My Trips - Save Trip
- [ ] Add "Save Trip" button on Route Planner
- [ ] Save trip to Firebase Firestore under user's account:
  - Trip name (user can edit)
  - Start/end locations
  - Waypoints array
  - Created date
  - Total distance/time
- [ ] Show success toast when saved
- [ ] Handle unauthenticated users (prompt to sign in or save locally)

**Acceptance Criteria:** User can save a planned trip and it persists in Firebase.

### 5. My Trips - Load & Display Trips
- [ ] My Trips page (`src/pages/Trips.tsx`) fetches user's saved trips from Firestore
- [ ] Display trips as cards showing: name, date, start→end, distance
- [ ] Click trip card to view details or continue editing
- [ ] Add delete trip functionality (with confirmation)

**Acceptance Criteria:** User sees their saved trips and can load or delete them.

## Key Principles
1. One task per loop iteration
2. Search existing code before creating new files
3. Use existing components from `src/components/ui/`
4. Follow existing code patterns and naming conventions
5. Commit after completing each checkbox item
6. Test in browser after each change if possible

## Files to Study First
- `src/pages/RoutePlanner.tsx` - Current route planner page
- `src/pages/Trips.tsx` - My trips page
- `src/components/map/EnhancedMapView.tsx` - Map component
- `src/components/tour/FuelPlanner.tsx` - Existing fuel/charging logic
- `src/lib/firebase.ts` - Firebase configuration
- `src/context/TripContext.tsx` - Trip state management
- `src/services/` - Existing API services

## Environment Variables Needed
Check `.env.local` for existing API keys. May need:
- `VITE_MAPBOX_TOKEN` or `VITE_GOOGLE_MAPS_KEY`
- `VITE_FIREBASE_*` credentials
- `VITE_NREL_API_KEY` for charging stations (free at https://developer.nrel.gov/)

## Status Reporting
End each response with:
```
---RALPH_STATUS---
COMPLETED: [list completed items]
CURRENT: [current task]
BLOCKED: [any blockers]
EXIT_SIGNAL: false
---END_STATUS---
```

Set `EXIT_SIGNAL: true` only when ALL tasks above are complete and tested.
