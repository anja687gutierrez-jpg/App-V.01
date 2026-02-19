import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  MapPin, Navigation, Clock, Battery, Zap, Sun, Car, User,
  Activity, Play, Plus, Youtube, Utensils, Map, Star, Tent,
  Settings2, Eye, EyeOff, TrendingUp, Bot, Heart, Mountain,
  Palette, Ticket, Sparkles, Droplets, Wind, Thermometer, Cloud,
  ChevronRight, CheckCircle2, MessageCircle, Bookmark, Timer,
  Trophy, Award, Lightbulb
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuickPlanDialog } from '@/components/QuickPlanDialog';
import { AIItineraryWizard } from '@/components/wizard/AIItineraryWizard';
import { CurrentStatusWidget } from '@/components/CurrentStatusWidget';
import { NextStopWidget } from '@/components/NextStopWidget';
import { NearbyPOIs } from '@/components/NearbyPOIs';
import { TierBadge } from '@/components/TierBadge';
import { useDashboardStats, useCurrentTrip, useGeolocation, usePOIToRoute, useNavigationState, useVehicle } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { getUserMembership } from '@/lib/featureFlags';
import { weatherService, type WeatherData } from '@/services/weatherService';
import { useAuth } from '@/contexts/AuthContext';
import type { MembershipTier } from '@/types';
import { PERSONAS } from '@/lib/personas';
import { VehicleStatusCard } from '@/components/vehicle/VehicleStatusCard';

// --- REMOVED CONTEXT IMPORT FOR SAFE MODE ---
// import { useTrip } from '@/context/TripContext';

// --- HELPER: SAFE FORMATTING ---
const formatDistance = (meters?: number) => {
  if (typeof meters !== 'number') return '-- mi';
  return `${(meters * 0.000621371).toFixed(1)} mi`;
};

const formatDuration = (minutes?: number) => {
  if (typeof minutes !== 'number') return '-- min';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

// --- COMPANION LOOKUP TABLE (derived from shared personas) ---
const USE_DICEBEAR_AVATARS = true; // Toggle this to false to use icons only

const COMPANION_DATA: Record<string, {
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  description: string;
  personality: string;
  expertise: string[];
  avatarUrl: string;
}> = Object.fromEntries(
  Object.values(PERSONAS).map(p => [p.id, {
    name: p.name,
    icon: p.icon,
    color: p.textColor,
    bg: p.iconBg,
    description: p.description,
    personality: p.personality,
    expertise: p.expertise,
    avatarUrl: p.avatarUrl,
  }])
);

// --- MOCK DATA FOR TRENDING (Stable) ---
const TRENDING_TRIPS = [
  {
    id: 't1',
    name: 'California Coast Highway',
    start: 'San Francisco, CA',
    end: 'Los Angeles, CA',
    distance: 732000,
    duration: 540,
    status: 'active',
    image: 'https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 't2',
    name: 'Rocky Mountain Explorer',
    start: 'Denver, CO',
    end: 'Aspen, CO',
    distance: 257000,
    duration: 220,
    status: 'planned',
    image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

// --- ROTATING GREETING SUBTITLES ---
const GREETING_SUBTITLES = [
  'Ready for your next adventure along the Pacific Coast?',
  'The open road is calling — where will you go today?',
  'Every mile tells a story. What\'s yours?',
  'Sun\'s out, routes mapped. Let\'s ride.',
  'Your next great road trip starts right here.',
  'Adventure awaits just around the bend.',
  'Time to chase some horizons.',
  'New roads, new memories. Let\'s go.',
];

// --- QUICK ACTIONS DATA ---
const QUICK_ACTIONS = [
  { label: 'Plan Trip', icon: Plus, href: '/plan', bg: 'bg-blue-50', color: 'text-blue-600', hoverBg: 'hover:bg-blue-100' },
  { label: 'Find Charging', icon: Zap, href: '/discover', bg: 'bg-green-50', color: 'text-green-600', hoverBg: 'hover:bg-green-100' },
  { label: 'Ask AI Guide', icon: Bot, href: '/guide', bg: 'bg-purple-50', color: 'text-purple-600', hoverBg: 'hover:bg-purple-100' },
  { label: 'Browse Routes', icon: Map, href: '/trips', bg: 'bg-orange-50', color: 'text-orange-600', hoverBg: 'hover:bg-orange-100' },
];

// --- WEEKLY STATS DATA ---
const WEEKLY_STATS = {
  milesDriven: 142,
  poisVisited: 8,
  chargeSessions: 2,
  driveTime: '6h 23m',
  changePercent: 23,
};

// --- COMMUNITY FEED DATA ---
const COMMUNITY_POSTS = [
  {
    id: 'p1',
    userName: 'Sarah M.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    text: 'Just hit the most incredible viewpoint at Bixby Bridge! The fog rolling in made it absolutely magical.',
    imageUrl: 'https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg?auto=compress&cs=tinysrgb&w=600',
    route: 'Pacific Coast Highway',
    likes: 24,
    comments: 8,
    timeAgo: '2h ago',
  },
  {
    id: 'p2',
    userName: 'Mike R.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    text: 'Pro tip: the Buellton Supercharger has amazing tacos next door at El Rancho. 10/10 charge stop.',
    route: 'Supercharger Review',
    likes: 47,
    comments: 12,
    timeAgo: '5h ago',
  },
  {
    id: 'p3',
    userName: 'Elena K.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    text: 'Completed the full Big Sur loop in my Model Y! Battery held up perfectly with 2 charge stops.',
    imageUrl: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600',
    route: 'Big Sur Loop',
    likes: 63,
    comments: 15,
    timeAgo: '1d ago',
  },
];

// --- ACHIEVEMENTS DATA ---
const ACHIEVEMENTS = [
  { id: 'a1', label: 'First 100 Miles', icon: Trophy, earned: true, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'a2', label: 'Coast Explorer', icon: Mountain, earned: true, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'a3', label: '5 Charge Stops', icon: Zap, earned: true, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'a4', label: 'Night Owl', icon: Star, earned: false, color: 'text-slate-400', bg: 'bg-slate-50' },
];

// --- EV TIPS DATA ---
const EV_TIPS = [
  'Precondition your battery before fast charging in cold weather — it can cut charge time by 20%.',
  'Keep your tire pressure at the recommended PSI. Under-inflated tires can reduce range by up to 10%.',
  'Use regenerative braking on downhill stretches to recover energy and extend your range.',
  'Charge to 80% for daily driving — it\'s faster and better for long-term battery health.',
];

// Helper for safe strings
const getSafeString = (value: unknown, fallback: string) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === 'string') return obj.name;
    if (typeof obj.address === 'string') return obj.address;
    return fallback;
  }
  return fallback;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- ROTATING SUBTITLE (picked once per mount) ---
  const [greetingSubtitle] = useState(
    () => GREETING_SUBTITLES[Math.floor(Math.random() * GREETING_SUBTITLES.length)]
  );
  const [evTip] = useState(
    () => EV_TIPS[Math.floor(Math.random() * EV_TIPS.length)]
  );

  // --- MOCK PROFILE (Safe Mode) ---
  // This replaces the Context hook to prevent crashes
  const userProfile = {
    name: "Explorer",
    preferences: {
      avatarStyle: "guide" // Defaulting to 'Travel Bestie'
    }
  };

  // --- HOOKS ---
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { trip: currentTripRaw, isActive, elapsedTime } = useCurrentTrip();
  const { vehicle, trend, alerts, tripAnalysis } = useVehicle();
  const { addPOIToRoute } = usePOIToRoute();
  const { resumeNavigation } = useNavigationState();
  const { toast } = useToast();

  // --- LOCAL STATE ---
  const [visibleSections, setVisibleSections] = useState({
    statsRow: true,
    vehicleHealth: true,
    driverHealth: true,
    tripHero: true,
    statusWidgets: true,
    trending: true,
    communityFeed: true
  });

  // --- USER TIER STATE ---
  const [userTier, setUserTier] = useState<MembershipTier>('free');

  // --- WEATHER STATE ---
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // --- GPS TRACKING ---
  const { position: gpsPosition } = useGeolocation({
    watch: true,
    immediate: true,
  });

  // Initialize user tier on mount
  React.useEffect(() => {
    const userId = user?.email || user?.uid || 'anonymous';
    const tier = getUserMembership(userId);
    setUserTier(tier);
  }, [user]);

  // Fetch weather based on GPS coordinates or fallback to LA
  React.useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        let weatherData: WeatherData;

        if (gpsPosition) {
          // Use GPS coordinates
          weatherData = await weatherService.getWeatherByCoordinates(
            gpsPosition.latitude,
            gpsPosition.longitude
          );
        } else {
          // Fallback to Los Angeles
          weatherData = await weatherService.getWeatherByCity('Los Angeles,US');
        }

        setWeather(weatherData);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [gpsPosition]); // Re-fetch when GPS position changes

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- COMPANION LOGIC ---
  const activeCompanionKey = userProfile?.preferences?.avatarStyle || 'guide';
  const activeCompanion = COMPANION_DATA[activeCompanionKey] || COMPANION_DATA['guide'];

  // --- DRIVER HEALTH LOGIC ---
  const driverStatus = useMemo(() => {
    const hoursDriven = (elapsedTime || 0) / 60;
    if (hoursDriven > 4) return {
      status: 'Fatigue Risk', color: 'text-red-600', bg: 'bg-red-50', icon: Utensils, recommendation: 'Stop for a full meal & rest.'
    };
    if (hoursDriven > 2) return {
      status: 'Break Recommended', color: 'text-orange-600', bg: 'bg-orange-50', icon: Activity, recommendation: 'Stretch legs and hydrate.'
    };
    return {
      status: 'Fresh', color: 'text-green-600', bg: 'bg-green-50', icon: User, recommendation: 'Good to continue driving.'
    };
  }, [elapsedTime]);

  // --- DATA SANITIZATION ---
  const safeStats = useMemo(() => {
    if (!stats) return null;
    return stats;
  }, [stats]);

  const currentTrip = useMemo(() => {
    if (!currentTripRaw) return null;
    return {
      ...currentTripRaw,
      name: getSafeString(currentTripRaw.name, 'Pacific Coast Highway'),
      nextPoi: getSafeString(currentTripRaw.nextPoi, 'Big Sur Station'),
      eta: getSafeString(currentTripRaw.eta, '2:45 PM'),
      progress: currentTripRaw.progress || 12
    };
  }, [currentTripRaw]);

  if (statsLoading) return <div className="p-4 sm:p-8 text-center text-muted-foreground">Loading Dashboard...</div>;
  if (statsError) return <div className="p-4 sm:p-8 text-center text-red-500">Error loading dashboard data.</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full pb-12 px-1 sm:px-0">

      {/* 1. TOP HEADER & ACTIVE COMPANION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-4 md:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Good Afternoon, {userProfile?.name || 'Explorer'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base md:text-lg">{greetingSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

             {/* TIER BADGE - Compact next to Voice Guide */}
             <TierBadge
               tier={userTier}
               compact={true}
             />

             {/* ACTIVE COMPANION BADGE (Dynamic) with Popover */}
             <Popover>
               <PopoverTrigger asChild>
                 <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${activeCompanion.bg} border-transparent shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Current Guide:</span>
                   <activeCompanion.icon className={`h-4 w-4 ${activeCompanion.color}`} />
                   <span className={`text-sm font-bold ${activeCompanion.color}`}>
                     {activeCompanion.name}
                   </span>
                 </div>
               </PopoverTrigger>
               <PopoverContent className="w-80" align="end">
                 <div className="space-y-3">
                   {/* Header */}
                   <div className="flex items-center gap-3 border-b pb-2">
                     {USE_DICEBEAR_AVATARS ? (
                       <img
                         src={activeCompanion.avatarUrl}
                         alt={activeCompanion.name}
                         className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                       />
                     ) : (
                       <div className={`p-2.5 rounded-full ${activeCompanion.bg}`}>
                         <activeCompanion.icon className={`h-5 w-5 ${activeCompanion.color}`} />
                       </div>
                     )}
                     <div>
                       <h4 className={`font-bold text-sm ${activeCompanion.color}`}>
                         {activeCompanion.name}
                       </h4>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wide">AI Travel Companion</p>
                     </div>
                   </div>

                   {/* Description */}
                   <p className="text-xs text-slate-600 italic">{activeCompanion.description}</p>

                   {/* Personality */}
                   <div>
                     <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Personality:</p>
                     <p className="text-xs text-slate-600 leading-relaxed">{activeCompanion.personality}</p>
                   </div>

                   {/* Expertise */}
                   <div>
                     <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Areas of Expertise:</p>
                     <div className="space-y-1">
                       {activeCompanion.expertise.map((skill, idx) => (
                         <div key={idx} className="flex items-start gap-2">
                           <div className={`mt-1 w-1 h-1 rounded-full ${activeCompanion.bg} border-2 ${activeCompanion.color.replace('text-', 'border-')}`} />
                           <p className="text-xs text-slate-600 leading-relaxed">{skill}</p>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Change Guide CTA */}
                   <div className={`mt-3 p-2 rounded-md ${activeCompanion.bg}`}>
                     <p className="text-[10px] text-slate-600 leading-relaxed">
                       <strong>Tip:</strong> You can change your AI Guide in{' '}
                       <button
                         onClick={() => navigate('/profile')}
                         className={`underline font-semibold ${activeCompanion.color} hover:opacity-80`}
                       >
                         Profile & Settings
                       </button>
                     </p>
                   </div>
                 </div>
               </PopoverContent>
             </Popover>

             {/* WEATHER */}
             <Popover>
               <PopoverTrigger asChild>
                 <div className="hidden sm:flex items-center gap-2 text-sm font-medium bg-white shadow-sm text-slate-700 px-3 sm:px-4 py-2 rounded-full border cursor-pointer hover:bg-gray-50 transition-colors touch-target">
                    <Sun className="h-4 w-4 text-orange-500" />
                    {weatherLoading ? (
                      <div className="h-4 w-16 sm:w-24 bg-gray-200 rounded animate-pulse" />
                    ) : weather ? (
                      <span className="text-xs sm:text-sm">{weather.description}, {Math.round((weather.temperature * 9) / 5 + 32)}°F</span>
                    ) : (
                      <div className="h-4 w-16 sm:w-24 bg-gray-200 rounded animate-pulse" />
                    )}
                 </div>
               </PopoverTrigger>
               {weather && (
                 <PopoverContent className="w-64" align="end">
                   <div className="space-y-3">
                     {/* Header */}
                     <div className="border-b pb-2">
                       <h4 className="font-semibold text-sm text-gray-900">Los Angeles Weather</h4>
                       <p className="text-xs text-gray-500">Current conditions</p>
                     </div>

                     {/* Temperature */}
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-50 rounded-full">
                         <Thermometer className="h-4 w-4 text-blue-600" />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs text-gray-500">Temperature</p>
                         <p className="text-sm font-semibold text-gray-900">
                           {Math.round((weather.temperature * 9) / 5 + 32)}°F
                           <span className="text-xs text-gray-500 ml-2">
                             (Feels like {Math.round((weather.feelsLike * 9) / 5 + 32)}°F)
                           </span>
                         </p>
                       </div>
                     </div>

                     {/* Humidity */}
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-cyan-50 rounded-full">
                         <Droplets className="h-4 w-4 text-cyan-600" />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs text-gray-500">Humidity</p>
                         <p className="text-sm font-semibold text-gray-900">{weather.humidity}%</p>
                       </div>
                     </div>

                     {/* Wind Speed */}
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-gray-50 rounded-full">
                         <Wind className="h-4 w-4 text-gray-600" />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs text-gray-500">Wind Speed</p>
                         <p className="text-sm font-semibold text-gray-900">
                           {(weather.windSpeed * 2.237).toFixed(1)} mph
                         </p>
                       </div>
                     </div>

                     {/* Weather Condition */}
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-50 rounded-full">
                         <Cloud className="h-4 w-4 text-yellow-600" />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs text-gray-500">Conditions</p>
                         <p className="text-sm font-semibold text-gray-900">{weather.description}</p>
                       </div>
                     </div>
                   </div>
                 </PopoverContent>
               )}
             </Popover>

             {/* CUSTOMIZE BUTTON */}
             <Popover>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="gap-2 rounded-full h-10 w-10 sm:h-auto sm:w-auto sm:px-3 touch-target">
                      <Settings2 className="h-4 w-4" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="end">
                   <h4 className="font-semibold mb-2 text-sm">Dashboard Visibility</h4>
                   <div className="space-y-2">
                      {Object.keys(visibleSections).map((key) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                           <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="h-8 w-8 p-0 touch-target"
                             onClick={() => toggleSection(key as keyof typeof visibleSections)}
                           >
                             {visibleSections[key as keyof typeof visibleSections] ?
                               <Eye className="h-4 w-4 text-blue-600" /> :
                               <EyeOff className="h-4 w-4 text-slate-400" />
                             }
                           </Button>
                        </div>
                      ))}
                   </div>
                </PopoverContent>
             </Popover>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      {visibleSections.statsRow && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-in slide-in-from-top-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Routes</p>
                  <p className="text-2xl sm:text-3xl font-bold">{safeStats?.routes.total ?? 3}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
                  <Map className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Miles Traveled</p>
                  <p className="text-2xl sm:text-3xl font-bold">{Math.round((safeStats?.trips.totalDistance || 905)).toLocaleString()}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-full">
                  <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">POIs Visited</p>
                  <p className="text-2xl sm:text-3xl font-bold">{safeStats?.pois.visited ?? 12}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Trips Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold">{safeStats?.trips.completed ?? 2}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-orange-50 rounded-full">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. MAIN DASHBOARD GRID (SECTION 1: ACTIVE OPS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12">

        {/* === LEFT COLUMN: STATUS WIDGETS === */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 order-2 lg:order-1">

          {/* VEHICLE HEALTH */}
          {visibleSections.vehicleHealth && vehicle && (
            <VehicleStatusCard
              vehicle={vehicle}
              trend={trend}
              alerts={alerts}
              tripAnalysis={isActive && currentTripRaw?.distanceTraveled != null
                ? tripAnalysis(currentTripRaw.distanceTraveled * 0.000621371)
                : undefined}
              onViewHealth={() => navigate('/vehicle')}
            />
          )}

          {/* DRIVER HEALTH */}
          {visibleSections.driverHealth && (
            driverStatus.status === 'Fresh' ? (
              /* Compact single-row when Fresh */
              <Card className="border-l-4 border-l-green-500 shadow-sm animate-in fade-in">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-bold text-slate-800">Driver Health</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-none font-bold text-xs">
                      Fresh — Good to go
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Full card when warning/fatigue */
              <Card className={`border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all animate-in fade-in`}>
                <CardHeader className="pb-3 bg-slate-50/50 p-4 sm:p-6 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-800">
                    <driverStatus.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${driverStatus.color}`} /> Driver Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 p-4 sm:p-6 sm:pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-muted-foreground text-xs sm:text-sm">Condition</span>
                       <Badge variant="outline" className={`${driverStatus.bg} ${driverStatus.color} border-none font-bold text-xs`}>
                         {driverStatus.status}
                       </Badge>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase mb-1">Recommendation</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">{driverStatus.recommendation}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs touch-target">Find Food</Button>
                        <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs touch-target">Rest Area</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* CURRENT STATUS */}
          {currentTrip && isActive && visibleSections.statusWidgets && (
            <div className="animate-in slide-in-from-right-4">
               <CurrentStatusWidget
                  progress={50}
                  trafficStatus="Moderate Traffic"
                  weatherStatus="Clear Skies"
                  city="Santa Barbara"
               />
            </div>
          )}

          {/* NEXT STOP WIDGET — grouped with status cards */}
          {currentTrip && isActive && visibleSections.statusWidgets && (
            <div className="animate-in fade-in slide-in-from-bottom-8">
              <NextStopWidget
                 stationName="Tesla Supercharger"
                 chargingLevel={55}
                 eta={currentTrip.eta}
                 distance="12 miles"
                 recommendedChargeLevel={80}
                 currentBattery={55}
                 amenities={['Coffee', 'Restroom', 'WiFi', 'Shopping']}
                 isEVCharger={true}
                 alert="Recommended charge stop. High speed stalls available."
                 onNavigate={() => {}}
              />
            </div>
          )}

          {/* QUICK ACTIONS */}
          <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold text-slate-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.href)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg ${action.bg} ${action.hoverBg} transition-colors cursor-pointer group`}
                  >
                    <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className={`text-xs font-semibold ${action.color}`}>{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ACTIVITY STATS */}
          <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold text-slate-800">This Week</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 rounded-md"><Car className="h-3.5 w-3.5 text-blue-600" /></div>
                  <span className="text-sm text-slate-700 flex-1">{WEEKLY_STATS.milesDriven} miles driven</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-50 rounded-md"><MapPin className="h-3.5 w-3.5 text-purple-600" /></div>
                  <span className="text-sm text-slate-700 flex-1">{WEEKLY_STATS.poisVisited} POIs visited</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-green-50 rounded-md"><Zap className="h-3.5 w-3.5 text-green-600" /></div>
                  <span className="text-sm text-slate-700 flex-1">{WEEKLY_STATS.chargeSessions} charge sessions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-orange-50 rounded-md"><Timer className="h-3.5 w-3.5 text-orange-600" /></div>
                  <span className="text-sm text-slate-700 flex-1">{WEEKLY_STATS.driveTime} drive time</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {WEEKLY_STATS.changePercent}% more than last week
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* === CENTER/RIGHT COLUMN: HERO & NEXT STOP === */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6 order-1 lg:order-2">

            {/* HERO CARD */}
            {visibleSections.tripHero && (
              <Card className="overflow-hidden border-none shadow-xl relative group min-h-[250px] sm:min-h-[340px] flex flex-col justify-end animate-in fade-in transition-all">
                <div className="absolute inset-0 z-0">
                   <img
                     src="https://images.pexels.com/photos/238622/pexels-photo-238622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                     alt="Current Trip"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </div>

                <CardContent className="relative z-10 p-4 sm:p-6 md:p-10 text-white">
                  {currentTrip && isActive ? (
                    <div className="flex flex-col xl:flex-row justify-between items-end gap-4 sm:gap-8">
                      <div className="space-y-3 sm:space-y-4 max-w-2xl w-full">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                           <Badge className="bg-green-500 hover:bg-green-600 border-none px-2 sm:px-3 py-1 text-xs sm:text-sm animate-pulse shadow-lg shadow-green-900/20">
                              <Navigation className="h-3 w-3 mr-1" /> ACTIVE
                           </Badge>
                           <span className="font-mono text-green-300 font-bold tracking-wide text-xs sm:text-sm">{currentTrip.progress}% Complete</span>
                        </div>
                        <div>
                           <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-2 sm:mb-4 tracking-tight drop-shadow-md">{currentTrip.name}</h2>
                           <p className="text-slate-200 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed drop-shadow-sm hidden sm:block">
                             Driving south along Highway 1. Expect scenic views and moderate winding roads for the next 40 miles.
                           </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm font-bold pt-2 flex-wrap">
                           <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10"><MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" /> Next: {currentTrip.nextPoi}</span>
                           <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10"><Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" /> ETA: {currentTrip.eta}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full xl:w-auto">
                         <Button
                           size="lg"
                           className="h-12 sm:h-16 text-base sm:text-lg bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xl px-4 sm:px-8 touch-target active:scale-95"
                           onClick={() => {
                             if (currentTrip?.id) {
                               resumeNavigation(currentTrip.id);
                             } else {
                               console.error('[Dashboard] No trip ID available');
                               toast({
                                 title: "Error",
                                 description: "Unable to resume navigation. Trip data not found.",
                                 variant: "destructive",
                               });
                             }
                           }}
                         >
                            <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" /> Resume Drive
                         </Button>
                         <Button size="lg" variant="outline" className="h-12 sm:h-16 text-base sm:text-lg border-white/30 bg-black/20 text-white hover:bg-white/20 backdrop-blur-md px-4 sm:px-8 touch-target active:scale-95" onClick={() => navigate('/trips')}>
                            View Map
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-20">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-lg">Where to next?</h2>
                      <p className="text-base sm:text-lg text-white/90 font-medium italic mb-3 sm:mb-4 drop-shadow-md">Don't just drive — experience!</p>
                      <p className="text-slate-200 mb-6 sm:mb-10 text-sm sm:text-base md:text-xl max-w-lg mx-auto">Your customized AI travel plan awaits. Start a new adventure today.</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                         <QuickPlanDialog
                           onRouteCreated={() => navigate('/trips')}
                           trigger={
                             <Button size="lg" className="h-12 sm:h-16 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-xl shadow-blue-900/20 px-4 sm:px-8 touch-target active:scale-95">
                               <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> Plan New Trip
                             </Button>
                           }
                         />
                         <AIItineraryWizard
                           onTourGenerated={() => navigate('/trips')}
                           trigger={
                             <Button size="lg" variant="outline" className="h-12 sm:h-16 text-base sm:text-lg bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md px-4 sm:px-8 touch-target active:scale-95">
                               <Sparkles className="h-4 w-4 mr-2" /> Ask AI Guide
                             </Button>
                           }
                         />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* NEARBY POIS - Capped preview with "See all" link */}
            {visibleSections.statusWidgets && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-8 relative">
                <div className="max-h-[420px] overflow-hidden relative">
                  <NearbyPOIs
                    radiusKm={10}
                    showCategories={true}
                    onAddToRoute={addPOIToRoute}
                  />
                  {/* Gradient fade overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
                <div className="flex justify-center mt-2">
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold gap-1"
                    onClick={() => navigate('/nearby')}
                  >
                    See all nearby <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* COMMUNITY FEED */}
            {visibleSections.communityFeed && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-sm font-bold text-slate-800">Community Feed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="max-h-[400px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="space-y-4">
                        {COMMUNITY_POSTS.map((post) => (
                          <div key={post.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                            {/* Post header */}
                            <div className="flex items-center gap-2.5 mb-2">
                              <img
                                src={post.avatarUrl}
                                alt={post.userName}
                                className="w-8 h-8 rounded-full border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800">{post.userName}</span>
                                  <span className="text-xs text-slate-400">{post.timeAgo}</span>
                                </div>
                                {post.route && (
                                  <span className="text-xs text-blue-600 font-medium">{post.route}</span>
                                )}
                              </div>
                            </div>
                            {/* Post image */}
                            {post.imageUrl && (
                              <div className="rounded-lg overflow-hidden mb-2">
                                <img
                                  src={post.imageUrl}
                                  alt=""
                                  className="w-full h-36 object-cover"
                                />
                              </div>
                            )}
                            {/* Post text */}
                            <p className="text-sm text-slate-600 leading-relaxed mb-2">{post.text}</p>
                            {/* Interactions */}
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <Heart className="h-3.5 w-3.5" /> {post.likes}
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
                              </button>
                              <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors ml-auto">
                                <Bookmark className="h-3.5 w-3.5" /> Save
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ACHIEVEMENTS + EV TIP — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-800">Achievements</CardTitle>
                    <span className="text-xs text-slate-400 font-medium">{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {ACHIEVEMENTS.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg ${badge.bg} ${!badge.earned ? 'opacity-40' : ''}`}
                      >
                        <badge.icon className={`h-4 w-4 ${badge.color} flex-shrink-0`} />
                        <span className={`text-xs font-semibold ${badge.earned ? 'text-slate-700' : 'text-slate-400'} leading-tight`}>{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-amber-400">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="p-2 bg-amber-50 rounded-full h-fit">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">EV Tip of the Day</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{evTip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

        </div>
      </div>

      {/* ------------------- SECTION 2: DISCOVERY & INSPIRATION (Below Fold) ------------------- */}

      {/* 4. THE LAYOUT DIVIDER */}
      {visibleSections.trending && (
        <div className="relative my-6 sm:my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="h-4 w-4" /> Explore & Inspire
            </span>
          </div>
        </div>
      )}

      {/* 5. INSPIRATION CARDS (HORIZONTAL GRID) - FIXED NAN */}
      {visibleSections.trending && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
             <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Trending Adventures</h2>
             <Button variant="ghost" className="text-blue-600 text-xs sm:text-sm touch-target">View All</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

             {/* MANUAL MAPPING OF TRENDING TRIPS (Fixes NaN by using safe numbers) */}
             {TRENDING_TRIPS.map((trip) => (
               <Card key={trip.id} className="group hover:shadow-lg transition-all border-slate-200 overflow-hidden">
                 <div className="h-28 sm:h-32 relative">
                    <img src={trip.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2">
                      <Badge variant={trip.status === 'active' ? 'default' : 'secondary'} className={`text-xs ${trip.status === 'active' ? 'bg-green-500' : 'bg-slate-100 text-slate-600'}`}>
                        {trip.status}
                      </Badge>
                    </div>
                 </div>
                 <CardContent className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-md text-slate-900 mb-3 sm:mb-4 line-clamp-1">{trip.name}</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t border-slate-100 pt-3 sm:pt-4">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Distance</span>
                        <span className="text-xs sm:text-sm font-mono font-medium">{formatDistance(trip.distance)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Duration</span>
                        <span className="text-xs sm:text-sm font-mono font-medium">{formatDuration(trip.duration)}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 flex gap-2">
                       <Button size="sm" className={`w-full h-9 touch-target active:scale-95 ${trip.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900'}`} onClick={() => navigate('/trip-details')}>
                          {trip.status === 'active' ? 'Continue' : 'Preview'}
                       </Button>
                    </div>
                 </CardContent>
               </Card>
             ))}

             {/* VIDEO CARD */}
             <Card className="overflow-hidden border-none shadow-md group cursor-pointer flex flex-col h-full bg-slate-900 text-white hover:scale-[1.02] transition-transform">
               <div className="relative h-36 sm:h-48">
                 <img
                   src="https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800"
                   alt="Food Vlog"
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 text-white rounded-full p-2.5 sm:p-3 shadow-lg group-hover:scale-110 transition-transform">
                       <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                    </div>
                 </div>
                 <Badge className="absolute top-2 left-2 bg-red-600 text-white border-none flex gap-1 text-xs">
                    <Youtube className="h-3 w-3" /> Trending
                 </Badge>
               </div>
               <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                 <div>
                   <h4 className="font-bold text-base sm:text-lg leading-tight mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                     Ultimate American BBQ Tour
                   </h4>
                   <p className="text-slate-400 text-xs line-clamp-2 hidden sm:block">
                     Join Mark Wiens as he discovers the smokiest briskets across the South.
                   </p>
                 </div>
                 <div className="mt-3 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-medium">
                    <span className="truncate">Best Ever Food Review</span>
                    <span>1.2M Views</span>
                 </div>
               </CardContent>
             </Card>

             {/* CAMPING TIPS */}
             <Card className="overflow-hidden border-none shadow-md group cursor-pointer flex flex-col h-full bg-green-900 text-white hover:scale-[1.02] transition-transform">
               <div className="relative h-36 sm:h-48">
                 <img
                   src="https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=800"
                   alt="Camping Tips"
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                 />
                 <Badge className="absolute top-2 left-2 bg-green-600 text-white border-none flex gap-1 text-xs">
                    <Tent className="h-3 w-3" /> Pro Tips
                 </Badge>
               </div>
               <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                 <div>
                   <h4 className="font-bold text-base sm:text-lg leading-tight mb-2 group-hover:text-green-400 transition-colors">
                     Camping Hacks 101
                   </h4>
                   <p className="text-green-100/70 text-xs line-clamp-2 hidden sm:block">
                     Essential gear, safety tips, and how to find the best free campsites.
                   </p>
                 </div>
                 <Button variant="outline" size="sm" className="mt-3 sm:mt-4 w-full border-green-400/30 text-green-100 hover:bg-green-800 hover:text-white text-xs touch-target active:scale-95">
                    Read Guide
                 </Button>
               </CardContent>
             </Card>

          </div>
        </div>
      )}

    </div>
  );
}
