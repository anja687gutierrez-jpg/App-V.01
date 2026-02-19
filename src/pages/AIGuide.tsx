import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Navigation, Zap, Coffee, Tent, Sparkles, Send, Bot, User,
  Play, Pause, RotateCcw, CloudRain, Car, Map, Heart, Mountain,
  MapPin, Clock, Gauge, Battery, CheckCircle2, PlusCircle,
  Utensils, Palette, Star, Ticket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PERSONAS } from '@/lib/personas';
import { aiService } from '@/services/aiService';

type Message = { id: string; role: 'ai' | 'user'; text: string; };
const SIMULATION_DURATION = 15000;

export function AIGuide() {
  const { toast } = useToast();

  // --- MOCK PROFILE (Safe Mode) ---
  const userProfile = {
    preferences: {
      avatarStyle: 'guide'
    }
  };

  // Reverting to local state
  const [trip, setTrip] = useState({
    title: 'Yosemite Road Trip',
    stops: [
      { id: '1', name: 'San Francisco, CA', time: '8:00 AM', type: 'start', coordinates: { x: 10, y: 50 } },
      { id: '2', name: 'Tracy Supercharger', time: '10:30 AM', type: 'charge', notes: 'Charge to 80%', coordinates: { x: 30, y: 50 } },
      { id: '3', name: 'The Cozy Bean', time: '12:15 PM', type: 'stop', notes: 'Lunch Stop', coordinates: { x: 50, y: 50 } },
      { id: '4', name: 'Yosemite Valley Lodge', time: '4:30 PM', type: 'destination', coordinates: { x: 90, y: 50 } },
    ]
  });

  const addStop = (newStop: any) => {
    const stopWithId = { ...newStop, id: Date.now().toString() };
    setTrip(prev => ({ ...prev, stops: [...prev.stops, stopWithId] }));
  };

  // --- STATE ---
  const [activePersona, setActivePersona] = useState<string>('tech');

  // Sync with Mock Profile
  useEffect(() => {
    if (userProfile?.preferences.avatarStyle) {
      const savedStyle = userProfile.preferences.avatarStyle;
      if (PERSONAS[savedStyle]) {
        setActivePersona(savedStyle);
      } else {
        setActivePersona('guide');
      }
    }
  }, []);

  const buddy = PERSONAS[activePersona] || PERSONAS['tech'];

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', text: buddy.greeting }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const requestRef = useRef<number>(undefined);
  const startTimeRef = useRef<number>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update greeting on persona change
  useEffect(() => {
    setMessages([{ id: '1', role: 'ai', text: buddy.greeting }]);
    // Reset chat session when persona changes so aiService picks up the new persona
    aiService.clearHistory();
  }, [activePersona]);

  // --- ANIMATION LOOP ---
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

  // --- HANDLERS ---
  const toggleSimulation = () => setIsPlaying(!isPlaying);
  const resetSimulation = () => { setIsPlaying(false); setProgress(0); };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Build route context from current trip data
      const routeContext = {
        tripName: trip.title,
        waypoints: trip.stops.map(s => ({ name: s.name, type: s.type })),
      };

      const response = await aiService.chat(text, routeContext, activePersona);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.message,
      }]);
    } catch (error) {
      console.error('[AIGuide] Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- THE BRIDGE: AI UPDATES THE PLANNER ---
  const handleAcceptSuggestion = () => {
    const newStop = {
      name: activePersona === 'guide' ? 'Hidden Waterfall' :
            activePersona === 'ranger' ? 'Ranger Station Check-in' :
            activePersona === 'foodie' ? 'Famous Pie Shop' : 'Optimized Charging Stop',
      time: '2:00 PM',
      type: 'highlight' as const,
      notes: 'Added via AI Suggestion',
      coordinates: { x: 60, y: 50 }
    };

    addStop(newStop);

    toast({
      title: "Itinerary Updated",
      description: `${newStop.name} has been added to your route plan.`
    });

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'ai',
      text: `Great choice! I've added ${newStop.name} to your official itinerary.`
    }]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-12 w-full p-6">

      {/* 1. HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Iconic Pathways™</h1>
          <p className="text-slate-500 mt-1 text-lg">Your intelligent journey companion.</p>
        </div>

        {/* Persona Switcher (Manual Override) */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl flex-wrap gap-1">
           {['tech', 'guide', 'ranger', 'foodie', 'artist'].map((id) => {
             const p = PERSONAS[id];
             return (
               <button
                 key={p.id}
                 onClick={() => setActivePersona(p.id)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                   activePersona === p.id
                     ? 'bg-white shadow-sm text-slate-900 ring-1 ring-black/5'
                     : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <p.icon className={`h-3 w-3 ${activePersona === p.id ? p.textColor : 'text-slate-400'}`} />
                 {p.name}
               </button>
             );
           })}
        </div>
      </div>

      {/* 2. SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)] min-h-[650px]">

        {/* === LEFT: MAP SIMULATION === */}
        <Card className="lg:col-span-8 overflow-hidden border-slate-200 shadow-xl flex flex-col relative bg-slate-950 group">
           <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

           {/* HUD Controls */}
           <div className="absolute top-6 right-6 z-10 flex gap-2">
              <Button size="sm" onClick={toggleSimulation} className={`backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all ${isPlaying ? 'bg-white/20' : ''}`}>
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Simulate'}
              </Button>
              <Button size="icon" variant="ghost" onClick={resetSimulation} className="text-white hover:bg-white/20 backdrop-blur-md bg-white/5 border border-white/10">
                <RotateCcw className="h-4 w-4" />
              </Button>
           </div>

           {/* VISUALIZATION LAYER */}
           <div className="relative flex-1 w-full h-full">
              {/* Route Line */}
              <div className="absolute top-1/2 left-[10%] right-[10%] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <div className={`h-full shadow-[0_0_15px_currentColor] transition-colors duration-500 ${buddy.textColor.replace('text-', 'bg-')}`} />
              </div>

              {/* Dynamic Markers from Trip Context */}
              {trip.stops.map((stop, idx) => {
                 const pos = 10 + ((idx / (trip.stops.length - 1)) * 80);
                 return (
                   <div key={stop.id} className="absolute top-1/2 -translate-y-1/2 z-10" style={{ left: `${pos}%` }}>
                      <div className={`w-3 h-3 rounded-full border-2 border-slate-900 bg-white shadow-lg transform transition-all duration-300 ${progress > (idx * 25) ? 'scale-125' : 'scale-100'}`} />
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] bg-black/80 text-white px-2 py-1 rounded">
                        {stop.name}
                      </div>
                   </div>
                 );
              })}

              {/* The Car */}
              <div className="absolute top-1/2 -translate-y-1/2 z-30 transition-transform will-change-transform" style={{ left: `${10 + (progress * 0.8)}%` }}>
                 <div className="relative">
                    <div className="bg-white w-12 h-7 rounded-md shadow-lg flex items-center justify-center border-2 border-slate-200">
                       <Car className={`h-4 w-4 ${buddy.textColor}`} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Stats Bar */}
           <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-xl border border-white/10 text-white w-full flex justify-between items-center">
                 <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-1">Active Trip</p>
                    <div className="flex items-center gap-3">
                       <h3 className="text-lg font-bold">{trip.title}</h3>
                       <span className="h-4 w-[1px] bg-white/20" />
                       <span className="text-sm text-white/80 flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.stops.length} Stops</span>
                    </div>
                 </div>
              </div>
           </div>
        </Card>

        {/* === RIGHT: SIDEBAR === */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">

           {/* 1. AI Suggestion (Dynamic & Actionable) */}
           <Card className={`border-l-4 shadow-sm animate-in slide-in-from-right-4 transition-all duration-300 ${buddy.styleClass}`}>
              <CardContent className="p-4">
                 <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full shadow-sm mt-1 bg-white ${buddy.textColor}`}>
                       <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900 text-sm">{buddy.suggestionTitle}</h4>
                       <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {buddy.suggestionText}
                       </p>
                       <Button size="sm" variant="outline" className={`mt-3 w-full h-8 text-xs bg-white hover:bg-white/80 ${buddy.borderColor} ${buddy.textColor}`} onClick={handleAcceptSuggestion}>
                          {buddy.suggestionAction}
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* 2. Live Itinerary (Synced from Context) */}
           <Card className="flex-shrink-0 border-slate-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
              <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                 <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Map className="h-3 w-3" /> Live Itinerary
                 </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                 <div className="space-y-4">
                    {trip.stops.map((stop, i) => (
                       <div key={stop.id} className="flex items-center gap-3 relative group">
                          {/* Connector */}
                          {i < trip.stops.length - 1 && (
                             <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-100" />
                          )}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-white border-slate-200 text-slate-400 group-hover:border-${buddy.textColor.split('-')[1]}-500 transition-colors`}>
                             {stop.type === 'charge' ? <Zap className="h-3 w-3" /> :
                              stop.type === 'highlight' ? <Sparkles className="h-3 w-3 text-yellow-500" /> :
                              <MapPin className="h-3 w-3" />}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-900">{stop.name}</span>
                                <span className="text-xs text-slate-400 font-mono">{stop.time}</span>
                             </div>
                             {stop.notes && <p className="text-[10px] text-slate-500">{stop.notes}</p>}
                          </div>
                       </div>
                    ))}
                 </div>
              </ScrollArea>
           </Card>

           {/* 3. Chat Interface — Travel Bestie - AI Bot™ */}
           <Card className="flex-1 flex flex-col border-slate-200 shadow-lg overflow-hidden min-h-[300px]">
              <CardHeader className={`py-3 px-4 border-b border-slate-100 transition-colors ${buddy.styleClass}`}>
                 <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md ${buddy.color}`}>
                       <buddy.icon className="h-4 w-4" />
                    </div>
                    <div>
                       <CardTitle className="text-sm font-bold text-slate-900">Travel Bestie - AI Bot™</CardTitle>
                       <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-slate-600 font-medium uppercase">{buddy.name} Mode</span>
                       </div>
                    </div>
                 </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-white">
                 <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-3">
                       {messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                             <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${msg.role === 'ai' ? `bg-white ${buddy.textColor} border-slate-100` : 'bg-slate-100 text-slate-500 border-transparent'}`}>
                                {msg.role === 'ai' ? <buddy.icon className="h-3 w-3" /> : <User className="h-3 w-3" />}
                             </div>
                             <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${msg.role === 'ai' ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none' : `${buddy.color} text-white rounded-tr-none`}`}>
                                {msg.text}
                             </div>
                          </div>
                       ))}
                       {isTyping && <div className="text-xs text-slate-400 p-2 italic">Typing...</div>}
                    </div>
                 </ScrollArea>

                 <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="flex gap-2">
                       <Input
                         placeholder={`Message ${buddy.name}...`}
                         className="bg-white border-slate-200 h-9 text-sm"
                         value={inputValue}
                         onChange={(e) => setInputValue(e.target.value)}
                       />
                       <Button type="submit" size="icon" className={`h-9 w-9 ${buddy.color} hover:opacity-90 text-white`}>
                          <Send className="h-4 w-4" />
                       </Button>
                    </form>
                 </div>
              </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}
