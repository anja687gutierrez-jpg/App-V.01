import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Fuel,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Plus,
  TrendingDown,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GasStation, RouteStop } from '@/types';

interface FuelPlannerProps {
  routeStops: RouteStop[];
  vehicleRange: number;
  currentFuelLevel: number;
  mpg: number; // Miles per gallon
  tankSize: number; // Gallons
  onUpdateRoute?: (updatedStops: RouteStop[]) => void;
}

export function FuelPlanner({
  routeStops,
  vehicleRange,
  currentFuelLevel,
  mpg = 25,
  tankSize = 15,
  onUpdateRoute
}: FuelPlannerProps) {
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [fuelLevel, setFuelLevel] = useState(currentFuelLevel);
  const [needsRefueling, setNeedsRefueling] = useState(false);
  const [lowFuelWarning, setLowFuelWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalTripCost, setTotalTripCost] = useState(0);
  const [costSavings, setCostSavings] = useState(0);
  const { toast } = useToast();

  // Calculate trip metrics
  const currentRange = fuelLevel * mpg;
  const costPerMile = (1 / mpg) * 3.5; // Approximate $3.50/gallon average

  useEffect(() => {
    const findGasStations = async () => {
      if (routeStops.length === 0) return;
      setLoading(true);
      try {
        // Simulate AI-powered gas station search with real-time pricing
        await new Promise(resolve => setTimeout(resolve, 1200));

        const basePrice = 3.45; // Current average US price
        const priceVariation = () => (Math.random() - 0.5) * 0.40; // ±$0.20 variation

        const intelligentStations: GasStation[] = [
          {
            id: 'shell_harris',
            name: 'Shell - Harris Ranch Rest Stop',
            latitude: 35.8922,
            longitude: -120.8234,
            pricePerGallon: basePrice + priceVariation(),
            brand: 'Shell',
            fuelTypes: ['Regular', 'Plus', 'Premium', 'Diesel'],
            amenities: ['Restaurant', 'Restrooms', '24/7 Open', 'Convenience Store', 'Car Wash'],
            distance: Math.floor(Math.random() * 80) + 40,
            rating: 4.3,
            availability: Math.random() > 0.2 ? 'open' : 'closing_soon',
            loyaltyDiscount: -0.15 // Shell Rewards -$0.15
          },
          {
            id: 'costco_fresno',
            name: 'Costco Gas - Fresno Station',
            latitude: 36.7469,
            longitude: -119.7674,
            pricePerGallon: basePrice - 0.35 + priceVariation(), // Costco usually cheaper
            brand: 'Costco',
            fuelTypes: ['Regular', 'Plus', 'Premium'],
            amenities: ['Membership Required', 'Fastest Service', 'Restrooms', '24/7 Open'],
            distance: Math.floor(Math.random() * 100) + 60,
            rating: 4.7,
            availability: 'open',
            loyaltyDiscount: -0.35 // Costco premium pricing model
          },
          {
            id: 'chevron_tulare',
            name: 'Chevron - Tulare Station',
            latitude: 36.2183,
            longitude: -119.3385,
            pricePerGallon: basePrice + 0.05 + priceVariation(),
            brand: 'Chevron',
            fuelTypes: ['Regular', 'Plus', 'Premium', 'Diesel'],
            amenities: ['Restrooms', 'Convenience Store', 'ATM', '24/7 Open', 'Rewards Program'],
            distance: Math.floor(Math.random() * 120) + 80,
            rating: 4.1,
            availability: 'open',
            loyaltyDiscount: -0.10 // Chevron Techron -$0.10
          },
          {
            id: 'arco_bakersfield',
            name: 'ARCO - Bakersfield Budget Stop',
            latitude: 35.3733,
            longitude: -119.0187,
            pricePerGallon: basePrice - 0.25 + priceVariation(), // ARCO is budget
            brand: 'ARCO',
            fuelTypes: ['Regular', 'Plus'],
            amenities: ['ATM Only', 'Cash/Card', 'Budget Option', '24/7 Open'],
            distance: Math.floor(Math.random() * 140) + 100,
            rating: 3.8,
            availability: 'open',
            loyaltyDiscount: 0 // ARCO no discount
          },
          {
            id: 'bpamoco_visalia',
            name: 'BP/Amoco - Visalia Station',
            latitude: 36.3305,
            longitude: -119.2945,
            pricePerGallon: basePrice + 0.08 + priceVariation(),
            brand: 'BP',
            fuelTypes: ['Regular', 'Plus', 'Premium', 'Diesel'],
            amenities: ['Restaurant', 'Restrooms', 'WiFi', 'EV Charging', 'Convenience Store'],
            distance: Math.floor(Math.random() * 110) + 70,
            rating: 4.2,
            availability: 'open',
            loyaltyDiscount: -0.12 // BP Rewards -$0.12
          }
        ];

        setGasStations(intelligentStations);
      } catch (error) {
        console.error('Failed to find gas stations:', error);
        // Fallback to basic stations
        const fallbackStations: GasStation[] = [
          {
            id: 'fallback_1',
            name: 'Gas Station - Highway Stop',
            latitude: 36.5,
            longitude: -120.0,
            pricePerGallon: 3.50,
            brand: 'Generic',
            fuelTypes: ['Regular', 'Plus', 'Premium'],
            amenities: ['Restrooms', 'Convenience Store'],
            distance: 75,
            rating: 3.5,
            availability: 'open',
            loyaltyDiscount: 0
          }
        ];
        setGasStations(fallbackStations);
      } finally {
        setLoading(false);
      }
    };

    findGasStations();
  }, [routeStops, vehicleRange, mpg, tankSize]);

  // Calculate refueling needs
  useEffect(() => {
    const totalDistance = routeStops.reduce((acc, stop, index) => {
      if (index === 0) return 0;
      const prevStop = routeStops[index - 1];
      const distance = Math.sqrt(
        Math.pow(stop.latitude - prevStop.latitude, 2) +
        Math.pow(stop.longitude - prevStop.longitude, 2)
      ) * 69; // rough miles conversion
      return acc + distance;
    }, 0);

    const fuelStops = routeStops.filter(stop => stop.type === 'fuel').length;
    const currentRange = fuelLevel * mpg;
    
    setLowFuelWarning(currentRange < totalDistance * 1.2 && fuelStops === 0);
    setNeedsRefueling(currentRange < totalDistance * 1.1 && fuelStops === 0);

    // Calculate trip cost
    const gallonsNeeded = totalDistance / mpg;
    const estimatedCost = gallonsNeeded * 3.50; // Average price
    setTotalTripCost(estimatedCost);

  }, [routeStops, fuelLevel, mpg]);

  const addOptimalRefuelingStop = (station: GasStation) => {
    const gallonsToFill = tankSize - fuelLevel;
    const costAtStation = gallonsToFill * (station.pricePerGallon + station.loyaltyDiscount);
    
    const newStop: RouteStop = {
      id: `fuel_${Date.now()}`,
      tourId: routeStops[0]?.tourId || 'temp',
      type: 'fuel',
      name: station.name,
      description: `${station.brand} - $${(station.pricePerGallon + station.loyaltyDiscount).toFixed(2)}/gal | Est. $${costAtStation.toFixed(2)} to fill`,
      latitude: station.latitude,
      longitude: station.longitude,
      stopOrder: routeStops.length + 1,
      estimatedTime: 8, // 8 minutes average fill time
      fuelInfo: {
        brand: station.brand,
        pricePerGallon: station.pricePerGallon,
        estimatedCost: costAtStation,
        fuelTypes: station.fuelTypes,
        loyaltyDiscount: station.loyaltyDiscount
      },
      amenities: JSON.stringify(station.amenities),
      createdAt: new Date().toISOString()
    };

    const updatedStops = [...routeStops, newStop];
    onUpdateRoute?.(updatedStops);

    setNeedsRefueling(false);
    setLowFuelWarning(false);
    setFuelLevel(Math.min(tankSize, fuelLevel + (tankSize * 0.7))); // Assume fill to ~70% initially

    toast({
      title: 'Refueling Stop Added! ⛽',
      description: `${station.name} (${station.pricePerGallon.toFixed(2)}/gal) added to your route.`
    });
  };

  const getFuelColor = (level: number, max: number = tankSize) => {
    const percentage = (level / max) * 100;
    if (percentage > 60) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFuelBgColor = (level: number, max: number = tankSize) => {
    const percentage = (level / max) * 100;
    if (percentage > 60) return 'bg-green-50 border-green-200';
    if (percentage > 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'open':
        return <Badge className="bg-green-500 hover:bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Open</Badge>;
      case 'closing_soon':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Closing Soon</Badge>;
      case 'closed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const calculateSavings = (selectedStation: GasStation) => {
    const expensiveStation = gasStations.reduce((prev, current) => 
      (current.pricePerGallon + current.loyaltyDiscount) > (prev.pricePerGallon + prev.loyaltyDiscount) ? current : prev
    );
    
    const gallonsNeeded = tankSize - fuelLevel;
    const savingsAmount = (expensiveStation.pricePerGallon - selectedStation.pricePerGallon) * gallonsNeeded;
    return savingsAmount;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Fuel className="h-5 w-5 mr-2 text-amber-600" />
            Fuel Cost Optimizer
          </div>
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              Finding stations...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fuel Tank Status */}
        <div className={`p-4 rounded-lg border-2 ${getFuelBgColor(fuelLevel)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Fuel className={`h-6 w-6 ${getFuelColor(fuelLevel)}`} />
              <div>
                <span className="text-sm font-medium">Current Fuel Level</span>
                {lowFuelWarning && (
                  <div className="flex items-center text-xs text-yellow-600 mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low fuel warning
                  </div>
                )}
              </div>
            </div>
            <span className={`text-2xl font-bold ${getFuelColor(fuelLevel)}`}>
              {fuelLevel.toFixed(1)} / {tankSize} gal
            </span>
          </div>

          <Progress value={(fuelLevel / tankSize) * 100} className="h-3 mb-2" />

          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
            <div>
              <span className="font-medium">Current Range</span>
              <p className="text-lg font-bold text-gray-900">{Math.floor(currentRange)} mi</p>
            </div>
            <div>
              <span className="font-medium">MPG</span>
              <p className="text-lg font-bold text-gray-900">{mpg}</p>
            </div>
            <div>
              <span className="font-medium">Cost/Mile</span>
              <p className="text-lg font-bold text-gray-900">${costPerMile.toFixed(2)}</p>
            </div>
          </div>

          {needsRefueling && (
            <div className="text-xs text-red-700 bg-red-50 p-2 rounded mt-2">
              ⚠️ Trip exceeds tank range. Add refueling stops required.
            </div>
          )}
        </div>

        {/* Trip Cost Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estimated Trip Cost</p>
                  <p className="text-2xl font-bold text-blue-600">${totalTripCost.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(calculateSavings(gasStations[0]) || 0).toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gas Stations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Gas Station Options</h4>
            <Badge variant="outline" className="text-xs">{gasStations.length} found</Badge>
          </div>

          {gasStations.map((station) => {
            const finalPrice = station.pricePerGallon + station.loyaltyDiscount;
            const savings = calculateSavings(station);
            const cheapest = gasStations.reduce((prev, current) =>
              (current.pricePerGallon + current.loyaltyDiscount) < (prev.pricePerGallon + prev.loyaltyDiscount) ? current : prev
            );
            const isCheapest = station.id === cheapest.id;

            return (
              <Card key={station.id} className={`border hover:shadow-md transition-shadow ${isCheapest ? 'border-green-300 bg-green-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-gray-900">{station.name}</h5>
                        {getAvailabilityBadge(station.availability || 'open')}
                        {isCheapest && <Badge className="bg-green-500">Best Price</Badge>}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          {finalPrice.toFixed(2)}/gal
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                          {station.distance} mi away
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-orange-500" />
                          ~8 min fill
                        </div>
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                          {station.rating}/5
                        </div>
                      </div>

                      {/* Fuel Types */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Fuel Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {station.fuelTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {station.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {station.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{station.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Loyalty Discount */}
                      {station.loyaltyDiscount < 0 && (
                        <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                          💳 Loyalty Discount: ${Math.abs(station.loyaltyDiscount).toFixed(2)}/gal
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Fill Cost</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${((tankSize - fuelLevel) * finalPrice).toFixed(2)}
                        </p>
                        {savings > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Save ${savings.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addOptimalRefuelingStop(station)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Route
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Refueling Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Refueling Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Cheapest option: {gasStations[gasStations.length - 1]?.brand || 'Gas Station'} at ${Math.min(...gasStations.map(s => s.pricePerGallon + s.loyaltyDiscount)).toFixed(2)}/gal</li>
              <li>• Loyalty programs save ${Math.abs(gasStations.reduce((min, s) => s.loyaltyDiscount < min ? s.loyaltyDiscount : min, 0)).toFixed(2)}/gal</li>
              <li>• Refuel early in the week (prices typically lower Mon-Wed)</li>
              <li>• Use rewards programs on longer trips to maximize savings</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
