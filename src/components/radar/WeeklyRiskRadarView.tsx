import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAppShellContext } from "../layout/AppShell";
import type { RiskLevel, StockAnalysis } from "../../lib/types";
import { formatWeekLabel, getWeekKey } from "../../lib/weekUtils";
import RiskBadge from "../ui/RiskBadge";
import SectionCard from "../ui/SectionCard";
import WeekSelector from "../feed/WeekSelector";

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

interface RankedStock extends StockAnalysis {
  rank: number;
}

function filterStocksByWeek(stocks: StockAnalysis[], weekKey: string): StockAnalysis[] {
  return stocks.map((stock) => {
    const weekEvents = stock.events.filter(
      (e) => e.expected_date && getWeekKey(e.expected_date) === weekKey
    );
    const eventScores = weekEvents.map((e) => e.risk_score);
    const product = eventScores.reduce((p, r) => p * (1 - r), 1);
    const total_risk_score = eventScores.length > 0 ? Math.min(1 - product, 1) : 0;
    const total_risk_level: RiskLevel =
      total_risk_score >= 0.6 ? "high" : total_risk_score >= 0.25 ? "medium" : "low";

    return {
      ...stock,
      events: weekEvents,
      total_risk_score,
      total_risk_level
    };
  });
}

export default function WeeklyRiskRadarView() {
  const {
    response,
    isLoading,
    weekKeys,
    selectedWeekIndex,
    setSelectedWeekIndex
  } = useAppShellContext();
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const safeWeekIndex = Math.min(
    Math.max(0, selectedWeekIndex),
    Math.max(0, weekKeys.length - 1)
  );
  const selectedWeekKey = weekKeys[safeWeekIndex] ?? weekKeys[0] ?? "";

  const stocksForWeek = useMemo(
    () =>
      response && selectedWeekKey
        ? filterStocksByWeek(response.stocks, selectedWeekKey)
        : response?.stocks ?? [],
    [response, selectedWeekKey]
  );

  const ranked = useMemo<RankedStock[]>(() => {
    if (!stocksForWeek.length) return [];

    const filtered = stocksForWeek.filter((s) => s.total_risk_score > 0.5);

    const all: RankedStock[] = filtered.map((s) => ({
      ...s,
      rank: 0
    }));

    all.sort((a, b) => b.total_risk_score - a.total_risk_score);
    all.forEach((s, i) => { s.rank = i + 1; });
    return all;
  }, [stocksForWeek]);

  if (!response) {
    return (
      <SectionCard>
        <p className="text-sm text-t-tertiary">
          {isLoading ? "Analyzing portfolio..." : "No analysis available yet."}
        </p>
      </SectionCard>
    );
  }

  const handlePrevWeek = () => setSelectedWeekIndex((i) => Math.max(0, i - 1));
  const handleNextWeek = () =>
    setSelectedWeekIndex((i) => Math.min(weekKeys.length - 1, i + 1));

  return (
    <div className="space-y-6">
      {weekKeys.length > 0 && (
        <WeekSelector
          weekKey={selectedWeekKey}
          weekIndex={safeWeekIndex}
          totalWeeks={weekKeys.length}
          onPrev={handlePrevWeek}
          onNext={handleNextWeek}
        />
      )}
      <SectionCard>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-medium text-t-primary">
            Stocks to Watch — {ranked.length} above 0.50
            {selectedWeekKey && (
              <span className="ml-2 text-sm font-normal text-t-tertiary">
                ({formatWeekLabel(selectedWeekKey)})
              </span>
            )}
          </h3>
          <span className="text-sm text-t-tertiary">
            {stocksForWeek.filter((s) => s.events.length > 0).length} stocks with events this week
          </span>
        </div>

        <div className="space-y-2">
          {ranked.map((stock) => {
            const pct = Math.round(stock.total_risk_score * 100);
            const isOpen = expandedSymbol === stock.symbol;

            return (
              <div
                key={stock.symbol}
                className={`overflow-hidden rounded-inner border transition-colors ${
                  stock.total_risk_level === "high"
                    ? "border-risk-high/15 bg-elevated/60"
                    : "border-border-subtle bg-elevated/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedSymbol(isOpen ? null : stock.symbol)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="w-6 text-center text-xs font-bold text-t-tertiary">
                    {stock.rank}
                  </span>

                  <div className="w-[130px] shrink-0">
                    <p className="text-sm font-semibold text-t-primary">{stock.symbol}</p>
                    <p className="truncate text-[11px] text-t-tertiary" title={stock.sector}>
                      {stock.sector}
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={`h-full rounded-full transition-all ${barColor[stock.total_risk_level]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <span className={`w-12 text-right font-mono text-sm font-semibold tabular-nums ${scoreColor[stock.total_risk_level]}`}>
                    {stock.total_risk_score.toFixed(2)}
                  </span>

                  <RiskBadge level={stock.total_risk_level} size="sm">
                    {stock.total_risk_level}
                  </RiskBadge>

                  <span className="w-14 text-right text-xs text-t-tertiary">
                    {stock.events.length} {stock.events.length === 1 ? "event" : "events"}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-t-tertiary transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && stock.events.length > 0 && (
                  <div className="border-t border-border-subtle divide-y divide-border-subtle">
                    {stock.events.map((event) => {
                      const riskPct = Math.round(event.risk_score * 100);
                      const confPct = Math.round(event.confidence * 100);

                      return (
                        <div key={`${stock.symbol}-${event.title}`} className="px-6 py-5">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-t-primary">{event.title}</p>
                              <p className="text-[11px] uppercase tracking-wide text-t-tertiary">
                                {event.event_type.replaceAll("_", " ")}
                              </p>
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
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
