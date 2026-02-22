import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatWeekLabel } from "../../lib/weekUtils";

interface WeekSelectorProps {
  weekKey: string;
  weekIndex: number;
  totalWeeks: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function WeekSelector({
  weekKey,
  weekIndex,
  totalWeeks,
  onPrev,
  onNext
}: WeekSelectorProps) {
  const canPrev = weekIndex > 0;
  const canNext = weekIndex < totalWeeks - 1;

  return (
    <div className="flex items-center justify-center gap-4 rounded-inner border border-border-subtle bg-elevated/50 px-4 py-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className="flex h-9 w-9 items-center justify-center rounded-inner border border-border-subtle bg-surface transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
        aria-label="Previous week"
      >
        <ChevronLeft size={18} className="text-t-primary" />
      </button>

      <span className="min-w-[200px] text-center text-sm font-medium text-t-primary">
        Week of {formatWeekLabel(weekKey)}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="flex h-9 w-9 items-center justify-center rounded-inner border border-border-subtle bg-surface transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
        aria-label="Next week"
      >
        <ChevronRight size={18} className="text-t-primary" />
      </button>
    </div>
  );
}
