/**
 * POI Markers Component
 *
 * Displays Points of Interest markers on the map with category filtering.
 * Used alongside InteractiveRouteMap to show nearby attractions, restaurants, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Utensils,
  Camera,
  Mountain,
  Zap,
  ShoppingBag,
  MapPin,
  Star,
  Plus,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Loader2,
} from 'lucide-react';
import { poiService } from '@/services';
import type { POI } from '@/types';

// POI category configuration
const POI_CATEGORIES = [
  { id: 'restaurant', label: 'Food', icon: Utensils, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { id: 'attraction', label: 'Attractions', icon: Mountain, color: 'text-green-500', bgColor: 'bg-green-100' },
  { id: 'photo-spot', label: 'Photo Spots', icon: Camera, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { id: 'gas-station', label: 'Charging', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { id: 'shopping', label: 'Supplies', icon: ShoppingBag, color: 'text-pink-500', bgColor: 'bg-pink-100' },
] as const;

type CategoryId = typeof POI_CATEGORIES[number]['id'];

interface POIMarkersProps {
  mapRef: React.MutableRefObject<any>;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  onAddToRoute?: (poi: { name: string; lat: number; lng: number; type: string }) => void;
  className?: string;
}

// Store filter preferences
const STORAGE_KEY = 'poi-filter-preferences';

export function POIMarkers({
  mapRef,
  center,
  radiusKm = 10,
  onAddToRoute,
  className = '',
}: POIMarkersProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [poiMarkersLayer, setPoiMarkersLayer] = useState<any>(null);

  // Load saved filter preferences
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved) as CategoryId[]);
      }
    } catch (e) {
      console.error('Failed to load POI filter preferences:', e);
    }
    // Default: all categories active
    return new Set(POI_CATEGORIES.map(c => c.id));
  });

  // Save filter preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...activeCategories]));
    } catch (e) {
      console.error('Failed to save POI filter preferences:', e);
    }
  }, [activeCategories]);

  // Fetch POIs when center changes
  useEffect(() => {
    if (!center) return;

    const fetchPOIs = async () => {
      setIsLoading(true);
      try {
        const nearbyPois = await poiService.searchNearby(center.lat, center.lng, radiusKm);
        setPois(nearbyPois);
      } catch (error) {
        console.error('Failed to fetch POIs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPOIs();
  }, [center, radiusKm]);

  // Update map markers when POIs or filters change
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing POI markers
    if (poiMarkersLayer) {
      poiMarkersLayer.clearLayers();
    }

    // Create new layer group for POI markers
    const markersLayer = L.layerGroup().addTo(map);
    setPoiMarkersLayer(markersLayer);

    // Filter POIs by active categories
    const filteredPois = pois.filter(poi => {
      // Map POI types to our categories
      const categoryMap: Record<string, CategoryId> = {
        'restaurant': 'restaurant',
        'food': 'restaurant',
        'cafe': 'restaurant',
        'attraction': 'attraction',
        'landmark': 'attraction',
        'museum': 'attraction',
        'park': 'attraction',
        'scenic-point': 'photo-spot',
        'viewpoint': 'photo-spot',
        'gas-station': 'gas-station',
        'charging': 'gas-station',
        'supercharger': 'gas-station',
        'shopping': 'shopping',
        'store': 'shopping',
        'parking': 'shopping',
      };

      const mappedCategory = categoryMap[poi.type] || 'attraction';
      return activeCategories.has(mappedCategory);
    });

    // Add markers for filtered POIs
    filteredPois.forEach(poi => {
      const category = POI_CATEGORIES.find(c => {
        const typeToCategory: Record<string, CategoryId> = {
          'restaurant': 'restaurant',
          'food': 'restaurant',
          'cafe': 'restaurant',
          'attraction': 'attraction',
          'landmark': 'attraction',
          'museum': 'attraction',
          'park': 'attraction',
          'scenic-point': 'photo-spot',
          'viewpoint': 'photo-spot',
          'gas-station': 'gas-station',
          'charging': 'gas-station',
          'supercharger': 'gas-station',
          'shopping': 'shopping',
          'store': 'shopping',
          'parking': 'shopping',
        };
        return typeToCategory[poi.type] === c.id;
      }) || POI_CATEGORIES[1]; // Default to attractions

      // Create custom marker icon
      const iconHtml = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-md ${category.bgColor} border-2 border-white cursor-pointer hover:scale-110 transition-transform">
          <span class="${category.color}" style="font-size: 14px;">
            ${getCategoryEmoji(category.id)}
          </span>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'poi-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([poi.location.lat, poi.location.lng], { icon });

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <div class="flex items-start gap-2">
            <div class="p-1.5 rounded ${category.bgColor}">
              <span class="${category.color}">${getCategoryEmoji(category.id)}</span>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm">${poi.name}</h4>
              <p class="text-xs text-gray-500 capitalize">${poi.type.replace('-', ' ')}</p>
              ${poi.rating ? `
                <div class="flex items-center gap-1 mt-1">
                  <span class="text-yellow-500">★</span>
                  <span class="text-xs font-medium">${poi.rating.toFixed(1)}</span>
                  ${poi.reviews ? `<span class="text-xs text-gray-400">(${poi.reviews})</span>` : ''}
                </div>
              ` : ''}
              ${poi.distance ? `
                <p class="text-xs text-gray-400 mt-1">${poi.distance.toFixed(1)} km away</p>
              ` : ''}
            </div>
          </div>
          ${onAddToRoute ? `
            <button
              onclick="window.dispatchEvent(new CustomEvent('addPOIToRoute', { detail: ${JSON.stringify({ name: poi.name, lat: poi.location.lat, lng: poi.location.lng, type: poi.type })} }))"
              class="mt-2 w-full px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              Add to Route
            </button>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 250 });

      marker.on('click', () => {
        setSelectedPOI(poi);
      });

      marker.addTo(markersLayer);
    });

    // Listen for add to route events from popup buttons
    const handleAddToRoute = (event: CustomEvent) => {
      if (onAddToRoute) {
        onAddToRoute(event.detail);
      }
    };

    window.addEventListener('addPOIToRoute', handleAddToRoute as EventListener);

    return () => {
      window.removeEventListener('addPOIToRoute', handleAddToRoute as EventListener);
      if (markersLayer) {
        markersLayer.clearLayers();
        map.removeLayer(markersLayer);
      }
    };
  }, [pois, activeCategories, mapRef, onAddToRoute]);

  const toggleCategory = (categoryId: CategoryId) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleAllCategories = () => {
    if (activeCategories.size === POI_CATEGORIES.length) {
      setActiveCategories(new Set());
    } else {
      setActiveCategories(new Set(POI_CATEGORIES.map(c => c.id)));
    }
  };

  // Count POIs per category
  const getCategoryCount = (categoryId: CategoryId): number => {
    const typeToCategory: Record<string, CategoryId> = {
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'cafe': 'restaurant',
      'attraction': 'attraction',
      'landmark': 'attraction',
      'museum': 'attraction',
      'park': 'attraction',
      'scenic-point': 'photo-spot',
      'viewpoint': 'photo-spot',
      'gas-station': 'gas-station',
      'charging': 'gas-station',
      'supercharger': 'gas-station',
      'shopping': 'shopping',
      'store': 'shopping',
      'parking': 'shopping',
    };

    return pois.filter(poi => typeToCategory[poi.type] === categoryId).length;
  };

  return (
    <Card className={`absolute bottom-4 left-4 z-[1000] w-72 shadow-lg ${className}`}>
      <CardContent className="p-3">
        {/* Header */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Points of Interest</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {pois.filter(poi => {
                const typeToCategory: Record<string, CategoryId> = {
                  'restaurant': 'restaurant',
                  'food': 'restaurant',
                  'cafe': 'restaurant',
                  'attraction': 'attraction',
                  'landmark': 'attraction',
                  'museum': 'attraction',
                  'park': 'attraction',
                  'scenic-point': 'photo-spot',
                  'viewpoint': 'photo-spot',
                  'gas-station': 'gas-station',
                  'charging': 'gas-station',
                  'supercharger': 'gas-station',
                  'shopping': 'shopping',
                  'store': 'shopping',
                  'parking': 'shopping',
                };
                return activeCategories.has(typeToCategory[poi.type] || 'attraction');
              }).length} shown
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Expanded Filter Options */}
        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Toggle All */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={toggleAllCategories}
            >
              {activeCategories.size === POI_CATEGORIES.length ? 'Hide All' : 'Show All'}
            </Button>

            {/* Category Toggles */}
            <div className="space-y-2">
              {POI_CATEGORIES.map(category => {
                const Icon = category.icon;
                const isActive = activeCategories.has(category.id);
                const count = getCategoryCount(category.id);

                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isActive
                        ? `${category.bgColor} border border-transparent`
                        : 'bg-gray-50 border border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isActive ? category.color : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {category.label}
                      </span>
                    </div>
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className={`text-xs ${isActive ? '' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Selected POI Details */}
            {selectedPOI && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{selectedPOI.name}</h4>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {selectedPOI.type.replace('-', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPOI(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {selectedPOI.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{selectedPOI.rating.toFixed(1)}</span>
                    {selectedPOI.reviews && (
                      <span className="text-xs text-gray-400">({selectedPOI.reviews} reviews)</span>
                    )}
                  </div>
                )}

                {selectedPOI.address && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{selectedPOI.address}</p>
                )}

                {onAddToRoute && (
                  <Button
                    size="sm"
                    className="w-full mt-3 h-8"
                    onClick={() => {
                      onAddToRoute({
                        name: selectedPOI.name,
                        lat: selectedPOI.location.lat,
                        lng: selectedPOI.location.lng,
                        type: selectedPOI.type,
                      });
                      setSelectedPOI(null);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Route
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to get emoji for category
function getCategoryEmoji(categoryId: CategoryId): string {
  switch (categoryId) {
    case 'restaurant':
      return '🍽️';
    case 'attraction':
      return '🏞️';
    case 'photo-spot':
      return '📸';
    case 'gas-station':
      return '⚡';
    case 'shopping':
      return '🛒';
    default:
      return '📍';
  }
}
