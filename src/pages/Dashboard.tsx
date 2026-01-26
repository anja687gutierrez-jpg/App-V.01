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
  Palette, Ticket, Sparkles, Droplets, Wind, Thermometer, Cloud
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuickPlanDialog } from '@/components/QuickPlanDialog';
import { AIItineraryWizard } from '@/components/wizard/AIItineraryWizard';
import { CurrentStatusWidget } from '@/components/CurrentStatusWidget';
import { NextStopWidget } from '@/components/NextStopWidget';
import { NearbyPOIs } from '@/components/NearbyPOIs';
import { TierBadge } from '@/components/TierBadge';
import { useDashboardStats, useCurrentTrip, useGeolocation, usePOIToRoute, useNavigationState } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { getUserMembership } from '@/lib/featureFlags';
import { weatherService, type WeatherData } from '@/services/weatherService';
import type { MembershipTier } from '@/types';

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

// --- COMPANION LOOKUP TABLE ---
const USE_DICEBEAR_AVATARS = true; // Toggle this to false to use icons only

const COMPANION_DATA: Record<string, {
  name: string;
  icon: any;
  color: string;
  bg: string;
  description: string;
  personality: string;
  expertise: string[];
  avatarUrl: string;
  avatarStyle: string;
}> = {
  tech: {
    name: 'Tech Droid',
    icon: Bot,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    description: 'Precise, logical, and helpful AI companion',
    personality: 'Analytical and detail-oriented with a focus on efficiency',
    expertise: ['Route optimization', 'Technical specifications', 'Data-driven recommendations', 'Real-time traffic analysis'],
    avatarUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=TechDroid&backgroundColor=c7d2fe',
    avatarStyle: 'bottts'
  },
  guide: {
    name: 'Travel Bestie',
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-100',
    description: 'Friendly, enthusiastic travel companion',
    personality: 'Warm and personable with local insider knowledge',
    expertise: ['Hidden gems', 'Local culture', 'Photo spots', 'Social travel tips', 'Meeting locals'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=fbcfe8',
    avatarStyle: 'avataaars'
  },
  ranger: {
    name: 'Ranger Scout',
    icon: Mountain,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    description: 'Outdoor adventure and nature expert',
    personality: 'Adventurous and conservation-focused',
    expertise: ['Hiking trails', 'National parks', 'Wildlife spotting', 'Camping sites', 'Outdoor safety'],
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RangerScout&backgroundColor=a7f3d0',
    avatarStyle: 'adventurer'
  },
  foodie: {
    name: 'Flavor Scout',
    icon: Utensils,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    description: 'Culinary expert and food lover',
    personality: 'Passionate about cuisine and local flavors',
    expertise: ['Local restaurants', 'Food trucks', 'Farmers markets', 'Regional specialties', 'Dietary options'],
    avatarUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23fed7aa"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="75">🧑‍🍳</text></svg>',
    avatarStyle: 'emoji'
  },
  artist: {
    name: 'The Artist',
    icon: Palette,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    description: 'Creative guide for scenic and artistic routes',
    personality: 'Imaginative and aesthetically driven',
    expertise: ['Scenic viewpoints', 'Art galleries', 'Architecture', 'Photography spots', 'Street art'],
    avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=TheArtist&backgroundColor=e9d5ff',
    avatarStyle: 'lorelei'
  },
  celebrity: {
    name: 'Star Spotter',
    icon: Star,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    description: 'Pop culture and entertainment specialist',
    personality: 'Trendy and in-the-know about hotspots',
    expertise: ['Filming locations', 'Celebrity hotspots', 'Trendy venues', 'Instagram-worthy spots', 'Pop culture sites'],
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=StarSpotter&backgroundColor=fef3c7&clip=true',
    avatarStyle: 'avataaars'
  },
  event: {
    name: 'Event Pro',
    icon: Ticket,
    color: 'text-cyan-600',
    bg: 'bg-cyan-100',
    description: 'Festival and event planning expert',
    personality: 'Organized and up-to-date on local happenings',
    expertise: ['Local events', 'Festivals', 'Concerts', 'Sports games', 'Seasonal activities'],
    avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=EventPro&backgroundColor=b6e3f4,c0aede,d1d4f9',
    avatarStyle: 'adventurer'
  },
};

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

// Helper for safe strings
const getSafeString = (value: any, fallback: string) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return value.name || value.address || fallback;
  }
  return fallback;
};

export function Dashboard() {
  const navigate = useNavigate();

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
    trending: true
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
    // In production, get from auth context
    const userId = 'test@example.com'; // Replace with actual authenticated user
    const tier = getUserMembership(userId);
    setUserTier(tier);
  }, []);

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
          <p className="text-slate-500 mt-1 text-sm sm:text-base md:text-lg">Ready for your next adventure along the Pacific Coast?</p>
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
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-2 lg:order-1">

          {/* VEHICLE HEALTH */}
          {visibleSections.vehicleHealth && (
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all animate-in fade-in">
              <CardHeader className="pb-3 bg-slate-50/50 p-4 sm:p-6 sm:pb-3">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-800">
                  <Car className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> Vehicle Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 p-4 sm:p-6 sm:pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs sm:text-sm">Model</span>
                    <span className="font-bold text-xs sm:text-sm">Tesla Model Y</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-muted-foreground">Battery</span>
                      <span className="font-bold text-green-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2 bg-slate-100" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="text-muted-foreground text-xs sm:text-sm">Range</span>
                    <div className="flex items-center gap-1 font-bold text-slate-800 text-xs sm:text-sm">
                      <Battery className="h-4 w-4 text-green-600" /> 280 mi
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4 text-green-700 hover:text-green-800 hover:bg-green-50 text-xs uppercase tracking-wide font-bold touch-target" onClick={() => navigate('/nearby')}>
                  View Charging Plan
                </Button>
              </CardContent>
            </Card>
          )}

          {/* DRIVER HEALTH */}
          {visibleSections.driverHealth && (
            <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all animate-in fade-in ${driverStatus.status === 'Fresh' ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
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

        </div>

        {/* === CENTER/RIGHT COLUMN: HERO & NEXT STOP === */}
        <div className="lg:col-span-9 space-y-4 sm:space-y-6 order-1 lg:order-2">

            {/* HERO CARD */}
            {visibleSections.tripHero && (
              <Card className="overflow-hidden border-none shadow-xl relative group min-h-[300px] sm:min-h-[400px] flex flex-col justify-end animate-in fade-in transition-all">
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
                             console.log('[Dashboard] Resume Drive clicked, trip:', currentTrip);
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

            {/* NEXT STOP WIDGET */}
            {currentTrip && isActive && visibleSections.statusWidgets && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-8">
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

            {/* NEARBY POIS - Always visible with GPS */}
            {visibleSections.statusWidgets && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-8">
                <NearbyPOIs
                  radiusKm={10}
                  showCategories={true}
                  onAddToRoute={addPOIToRoute}
                />
              </div>
            )}

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
