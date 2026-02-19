import { cn } from '@/lib/utils';
import { TIRE_PRESSURE_SPEC_PSI, type TirePressurePSI } from '@/types/vehicle';

interface TirePressureGridProps {
  pressure: TirePressurePSI;
}

function tireColor(psi: number, spec: number): string {
  const diff = Math.abs(psi - spec);
  if (diff <= 1) return 'text-green-600 bg-green-50';
  if (diff <= TIRE_PRESSURE_SPEC_PSI.tolerancePSI) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function tireIndicator(psi: number, spec: number): string {
  const diff = psi - spec;
  if (Math.abs(diff) <= 1) return '';
  return diff < 0 ? '\u25BC' : '\u25B2'; // ▼ or ▲
}

export function TirePressureGrid({ pressure }: TirePressureGridProps) {
  const { front, rear } = TIRE_PRESSURE_SPEC_PSI;

  const tires = [
    { label: 'FL', psi: pressure.frontLeft, spec: front },
    { label: 'FR', psi: pressure.frontRight, spec: front },
    { label: 'RL', psi: pressure.rearLeft, spec: rear },
    { label: 'RR', psi: pressure.rearRight, spec: rear },
  ];

  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
      <span className="text-muted-foreground shrink-0">Tires</span>
      <div className="flex gap-1 flex-1 justify-end">
        {tires.map(t => (
          <span
            key={t.label}
            className={cn(
              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[11px] sm:text-xs font-medium min-w-[3rem] justify-center',
              tireColor(t.psi, t.spec)
            )}
          >
            {t.label}:{t.psi}
            {tireIndicator(t.psi, t.spec) && (
              <span className="text-[9px]">{tireIndicator(t.psi, t.spec)}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
