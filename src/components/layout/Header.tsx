import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Navigation, 
  Clock, 
  Cloud, 
  Mic,
  MicOff,
  Volume2,
  Settings,
  X,
  Sparkles
} from 'lucide-react';
import { startListening, stopListening } from '@/lib/voice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VoiceAssistant } from '@/components/tour/VoiceAssistant';
import type { Tour, RouteStop, TourPreferences } from '@/types';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  activeTour?: Tour;
  currentStop?: RouteStop;
  userPreferences?: TourPreferences;
  currentLocation?: { lat: number; lon: number };
  weather?: { temperature: number; description: string };
}

export function Header({ 
  onMenuClick, 
  showMenuButton = false,
  activeTour,
  currentStop,
  userPreferences,
  currentLocation,
  weather
}: HeaderProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  
  // New state to simulate AI "Thinking" vs "Active"
  const [isAiCalculating, setIsAiCalculating] = useState(false);

  // Simulate AI background activity (e.g., checking traffic every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAiCalculating(true);
      setTimeout(() => setIsAiCalculating(false), 3000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    if (isVoiceActive) {
      stopListening();
      setIsVoiceActive(false);
    } else {
      setShowAssistant(true);
      setTimeout(() => {
        startListening((result) => {
          setTranscript(result.transcript);
          if (result.isFinal) {
            console.log('Final transcript:', result.transcript);
          }
        });
        setIsVoiceActive(true);
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const handleCloseAssistant = () => {
    setShowAssistant(false);
    stopListening();
    setIsVoiceActive(false);
    setTranscript('');
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center space-x-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          {isVoiceActive ? (
            <div className="text-sm text-muted-foreground italic min-w-[200px]">{transcript || "Listening..."}</div>
          ) : (
            <div className="text-sm font-semibold text-primary">Iconic Pathways USA AI</div>
          )}
          <div className="flex items-center space-x-2">
            <Navigation className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">GPS Active</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm">2:34 PM</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Cloud className="h-4 w-4 text-gray-500" />
            <span className="text-sm">72°F</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Voice Control */}
        <div className="flex items-center space-x-2">
          <Button
            variant={isVoiceActive ? "default" : "outline"}
            size="sm"
            onClick={toggleVoice}
            className="flex items-center space-x-2"
          >
            {isVoiceActive ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isVoiceActive ? 'Stop Listening' : 'Voice Guide'}
            </span>
          </Button>
          {isVoiceActive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <Volume2 className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* --- DYNAMIC AI STATUS BADGE --- */}
        <Badge 
          variant="secondary" 
          className={`
            flex items-center gap-1.5 transition-all duration-500 border-primary/20
            ${isAiCalculating 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'bg-primary/10 text-primary'
            }
          `}
        >
          {isAiCalculating ? (
            <Sparkles className="h-3 w-3 animate-spin text-white" />
          ) : (
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          )}
          {isAiCalculating ? 'AI Thinking...' : 'AI Active'}
        </Badge>

        {/* Settings Linked to Profile */}
        <Link to="/profile">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Voice Assistant Modal */}
      {activeTour && (
        <Dialog open={showAssistant} onOpenChange={setShowAssistant}>
          <DialogContent className="max-w-2xl h-[600px] p-0 border-0">
            <VoiceAssistant
              activeTour={activeTour}
              currentStop={currentStop}
              userPreferences={userPreferences}
              currentLocation={currentLocation}
              weather={weather}
              onClose={handleCloseAssistant}
            />
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}