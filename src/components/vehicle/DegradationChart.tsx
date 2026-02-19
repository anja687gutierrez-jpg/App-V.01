import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VehicleHealthSnapshot } from '@/types/vehicle';
import { TESLA_MODEL_Y_SPECS } from '@/types/vehicle';

interface DegradationChartProps {
  history: VehicleHealthSnapshot[];
}

export function DegradationChart({ history }: DegradationChartProps) {
  const data = history.map(s => {
    const date = new Date(s.timestamp);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      kWh: s.nominalFullPackEnergy,
      range: Math.round(
        (s.nominalFullPackEnergy / TESLA_MODEL_Y_SPECS.BATTERY_CAPACITY_KWH) *
        TESLA_MODEL_Y_SPECS.EPA_RANGE_MILES
      ),
      odometer: s.odometer,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="kwhGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          domain={['dataMin - 1', 'dataMax + 1']}
          label={{ value: 'kWh', angle: -90, position: 'insideLeft', fontSize: 11, offset: 15 }}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value: number, name: string) => {
            if (name === 'kWh') return [`${value} kWh`, 'Pack Energy'];
            return [value, name];
          }}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="kWh"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#kwhGradient)"
          dot={{ r: 3, fill: '#3b82f6' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
