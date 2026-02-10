import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  DollarSign,
  Zap,
  MapPinOff,
  Star,
  Apple,
  Smartphone,
  Navigation,
  Clock,
  AlertCircle,
  Shield,
  Wifi,
  Coffee,
  Car,
  Accessibility
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ParkingLocation } from '@/types';

const PARKING_TYPES = ['street', 'garage', 'lot', 'valet', 'residential'] as const;
const AMENITIES = ['charging', 'camera', 'lighting', 'attendant', 'wifi', 'nearby_cafes', 'wheelchair_accessible'];

// Sample parking data for MVP (would connect to real APIs)
const SAMPLE_PARKING: ParkingLocation[] = [
  {
    id: '1',
    poiId: 'parking-downtown',
    name: 'Downtown Garage',
    location: { lat: 37.7749, lng: -122.4194 },
    address: '123 Market St, San Francisco, CA',
    distance: 0.3,
    type: 'garage',
    pricePerHour: 4.50,
    availability: 24,
    amenities: ['charging', 'camera', 'lighting'],
    rating: 4.5,
    acceptsPaymentApps: ['apple-pay', 'google-pay', 'venmo'],
    totalSpaces: 200,
  },
  {
    id: '2',
    poiId: 'parking-mission',
    name: 'Mission District Lot',
    location: { lat: 37.7599, lng: -122.4148 },
    address: '456 Valencia St, San Francisco, CA',
    distance: 1.2,
    type: 'lot',
    pricePerHour: 3.00,
    availability: 45,
    amenities: ['lighting', 'camera'],
    rating: 4.2,
    acceptsPaymentApps: ['google-pay'],
    totalSpaces: 150,
  },
  {
    id: '3',
    poiId: 'parking-soma',
    name: 'SoMa Valet',
    location: { lat: 37.7831, lng: -122.3969 },
    address: '789 Brannan St, San Francisco, CA',
    distance: 0.8,
    type: 'valet',
    pricePerHour: 8.00,
    availability: 10,
    amenities: ['attendant', 'camera', 'charging'],
    rating: 4.8,
    acceptsPaymentApps: ['apple-pay', 'google-pay', 'venmo'],
    totalSpaces: 80,
  },
  {
    id: '4',
    poiId: 'parking-financial',
    name: 'Financial District Street',
    location: { lat: 37.7954, lng: -122.3977 },
    address: 'Pine St, San Francisco, CA',
    distance: 1.5,
    type: 'street',
    pricePerHour: 6.00,
    availability: 3,
    amenities: ['lighting'],
    rating: 3.8,
    acceptsPaymentApps: ['google-pay', 'venmo'],
    totalSpaces: 50,
  },
];

interface ParkingFinderProps {
  currentLocation?: { latitude: number; longitude: number };
  onParkingSelected?: (parking: ParkingLocation) => void;
  maxDistance?: number; // in miles
}

export function ParkingFinder({
  currentLocation,
  onParkingSelected,
  maxDistance = 5
}: ParkingFinderProps) {
  const [parkingSpots, setParkingSpots] = useState<ParkingLocation[]>(SAMPLE_PARKING);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('10');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'availability'>('price');
  const [selectedParking, setSelectedParking] = useState<ParkingLocation | null>(null);
  const { toast } = useToast();

  // Filter and sort parking
  const filteredParking = parkingSpots
    .filter(p => {
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (parseFloat(maxPrice) > 0 && p.pricePerHour > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricePerHour - b.pricePerHour;
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          return b.availability - a.availability;
        default:
          return 0;
      }
    });

  const handleReserve = (parking: ParkingLocation) => {
    setSelectedParking(parking);
    toast({
      title: '🅿️ Parking Selected',
      description: `${parking.name} - Tap to reserve or navigate`,
    });
    onParkingSelected?.(parking);
  };

  const handleNavigate = (parking: ParkingLocation) => {
    // In real app, would open maps
    toast({
      title: '📍 Directions',
      description: `Opening directions to ${parking.name}`,
    });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'charging':
        return <Zap className="h-3 w-3" />;
      case 'wifi':
        return <Wifi className="h-3 w-3" />;
      case 'nearby_cafes':
        return <Coffee className="h-3 w-3" />;
      case 'wheelchair_accessible':
        return <Accessibility className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    return amenity.charAt(0).toUpperCase() + amenity.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Find Parking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                    <SelectItem value="lot">Lot</SelectItem>
                    <SelectItem value="street">Street</SelectItem>
                    <SelectItem value="valet">Valet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Max Price</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="mt-1"
                  placeholder="$10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parking Results */}
      <div className="space-y-3">
        {filteredParking.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="py-8 text-center">
              <MapPinOff className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">No parking found matching your criteria</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredParking.map(parking => (
            <Card
              key={parking.id}
              className={`cursor-pointer transition-all ${
                selectedParking?.id === parking.id
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleReserve(parking)}
            >
              <CardContent className="py-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{parking.name}</h3>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {parking.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        ${parking.pricePerHour.toFixed(2)}/hr
                      </div>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{parking.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Type Badge and Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="capitalize">
                        {parking.type}
                      </Badge>
                      {parking.availability < 5 && (
                        <Badge className="bg-red-500">Low Availability</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{parking.availability}</span> spots available
                    </div>
                  </div>

                  {/* Amenities */}
                  {parking.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parking.amenities.map(amenity => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{getAmenityLabel(amenity)}</span>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Payment Apps */}
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-600 mb-1">Accepts:</div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      {(Array.isArray(parking.acceptsPaymentApps) ? parking.acceptsPaymentApps : []).map(app => (
                        <Badge key={app} variant="outline" className="text-xs">
                          {app === 'apple-pay' ? (
                            <>
                              <Apple className="h-3 w-3 mr-1" />
                              Apple Pay
                            </>
                          ) : app === 'google-pay' ? (
                            <>
                              <Smartphone className="h-3 w-3 mr-1" />
                              Google Pay
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-3 w-3 mr-1" />
                              Venmo
                            </>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Info */}
                  {parking.totalSpaces && parking.totalSpaces > 0 && (
                    <div className="text-xs text-gray-600 flex items-center">
                      <Accessibility className="h-3 w-3 mr-1" />
                      {parking.totalSpaces} total spaces available
                    </div>
                  )}

                  {/* Low Availability Alert */}
                  {parking.availability < 10 && (
                    <div className="flex items-start space-x-2 bg-yellow-50 p-2 rounded text-xs">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-yellow-800">Getting full - consider nearby options</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(parking);
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Navigate
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReserve(parking);
                      }}
                    >
                      <Car className="h-4 w-4 mr-1" />
                      {selectedParking?.id === parking.id ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Selected Parking Details */}
      {selectedParking && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm text-green-900">
              ✅ Parking Reserved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Location:</strong> {selectedParking.name}</p>
            <p><strong>Address:</strong> {selectedParking.address}</p>
            <p><strong>Rate:</strong> ${selectedParking.pricePerHour.toFixed(2)}/hour</p>
            <div className="pt-2 border-t">
              <Button size="sm" className="w-full">
                <Car className="h-4 w-4 mr-2" />
                Check In to Parking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Travelers */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-900">
            ✈️ Parking Tips for Travelers
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-blue-800 space-y-1">
          <p>• Save your parking location in case you need to return to your car</p>
          <p>• Check if overnight parking is available before leaving your car</p>
          <p>• Photograph your parking spot and surroundings</p>
          <p>• Keep your reservation confirmation and payment apps ready</p>
          <p>• Look for well-lit, attended facilities for safety</p>
        </CardContent>
      </Card>
    </div>
  );
}
