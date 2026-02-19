import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile, useGeolocation } from '@/hooks';
import { useLocation } from 'react-router-dom';
import { weatherService, type WeatherData } from '@/services/weatherService';
import { TravelBestie } from '@/components/ai/TravelBestie';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const weatherFetchRef = useRef(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  // Single GPS tracker for the entire app — shared with Header via props
  const { position: gpsPosition, error: gpsError, loading: gpsLoading } = useGeolocation({
    watch: true,
    immediate: true,
  });

  // Fetch weather based on GPS coordinates or fallback to LA
  // Use coordinate primitives as deps to avoid re-fetching on every GPS object change
  const gpsLat = gpsPosition?.latitude;
  const gpsLng = gpsPosition?.longitude;

  useEffect(() => {
    // Skip duplicate fetches while one is in-flight
    if (weatherFetchRef.current) return;
    weatherFetchRef.current = true;

    const fetchWeather = async () => {
      try {
        let weatherData: WeatherData;

        if (gpsLat != null && gpsLng != null) {
          weatherData = await weatherService.getWeatherByCoordinates(gpsLat, gpsLng);
        } else {
          weatherData = await weatherService.getWeatherByCity('Los Angeles,US');
        }

        setWeather(weatherData);
      } catch (error) {
        console.error('[AppLayout] Failed to fetch weather:', error);
      } finally {
        weatherFetchRef.current = false;
      }
    };

    fetchWeather();
  }, [gpsLat, gpsLng]);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {!isMobile && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapsed}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onMenuClick={isMobile ? toggleSidebar : toggleCollapsed}
          showMenuButton={isMobile}
          weather={weather}
          gpsPosition={gpsPosition}
          gpsError={gpsError}
          gpsLoading={gpsLoading}
        />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeSidebar}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Iconic Pathways USA AI™</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                isCollapsed={false}
                onClose={closeSidebar}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Travel Bestie Chat Widget — hidden on /guide (has its own full-page chat) */}
      {pathname !== '/guide' && (
        <ErrorBoundary isolate fallback={null}>
          <TravelBestie />
        </ErrorBoundary>
      )}
    </div>
  );
}
