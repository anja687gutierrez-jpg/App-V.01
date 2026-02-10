import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/i18n/config'; // Initialize i18n

// Lightweight pages — load eagerly
import { Dashboard } from '@/pages/Dashboard';
import { Discover } from '@/pages/Discover';
import { Profile } from '@/pages/Profile';
import { Favorites } from '@/pages/Favorites';
import { Emergency } from '@/pages/Emergency';
import { Nearby } from '@/pages/Nearby';

// Heavy pages — lazy load (Leaflet maps, AI services, etc.)
const RoutePlanner = React.lazy(() => import('@/pages/RoutePlanner').then(m => ({ default: m.RoutePlanner })));
const AIGuide = React.lazy(() => import('@/pages/AIGuide').then(m => ({ default: m.AIGuide })));
const Trips = React.lazy(() => import('@/pages/Trips').then(m => ({ default: m.Trips })));
const TripDetails = React.lazy(() => import('@/pages/TripDetails').then(m => ({ default: m.TripDetails })));
const NavigationMode = React.lazy(() => import('@/pages/NavigationMode').then(m => ({ default: m.NavigationMode })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Navigation Pages */}
            <Route path="/plan" element={<RoutePlanner />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/guide" element={<AIGuide />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trip-details" element={<TripDetails />} />
            <Route path="/navigation" element={<NavigationMode />} />
            <Route path="/favorites" element={<Favorites />} />

            {/* User & Settings */}
            <Route path="/profile" element={<Profile />} />

            {/* Quick Actions */}
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/nearby" element={<Nearby />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
