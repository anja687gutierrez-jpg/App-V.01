/**
 * PathSpotter — AR Discovery Feature
 *
 * Camera-to-Gemini Vision pipeline: capture a photo, get GPS context,
 * and receive rich travel-relevant identification and facts.
 */

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera, Zap, MapPin, RotateCcw, Sparkles, Star, Lightbulb, Clock,
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import type { ScanResult } from '@/services/aiService';

/** Camera + flash bolt composite icon */
function SpotterIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <Camera className="h-full w-full" />
      <Zap className="absolute -top-1 -right-1 h-[45%] w-[45%] text-amber-400 fill-amber-400 drop-shadow-sm" />
    </span>
  );
}

interface ScanEntry {
  id: number;
  image: string;
  result: ScanResult;
  timestamp: Date;
  location: { lat: number; lng: number } | null;
}

type ScanState = 'capture' | 'analyzing' | 'result';

export function PathScanner() {
  const [state, setState] = useState<ScanState>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      // Extract base64 portion (after the comma in data URL)
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);

    // Request GPS in parallel
    requestGps();
  };

  const handleScan = async () => {
    if (!imageBase64) return;

    setState('analyzing');
    setError(null);

    try {
      const result = await aiService.analyzeImage(
        imageBase64,
        imageMime,
        gps?.lat ?? null,
        gps?.lng ?? null
      );
      setCurrentResult(result);

      // Add to history (keep last 5)
      const entry: ScanEntry = {
        id: ++idCounter.current,
        image: imagePreview!,
        result,
        timestamp: new Date(),
        location: gps,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 5));

      setState('result');
    } catch (err) {
      console.error('[PathSpotter] Scan failed:', err);
      setError('Scan failed. Please try again.');
      setState('capture');
    }
  };

  const handleReset = () => {
    setState('capture');
    setImagePreview(null);
    setImageBase64(null);
    setCurrentResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const ratingStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
      />
    ));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
          <SpotterIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">PathSpotter</h1>
          <p className="text-sm text-muted-foreground">
            Identify landmarks, nature, and hidden gems with AI
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          {aiService.isAvailable() ? 'Gemini Vision' : 'Demo Mode'}
        </Badge>
      </div>

      {/* Tip Card */}
      {state === 'capture' && !imagePreview && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-violet-700">
                Point your camera at landmarks, signs, nature, food, or anything interesting along your route.
                PathSpotter will identify it and share travel-relevant context.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Capture Mode */}
      {state === 'capture' && (
        <Card>
          <CardContent className="pt-6">
            {!imagePreview ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-full aspect-[4/3] max-w-md border-2 border-dashed border-violet-300 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-12 w-12 text-violet-400" />
                  <p className="text-sm text-muted-foreground">Tap to take a photo or choose from gallery</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md rounded-xl overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Captured"
                    className="w-full object-cover max-h-80"
                  />
                </div>

                {/* GPS indicator */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {gpsLoading ? (
                    <span>Getting location...</span>
                  ) : gps ? (
                    <span>{gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</span>
                  ) : (
                    <span>Location unavailable</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleScan}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <SpotterIcon className="h-4 w-4 mr-2" />
                    Spot It
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analyzing State */}
      {state === 'analyzing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-600">
                  <SpotterIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="text-center">
                <p className="font-medium">Spotting...</p>
                <p className="text-sm text-muted-foreground">Identifying what you found</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Mode */}
      {state === 'result' && currentResult && (
        <div className="space-y-4">
          {/* Main Result Card */}
          <Card className="border-violet-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt={currentResult.name}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                  )}
                  <div>
                    <CardTitle className="text-xl">{currentResult.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {currentResult.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {ratingStars(currentResult.discoveryRating)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{currentResult.description}</p>

              {/* Fun Facts */}
              {currentResult.facts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Fun Facts
                  </h4>
                  <ul className="space-y-1.5">
                    {currentResult.facts.map((fact, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-violet-400">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nearby Tips */}
              {currentResult.nearbyTips.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Nearby Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {currentResult.nearbyTips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-blue-400">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* GPS */}
              {gps && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Spotted at {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleReset} className="w-full bg-violet-600 hover:bg-violet-700">
            <SpotterIcon className="h-4 w-4 mr-2" />
            Spot Again
          </Button>
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Discoveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={entry.image}
                    alt={entry.result.name}
                    className="w-10 h-10 rounded-md object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.result.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.result.category}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {ratingStars(entry.result.discoveryRating)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
