import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BatteryGauge } from './BatteryGauge';
import { TirePressureGrid } from './TirePressureGrid';
import { TripConfidence } from './TripConfidence';
import type { VehicleState, VehicleHealthTrend, VehicleServiceAlert, TripRangeAnalysis } from '@/types/vehicle';

interface VehicleStatusCardProps {
  vehicle: VehicleState;
  trend: VehicleHealthTrend | null;
  alerts: VehicleServiceAlert[];
  tripAnalysis?: TripRangeAnalysis | null;
  onViewHealth: () => void;
}

function borderColor(alerts: VehicleServiceAlert[]): string {
  if (alerts.some(a => a.severity === 'critical')) return 'border-l-red-500';
  if (alerts.some(a => a.severity === 'warning')) return 'border-l-yellow-500';
  return 'border-l-green-500';
}

function healthBadge(trend: VehicleHealthTrend | null) {
  if (!trend || trend.trend === 'insufficient_data') return null;

  const healthPercent = Math.round(
    (trend.currentKWh / trend.baselineKWh) * 100
  );

  const arrow = trend.trend === 'degrading' ? '\u2193' : trend.trend === 'improving' ? '\u2191' : '';
  const color =
    trend.trend === 'degrading' ? 'bg-yellow-100 text-yellow-800' :
    trend.trend === 'improving' ? 'bg-green-100 text-green-800' :
    'bg-slate-100 text-slate-700';

  return (
    <Badge variant="outline" className={cn('text-[10px] border-none font-bold', color)}>
      {healthPercent}% {arrow}
    </Badge>
  );
}

export function VehicleStatusCard({ vehicle, trend, alerts, tripAnalysis, onViewHealth }: VehicleStatusCardProps) {
  return (
    <Card className={cn('border-l-4 shadow-sm hover:shadow-md transition-all animate-in fade-in', borderColor(alerts))}>
      <CardHeader className="pb-3 bg-slate-50/50 p-4 sm:p-6 sm:pb-3">
        <CardTitle className="text-sm sm:text-base font-bold flex items-center justify-between text-slate-800">
          <span className="flex items-center gap-2">
            <Car className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            Vehicle Status
          </span>
          {healthBadge(trend)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 p-4 sm:p-6 sm:pt-4">
        <div className="space-y-3">
          {/* Model */}
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-muted-foreground">Model</span>
            <span className="font-bold">Tesla Model Y</span>
          </div>

          {/* Battery Gauge */}
          <BatteryGauge
            percent={vehicle.batteryPercent}
            rangeMiles={vehicle.rangeMiles}
            chargeState={vehicle.chargeState}
            chargeLimitPercent={vehicle.chargeLimitPercent}
          />

          {/* Tire Pressure */}
          <TirePressureGrid pressure={vehicle.tirePressure} />

          {/* Trip Confidence (only with active trip) */}
          {tripAnalysis && <TripConfidence analysis={tripAnalysis} />}

          {/* Alert count */}
          {alerts.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
              <span className="font-medium">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-4 text-green-700 hover:text-green-800 hover:bg-green-50 text-xs uppercase tracking-wide font-bold"
          onClick={onViewHealth}
        >
          View Full Health
        </Button>
      </CardContent>
    </Card>
  );
}
