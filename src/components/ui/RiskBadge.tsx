import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const riskBadgeVariants = cva(
  "inline-flex items-center rounded-inner border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      level: {
        high: "border-risk-high/30 bg-risk-high-muted text-risk-high",
        medium: "border-risk-medium/30 bg-risk-medium-muted text-risk-medium",
        low: "border-risk-low/30 bg-risk-low-muted text-risk-low"
      },
      size: {
        sm: "px-2 py-px text-[10px]",
        md: "px-2.5 py-0.5 text-[11px]",
        lg: "px-3 py-1 text-xs"
      }
    },
    defaultVariants: {
      level: "low",
      size: "md"
    }
  }
);

type RiskBadgeProps = VariantProps<typeof riskBadgeVariants> & {
  children: React.ReactNode;
  className?: string;
};

export default function RiskBadge({ level, size, children, className }: RiskBadgeProps) {
  return (
    <span className={cn(riskBadgeVariants({ level, size }), className)}>
      {children}
    </span>
  );
}
