/**
 * Vehicle Health Page
 *
 * Comprehensive EV Brain dashboard: degradation chart, tire history,
 * service schedule, software timeline, and NHTSA recall check.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Car, Battery, Activity, Wrench, Shield, RefreshCw, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { useVehicle } from '@/hooks';
import { DegradationChart } from '@/components/vehicle/DegradationChart';
import { BatteryGauge } from '@/components/vehicle/BatteryGauge';
import { TirePressureGrid } from '@/components/vehicle/TirePressureGrid';
import type { NHTSARecall } from '@/types/vehicle';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TIRE_PRESSURE_SPEC_PSI } from '@/types/vehicle';

// Service schedule for Tesla Model Y
const SERVICE_SCHEDULE = [
  { service: 'Tire Rotation', intervalMiles: 6250, icon: '🔄' },
  { service: 'Cabin Air Filter', intervalMonths: 24, icon: '🌬️' },
  { service: 'Brake Fluid Check', intervalMonths: 24, icon: '🛑' },
  { service: 'A/C Desiccant', intervalMonths: 48, icon: '❄️' },
  { service: 'Multi-Point Inspection', intervalMiles: 12500, icon: '🔍' },
];

export function VehicleHealth() {
  const { vehicle, healthHistory, trend, alerts, loading } = useVehicle();
  const [recalls, setRecalls] = useState<NHTSARecall[]>([]);
  const [recallLoading, setRecallLoading] = useState(false);
  const [recallChecked, setRecallChecked] = useState(false);

  const handleRecallCheck = async () => {
    setRecallLoading(true);
    try {
      const { teslaService } = await import('@/services/teslaService');
      const results = await teslaService.getNHTSARecalls('TESLA', 'MODEL Y', '2023');
      setRecalls(results);
      setRecallChecked(true);
    } catch {
      setRecalls([]);
      setRecallChecked(true);
    } finally {
      setRecallLoading(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  // Tire history chart data
  const tireChartData = healthHistory.map(s => {
    const date = new Date(s.timestamp);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      FL: s.tirePressure.frontLeft,
      FR: s.tirePressure.frontRight,
      RL: s.tirePressure.rearLeft,
      RR: s.tirePressure.rearRight,
    };
  });

  // Software versions timeline
  const softwareVersions = [
    ...new Set(healthHistory.map(s => s.softwareVersion)),
  ].map(version => {
    const first = healthHistory.find(s => s.softwareVersion === version)!;
    return {
      version,
      date: new Date(first.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Car className="h-6 w-6 text-green-600" />
            Vehicle Health
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tesla Model Y Long Range · {vehicle.odometer.toLocaleString()} mi
          </p>
        </div>
        <BatteryGauge
          percent={vehicle.batteryPercent}
          rangeMiles={vehicle.rangeMiles}
          chargeState={vehicle.chargeState}
          chargeLimitPercent={vehicle.chargeLimitPercent}
        />
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                alert.severity === 'critical'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : alert.severity === 'warning'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Battery Degradation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Battery className="h-5 w-5 text-blue-600" />
            Battery Degradation
            {trend && trend.trend !== 'insufficient_data' && (
              <Badge variant="outline" className="ml-auto text-xs">
                {trend.degradationPercent}% degraded
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DegradationChart history={healthHistory} />
          {trend && (
            <div className="grid grid-cols-3 gap-4 mt-4 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Baseline</p>
                <p className="font-bold">{trend.baselineKWh} kWh</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current</p>
                <p className="font-bold">{trend.currentKWh} kWh</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trend</p>
                <p className="font-bold capitalize">{trend.trend.replace('_', ' ')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Tire Pressure History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-orange-600" />
            Tire Pressure History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <TirePressureGrid pressure={vehicle.tirePressure} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tireChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[38, 50]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={TIRE_PRESSURE_SPEC_PSI.front} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Spec', fontSize: 10 }} />
              <Bar dataKey="FL" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="FR" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="RL" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="RR" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />FL</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />FR</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />RL</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />RR</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Service Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-5 w-5 text-slate-600" />
            Service Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SERVICE_SCHEDULE.map(item => {
              const isDue = item.intervalMiles
                ? vehicle.odometer % item.intervalMiles > item.intervalMiles * 0.85
                : false;

              return (
                <div
                  key={item.service}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.service}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.intervalMiles
                      ? `Every ${item.intervalMiles.toLocaleString()} mi`
                      : `Every ${item.intervalMonths} months`}
                    {isDue && (
                      <Badge variant="outline" className="ml-2 text-[10px] bg-yellow-50 text-yellow-700 border-none">
                        Due Soon
                      </Badge>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Software Version Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            Software Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {softwareVersions.map((sv, i) => (
              <div
                key={sv.version}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono text-xs">{sv.version}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{sv.date}</span>
                  {i === softwareVersions.length - 1 && (
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-none">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5. NHTSA Recall Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-red-600" />
            Recall Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recallChecked ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Check NHTSA database for any active recalls on your vehicle.
              </p>
              <Button onClick={handleRecallCheck} disabled={recallLoading}>
                {recallLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'Check for Recalls'
                )}
              </Button>
            </div>
          ) : recalls.length === 0 ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3 text-sm">
              <CheckCircle2 className="h-5 w-5" />
              No active recalls found for Tesla Model Y 2023.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {recalls.map((recall, i) => (
                <AccordionItem key={recall.NHTSACampaignNumber || i} value={`recall-${i}`}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2 text-left">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                      <span>{recall.Component}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs space-y-2">
                    <p><strong>Campaign:</strong> {recall.NHTSACampaignNumber}</p>
                    <p><strong>Date:</strong> {recall.ReportReceivedDate}</p>
                    <p><strong>Summary:</strong> {recall.Summary}</p>
                    <p><strong>Consequence:</strong> {recall.Consequence}</p>
                    <p><strong>Remedy:</strong> {recall.Remedy}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
