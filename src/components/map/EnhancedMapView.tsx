import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Layers,
  Maximize
} from 'lucide-react';
import type { RouteStop } from '@/types';

interface EnhancedMapViewProps {
  routeStops: RouteStop[];
  startLocation: string;
  endLocation: string;
  onStopSelect?: (stopIndex: number) => void;
}

export function EnhancedMapView({ routeStops, startLocation, endLocation, onStopSelect }: EnhancedMapViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<number | null>(null);
    const mapRef = useRef(null);

  
  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying && routeStops.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          const increment = 0.5 * speed;
          let next = prev + increment;
          if (next >= 100) next = 0;

          const totalStops = routeStops.length;
          const idx = Math.floor((next / 100) * (totalStops - 1));
          const stop = routeStops[idx];
          if (stop) {
            onStopSelect?.(idx);
          }

          return next;
        });
      }, 150);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, routeStops, onStopSelect]);

  const resetAnimation = () => {
    setProgress(0);
    setIsPlaying(false);
    if (routeStops.length > 0) {
      onStopSelect?.(0);
    }
  };

  return (
    <div className={`h-full w-full relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div ref={mapRef} className="h-full w-full bg-gradient-to-br from-slate-50 to-white rounded">
        <div className="p-6">
          <div className="border rounded-lg h-[420px] bg-white shadow-sm flex items-center justify-center"> 
            {/* Placeholder map canvas */}
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Interactive Map Canvas</div>
              <div className="text-xs text-gray-400">Start: {startLocation} • End: {endLocation}</div>
              <div className="mt-4">
                <div className="inline-block p-3 bg-green-50 rounded-full shadow">🚗</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="absolute top-4 right-4 z-10 w-72">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Smart EV Vehicle</span>
            </div>
            <Badge className="bg-gradient-to-r from-green-600 to-blue-600">{Math.round(progress)}%</Badge>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Route Progress</span>
              <span>{routeStops.length} stops</span>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsPlaying(p => !p)} className="px-3 py-1">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={resetAnimation}><RotateCcw className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              {[0.5, 1, 2].map(s => (
                <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded text-xs ${speed === s ? 'bg-blue-100' : 'bg-gray-100'}`}>{s}x</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><Navigation className="h-4 w-4" /><span className="text-xs ml-1">Traffic</span></Button>
              <Button variant="ghost" size="sm"><Layers className="h-4 w-4" /><span className="text-xs ml-1">Style</span></Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(f => !f)}><Maximize className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      <Card className="absolute bottom-4 right-4 z-10">
        <div className="p-3 space-y-2">
          <h4 className="font-semibold text-sm text-gray-900">Map Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> <span>Charging Station</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> <span>Accommodation</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-orange-500 rounded-full" /> <span>Restaurant</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-purple-500 rounded-full" /> <span>Point of Interest</span></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
