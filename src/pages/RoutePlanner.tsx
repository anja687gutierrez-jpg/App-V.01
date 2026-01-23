import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Save, ArrowLeft, MapPin, Zap, Sparkles, Bot, User,
  Send, Heart, Mountain, Utensils, Palette, Star, Ticket,
  Play, Pause, Map as MapIcon, X, Calendar, GripVertical, Loader2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePOIToRoute, useNavigationState } from '@/hooks';
import { routeService, openRouteService } from '@/services';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { getUserMembership } from '@/lib/featureFlags';
import { firestoreService, authService } from '@/lib/firebaseConfig';
import type { MembershipTier } from '@/types';

// --- REMOVED CONTEXT IMPORT FOR SAFE MODE ---
// import { useTrip } from '@/context/TripContext';

// --- 1. PERSONAS ---
const PERSONAS: Record<string, any> = {
  tech: {
    id: 'tech', name: 'Iconic Tech', role: 'System',
    color: 'bg-indigo-600', textColor: 'text-indigo-600', borderColor: 'border-indigo-200', bgSoft: 'bg-indigo-50',
    icon: Bot, greeting: "Systems nominal. Planning optimal route efficiency.",
    suggestionTitle: "Optimization Alert", suggestionText: "Traffic detected. Rerouting via Tesla Way saves 12m.",
    suggestionAction: "Apply Detour"
  },
  guide: {
    id: 'guide', name: 'Travel Bestie', role: 'Friend',
    color: 'bg-pink-500', textColor: 'text-pink-500', borderColor: 'border-pink-200', bgSoft: 'bg-pink-50',
    icon: Heart, greeting: "Omg, let's plan the perfect trip! I have so many ideas!",
    suggestionTitle: "Hidden Gem Alert!", suggestionText: "There is a secret waterfall just 10 mins off this route.",
    suggestionAction: "Add Waterfall"
  },
  ranger: {
    id: 'ranger', name: 'Ranger Scout', role: 'Guide',
    color: 'bg-emerald-600', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', bgSoft: 'bg-emerald-50',
    icon: Mountain, greeting: "Ready to map the terrain. Checking trail conditions.",
    suggestionTitle: "Scenic Overlook", suggestionText: "Elevation gain ahead. Perfect spot for a sunset photo.",
    suggestionAction: "Add Overlook"
  },
  foodie: {
    id: 'foodie', name: 'Flavor Scout', role: 'Connoisseur',
    color: 'bg-orange-500', textColor: 'text-orange-600', borderColor: 'border-orange-200', bgSoft: 'bg-orange-50',
    icon: Utensils, greeting: "Route plotting... searching for the best pie in the state.",
    suggestionTitle: "Must-Try Diner", suggestionText: "Rated 4.9 stars. Famous for their cherry pie.",
    suggestionAction: "Add Lunch"
  },
  artist: {
    id: 'artist', name: 'The Artist', role: 'Curator',
    color: 'bg-purple-600', textColor: 'text-purple-600', borderColor: 'border-purple-200', bgSoft: 'bg-purple-50',
    icon: Palette, greeting: "Let's curate a journey of color and light.",
    suggestionTitle: "Neon Museum", suggestionText: "A visual masterpiece awaits just off the highway.",
    suggestionAction: "Add Visit"
  },
  celebrity: {
    id: 'celebrity', name: 'Star Spotter', role: 'Insider',
    color: 'bg-yellow-600', textColor: 'text-yellow-700', borderColor: 'border-yellow-200', bgSoft: 'bg-yellow-50',
    icon: Star, greeting: "Mapping the route past the stars' estates.",
    suggestionTitle: "Filming Location", suggestionText: "You're passing the diner from that famous 90s movie!",
    suggestionAction: "Stop & Look"
  },
  event: {
    id: 'event', name: 'Event Pro', role: 'Promoter',
    color: 'bg-cyan-600', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', bgSoft: 'bg-cyan-50',
    icon: Ticket, greeting: "Scanning for festivals and live events nearby.",
    suggestionTitle: "Street Fair", suggestionText: "Live music starting in 20 minutes nearby.",
    suggestionAction: "Add Detour"
  }
};

const SIMULATION_DURATION = 15000;
type Message = { id: string; role: 'ai' | 'user'; text: string; };

// --- STEP 1: TIME HELPER ---
const addMinutes = (timeStr: string, minutes: number) => {
  if (!timeStr) return '00:00';
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(mins + minutes);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export function RoutePlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { getPendingPOI } = usePOIToRoute();
  const { getPendingNavigation, clearNavigation } = useNavigationState();

  // --- MOCK PROFILE (Safe Mode) ---
  const userProfile = {
    preferences: {
      avatarStyle: 'guide'
    }
  };

  // --- STATE ---
  const [tripName, setTripName] = useState('My Iconic Trip');
  const [startTime, setStartTime] = useState('08:00'); // Global Departure

  // Waypoints State (with lat/lng for map display)
  const [waypoints, setWaypoints] = useState([
    { id: 1, name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, time: '08:00', type: 'start', notes: 'Departing', battery: 100 },
    { id: 2, name: 'Tracy Supercharger', lat: 37.7396, lng: -121.4252, time: '09:45', type: 'charge', notes: 'Charge to 90%', battery: 45 },
    { id: 3, name: 'The Cozy Bean', lat: 37.6618, lng: -120.9980, time: '11:30', type: 'stop', notes: 'Lunch Stop', battery: 78 },
    { id: 4, name: 'Yosemite Valley Lodge', lat: 37.7459, lng: -119.5936, time: '15:00', type: 'destination', notes: 'Arrival', battery: 32 }
  ]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // AI & Sim State
  const [activePersona, setActivePersona] = useState<string>('guide');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // ORS Integration State
  const [userTier, setUserTier] = useState<MembershipTier>('free');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [remainingQuota, setRemainingQuota] = useState(2000);
  const [isSaving, setIsSaving] = useState(false);

  const buddy = PERSONAS[activePersona] || PERSONAS['guide'];

  // --- STEP 2: LOGISTICS ENGINE ---
  const recalculateLogistics = (currentStops: any[], start: string) => {
    let currentTime = start;
    let currentBattery = 100;

    return currentStops.map((stop, index) => {
      // Update waypoint types based on position
      let newType = stop.type;
      if (index === 0) newType = 'start';
      else if (index === currentStops.length - 1) newType = 'destination';
      else if (stop.type === 'start' || stop.type === 'destination') newType = 'stop';

      if (index === 0) {
        return { ...stop, type: newType, time: start, battery: 100, notes: 'Departing' };
      }

      const travelTime = 105;
      const drain = 22;

      currentTime = addMinutes(currentTime, travelTime);
      currentBattery = Math.max(0, currentBattery - drain);

      let autoNote = `Arrive ${currentBattery}%`;

      if (stop.type === 'charge') {
        currentTime = addMinutes(currentTime, 45);
        currentBattery = 90;
        autoNote = 'Charge to 90%';
      } else if (stop.type === 'stop' || stop.type === 'destination') {
        currentTime = addMinutes(currentTime, 60);
        autoNote += ' - Break';
      }

      return {
        ...stop,
        type: newType,
        time: currentTime,
        battery: currentBattery,
        notes: stop.notes === 'New Stop' || stop.notes.includes('Arrive') || stop.notes === 'Departing' || stop.notes === 'Arrival' ? autoNote : stop.notes
      };
    });
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setWaypoints(prev => {
      const newWaypoints = [...prev];
      const [draggedItem] = newWaypoints.splice(draggedIndex, 1);
      newWaypoints.splice(dropIndex, 0, draggedItem);
      return recalculateLogistics(newWaypoints, startTime);
    });

    setDraggedIndex(null);
    setDragOverIndex(null);

    toast({
      title: "Waypoint Reordered",
      description: "Route has been recalculated.",
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // --- EFFECTS ---

  // Load navigation data from QuickPlanDialog, My Trips, or Dashboard
  useEffect(() => {
    const navData = getPendingNavigation();

    if (navData) {
      console.log('[RoutePlanner] Loading navigation data:', navData);

      // Handle "start" mode - new trip from QuickPlanDialog
      if (navData.mode === 'start' && navData.waypoints) {
        setTripName(navData.routeName || 'My Iconic Trip');

        // Convert waypoints to route planner format
        const formattedWaypoints = navData.waypoints.map((wp: any, index: number) => ({
          id: index + 1,
          name: wp.name,
          lat: wp.lat,
          lng: wp.lng,
          time: index === 0 ? startTime : '00:00',
          type: index === 0 ? 'start' : (index === navData.waypoints.length - 1 ? 'destination' : 'stop'),
          notes: index === 0 ? 'Departing' : (index === navData.waypoints.length - 1 ? 'Arrival' : 'Stop'),
          battery: index === 0 ? 100 : 50
        }));

        const recalculated = recalculateLogistics(formattedWaypoints, startTime);
        setWaypoints(recalculated);

        toast({
          title: "Route Loaded",
          description: `${navData.routeName} is ready to plan.`,
        });
      }

      // Handle "resume" mode - existing trip from My Trips or Dashboard
      if (navData.mode === 'resume' && navData.tripId) {
        const loadTrip = async () => {
          try {
            const { tripService } = await import('@/services');
            const trip = await tripService.getTripById(navData.tripId);

            if (trip) {
              setTripName(trip.name || 'Pacific Coast Highway');

              const waypointsFromTrip = trip.checkPoints.map((checkpoint: any, index: number) => ({
                id: index + 1,
                name: checkpoint.location,
                lat: index === 0 ? trip.startLocation.lat : 0,
                lng: index === 0 ? trip.startLocation.lng : 0,
                time: new Date(checkpoint.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                type: index === 0 ? 'start' : (index === trip.checkPoints.length - 1 ? 'destination' : 'stop'),
                notes: checkpoint.notes || 'Stop',
                battery: index === 0 ? 100 : 50
              }));

              setWaypoints(waypointsFromTrip);

              toast({
                title: "Trip Loaded",
                description: `${trip.name} is ready to navigate.`,
              });
            }
          } catch (error) {
            console.error('[RoutePlanner] Failed to load trip:', error);
            toast({
              title: "Error",
              description: "Failed to load trip data.",
              variant: "destructive",
            });
          }
        };

        loadTrip();
      }
    }
  }, [getPendingNavigation, startTime, toast]);

  // Check for pending POI to add to route
  useEffect(() => {
    const pendingPOI = getPendingPOI();
    if (pendingPOI) {
      const newWaypoint = {
        id: waypoints.length + 1,
        name: pendingPOI.name,
        lat: pendingPOI.lat,
        lng: pendingPOI.lng,
        time: '00:00',
        type: 'stop',
        notes: 'Added from POI',
        battery: 50
      };

      const updatedWaypoints = [
        ...waypoints.slice(0, -1),
        newWaypoint,
        waypoints[waypoints.length - 1]
      ];

      const recalculated = recalculateLogistics(updatedWaypoints, startTime);
      setWaypoints(recalculated);

      toast({
        title: "POI Added to Route",
        description: `${pendingPOI.name} has been added to your route.`,
      });
    }
  }, []);

  useEffect(() => {
    if (userProfile?.preferences.avatarStyle && PERSONAS[userProfile.preferences.avatarStyle]) {
      setActivePersona(userProfile.preferences.avatarStyle);
    }
  }, []);

  useEffect(() => {
    setMessages([{ id: 'init', role: 'ai', text: buddy.greeting }]);
  }, [activePersona]);

  useEffect(() => {
    const userId = 'test@example.com';
    const tier = getUserMembership(userId);
    setUserTier(tier);
    setRemainingQuota(openRouteService.getRemainingQuota());
  }, []);

  // Calculate route when waypoints change (debounced)
  useEffect(() => {
    if (waypoints.length < 2) return;

    const timer = setTimeout(async () => {
      setIsCalculatingRoute(true);

      try {
        const coords = waypoints
          .filter(wp => wp.lat && wp.lng)
          .map(wp => ({
            lat: wp.lat,
            lng: wp.lng,
          }));

        if (coords.length >= 2) {
          const result = await routeService.calculateRoute(coords, 'test@example.com');
          setRouteData(result);
        }

        setRemainingQuota(openRouteService.getRemainingQuota());
      } catch (error) {
        console.error('Route calculation error:', error);
      } finally {
        setIsCalculatingRoute(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [waypoints]);

  // --- STEP 3: CONNECT START TIME ---
  const handleStartTimeChange = (newTime: string) => {
    setStartTime(newTime);
    setWaypoints(prev => recalculateLogistics(prev, newTime));
  };

  // --- ACTIONS ---
  const addWaypoint = () => {
    const newStop = {
      id: Date.now(),
      name: '',
      lat: undefined as number | undefined,
      lng: undefined as number | undefined,
      time: '',
      type: 'stop',
      notes: 'New Stop',
      battery: 0
    };
    setWaypoints(prev => recalculateLogistics([...prev, newStop], startTime));
  };

  const removeWaypoint = (id: number) => {
    setWaypoints(prev => recalculateLogistics(prev.filter(wp => wp.id !== id), startTime));
  };

  const updateWaypoint = (id: number, field: string, val: any) => {
    setWaypoints(prev => {
      const updated = prev.map(wp => wp.id === id ? { ...wp, [field]: val } : wp);
      return updated;
    });
  };

  const handleAcceptSuggestion = () => {
    const newStopName = buddy.suggestionAction.replace("Add ", "") + " (AI Rec)";
    setWaypoints(prev => {
      const newStop = { id: Date.now(), name: newStopName, lat: undefined as number | undefined, lng: undefined as number | undefined, type: 'highlight', time: '', notes: '', battery: 0 };
      let newList = [...prev];
      if (newList.length > 1) {
        newList.splice(newList.length - 1, 0, newStop);
      } else {
        newList.push(newStop);
      }
      return recalculateLogistics(newList, startTime);
    });
    toast({ title: "Itinerary Updated", description: `${newStopName} added & route optimized.` });
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: `Recalculated route! Added ${newStopName}.` }]);
  };

  // Save trip to Firebase Firestore
  const saveTrip = async () => {
    setIsSaving(true);

    try {
      const userId = authService.getUserId();
      const startWaypoint = waypoints[0];
      const endWaypoint = waypoints[waypoints.length - 1];

      const tripData = {
        userId,
        name: tripName,
        waypoints: waypoints.map(wp => ({
          id: wp.id,
          name: wp.name,
          lat: wp.lat,
          lng: wp.lng,
          time: wp.time,
          type: wp.type,
          notes: wp.notes,
          battery: wp.battery,
        })),
        totalDistance: routeData?.distance || 0,
        totalDuration: routeData?.duration || 0,
        startLocation: startWaypoint?.lat && startWaypoint?.lng ? {
          lat: startWaypoint.lat,
          lng: startWaypoint.lng,
          name: startWaypoint.name,
        } : undefined,
        endLocation: endWaypoint?.lat && endWaypoint?.lng ? {
          lat: endWaypoint.lat,
          lng: endWaypoint.lng,
          name: endWaypoint.name,
        } : undefined,
        status: 'planned' as const,
      };

      const tripId = await firestoreService.saveTrip(tripData);

      toast({
        title: "Trip Saved!",
        description: authService.isAuthenticated()
          ? "Your trip has been saved to your account."
          : "Trip saved locally. Sign in to sync across devices.",
      });

      // Navigate to trips page
      setTimeout(() => {
        navigate('/trips');
      }, 500);

    } catch (error) {
      console.error('[RoutePlanner] Error saving trip:', error);
      toast({
        title: "Error",
        description: "Failed to save trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'ai', text: `I'm checking the map for "${text}"... Found a great spot!` }]);
      setIsTyping(false);
    }, 1200);
  };

  // Handle route calculation callback from map
  const handleRouteCalculated = (routeInfo: { distance: number; duration: number }) => {
    setRouteData(routeInfo);
  };

  // --- ANIMATION ---
  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const newProgress = (elapsed % SIMULATION_DURATION) / SIMULATION_DURATION * 100;
    setProgress(newProgress);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) requestRef.current = requestAnimationFrame(animate);
    else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = undefined;
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isPlaying]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] animate-fade-in bg-slate-50">

      {/* ---------------- COLUMN 1: THE MAP (LEFT) ---------------- */}
      <div className="flex-1 relative bg-slate-100 flex flex-col order-2 lg:order-1 h-[500px] lg:h-auto">
        <Tabs defaultValue="map" className="flex-1 flex flex-col">
          <div className="absolute top-4 left-4 z-20">
            <TabsList className="bg-white/90 backdrop-blur shadow-sm border border-slate-200">
              <TabsTrigger value="map" className="text-xs font-medium"><MapIcon className="h-3 w-3 mr-2" />Interactive Map</TabsTrigger>
              <TabsTrigger value="simulation" className="text-xs font-medium"><Sparkles className="h-3 w-3 mr-2" />AI Vision</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="flex-1 m-0 p-0 h-full">
             <InteractiveRouteMap
               waypoints={waypoints}
               onWaypointUpdate={updateWaypoint}
               onRouteCalculated={handleRouteCalculated}
               className="w-full h-full"
             />
          </TabsContent>

          <TabsContent value="simulation" className="flex-1 m-0 p-0 relative h-full">
             <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center" />
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                   <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="bg-white/10 backdrop-blur hover:bg-white/20 text-white border border-white/10">
                      {isPlaying ? <Pause className="h-4 w-4 mr-2"/> : <Play className="h-4 w-4 mr-2"/>}
                      {isPlaying ? 'Pause' : 'Simulate'}
                   </Button>
                </div>
                {/* Route Line */}
                <div className="absolute top-1/2 left-[10%] right-[10%] h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <div className={`h-full shadow-[0_0_20px_currentColor] transition-colors duration-500 ${buddy.color.replace('bg-', 'bg-')}`} style={{ width: '100%' }} />
                   <div className="absolute top-1/2 -translate-y-1/2 z-30 transition-transform" style={{ left: `${progress}%` }}>
                      <div className="bg-white p-1.5 rounded-lg shadow-lg shadow-white/20 border-2 border-white transform -rotate-3">
                         <div className={buddy.textColor}><Zap className="h-4 w-4 fill-current" /></div>
                      </div>
                   </div>
                </div>
                {/* Dots */}
                {waypoints.map((_, idx) => {
                   const pos = 10 + ((idx / (waypoints.length > 1 ? waypoints.length - 1 : 1)) * 80);
                   return <div key={idx} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-slate-900 shadow-xl" style={{ left: `${pos}%` }} />
                })}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ---------------- COLUMN 2: THE SIDEBAR (RIGHT) ---------------- */}
      <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col z-10 shadow-2xl order-1 lg:order-2">

        {/* 1. Header & Persona */}
        <div className={`p-4 border-b border-slate-100 flex items-center justify-between ${buddy.bgSoft}`}>
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${buddy.color}`}>
                 <buddy.icon className="h-5 w-5" />
              </div>
              <div>
                 <h2 className="font-bold text-sm text-slate-900">{buddy.name}</h2>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wide">Online Guide</span>
                 </div>
              </div>
           </div>
           <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="h-8 text-slate-500">
             <ArrowLeft className="h-4 w-4 mr-1" /> Exit
           </Button>
        </div>

        {/* API Status Badge */}
        {userTier === 'test' || userTier === 'basic' || userTier === 'advanced' || userTier === 'expert' ? (
          <Card className="mx-4 mt-3 bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-blue-900 flex items-center gap-1">
                  <MapIcon className="w-3 h-3" />
                  Real Routing Active
                </span>
                <Badge variant="outline" className="bg-white text-blue-700 text-[10px] px-2 py-0.5">
                  {remainingQuota}/2000 today
                </Badge>
              </div>
              {isCalculatingRoute && (
                <div className="mt-2 text-xs text-blue-600 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Calculating optimal route...
                </div>
              )}
              {routeData && !isCalculatingRoute && (
                <div className="mt-2 text-[10px] text-blue-700">
                  Route: {routeData.distance.toFixed(1)} km - {routeData.duration.toFixed(1)}h
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-4 mt-3 bg-gray-50 border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Free Explorer
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2"
                  onClick={() => navigate('/pricing')}
                >
                  Upgrade
                </Button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Using estimated routes. Upgrade for real-time navigation.
              </p>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="flex-1" ref={scrollRef}>
           <div className="p-5 space-y-6">

              {/* 2. Hidden Gem Alert */}
              <Card className={`border-l-4 shadow-sm animate-in slide-in-from-top-4 transition-all duration-300 ${buddy.borderColor} bg-white`}>
                 <CardContent className="p-4">
                    <div className="flex gap-3 items-start">
                       <div className={`mt-0.5 p-1.5 rounded-md ${buddy.bgSoft} ${buddy.textColor}`}>
                          <Sparkles className="h-4 w-4" />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900">{buddy.suggestionTitle}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{buddy.suggestionText}</p>
                          <Button size="sm" variant="outline" className={`mt-3 w-full h-7 text-xs bg-white hover:${buddy.bgSoft} ${buddy.borderColor} ${buddy.textColor}`} onClick={handleAcceptSuggestion}>
                             {buddy.suggestionAction}
                          </Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* 3. LIVE ITINERARY */}
              <div>
                 <div className="space-y-3 mb-4">
                    <Input
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="font-bold text-lg border-transparent hover:border-slate-200 focus:border-indigo-300 transition-all p-0 h-auto bg-transparent w-full text-slate-900 placeholder:text-slate-400"
                      placeholder="Name your trip..."
                    />

                    {/* START TIME CONTROLLER */}
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                       <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
                          <Calendar className="h-3 w-3" /> Departure
                       </div>
                       <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          className="w-24 h-7 text-xs font-bold bg-white border-slate-200 focus:border-indigo-300 cursor-pointer"
                       />
                       <Badge variant="outline" className="ml-auto text-[10px] font-normal bg-white text-slate-500 border-slate-200">
                          {waypoints.length} Stops
                       </Badge>
                    </div>
                 </div>

                 {/* The Timeline List with Drag and Drop */}
                 <div className="space-y-0 relative">
                    {waypoints.map((point, idx) => (
                      <div
                        key={point.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`relative flex gap-2 group pb-6 last:pb-0 cursor-move transition-all ${
                          draggedIndex === idx ? 'opacity-50 scale-95' : ''
                        } ${
                          dragOverIndex === idx ? 'bg-indigo-50 rounded-lg -mx-2 px-2 py-2' : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="mt-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-slate-300" />
                        </div>

                        {/* Connecting Line */}
                        {idx !== waypoints.length - 1 && (
                           <div className="absolute left-[35px] top-8 bottom-0 w-[2px] bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                        )}

                        {/* Left Icon (The Timeline Dot) */}
                        <div className="mt-1 relative z-10 flex-shrink-0">
                           {point.type === 'charge' ? (
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                 <Zap className="h-3 w-3 fill-current" />
                              </div>
                           ) : point.type === 'highlight' ? (
                              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100 shadow-sm">
                                 <Sparkles className="h-3 w-3 fill-current" />
                              </div>
                           ) : point.type === 'start' ? (
                              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shadow-sm">
                                 <MapPin className="h-3 w-3" />
                              </div>
                           ) : point.type === 'destination' ? (
                              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                                 <MapPin className="h-3 w-3" />
                              </div>
                           ) : (
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm group-hover:border-slate-300">
                                 <MapPin className="h-3 w-3" />
                              </div>
                           )}
                        </div>

                        {/* Middle Content */}
                        <div className="flex-1 min-w-0 pt-1.5">
                           <input
                             value={point.name}
                             onChange={(e) => updateWaypoint(point.id, 'name', e.target.value)}
                             className="block w-full font-semibold text-sm text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 truncate"
                             placeholder="Stop Name"
                           />
                           {/* NOTES & BATTERY */}
                           <div className="flex items-center gap-2 mt-0.5">
                              {point.type !== 'start' && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${point.battery < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                  {point.battery}%
                                </span>
                              )}
                              <input
                                value={point.notes}
                                onChange={(e) => updateWaypoint(point.id, 'notes', e.target.value)}
                                className="block w-full text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 truncate"
                                placeholder="Notes..."
                              />
                           </div>
                        </div>

                        {/* Right Content */}
                        <div className="pt-1.5 text-right flex flex-col items-end">
                           <span className="block w-16 text-right font-mono text-xs text-slate-500 bg-transparent border-none p-0">
                             {point.time}
                           </span>
                           <button
                             onClick={() => removeWaypoint(point.id)}
                             className="mt-1 text-[10px] text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-wider"
                           >
                             Remove
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Add Stop Button */}
                 <Button variant="ghost" className="w-full mt-4 border border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 h-10 text-xs uppercase tracking-widest" onClick={addWaypoint}>
                    <Plus className="h-3 w-3 mr-2" /> Add Stop
                 </Button>
              </div>

              {/* 4. Save Button */}
              <Button
                size="lg"
                className={`w-full font-bold shadow-lg text-white ${buddy.color} hover:opacity-90 mt-4`}
                onClick={saveTrip}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Start Trip
                  </>
                )}
              </Button>

              {/* 5. Chat History */}
              <div className="pt-6 border-t border-slate-100">
                 <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest mb-4 block">Discussion</label>
                 <div className="space-y-4">
                    {messages.map((msg) => (
                       <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] border ${msg.role === 'ai' ? `bg-white ${buddy.textColor} border-slate-100` : 'bg-slate-100 text-slate-500 border-transparent'}`}>
                             {msg.role === 'ai' ? <buddy.icon className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          </div>
                          <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${msg.role === 'ai' ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none' : `${buddy.color} text-white rounded-tr-none`}`}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                    {isTyping && <div className="text-xs text-slate-400 pl-10 italic animate-pulse">Typing...</div>}
                 </div>
              </div>

           </div>
        </ScrollArea>

        {/* 6. Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200">
           <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="flex gap-2">
              <Input
                placeholder={`Ask ${buddy.name} for suggestions...`}
                className="bg-slate-50 border-slate-200 h-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indigo-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button type="submit" size="icon" className={`h-10 w-10 ${buddy.color} text-white shadow-md hover:opacity-90`}>
                 <Send className="h-4 w-4" />
              </Button>
           </form>
        </div>

      </div>
    </div>
  );
}
