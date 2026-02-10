import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Battery,
  MapPin,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Plus,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { nrelService, type ChargingStationFormatted } from '@/services';
import type { RouteStop } from '@/types';

// Tesla Model Y specifications
const TESLA_MODEL_Y = {
  batteryCapacity: 75, // kWh
  range: 280, // miles (EPA estimated)
};

interface ChargingPlannerProps {
  routeStops: RouteStop[];
  vehicleRange?: number;
  currentBattery?: number;
  onUpdateRoute?: (updatedStops: RouteStop[]) => void;
}

export function ChargingPlanner({
  routeStops,
  vehicleRange = TESLA_MODEL_Y.range,
  currentBattery = 80,
  onUpdateRoute
}: ChargingPlannerProps) {
  const [chargingStations, setChargingStations] = useState<ChargingStationFormatted[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(currentBattery);
  const [needsCharging, setNeedsCharging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rangeAnxiety, setRangeAnxiety] = useState(false);
  const [batteryAnalysis, setBatteryAnalysis] = useState<{
    estimatedRemainingPercent: number;
    segments: Array<{
      from: { lat: number; lng: number };
      to: { lat: number; lng: number };
      distance: number;
      batteryUsed: number;
      batteryRemaining: number;
    }>;
  } | null>(null);
  const { toast } = useToast();

  // Fetch charging stations from NREL API
  const fetchChargingStations = useCallback(async () => {
    if (routeStops.length === 0) return;

    setLoading(true);
    try {
      // Get the first stop location as reference point
      const firstStop = routeStops[0];
      const lat = firstStop.latitude;
      const lng = firstStop.longitude;

      if (!lat || !lng) {
        console.warn('[ChargingPlanner] No valid coordinates for first stop');
        return;
      }

      // If we have multiple stops, analyze the route
      if (routeStops.length >= 2) {
        const waypoints = routeStops
          .filter(stop => stop.latitude && stop.longitude)
          .map(stop => ({
            lat: stop.latitude,
            lng: stop.longitude,
          }));

        const result = await nrelService.getStationsAlongRoute(waypoints, batteryLevel);

        setChargingStations(result.stations.length > 0 ? result.stations : await nrelService.getTeslaSuperchargers(lat, lng, 50));
        setBatteryAnalysis({
          estimatedRemainingPercent: result.batteryAnalysis.estimatedRemainingPercent,
          segments: result.batteryAnalysis.segments,
        });
        setNeedsCharging(result.batteryAnalysis.needsCharging);
        setRangeAnxiety(result.batteryAnalysis.rangeAnxiety);

        // Auto-suggest stops if needed
        if (result.suggestedStops.length > 0) {
          toast({
            title: 'Charging stops recommended',
            description: `${result.suggestedStops.length} charging stop(s) suggested along your route.`,
          });
        }
      } else {
        // Single location - just fetch nearby stations
        const stations = await nrelService.getTeslaSuperchargers(lat, lng, 50);
        setChargingStations(stations);
      }
    } catch (error) {
      console.error('[ChargingPlanner] Failed to find charging stations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load charging stations. Using cached data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [routeStops, batteryLevel, toast]);

  useEffect(() => {
    fetchChargingStations();
  }, [fetchChargingStations]);

  // Calculate battery impact when route changes
  useEffect(() => {
    if (routeStops.length < 2) return;

    const totalDistance = routeStops.reduce((acc, stop, index) => {
      if (index === 0) return 0;
      const prevStop = routeStops[index - 1];
      if (!stop.latitude || !stop.longitude || !prevStop.latitude || !prevStop.longitude) return acc;

      // Haversine formula for distance
      const R = 3959; // Earth's radius in miles
      const dLat = (stop.latitude - prevStop.latitude) * Math.PI / 180;
      const dLng = (stop.longitude - prevStop.longitude) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(prevStop.latitude * Math.PI / 180) *
        Math.cos(stop.latitude * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return acc + R * c;
    }, 0);

    const chargingStops = routeStops.filter(stop => stop.type === 'charging').length;
    const estimatedBatteryAtEnd = batteryLevel - ((totalDistance / vehicleRange) * 100);

    setRangeAnxiety(estimatedBatteryAtEnd < 20);
    setNeedsCharging(estimatedBatteryAtEnd < 10 && chargingStops === 0);
  }, [routeStops, vehicleRange, batteryLevel]);

  const addOptimalChargingStop = (station: ChargingStationFormatted) => {
    const newStop: RouteStop = {
      id: `charging_${Date.now()}`,
      tourId: routeStops[0]?.tourId || 'temp',
      type: 'charging',
      name: station.name,
      description: `${station.chargingSpeed} - Est. ${station.estimatedChargeTime} min charge to 80%`,
      location: { lat: station.latitude, lng: station.longitude },
      address: station.name,
      order: routeStops.length + 1,
      latitude: station.latitude,
      longitude: station.longitude,
      stopOrder: routeStops.length + 1,
      estimatedTime: station.estimatedChargeTime,
      chargingInfo: {
        connectorTypes: station.connectorTypes,
        maxPower: parseInt(station.chargingSpeed) || 150,
        pricing: station.pricing
      },
      amenities: JSON.stringify(station.amenities),
      createdAt: new Date().toISOString()
    };

    const updatedStops = [...routeStops, newStop];
    onUpdateRoute?.(updatedStops);

    setNeedsCharging(false);
    setRangeAnxiety(false);
    setBatteryLevel(Math.min(100, batteryLevel + 60));

    toast({
      title: 'Charging Stop Added!',
      description: `${station.name} added to your route.`
    });
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryBgColor = (level: number) => {
    if (level > 60) return 'bg-green-50 border-green-200';
    if (level > 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Busy</Badge>;
      case 'offline':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getNetworkBadge = (network: string) => {
    if (network === 'Tesla') {
      return <Badge className="bg-red-600 hover:bg-red-600 text-white">Tesla</Badge>;
    }
    if (network === 'Electrify America') {
      return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">EA</Badge>;
    }
    return <Badge variant="outline">{network}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Battery className="h-5 w-5 mr-2 text-primary" />
            Tesla Charging Planner
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                Finding stations...
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchChargingStations}
                className="h-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Battery Status */}
        <div className={`p-4 rounded-lg border-2 ${getBatteryBgColor(batteryLevel)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Battery className={`h-6 w-6 ${getBatteryColor(batteryLevel)}`} />
              <div>
                <span className="text-sm font-medium">Current Battery</span>
                {rangeAnxiety && (
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Range anxiety detected
                  </div>
                )}
              </div>
            </div>
            <span className={`text-2xl font-bold ${getBatteryColor(batteryLevel)}`}>{batteryLevel}%</span>
          </div>

          <Progress value={batteryLevel} className="h-3 mb-2" />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Est. Range: {Math.floor((batteryLevel / 100) * vehicleRange)} miles</span>
            <span>Model Y: {vehicleRange} mi max</span>
          </div>

          {batteryAnalysis && batteryAnalysis.segments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Route Battery Analysis</div>
              <div className="flex items-center justify-between text-sm">
                <span>Est. at destination:</span>
                <span className={getBatteryColor(batteryAnalysis.estimatedRemainingPercent)}>
                  {batteryAnalysis.estimatedRemainingPercent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {needsCharging && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Critical: Charging Required</h4>
                <p className="text-sm text-red-700">Your route exceeds your vehicle's remaining range. Add charging stops to continue safely.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Tesla Superchargers Nearby</h4>
            <Badge variant="outline" className="text-xs">{chargingStations.length} found</Badge>
          </div>

          {chargingStations.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No charging stations found nearby.</p>
              <p className="text-sm">Try adjusting your route or search radius.</p>
            </div>
          )}

          {chargingStations.map((station) => (
            <Card key={station.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{station.name}</h5>
                      {getNetworkBadge(station.network)}
                      {getAvailabilityBadge(station.status)}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {station.address}, {station.city}, {station.state}
                    </p>

                    <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-blue-500" />
                        {station.chargingSpeed}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-green-500" />
                        {station.distance} mi
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-orange-500" />
                        ~{station.estimatedChargeTime} min
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Pricing:</span> {station.pricing}
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Chargers:</span> {station.dcFastCount} DC Fast
                      {station.level2Count > 0 && `, ${station.level2Count} Level 2`}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {station.connectorTypes.map((connector, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{connector}</Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {station.amenities.slice(0, 4).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                      ))}
                      {station.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{station.amenities.length - 4} more</Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => addOptimalChargingStop(station)}
                    disabled={station.status === 'offline'}
                    className="ml-4"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {routeStops.filter(stop => stop.type === 'charging').length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Planned Charging Stops</h4>
            <div className="space-y-2">
              {routeStops.filter(stop => stop.type === 'charging').map((stop) => (
                <div key={stop.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-medium text-green-900">{stop.name}</span>
                      <div className="text-sm text-green-700">{stop.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Stop #{stop.stopOrder}</Badge>
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">{stop.estimatedTime}min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto flex flex-col items-center py-3">
              <Navigation className="h-5 w-5 mb-1 text-blue-600" />
              <span className="text-sm">Route to Nearest</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center py-3">
              <Battery className="h-5 w-5 mb-1 text-green-600" />
              <span className="text-sm">Battery Health</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
