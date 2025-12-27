import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  Mic, 
  X, 
  SkipForward, 
  Play, 
  Pause, 
  Volume2,
  MapPin,
  Clock,
  Battery,
  StopCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NavigationMode() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true); // Music state
  const [activeStep, setActiveStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI Voice state

  const steps = [
    { instruction: 'Head north on I-5 N', distance: '45 miles' },
    { instruction: 'Take exit 219A for CA-99 N', distance: '12 miles' },
    { instruction: 'Merge onto CA-41 N toward Yosemite', distance: '85 miles' },
    { instruction: 'Arrive at Tunnel View', distance: '0.5 miles' }
  ];

  const storyText = "On your right is the historic Tejon Ranch. Established in 1843, it is the largest continuous expanse of private land in California, covering over 270,000 acres. It was originally a Mexican land grant and remains a working cattle ranch today.";

  // Handle Text-to-Speech
  const handlePlayStory = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(storyText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        
        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name.includes('Google US English') || voice.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        // Pause music while speaking (simulation)
        setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col animate-in fade-in duration-300">
      
      {/* TOP BAR */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/trips/1')}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">Yosemite Valley</span>
            <span className="text-xs text-green-400 font-mono">3h 45m remaining • 186 mi</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-sm font-medium">GPS Active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
             <Clock className="h-4 w-4" />
             <span className="font-mono font-bold text-white">10:42 AM</span>
          </div>
          <Battery className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: INSTRUCTIONS */}
        <div className="w-1/3 min-w-[350px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
          
          {/* Current Direction */}
          <div className="space-y-6">
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
               <Navigation className="h-12 w-12 text-blue-500 mb-4" />
               <h2 className="text-3xl font-bold">{steps[activeStep].distance}</h2>
               <p className="text-2xl text-slate-300 font-medium leading-tight mt-2">
                 {steps[activeStep].instruction}
               </p>
             </div>

             {/* Next Steps List */}
             <div className="space-y-4 pl-4 border-l-2 border-slate-800">
               {steps.map((step, idx) => (
                 <div 
                    key={idx} 
                    className={`flex justify-between items-center p-2 rounded transition-colors cursor-pointer ${idx === activeStep ? 'hidden' : 'text-slate-500 hover:bg-white/5'}`}
                    onClick={() => setActiveStep(idx)}
                 >
                   <span>{step.instruction}</span>
                   <span className="font-mono text-sm">{step.distance}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* AI Guide Widget (NOW INTERACTIVE) */}
          <Card className={`transition-all duration-500 border-indigo-500/30 p-4 mt-6 ${isSpeaking ? 'bg-indigo-900/40 ring-2 ring-indigo-500' : 'bg-indigo-950/50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-500'}`}>
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-indigo-200">
                {isSpeaking ? 'AI Guide Speaking...' : 'AI Guide Active'}
              </span>
            </div>
            <p className="text-sm text-indigo-100 mb-3">
              "On your right is the historic Tejon Ranch. Would you like to hear a story about it?"
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handlePlayStory}
                className={`${isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-indigo-900 hover:bg-indigo-50'} font-bold flex-1 transition-colors`}
              >
                {isSpeaking ? <><StopCircle className="h-4 w-4 mr-2" /> Stop</> : <><Play className="h-4 w-4 mr-2" /> Yes, Play</>}
              </Button>
              <Button size="sm" variant="ghost" className="text-indigo-300 hover:text-white hover:bg-indigo-900/50 flex-1">Dismiss</Button>
            </div>
          </Card>

        </div>

        {/* RIGHT PANEL: MAP */}
        <div className="flex-1 relative bg-slate-800">
          <iframe 
             width="100%" 
             height="100%" 
             frameBorder="0" 
             title="Nav Map"
             className="w-full h-full opacity-60 grayscale invert contrast-125 hover:opacity-80 transition-opacity"
             src="https://www.openstreetmap.org/export/embed.html?bbox=-119.65,37.70,-119.50,37.80&layer=mapnik"
           ></iframe>
           
           <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/50 to-transparent" />

           {/* Media Player Floating Bar */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full p-2 pr-6 flex items-center gap-4 shadow-2xl">
             <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden">
               <img src="https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=200" alt="Album" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col min-w-[120px]">
               <span className="text-sm font-bold">Road Trip Classics</span>
               <span className="text-xs text-slate-400">Fleetwood Mac</span>
             </div>
             <div className="flex items-center gap-3 text-slate-200">
               <SkipForward className="h-5 w-5 rotate-180" />
               <button onClick={() => setIsPlaying(!isPlaying)} className="hover:scale-110 transition-transform">
                 {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
               </button>
               <SkipForward className="h-5 w-5" />
             </div>
             <Volume2 className="h-5 w-5 text-slate-400 ml-2" />
           </div>

        </div>
      </div>
    </div>
  );
}