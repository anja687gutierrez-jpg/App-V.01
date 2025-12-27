import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battery, Clock, AlertCircle, Navigation, Zap } from 'lucide-react';

interface NextStopWidgetProps {
  stationName?: string;
  chargingLevel?: number;
  eta?: string;
  distance?: string;
  recommendedChargeLevel?: number;
  amenities?: string[];
  currentBattery?: number;
  isEVCharger?: boolean;
  alert?: string;
  onNavigate?: () => void;
}

export function NextStopWidget({
  stationName = "Tesla Supercharger",
  eta = "1:30 PM",
  distance = "12.3 miles",
  recommendedChargeLevel = 80,
  amenities = ["WiFi", "Restrooms", "Snacks"],
  currentBattery = 55,
  isEVCharger = true,
  alert = "Suggested charging to 80% to ensure comfortable range for the next leg.",
  onNavigate
}: NextStopWidgetProps) {
  const estimatedChargingTime = Math.ceil((recommendedChargeLevel - currentBattery) / 10); // Rough estimate

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Next Stop
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Station Name & Type */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-foreground">{stationName}</h3>
            {isEVCharger && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                <Zap className="h-3 w-3" />
                EV Charging
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{distance} away</p>
        </div>

        {/* Charging Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Current Charge</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentBattery}%</span>
          </div>
          <Progress 
            value={currentBattery} 
            className="h-3 bg-gray-200 dark:bg-gray-700"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: {recommendedChargeLevel}% | Est. time: {estimatedChargingTime} mins
          </p>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-blue-800">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ETA</p>
              <p className="font-semibold text-sm">{eta}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-blue-800">
            <Battery className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Battery</p>
              <p className="font-semibold text-sm">{currentBattery}% → {recommendedChargeLevel}%</p>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {alert && (
          <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 dark:text-amber-200">{alert}</p>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, idx) => (
                <Badge key={idx} variant="secondary" className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          onClick={onNavigate}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Navigate to {stationName}
        </Button>
      </CardContent>
    </Card>
  );
}
