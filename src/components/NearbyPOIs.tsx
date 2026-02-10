/**
 * Nearby POIs Component
 * Displays points of interest near the user's current GPS location
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import {
  MapPin,
  Navigation,
  Utensils,
  Fuel,
  ShoppingBag,
  Camera,
  ParkingCircle,
  Star,
  ExternalLink,
  Loader2,
  MapPinOff,
  Filter,
  Heart,
  Plus,
} from 'lucide-react';
import { useGeolocation } from '@/hooks';
import { poiService, favoritesService } from '@/services';
import type { POI } from '@/types';
import { POIDetailModal } from './POIDetailModal';

interface NearbyPOIsProps {
  radiusKm?: number;
  showCategories?: boolean;
  onAddToRoute?: (poi: POI) => void;
}

interface FilterOptions {
  minRating: number;
  maxPrice?: number;
  showOpen?: boolean;
}

const CATEGORY_ICONS = {
  restaurant: Utensils,
  'gas-station': Fuel,
  parking: ParkingCircle,
  attraction: Camera,
  shopping: ShoppingBag,
};

const CATEGORY_COLORS = {
  restaurant: 'text-orange-600 bg-orange-100',
  'gas-station': 'text-blue-600 bg-blue-100',
  parking: 'text-indigo-600 bg-indigo-100',
  attraction: 'text-pink-600 bg-pink-100',
  shopping: 'text-green-600 bg-green-100',
};

export function NearbyPOIs({
  radiusKm = 10,
  showCategories = true,
  onAddToRoute,
}: NearbyPOIsProps) {
  const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: 0,
    maxPrice: undefined,
    showOpen: false,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // GPS tracking
  const { position: gpsPosition, error: gpsError, loading: gpsLoading } = useGeolocation({
    watch: true,
    immediate: true,
  });

  // Load favorites on mount
  useEffect(() => {
    const favoriteIds = favoritesService.getFavoriteIds();
    setFavorites(favoriteIds);
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = (poi: POI) => {
    const success = favoritesService.toggleFavorite({
      id: poi.id,
      name: poi.name,
      type: poi.type,
      location: poi.location,
    });

    if (success) {
      // Update local state
      const updatedFavorites = favoritesService.getFavoriteIds();
      setFavorites(updatedFavorites);
    }
  };

  // Handle POI card click to open modal
  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    setModalOpen(true);
  };

  // Fetch nearby POIs when GPS position changes
  useEffect(() => {
    const fetchNearbyPOIs = async () => {
      if (!gpsPosition) {
        return;
      }

      setLoading(true);
      try {
        const pois = await poiService.searchNearby(
          gpsPosition.latitude,
          gpsPosition.longitude,
          radiusKm
        );
        setNearbyPOIs(pois);
      } catch (error) {
        console.error('[NearbyPOIs] Failed to fetch nearby POIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPOIs();
  }, [gpsPosition, radiusKm]);

  // Filter POIs by category and filters
  const filteredPOIs = nearbyPOIs
    .filter((poi) => selectedCategory === 'all' || poi.type === selectedCategory)
    .filter((poi) => poi.rating >= filters.minRating)
    .filter((poi) => !filters.maxPrice || !poi.pricePerHour || poi.pricePerHour <= filters.maxPrice);

  // Group POIs by type
  const poiCounts = nearbyPOIs.reduce((acc, poi) => {
    acc[poi.type] = (acc[poi.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDistance = (distance?: number) => {
    if (!distance) return '';

    // Convert km to miles
    const miles = distance * 0.621371;

    if (distance < 1) {
      // Less than 1km - show in meters and feet
      const meters = Math.round(distance * 1000);
      const feet = Math.round(meters * 3.28084);
      return `${meters}m (${feet}ft)`;
    }

    // 1km or more - show in km and miles
    return `${distance.toFixed(1)}km (${miles.toFixed(1)}mi)`;
  };

  // Loading state
  if (gpsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Nearby Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Getting your location...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (gpsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Nearby Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MapPinOff className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground mb-2">
              Location Access Required
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {gpsError.message}
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-left max-w-sm">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>How to enable location:</strong>
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Click the location icon in your browser's address bar</li>
                <li>Select "Allow" or "Always allow"</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Nearby Places
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {filteredPOIs.length} found
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Filter className="h-4 w-4" />
                  {(filters.minRating > 0 || filters.maxPrice) && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                      {(filters.minRating > 0 ? 1 : 0) + (filters.maxPrice ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Filter Options</h4>
                    <p className="text-xs text-muted-foreground">
                      Refine your search results
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Minimum Rating</label>
                      <span className="text-sm text-muted-foreground">
                        {filters.minRating > 0 ? `${filters.minRating}+ ⭐` : 'Any'}
                      </span>
                    </div>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, minRating: value[0] }))
                      }
                      min={0}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Max Price/Hour</label>
                      <span className="text-sm text-muted-foreground">
                        {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
                      </span>
                    </div>
                    <Slider
                      value={[filters.maxPrice || 50]}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: value[0] === 50 ? undefined : value[0],
                        }))
                      }
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only applies to parking locations
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          minRating: 0,
                          maxPrice: undefined,
                          showOpen: false,
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {filteredPOIs.length} of {nearbyPOIs.length} shown
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {gpsPosition && (
          <p className="text-xs text-muted-foreground mt-1">
            Within {radiusKm}km ({(radiusKm * 0.621371).toFixed(1)}mi) of your location
          </p>
        )}
      </CardHeader>

      <CardContent>
        {showCategories && (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="all" className="text-xs px-2 py-1.5">
                All
                <Badge variant="secondary" className="ml-1 text-xs">
                  {nearbyPOIs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="text-xs px-2 py-1.5">
                <Utensils className="h-3 w-3 mr-1" />
                {poiCounts.restaurant || 0}
              </TabsTrigger>
              <TabsTrigger value="parking" className="text-xs px-2 py-1.5">
                <ParkingCircle className="h-3 w-3 mr-1" />
                {poiCounts.parking || 0}
              </TabsTrigger>
              <TabsTrigger value="attraction" className="text-xs px-2 py-1.5">
                <Camera className="h-3 w-3 mr-1" />
                {poiCounts.attraction || 0}
              </TabsTrigger>
              <TabsTrigger value="gas-station" className="text-xs px-2 py-1.5">
                <Fuel className="h-3 w-3 mr-1" />
                {poiCounts['gas-station'] || 0}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Finding nearby places...</span>
          </div>
        ) : filteredPOIs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MapPinOff className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {selectedCategory === 'all'
                ? 'No places found nearby'
                : `No ${selectedCategory}s found nearby`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPOIs.map((poi) => {
              const IconComponent = CATEGORY_ICONS[poi.type as keyof typeof CATEGORY_ICONS] || MapPin;
              const colorClass = CATEGORY_COLORS[poi.type as keyof typeof CATEGORY_COLORS] || 'text-gray-600 bg-gray-100';

              return (
                <div
                  key={poi.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handlePOIClick(poi)}
                >
                  <div className={`p-2 rounded-full ${colorClass} shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-tight">{poi.name}</h4>
                      {poi.distance && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          <Navigation className="h-3 w-3 mr-1" />
                          {formatDistance(poi.distance)}
                        </Badge>
                      )}
                    </div>

                    {poi.address && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {poi.address}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {poi.rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{poi.rating.toFixed(1)}</span>
                          {poi.reviews && (
                            <span className="text-muted-foreground">({poi.reviews})</span>
                          )}
                        </div>
                      )}

                      {poi.hours && (
                        <span className="text-xs text-muted-foreground">{poi.hours}</span>
                      )}
                    </div>

                    {poi.amenities && poi.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {poi.amenities.slice(0, 3).map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                            {amenity}
                          </Badge>
                        ))}
                        {poi.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            +{poi.amenities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={favorites.includes(poi.id) ? 'default' : 'outline'}
                        className="text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(poi);
                        }}
                      >
                        <Heart
                          className={`h-3 w-3 mr-1 ${
                            favorites.includes(poi.id) ? 'fill-current' : ''
                          }`}
                        />
                        {favorites.includes(poi.id) ? 'Saved' : 'Save'}
                      </Button>
                      {onAddToRoute && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToRoute(poi);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Route
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `https://www.google.com/maps/search/?api=1&query=${poi.location.lat},${poi.location.lng}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* POI Detail Modal */}
      <POIDetailModal
        poi={selectedPOI}
        open={modalOpen}
        onOpenChange={setModalOpen}
        isFavorite={selectedPOI ? favorites.includes(selectedPOI.id) : false}
        onToggleFavorite={
          selectedPOI
            ? () => {
                handleToggleFavorite(selectedPOI);
              }
            : undefined
        }
        onAddToRoute={
          selectedPOI && onAddToRoute
            ? () => {
                onAddToRoute(selectedPOI);
                setModalOpen(false);
              }
            : undefined
        }
      />
    </Card>
  );
}
