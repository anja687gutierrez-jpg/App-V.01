import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  Route as RouteIcon,
  Clock,
  Zap
} from 'lucide-react';
import { openRouteService } from '@/services';

// Type declarations for Leaflet (loaded via CDN)
declare global {
  interface Window {
    L: any;
  }
}

interface Waypoint {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  time: string;
  type: string;
  notes: string;
  battery: number;
}

interface RouteInfo {
  distance: number; // in km
  duration: number; // in hours
  geometry?: [number, number][];
}

interface InteractiveRouteMapProps {
  waypoints: Waypoint[];
  onWaypointUpdate: (id: number, field: string, value: any) => void;
  onRouteCalculated?: (routeInfo: RouteInfo) => void;
  className?: string;
}

// Load Leaflet CSS and JS via CDN
const loadLeaflet = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.L) {
      resolve();
      return;
    }

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
};

export function InteractiveRouteMap({
  waypoints,
  onWaypointUpdate,
  onRouteCalculated,
  className = ''
}: InteractiveRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSearchField, setActiveSearchField] = useState<'start' | 'end' | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        await loadLeaflet();

        if (!mounted || !mapContainerRef.current) return;

        const L = window.L;

        // Create map centered on US
        const map = L.map(mapContainerRef.current, {
          center: [39.8283, -98.5795], // Center of US
          zoom: 4,
          zoomControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setIsMapReady(true);
        setIsLoading(false);

        // Handle map clicks
        map.on('click', (e: any) => {
          if (activeSearchField) {
            handleMapClick(e.latlng.lat, e.latlng.lng);
          }
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError('Failed to load map. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when waypoints change
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for waypoints with coordinates
    const validWaypoints = waypoints.filter(wp => wp.lat && wp.lng);

    validWaypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === validWaypoints.length - 1;

      // Create custom icon
      const iconHtml = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg ${
          isStart ? 'bg-green-500' : isEnd ? 'bg-red-500' : wp.type === 'charge' ? 'bg-blue-500' : 'bg-orange-500'
        } text-white text-xs font-bold border-2 border-white">
          ${isStart ? 'A' : isEnd ? 'B' : wp.type === 'charge' ? '⚡' : (index).toString()}
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon, draggable: true })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <strong>${wp.name || 'Waypoint'}</strong><br/>
            <span class="text-xs text-gray-500">${wp.notes || ''}</span><br/>
            <span class="text-xs">Battery: ${wp.battery}%</span>
          </div>
        `);

      // Handle marker drag
      marker.on('dragend', async (e: any) => {
        const newLatLng = e.target.getLatLng();

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLatLng.lat}&lon=${newLatLng.lng}`
          );
          const data = await response.json();
          const locationName = data.display_name?.split(',').slice(0, 2).join(',') || 'Unknown Location';

          onWaypointUpdate(wp.id, 'name', locationName);
          onWaypointUpdate(wp.id, 'lat', newLatLng.lat);
          onWaypointUpdate(wp.id, 'lng', newLatLng.lng);
        } catch (error) {
          onWaypointUpdate(wp.id, 'lat', newLatLng.lat);
          onWaypointUpdate(wp.id, 'lng', newLatLng.lng);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (validWaypoints.length > 0) {
      const bounds = L.latLngBounds(validWaypoints.map(wp => [wp.lat!, wp.lng!]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

  }, [waypoints, isMapReady, onWaypointUpdate]);

  // Calculate and draw route when waypoints change
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const calculateRoute = async () => {
      const validWaypoints = waypoints.filter(wp => wp.lat && wp.lng);
      if (validWaypoints.length < 2) {
        // Clear route if not enough waypoints
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
          routeLayerRef.current = null;
        }
        setRouteInfo(null);
        return;
      }

      const L = window.L;
      const map = mapRef.current;

      try {
        // Get route from OpenRouteService
        const coords = validWaypoints.map(wp => ({ lat: wp.lat!, lng: wp.lng! }));
        const route = await openRouteService.getDirections(coords, 'driving-car', {
          includeGeometry: true,
        });

        if (route && route.geometry) {
          // Clear existing route
          if (routeLayerRef.current) {
            routeLayerRef.current.remove();
          }

          // Decode geometry (ORS returns encoded polyline or GeoJSON)
          let routeCoords: [number, number][];

          if (typeof route.geometry === 'string') {
            // Encoded polyline - decode it
            routeCoords = decodePolyline(route.geometry);
          } else if (route.geometry.coordinates) {
            // GeoJSON format - coordinates are [lng, lat], need to flip
            routeCoords = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          } else {
            routeCoords = [];
          }

          // Draw route line
          routeLayerRef.current = L.polyline(routeCoords, {
            color: '#3B82F6',
            weight: 5,
            opacity: 0.8,
            smoothFactor: 1,
          }).addTo(map);

          // Update route info
          const info: RouteInfo = {
            distance: route.summary?.distance ? route.summary.distance / 1000 : 0, // Convert to km
            duration: route.summary?.duration ? route.summary.duration / 3600 : 0, // Convert to hours
            geometry: routeCoords,
          };

          setRouteInfo(info);
          onRouteCalculated?.(info);
        }
      } catch (error) {
        console.error('Failed to calculate route:', error);

        // Fallback: draw a simple line between waypoints
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
        }

        const coords = validWaypoints.map(wp => [wp.lat!, wp.lng!] as [number, number]);
        routeLayerRef.current = L.polyline(coords, {
          color: '#9CA3AF',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10',
        }).addTo(map);

        // Estimate distance and duration
        const totalDistance = calculateStraightLineDistance(validWaypoints);
        const estimatedDuration = totalDistance / 100; // Rough estimate: 100 km/h average

        setRouteInfo({
          distance: totalDistance,
          duration: estimatedDuration,
        });
      }
    };

    calculateRoute();
  }, [waypoints, isMapReady, onRouteCalculated]);

  // Handle location search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use Nominatim for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      })));
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search result selection
  const handleSelectSearchResult = (result: { name: string; lat: number; lng: number }) => {
    if (activeSearchField === 'start' && waypoints.length > 0) {
      const startWp = waypoints[0];
      onWaypointUpdate(startWp.id, 'name', result.name.split(',').slice(0, 2).join(','));
      onWaypointUpdate(startWp.id, 'lat', result.lat);
      onWaypointUpdate(startWp.id, 'lng', result.lng);
    } else if (activeSearchField === 'end' && waypoints.length > 1) {
      const endWp = waypoints[waypoints.length - 1];
      onWaypointUpdate(endWp.id, 'name', result.name.split(',').slice(0, 2).join(','));
      onWaypointUpdate(endWp.id, 'lat', result.lat);
      onWaypointUpdate(endWp.id, 'lng', result.lng);
    }

    setSearchResults([]);
    setSearchQuery('');
    setActiveSearchField(null);

    // Pan to the selected location
    if (mapRef.current) {
      mapRef.current.setView([result.lat, result.lng], 10);
    }
  };

  // Handle map click for setting waypoints
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocode
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const locationName = data.display_name?.split(',').slice(0, 2).join(',') || 'Selected Location';

      if (activeSearchField === 'start' && waypoints.length > 0) {
        const startWp = waypoints[0];
        onWaypointUpdate(startWp.id, 'name', locationName);
        onWaypointUpdate(startWp.id, 'lat', lat);
        onWaypointUpdate(startWp.id, 'lng', lng);
      } else if (activeSearchField === 'end' && waypoints.length > 1) {
        const endWp = waypoints[waypoints.length - 1];
        onWaypointUpdate(endWp.id, 'name', locationName);
        onWaypointUpdate(endWp.id, 'lat', lat);
        onWaypointUpdate(endWp.id, 'lng', lng);
      }

      setActiveSearchField(null);
    } catch (error) {
      console.error('Reverse geocode failed:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Search Panel */}
      <Card className="absolute top-4 left-4 z-[1000] w-80 shadow-lg">
        <CardContent className="p-3 space-y-3">
          {/* Start Location */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Start Location
            </label>
            <div className="relative">
              <Input
                placeholder="Search or click map..."
                value={activeSearchField === 'start' ? searchQuery : (waypoints[0]?.name || '')}
                onChange={(e) => {
                  setActiveSearchField('start');
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => setActiveSearchField('start')}
                className="pr-8 text-sm h-9"
              />
              {isSearching && activeSearchField === 'start' ? (
                <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* End Location */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              End Location
            </label>
            <div className="relative">
              <Input
                placeholder="Search or click map..."
                value={activeSearchField === 'end' ? searchQuery : (waypoints[waypoints.length - 1]?.name || '')}
                onChange={(e) => {
                  setActiveSearchField('end');
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => setActiveSearchField('end')}
                className="pr-8 text-sm h-9"
              />
              {isSearching && activeSearchField === 'end' ? (
                <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && activeSearchField && (
            <div className="absolute left-0 right-0 top-full mt-1 mx-3 bg-white border rounded-md shadow-lg z-[1001] max-h-48 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{result.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active Search Indicator */}
          {activeSearchField && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
              <Navigation className="h-3 w-3" />
              Click on the map to set {activeSearchField === 'start' ? 'start' : 'end'} location
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Info Panel */}
      {routeInfo && (
        <Card className="absolute top-4 right-4 z-[1000] shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RouteIcon className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">Distance</div>
                  <div className="font-semibold text-sm">{routeInfo.distance.toFixed(1)} km</div>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500">Drive Time</div>
                  <div className="font-semibold text-sm">
                    {Math.floor(routeInfo.duration)}h {Math.round((routeInfo.duration % 1) * 60)}m
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500">Est. Charges</div>
                  <div className="font-semibold text-sm">
                    {Math.ceil(routeInfo.distance / 400)} stops
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{mapError}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Custom Marker Styles */}
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

// Helper: Decode polyline (Google's encoded polyline format)
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Helper: Calculate straight-line distance between waypoints
function calculateStraightLineDistance(waypoints: Waypoint[]): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    if (wp1.lat && wp1.lng && wp2.lat && wp2.lng) {
      total += haversineDistance(wp1.lat, wp1.lng, wp2.lat, wp2.lng);
    }
  }
  return total;
}

// Haversine formula for distance calculation
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
