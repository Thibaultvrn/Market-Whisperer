import type { RiskLevel, StockAnalysis } from "../../lib/types";
import RiskBadge from "../ui/RiskBadge";
import SectionCard from "../ui/SectionCard";

interface StockCardProps {
  stock: StockAnalysis;
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

export default function StockCard({ stock }: StockCardProps) {
  const isHighRisk = stock.total_risk_level === "high";

  return (
    <SectionCard
      noPadding
      className={isHighRisk ? "border-risk-high/20" : undefined}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-6 py-5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-semibold text-t-primary">{stock.symbol}</h3>
          <span className="text-sm text-t-tertiary">{stock.sector}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xl font-semibold tabular-nums ${scoreColor[stock.total_risk_level]}`}>
            {stock.total_risk_score.toFixed(2)}
          </span>
          <RiskBadge level={stock.total_risk_level}>{stock.total_risk_level}</RiskBadge>
        </div>
      </div>

      <div className="divide-y divide-border-subtle">
        {stock.events.map((event) => {
          const riskPct = Math.round(event.risk_score * 100);
          const confPct = Math.round(event.confidence * 100);

          return (
            <div key={`${stock.symbol}-${event.title}`} className="px-6 py-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-t-primary">{event.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-[11px] uppercase tracking-wide text-t-tertiary">
                      {event.event_type.replaceAll("_", " ")}
                    </p>
                    {event.expected_date && (
                      <span className="text-[11px] text-t-tertiary">
                        · {new Date(event.expected_date + "T12:00:00Z").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <RiskBadge level={event.risk_level} size="sm">
                  {event.risk_level}
                </RiskBadge>
              </div>

              <div className="mb-2 flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-[11px] text-t-tertiary">
                    <span>Risk</span>
                    <span className={`font-medium tabular-nums ${scoreColor[event.risk_level]}`}>
                      {event.risk_score.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className={`h-full rounded-full ${barColor[event.risk_level]}`}
                      style={{ width: `${riskPct}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  <div className="mb-1 flex justify-between text-[11px] text-t-tertiary">
                    <span>Conf.</span>
                    <span className="tabular-nums">{confPct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-t-tertiary"
                      style={{ width: `${confPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-t-tertiary">
                {event.rationale}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
