import React, { useState, useEffect } from 'react';
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
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ChargingStation, RouteStop } from '@/types';

interface ChargingPlannerProps {
  routeStops: RouteStop[];
  vehicleRange: number;
  currentBattery: number;
  onUpdateRoute?: (updatedStops: RouteStop[]) => void;
}

export function ChargingPlanner({
  routeStops,
  vehicleRange,
  currentBattery,
  onUpdateRoute
}: ChargingPlannerProps) {
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(currentBattery);
  const [needsCharging, setNeedsCharging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rangeAnxiety, setRangeAnxiety] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const findChargingStations = async () => {
      if (routeStops.length === 0) return;
      setLoading(true);
      try {
        // Mock AI-powered charging station search
        await new Promise(resolve => setTimeout(resolve, 1000));

        const intelligentStations: ChargingStation[] = [
          {
            id: 'tesla_gilroy',
            name: 'Tesla Supercharger - Gilroy Premium Outlets',
            latitude: 37.0058,
            longitude: -121.5683,
            chargingSpeed: '250kW DC Fast Charging',
            connectorTypes: ['Tesla Supercharger V3', 'CCS (Magic Dock)'],
            amenities: ['Premium Outlets', 'Starbucks', 'Food Court', 'Restrooms', 'WiFi', '24/7 Security'],
            estimatedTime: 25,
            distance: Math.floor(Math.random() * 100) + 50,
            pricing: '$0.28/kWh',
            availability: Math.random() > 0.3 ? 'available' : 'busy'
          },
          {
            id: 'ea_kettleman',
            name: 'Electrify America - Kettleman City Travel Center',
            latitude: 36.0078,
            longitude: -119.9625,
            chargingSpeed: '350kW Ultra Fast Charging',
            connectorTypes: ['CCS', 'CHAdeMO'],
            amenities: ['Tesla Supercharger', 'In-N-Out Burger', 'Starbucks', 'Shell Station', '24/7 Open'],
            estimatedTime: 18,
            distance: Math.floor(Math.random() * 150) + 100,
            pricing: '$0.32/kWh',
            availability: 'available'
          }
        ];

        setChargingStations(intelligentStations);
      } catch (error) {
        console.error('Failed to find charging stations:', error);
        const fallbackStations: ChargingStation[] = [
          {
            id: 'fallback_1',
            name: 'Tesla Supercharger - Highway Stop',
            latitude: 37.0058,
            longitude: -121.5683,
            chargingSpeed: '250kW DC Fast Charging',
            connectorTypes: ['Tesla Supercharger'],
            amenities: ['Restaurant', 'Restrooms', 'WiFi'],
            estimatedTime: 25,
            distance: 85,
            pricing: '$0.28/kWh',
            availability: 'available'
          }
        ];
        setChargingStations(fallbackStations);
      } finally {
        setLoading(false);
      }
    };

    findChargingStations();
  }, [routeStops, vehicleRange, batteryLevel]);

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

    const chargingStops = routeStops.filter(stop => stop.type === 'charging').length;
    const estimatedBatteryAtEnd = batteryLevel - ((totalDistance / vehicleRange) * 100);

    setRangeAnxiety(estimatedBatteryAtEnd < 20);
    setNeedsCharging(estimatedBatteryAtEnd < 10 && chargingStops === 0);

    if (estimatedBatteryAtEnd < 0) {
      setBatteryLevel(Math.max(5, estimatedBatteryAtEnd + 100));
    }
  }, [routeStops, vehicleRange, batteryLevel]);

  const addOptimalChargingStop = (station: ChargingStation) => {
    const newStop: RouteStop = {
      id: `charging_${Date.now()}`,
      tourId: routeStops[0]?.tourId || 'temp',
      type: 'charging',
      name: station.name,
      description: `${station.chargingSpeed} - Est. ${station.estimatedTime} min charge to 80%`,
      latitude: station.latitude,
      longitude: station.longitude,
      stopOrder: routeStops.length + 1,
      estimatedTime: station.estimatedTime,
      chargingInfo: { connectorTypes: station.connectorTypes, maxPower: parseInt(station.chargingSpeed) || 150, pricing: station.pricing || 'Contact station' },
      amenities: JSON.stringify(station.amenities),
      createdAt: new Date().toISOString()
    };

    const updatedStops = [...routeStops, newStop];
    onUpdateRoute?.(updatedStops);

    setNeedsCharging(false);
    setRangeAnxiety(false);
    setBatteryLevel(Math.min(100, batteryLevel + 60));

    toast({ title: 'Charging Stop Added! ⚡', description: `${station.name} added to your route.` });
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

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Battery className="h-5 w-5 mr-2 text-primary" />
            Smart EV Charging Planner
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
            <span>Max Range: {vehicleRange} miles</span>
          </div>
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
            <h4 className="font-semibold text-gray-900">Recommended Charging Stations</h4>
            <Badge variant="outline" className="text-xs">{chargingStations.length} found</Badge>
          </div>

          {chargingStations.map((station) => (
            <Card key={station.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{station.name}</h5>
                      {getAvailabilityBadge(station.availability || 'available')}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center"><Zap className="h-4 w-4 mr-1 text-blue-500" />{station.chargingSpeed}</div>
                      <div className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-green-500" />{station.distance} mi</div>
                      <div className="flex items-center"><Clock className="h-4 w-4 mr-1 text-orange-500" />~{station.estimatedTime} min</div>
                    </div>

                    {station.pricing && (<div className="text-sm text-gray-600 mb-2"><span className="font-medium">Pricing:</span> {station.pricing}</div>)}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {station.connectorTypes.map((connector, index) => (<Badge key={index} variant="secondary" className="text-xs">{connector}</Badge>))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {station.amenities.slice(0, 4).map((amenity, index) => (<Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>))}
                      {station.amenities.length > 4 && (<Badge variant="outline" className="text-xs">+{station.amenities.length - 4} more</Badge>)}
                    </div>
                  </div>

                  <Button onClick={() => addOptimalChargingStop(station)} disabled={station.availability === 'offline'} className="ml-4">
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
            <Button variant="outline" className="h-auto flex flex-col items-center py-3"><Navigation className="h-5 w-5 mb-1 text-blue-600" /><span className="text-sm">Route to Nearest</span></Button>
            <Button variant="outline" className="h-auto flex flex-col items-center py-3"><Battery className="h-5 w-5 mb-1 text-green-600" /><span className="text-sm">Battery Health</span></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
