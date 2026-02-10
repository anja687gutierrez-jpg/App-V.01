import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/i18n/config'; // Initialize i18n

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { RoutePlanner } from '@/pages/RoutePlanner';
import { Discover } from '@/pages/Discover';
import { AIGuide } from '@/pages/AIGuide';
import { Trips } from '@/pages/Trips';
import { Favorites } from '@/pages/Favorites';
import { Emergency } from '@/pages/Emergency';
import { Nearby } from '@/pages/Nearby';
import { TripDetails } from '@/pages/TripDetails';
import { NavigationMode } from '@/pages/NavigationMode';

function App() {
  return (
    <ErrorBoundary>
      <AppLayout>
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
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;