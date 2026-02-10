import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Mic,
  MessageSquare,
  Sparkles,
  Clock,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tour, RouteStop, NarrationScript } from '@/types';

interface AudioNarrationProps {
  activeTour: Tour;
  routeStops: RouteStop[];
  currentStopIndex: number;
  onStopChange: (index: number) => void;
}

export function AudioNarration({
  activeTour,
  routeStops,
  currentStopIndex,
  onStopChange
}: AudioNarrationProps) {
  const [scripts, setScripts] = useState<NarrationScript[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoNarration, setAutoNarration] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Generate intelligent narration scripts
  const generateIntelligentNarration = React.useCallback(async () => {
    if (routeStops.length === 0) return;

    setIsGenerating(true);
    const newScripts: NarrationScript[] = [];

    // Generate narration for up to 5 stops to avoid overwhelming
    for (const stop of routeStops.slice(0, 5)) {
      try {
        // Mock AI text generation
        await new Promise(resolve => setTimeout(resolve, 500));
        const text = `Welcome to ${stop.name}! This is a fantastic stop on your journey, offering unique sights and experiences. Enjoy your time here.`;

        const script: NarrationScript = {
          id: `script_${stop.id}`,
          stopId: stop.id,
          title: `Discover ${stop.name}`,
          text: text,
          script: text,
          duration: Math.floor(text.length / 12), // ~12 chars per second
          isGenerating: false
        };

        newScripts.push(script);
      } catch (error) {
        console.error('Failed to generate narration for', stop.name, error);

        // Fallback script if AI fails
        const fallbackText = `Welcome to ${stop.name}. This ${stop.type} offers a unique experience along your journey. Take some time to explore and enjoy what this location has to offer.`;
        const fallbackScript: NarrationScript = {
          id: `script_${stop.id}`,
          stopId: stop.id,
          title: `About ${stop.name}`,
          text: fallbackText,
          script: fallbackText,
          duration: 15,
          isGenerating: false
        };

        newScripts.push(fallbackScript);
      }
    }

    setScripts(newScripts);
    setIsGenerating(false);

    toast({
      title: 'AI Narration Ready! 🎙️',
      description: `Generated intelligent commentary for ${newScripts.length} stops.`
    });
  }, [routeStops, toast]);

  useEffect(() => {
    if (routeStops.length > 0) {
      generateIntelligentNarration();
    }
  }, [generateIntelligentNarration]);

  // Generate high-quality audio with AI speech synthesis
  const generatePremiumAudio = async (script: NarrationScript) => {
    try {
      setScripts(prev => prev.map(s =>
        s.id === script.id ? { ...s, isGenerating: true } : s
      ));

      // Mock AI speech generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const url = 'https://cdn.pixabay.com/audio/2022/03/10/audio_c4b0163cfc.mp3';

      setScripts(prev => prev.map(s =>
        s.id === script.id ? { ...s, audioUrl: url, isGenerating: false } : s
      ));

      toast({
        title: 'Audio Generated! 🔊',
        description: 'High-quality narration is ready to play.'
      });
    } catch (error) {
      console.error('Failed to generate audio:', error);

      setScripts(prev => prev.map(s =>
        s.id === script.id ? { ...s, isGenerating: false } : s
      ));

      toast({
        title: 'Audio Generation Failed',
        description: 'Unable to create audio. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const currentScript = scripts.find(s => s.stopId === routeStops[currentStopIndex]?.id);

  const togglePlayPause = () => {
    if (!currentScript?.audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const goToPreviousStop = React.useCallback(() => {
    if (currentStopIndex > 0) {
      onStopChange(currentStopIndex - 1);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentStopIndex, onStopChange]);

  const goToNextStop = React.useCallback(() => {
    if (currentStopIndex < routeStops.length - 1) {
      onStopChange(currentStopIndex + 1);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentStopIndex, routeStops.length, onStopChange]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      if (autoNarration && currentStopIndex < routeStops.length - 1) {
        setTimeout(() => goToNextStop(), 2000);
      }
    };
    const handleLoadedMetadata = () => {
      audio.volume = volume;
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [autoNarration, currentStopIndex, routeStops.length, goToNextStop, volume]);

  if (routeStops.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2 text-primary" />
            AI Audio Tour Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Create a tour to enable AI-powered audio narration</p>
            <Badge variant="outline" className="text-xs">Premium Voice Experience</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2 text-primary" />
            AI Audio Tour Guide
          </div>
          <div className="flex items-center space-x-2">
            {isGenerating && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                Generating...
              </div>
            )}
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Sparkles className="h-3 w-3 mr-1" /> AI Powered
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentScript ? (
          <>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{currentScript.title}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>Stop {currentStopIndex + 1} of {routeStops.length}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{currentScript.duration}s</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{currentScript.text || currentScript.script}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {currentScript.audioUrl ? (
                <>
                  <audio ref={audioRef} src={currentScript.audioUrl} preload="metadata" />

                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-12">{formatTime(currentTime)}</span>
                      <div className="flex-1">
                        <Progress value={audioRef.current?.duration ? (currentTime / audioRef.current.duration) * 100 : 0} className="h-2 cursor-pointer" />
                      </div>
                      <span className="text-sm text-gray-500 w-12">{formatTime(audioRef.current?.duration || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Button variant="outline" size="sm" onClick={goToPreviousStop} disabled={currentStopIndex === 0}>
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button onClick={togglePlayPause} className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </Button>

                    <Button variant="outline" size="sm" onClick={goToNextStop} disabled={currentStopIndex === routeStops.length - 1}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <Button variant="ghost" size="sm" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>

                    <div className="flex items-center space-x-2 min-w-[100px]">
                      <span className="text-xs text-gray-500">Vol</span>
                      <div className="flex-1">
                        <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => handleVolumeChange([parseInt(e.target.value)])} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>

                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={autoNarration} onChange={(e) => setAutoNarration(e.target.checked)} className="rounded" />
                      <span className="text-xs">Auto-advance</span>
                    </label>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={() => generatePremiumAudio(currentScript)} disabled={currentScript.isGenerating} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    {currentScript.isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Audio...
                      </div>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Generate Premium Audio
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">High-quality AI voice synthesis</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Volume2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 mb-2">Select a stop to hear AI narration</p>
            <Badge variant="outline" className="text-xs">{scripts.length} narrations ready</Badge>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Tour Progress</h4>
            <Badge variant="outline" className="text-xs">{scripts.filter(s => s.audioUrl).length}/{scripts.length} audio ready</Badge>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {routeStops.map((stop, index) => {
              const hasScript = scripts.some(s => s.stopId === stop.id);
              const hasAudio = scripts.some(s => s.stopId === stop.id && s.audioUrl);
              const isActive = index === currentStopIndex;

              return (
                <button key={stop.id} onClick={() => onStopChange(index)} className={`w-full text-left p-3 rounded-lg border transition-all ${isActive ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium">{stop.name}</span>
                      <div className="text-xs text-gray-500 mt-1">{stop.type} • Stop #{index + 1}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {hasAudio && <Volume2 className="h-3 w-3 text-green-600" />}
                      {hasScript && !hasAudio && <MessageSquare className="h-3 w-3 text-blue-600" />}
                      {isActive && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
