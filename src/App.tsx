import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

// --- SAFE MODE: Commented out the broken context ---
// import { TripProvider } from '@/context/TripContext'; 

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
  console.log("App initializing... Safe Mode active."); // Debugger log

  return (
    // REMOVED <TripProvider> wrapper to stop the crash
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
  );
}

export default App;