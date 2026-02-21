import type { RiskLevel, StockAnalysis } from "../../lib/types";

interface StockCardProps {
  stock: StockAnalysis;
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

export default function StockCard({ stock }: StockCardProps) {
  const totalColors = levelColors[stock.total_risk_level];
  const isHighRisk = stock.total_risk_level === "high";

  return (
    <article
      className={`rounded-xl border bg-zinc-900/30 ${
        isHighRisk
          ? "border-red-500/30 ring-1 ring-red-500/20"
          : "border-zinc-800/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/50 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-bold text-zinc-100">{stock.symbol}</h3>
          <span className="text-xs text-zinc-500">{stock.sector}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold tabular-nums ${totalColors.text}`}>
            {stock.total_risk_score.toFixed(2)}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${totalColors.badge}`}
          >
            {stock.total_risk_level}
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/40">
        {stock.events.map((event) => {
          const evtColors = levelColors[event.risk_level];
          const riskPct = Math.round(event.risk_score * 100);
          const confPct = Math.round(event.confidence * 100);

          return (
            <div key={`${stock.symbol}-${event.title}`} className="px-4 py-3">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{event.title}</p>
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    {event.event_type.replaceAll("_", " ")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${evtColors.badge}`}
                >
                  {event.risk_level}
                </span>
              </div>

              <div className="mb-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-0.5 flex justify-between text-[11px] text-zinc-400">
                    <span>Risk</span>
                    <span className={`font-medium tabular-nums ${evtColors.text}`}>
                      {event.risk_score.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${evtColors.bar}`}
                      style={{ width: `${riskPct}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 shrink-0">
                  <div className="mb-0.5 flex justify-between text-[11px] text-zinc-400">
                    <span>Conf.</span>
                    <span className="tabular-nums">{confPct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-400"
                      style={{ width: `${confPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                {event.rationale}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
