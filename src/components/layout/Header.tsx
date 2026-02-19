import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Sparkles,
  Droplets,
  Wind,
  Thermometer
} from 'lucide-react';
import { startListening, stopListening } from '@/lib/voice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VoiceAssistant } from '@/components/tour/VoiceAssistant';
import type { GeolocationPosition, GeolocationError } from '@/services/geolocationService';
import type { Tour, RouteStop, TourPreferences } from '@/types';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  activeTour?: Tour;
  currentStop?: RouteStop;
  userPreferences?: TourPreferences;
  currentLocation?: { lat: number; lon: number };
  weather?: { temperature: number; description: string; feelsLike?: number; humidity?: number; windSpeed?: number };
  gpsPosition?: GeolocationPosition | null;
  gpsError?: GeolocationError | null;
  gpsLoading?: boolean;
}

export function Header({
  onMenuClick,
  showMenuButton = false,
  activeTour,
  currentStop,
  userPreferences,
  currentLocation,
  weather,
  gpsPosition = null,
  gpsError = null,
  gpsLoading = false,
}: HeaderProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // New state to simulate AI "Thinking" vs "Active"
  const [isAiCalculating, setIsAiCalculating] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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
            <div className="text-sm font-semibold text-primary">Iconic Pathways™</div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                {gpsLoading ? (
                  <>
                    <Navigation className="h-4 w-4 text-yellow-500 animate-pulse" />
                    <span className="text-sm font-medium text-yellow-600">GPS Searching...</span>
                  </>
                ) : gpsError ? (
                  <>
                    <Navigation className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">GPS Unavailable</span>
                  </>
                ) : gpsPosition ? (
                  <>
                    <Navigation className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">GPS Active</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">GPS Off</span>
                  </>
                )}
              </div>
            </PopoverTrigger>
            {gpsPosition && (
              <PopoverContent className="w-72" align="start">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="border-b pb-2">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-green-500" />
                      GPS Location
                    </h4>
                    <p className="text-xs text-gray-500">Live tracking active</p>
                  </div>

                  {/* Coordinates */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      {gpsPosition.latitude.toFixed(6)}°N
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      {gpsPosition.longitude.toFixed(6)}°W
                    </p>
                  </div>

                  {/* Accuracy */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ±{Math.round(gpsPosition.accuracy)}m
                    </p>
                  </div>

                  {/* Last Update */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Update</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(gpsPosition.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </PopoverContent>
            )}
            {gpsError && (
              <PopoverContent className="w-72" align="start">
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h4 className="font-semibold text-sm text-red-900 flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-red-500" />
                      GPS Error
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700">{gpsError.message}</p>
                  <p className="text-xs text-gray-500">
                    Please enable location permissions in your browser settings.
                  </p>
                </div>
              </PopoverContent>
            )}
          </Popover>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                <Cloud className="h-4 w-4 text-gray-500" />
                {weather ? (
                  <span className="text-sm">
                    {weather.description}, {Math.round((weather.temperature * 9) / 5 + 32)}°F
                  </span>
                ) : (
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                )}
              </div>
            </PopoverTrigger>
            {weather && (
              <PopoverContent className="w-64" align="start">
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
            <ErrorBoundary isolate fallback={<div className="p-8 text-center text-muted-foreground">Voice Assistant encountered an error. Please try again.</div>}>
              <VoiceAssistant
                activeTour={activeTour}
                currentStop={currentStop}
                userPreferences={userPreferences}
                currentLocation={currentLocation}
                weather={weather}
                onClose={handleCloseAssistant}
              />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}