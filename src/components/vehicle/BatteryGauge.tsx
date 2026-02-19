import { Progress } from '@/components/ui/progress';
import { Battery, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChargeState } from '@/types/vehicle';

interface BatteryGaugeProps {
  percent: number;
  rangeMiles: number;
  chargeState: ChargeState;
  chargeLimitPercent: number;
}

export function BatteryGauge({ percent, rangeMiles, chargeState, chargeLimitPercent }: BatteryGaugeProps) {
  const isCharging = chargeState === 'charging';
  const color = percent > 60 ? 'text-green-600' : percent > 20 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs sm:text-sm">
        <span className="text-muted-foreground flex items-center gap-1">
          {isCharging ? <Zap className="h-3.5 w-3.5 text-yellow-500 animate-pulse" /> : <Battery className="h-3.5 w-3.5" />}
          Battery
        </span>
        <span className={cn('font-bold', color)}>{percent}%</span>
      </div>
      <Progress value={percent} className="h-2 bg-slate-100" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>
          {isCharging ? 'Charging' : chargeState === 'complete' ? 'Fully Charged' : 'Disconnected'}
          {' · '}{chargeLimitPercent}% limit
        </span>
        <span className="font-medium">{rangeMiles} mi</span>
      </div>
    </div>
  );
}
