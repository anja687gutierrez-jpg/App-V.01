import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CloudSun, TrafficCone, Navigation } from 'lucide-react';
import { weatherService, type WeatherData } from '@/services/weatherService';

interface CurrentStatusWidgetProps {
  progress?: number;
  trafficStatus?: string;
  weatherStatus?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
}

export function CurrentStatusWidget({ 
  progress = 67, 
  trafficStatus = "Light congestion ahead", 
  weatherStatus = "Clear, 72°F",
  latitude,
  longitude,
  city
}: CurrentStatusWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [displayWeather, setDisplayWeather] = useState(weatherStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        let weatherData: WeatherData;

        // Prefer coordinates over city name
        if (latitude !== undefined && longitude !== undefined) {
          weatherData = await weatherService.getWeatherByCoordinates(
            latitude,
            longitude
          );
        } else if (city) {
          weatherData = await weatherService.getWeatherByCity(city);
        } else {
          // No location provided, use fallback
          setLoading(false);
          return;
        }

        setWeather(weatherData);
        setDisplayWeather(weatherService.formatWeatherDisplay(weatherData, true));
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Keep the default weatherStatus on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if location data is provided
    if ((latitude !== undefined && longitude !== undefined) || city) {
      fetchWeather();
    }
  }, [latitude, longitude, city]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Current Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Completion */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Route Completion</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traffic */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full shrink-0">
              <TrafficCone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Traffic</p>
              <p className="font-semibold text-sm">{trafficStatus}</p>
            </div>
          </div>

          {/* Weather */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full shrink-0">
              <CloudSun className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weather</p>
              <p className="font-semibold text-sm">
                {loading ? 'Loading...' : displayWeather}
              </p>
              {weather && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Humidity: {weather.humidity}% • Wind: {weather.windSpeed} m/s
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}