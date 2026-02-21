import type { RiskLevel } from "../../lib/types";

interface PortfolioRiskBannerProps {
  score: number;
  level: RiskLevel;
  stockCount: number;
}

const levelColors: Record<RiskLevel, { bar: string; badge: string; text: string }> = {
  high: {
    bar: "bg-red-500",
    badge: "border-red-500/40 bg-red-500/15 text-red-300",
    text: "text-red-300"
  },
  medium: {
    bar: "bg-amber-500",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    text: "text-amber-300"
  },
  low: {
    bar: "bg-green-500",
    badge: "border-green-500/40 bg-green-500/15 text-green-300",
    text: "text-green-300"
  }
};

export default function PortfolioRiskBanner({
  score,
  level,
  stockCount
}: PortfolioRiskBannerProps) {
  const colors = levelColors[level];
  const pct = Math.round(score * 100);

  return (
    <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">Portfolio Risk</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>
              {score.toFixed(2)}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${colors.badge}`}
            >
              {level}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">{stockCount} stocks at risk</p>
          <p className="mt-0.5 text-xs text-zinc-500">Correlation-weighted</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
