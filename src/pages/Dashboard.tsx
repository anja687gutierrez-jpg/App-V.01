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
  Palette, Ticket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuickPlanDialog } from '@/components/QuickPlanDialog';
import { AIItineraryWizard } from '@/components/wizard/AIItineraryWizard';
import { CurrentStatusWidget } from '@/components/CurrentStatusWidget';
import { NextStopWidget } from '@/components/NextStopWidget';
import { useDashboardStats, useCurrentTrip } from '@/hooks';

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
const COMPANION_DATA: Record<string, { name: string; icon: any; color: string; bg: string }> = {
  tech: { name: 'Tech Droid', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  guide: { name: 'Travel Bestie', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' },
  ranger: { name: 'Ranger Scout', icon: Mountain, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  foodie: { name: 'Flavor Scout', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100' },
  artist: { name: 'The Artist', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-100' },
  celebrity: { name: 'Star Spotter', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  event: { name: 'Event Pro', icon: Ticket, color: 'text-cyan-600', bg: 'bg-cyan-100' },
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

  // --- LOCAL STATE ---
  const [visibleSections, setVisibleSections] = useState({
    statsRow: true,
    vehicleHealth: true,
    driverHealth: true,
    tripHero: true,
    statusWidgets: true,
    trending: true
  });

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

  if (statsLoading) return <div className="p-8 text-center text-muted-foreground">Loading Dashboard...</div>;
  if (statsError) return <div className="p-8 text-center text-red-500">Error loading dashboard data.</div>;

  return (
    <div className="space-y-8 animate-fade-in w-full pb-12">
      
      {/* 1. TOP HEADER & ACTIVE COMPANION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Good Afternoon, {userProfile?.name || 'Explorer'}
          </h1>
          <p className="text-slate-500 mt-1 text-lg">Ready for your next adventure along the Pacific Coast?</p>
        </div>
        <div className="flex items-center gap-3">
             
             {/* ACTIVE COMPANION BADGE (Dynamic) */}
             <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${activeCompanion.bg} border-transparent shadow-sm`}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Current Guide:</span>
                <activeCompanion.icon className={`h-4 w-4 ${activeCompanion.color}`} />
                <span className={`text-sm font-bold ${activeCompanion.color}`}>
                  {activeCompanion.name}
                </span>
             </div>

             {/* WEATHER */}
             <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-white shadow-sm text-slate-700 px-4 py-2 rounded-full border">
                <Sun className="h-4 w-4 text-orange-500" />
                <span>72°F</span>
             </div>
             
             {/* CUSTOMIZE BUTTON */}
             <Popover>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="gap-2 rounded-full">
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
                             className="h-6 w-6 p-0" 
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                  <p className="text-3xl font-bold">{safeStats?.routes.total ?? 3}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-full">
                  <Map className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Miles Traveled</p>
                  <p className="text-3xl font-bold">{Math.round((safeStats?.trips.totalDistance || 905)).toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-full">
                  <Navigation className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">POIs Visited</p>
                  <p className="text-3xl font-bold">{safeStats?.pois.visited ?? 12}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-full">
                  <MapPin className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trips Completed</p>
                  <p className="text-3xl font-bold">{safeStats?.trips.completed ?? 2}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-full">
                  <Star className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. MAIN DASHBOARD GRID (SECTION 1: ACTIVE OPS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* === LEFT COLUMN: STATUS WIDGETS === */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* VEHICLE HEALTH */}
          {visibleSections.vehicleHealth && (
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all animate-in fade-in">
              <CardHeader className="pb-3 bg-slate-50/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Car className="h-5 w-5 text-green-600" /> Vehicle Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Model</span>
                    <span className="font-bold text-sm">Tesla Model Y</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Battery</span>
                      <span className="font-bold text-green-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2 bg-slate-100" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="text-muted-foreground text-sm">Range</span>
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Battery className="h-4 w-4 text-green-600" /> 280 mi
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4 text-green-700 hover:text-green-800 hover:bg-green-50 text-xs uppercase tracking-wide font-bold" onClick={() => navigate('/nearby')}>
                  View Charging Plan
                </Button>
              </CardContent>
            </Card>
          )}

          {/* DRIVER HEALTH */}
          {visibleSections.driverHealth && (
            <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all animate-in fade-in ${driverStatus.status === 'Fresh' ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
              <CardHeader className="pb-3 bg-slate-50/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <driverStatus.icon className={`h-5 w-5 ${driverStatus.color}`} /> Driver Health
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-muted-foreground text-sm">Condition</span>
                     <Badge variant="outline" className={`${driverStatus.bg} ${driverStatus.color} border-none font-bold`}>
                       {driverStatus.status}
                     </Badge>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase mb-1">Recommendation</p>
                    <p className="text-sm font-semibold text-slate-800">{driverStatus.recommendation}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs">Find Food</Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">Rest Area</Button>
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
        <div className="lg:col-span-9 space-y-6">
            
            {/* HERO CARD */}
            {visibleSections.tripHero && (
              <Card className="overflow-hidden border-none shadow-xl relative group min-h-[400px] flex flex-col justify-end animate-in fade-in transition-all">
                <div className="absolute inset-0 z-0">
                   <img 
                     src="https://images.pexels.com/photos/238622/pexels-photo-238622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                     alt="Current Trip"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </div>

                <CardContent className="relative z-10 p-10 text-white">
                  {currentTrip && isActive ? (
                    <div className="flex flex-col xl:flex-row justify-between items-end gap-8">
                      <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                           <Badge className="bg-green-500 hover:bg-green-600 border-none px-3 py-1 text-sm animate-pulse shadow-lg shadow-green-900/20">
                              <Navigation className="h-3 w-3 mr-1" /> ACTIVE NAVIGATION
                           </Badge>
                           <span className="font-mono text-green-300 font-bold tracking-wide">{currentTrip.progress}% Complete</span>
                        </div>
                        <div>
                           <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight drop-shadow-md">{currentTrip.name}</h2>
                           <p className="text-slate-200 text-lg md:text-xl font-medium leading-relaxed drop-shadow-sm">
                             Driving south along Highway 1. Expect scenic views and moderate winding roads for the next 40 miles.
                           </p>
                        </div>
                        <div className="flex items-center gap-4 text-white text-sm font-bold pt-2">
                           <span className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10"><MapPin className="h-4 w-4 text-orange-400" /> Next: {currentTrip.nextPoi}</span>
                           <span className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10"><Clock className="h-4 w-4 text-blue-400" /> ETA: {currentTrip.eta}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                         <Button size="lg" className="h-16 text-lg bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xl px-8" onClick={() => navigate('/navigation')}>
                            <Play className="h-6 w-6 mr-2 text-green-600" /> Resume Drive
                         </Button>
                         <Button size="lg" variant="outline" className="h-16 text-lg border-white/30 bg-black/20 text-white hover:bg-white/20 backdrop-blur-md px-8" onClick={() => navigate('/trips')}>
                            View Map
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">Where to next?</h2>
                      <p className="text-slate-200 mb-10 text-xl max-w-lg mx-auto">Your customized AI travel plan awaits. Start a new adventure today.</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                         <QuickPlanDialog
                           onRouteCreated={() => navigate('/trips')}
                           trigger={
                             <Button size="lg" className="h-16 text-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-xl shadow-blue-900/20 px-8">
                               <Plus className="h-6 w-6 mr-2" /> Plan New Trip
                             </Button>
                           }
                         />
                         <AIItineraryWizard
                           onTourGenerated={() => navigate('/trips')}
                           trigger={
                             <Button size="lg" variant="outline" className="h-16 text-lg bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md px-8">
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

        </div>
      </div>

      {/* ------------------- SECTION 2: DISCOVERY & INSPIRATION (Below Fold) ------------------- */}
      
      {/* 4. THE LAYOUT DIVIDER */}
      {visibleSections.trending && (
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="h-4 w-4" /> Explore & Inspire
            </span>
          </div>
        </div>
      )}

      {/* 5. INSPIRATION CARDS (HORIZONTAL GRID) - FIXED NAN */}
      {visibleSections.trending && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending Adventures</h2>
             <Button variant="ghost" className="text-blue-600">View All Categories</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             
             {/* MANUAL MAPPING OF TRENDING TRIPS (Fixes NaN by using safe numbers) */}
             {TRENDING_TRIPS.map((trip) => (
               <Card key={trip.id} className="group hover:shadow-lg transition-all border-slate-200 overflow-hidden">
                 <div className="h-32 relative">
                    <img src={trip.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2">
                      <Badge variant={trip.status === 'active' ? 'default' : 'secondary'} className={trip.status === 'active' ? 'bg-green-500' : 'bg-slate-100 text-slate-600'}>
                        {trip.status}
                      </Badge>
                    </div>
                 </div>
                 <CardContent className="p-4">
                    <h3 className="font-bold text-md text-slate-900 mb-4">{trip.name}</h3>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Distance</span>
                        <span className="text-sm font-mono font-medium">{formatDistance(trip.distance)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Duration</span>
                        <span className="text-sm font-mono font-medium">{formatDuration(trip.duration)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                       <Button size="sm" className={`w-full ${trip.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900'}`} onClick={() => navigate('/trip-details')}>
                          {trip.status === 'active' ? 'Continue' : 'Preview'}
                       </Button>
                    </div>
                 </CardContent>
               </Card>
             ))}

             {/* VIDEO CARD */}
             <Card className="overflow-hidden border-none shadow-md group cursor-pointer flex flex-col h-full bg-slate-900 text-white hover:scale-[1.02] transition-transform">
               <div className="relative h-48">
                 <img 
                   src="https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800"
                   alt="Food Vlog"
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 text-white rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                       <Play className="h-6 w-6 fill-current" />
                    </div>
                 </div>
                 <Badge className="absolute top-2 left-2 bg-red-600 text-white border-none flex gap-1">
                    <Youtube className="h-3 w-3" /> Trending
                 </Badge>
               </div>
               <CardContent className="p-4 flex-1 flex flex-col justify-between">
                 <div>
                   <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-red-400 transition-colors">
                     Ultimate American BBQ Tour
                   </h4>
                   <p className="text-slate-400 text-xs line-clamp-2">
                     Join Mark Wiens as he discovers the smokiest briskets across the South.
                   </p>
                 </div>
                 <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Best Ever Food Review Show</span>
                    <span>1.2M Views</span>
                 </div>
               </CardContent>
             </Card>

             {/* CAMPING TIPS */}
             <Card className="overflow-hidden border-none shadow-md group cursor-pointer flex flex-col h-full bg-green-900 text-white hover:scale-[1.02] transition-transform">
               <div className="relative h-48">
                 <img 
                   src="https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=800"
                   alt="Camping Tips"
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                 />
                 <Badge className="absolute top-2 left-2 bg-green-600 text-white border-none flex gap-1">
                    <Tent className="h-3 w-3" /> Pro Tips
                 </Badge>
               </div>
               <CardContent className="p-4 flex-1 flex flex-col justify-between">
                 <div>
                   <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-green-400 transition-colors">
                     Camping Hacks 101
                   </h4>
                   <p className="text-green-100/70 text-xs line-clamp-2">
                     Essential gear, safety tips, and how to find the best free campsites.
                   </p>
                 </div>
                 <Button variant="outline" size="sm" className="mt-4 w-full border-green-400/30 text-green-100 hover:bg-green-800 hover:text-white text-xs">
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