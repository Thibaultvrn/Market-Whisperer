import { cn } from "../../lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
  valueClassName?: string;
}

export default function MetricCard({
  label,
  value,
  sub,
  className,
  valueClassName
}: MetricCardProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm text-t-tertiary">{label}</p>
      <p className={cn("text-xl font-semibold tabular-nums text-t-primary", valueClassName)}>
        {value}
      </p>
      {sub ? <p className="text-xs text-t-tertiary">{sub}</p> : null}
    </div>
  );
}
