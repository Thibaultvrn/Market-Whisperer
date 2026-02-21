import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAppShellContext } from "../layout/AppShell";
import type { RiskLevel, StockAnalysis } from "../../lib/types";

const levelBadge: Record<RiskLevel, string> = {
  high: "border-red-500/40 bg-red-500/15 text-red-300",
  medium: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  low: "border-green-500/40 bg-green-500/15 text-green-300"
};

const barColor: Record<RiskLevel, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500"
};

const levelText: Record<RiskLevel, string> = {
  high: "text-red-300",
  medium: "text-amber-300",
  low: "text-green-300"
};

interface RankedStock extends StockAnalysis {
  rank: number;
}

export default function WeeklyRiskRadarView() {
  const { response, isLoading } = useAppShellContext();
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const ranked = useMemo<RankedStock[]>(() => {
    if (!response) return [];

    const filtered = response.stocks.filter((s) => s.total_risk_score > 0.5);

    const all: RankedStock[] = filtered.map((s) => ({
      ...s,
      rank: 0
    }));

    all.sort((a, b) => b.total_risk_score - a.total_risk_score);
    all.forEach((s, i) => { s.rank = i + 1; });
    return all;
  }, [response]);

  if (!response) {
    return (
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        {isLoading ? "Analyzing portfolio..." : "No analysis available yet."}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <article className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">
            Stocks to Watch — {ranked.length} above 0.50
          </h3>
          <span className="text-xs text-zinc-500">
            {response.stocks.length} stocks analyzed
          </span>
        </div>

        <div className="space-y-2">
          {ranked.map((stock) => {
            const pct = Math.round(stock.total_risk_score * 100);
            const colors = barColor[stock.total_risk_level];
            const badge = levelBadge[stock.total_risk_level];
            const isOpen = expandedSymbol === stock.symbol;

            return (
              <div
                key={stock.symbol}
                className={`rounded-lg border overflow-hidden ${
                  stock.total_risk_level === "high"
                    ? "border-red-500/25 bg-zinc-900/60"
                    : "border-zinc-800/50 bg-zinc-900/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedSymbol(isOpen ? null : stock.symbol)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/30"
                >
                  <span className="w-6 text-center text-xs font-bold text-zinc-500">
                    {stock.rank}
                  </span>

                  <div className="w-[130px] shrink-0">
                    <p className="text-sm font-bold text-zinc-100">{stock.symbol}</p>
                    <p className="truncate text-[11px] text-zinc-500" title={stock.sector}>
                      {stock.sector}
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all ${colors}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <span className="w-12 text-right font-mono text-sm font-bold text-zinc-200">
                    {stock.total_risk_score.toFixed(2)}
                  </span>

                  <span
                    className={`w-16 rounded-full border px-2 py-0.5 text-center text-[11px] font-medium uppercase ${badge}`}
                  >
                    {stock.total_risk_level}
                  </span>

                  <span className="w-14 text-right text-xs text-zinc-500">
                    {stock.events.length} {stock.events.length === 1 ? "event" : "events"}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && stock.events.length > 0 && (
                  <div className="border-t border-zinc-800/40 divide-y divide-zinc-800/30">
                    {stock.events.map((event) => {
                      const evtBadge = levelBadge[event.risk_level];
                      const evtBar = barColor[event.risk_level];
                      const evtText = levelText[event.risk_level];
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
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${evtBadge}`}
                            >
                              {event.risk_level}
                            </span>
                          </div>

                          <div className="mb-1 flex items-center gap-3">
                            <div className="flex-1">
                              <div className="mb-0.5 flex justify-between text-[11px] text-zinc-400">
                                <span>Risk</span>
                                <span className={`font-medium tabular-nums ${evtText}`}>
                                  {event.risk_score.toFixed(2)}
                                </span>
                              </div>
                              <div className="h-1 rounded-full bg-zinc-800">
                                <div
                                  className={`h-full rounded-full ${evtBar}`}
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
                )}
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
