import type { RiskLevel } from "../../lib/types";
import RiskBadge from "../ui/RiskBadge";
import SectionCard from "../ui/SectionCard";

interface PortfolioRiskBannerProps {
  score: number;
  level: RiskLevel;
  stockCount: number;
}

const barColor: Record<RiskLevel, string> = {
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low"
};

const scoreColor: Record<RiskLevel, string> = {
  high: "text-risk-high",
  medium: "text-risk-medium",
  low: "text-risk-low"
};

export default function PortfolioRiskBanner({
  score,
  level,
  stockCount
}: PortfolioRiskBannerProps) {
  const pct = Math.round(score * 100);

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-t-tertiary">Portfolio Risk</p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className={`text-3xl font-semibold tabular-nums ${scoreColor[level]}`}>
              {score.toFixed(2)}
            </span>
            <RiskBadge level={level} size="lg">{level}</RiskBadge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-t-tertiary">{stockCount} stocks at risk</p>
          <p className="mt-0.5 text-xs text-t-tertiary">Correlation-weighted</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full transition-all ${barColor[level]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </SectionCard>
  );
}
