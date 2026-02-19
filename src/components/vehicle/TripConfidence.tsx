import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { TripRangeAnalysis } from '@/types/vehicle';

interface TripConfidenceProps {
  analysis: TripRangeAnalysis;
}

const tierColors: Record<string, string> = {
  comfortable: 'bg-green-100 text-green-800',
  tight: 'bg-yellow-100 text-yellow-800',
  risky: 'bg-orange-100 text-orange-800',
  insufficient: 'bg-red-100 text-red-800',
};

function ConfidenceDots({ score }: { score: number }) {
  const filled = Math.round(score / 20); // 0-5
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            i < filled ? 'bg-current' : 'bg-slate-300'
          )}
        />
      ))}
    </span>
  );
}

export function TripConfidence({ analysis }: TripConfidenceProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed text-xs sm:text-sm">
      <span className="text-muted-foreground">Trip</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn('text-[10px] sm:text-xs border-none font-bold', tierColors[analysis.warningTier])}>
          {analysis.confidenceScore}%
        </Badge>
        <ConfidenceDots score={analysis.confidenceScore} />
        <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
          {analysis.availableRangeMiles}/{analysis.routeMiles} mi
        </span>
      </div>
    </div>
  );
}
