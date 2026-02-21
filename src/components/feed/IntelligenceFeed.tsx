import { useMemo } from "react";
import { useAppShellContext } from "../layout/AppShell";
import type { RiskLevel, StockAnalysis } from "../../lib/types";
import StockCard from "./EventCard";
import PortfolioRiskBanner from "./PortfolioSummary";

function computeSubsetPortfolioRisk(stocks: StockAnalysis[]): {
  score: number;
  level: RiskLevel;
} {
  const n = stocks.length;
  if (n === 0) return { score: 0, level: "low" };

  const stockEvents = new Map<string, Set<string>>();
  for (const stock of stocks) {
    stockEvents.set(stock.symbol, new Set(stock.events.map((e) => e.title)));
  }

  const w = 1 / n;
  let variance = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let corr: number;
      if (i === j) {
        corr = 1;
      } else {
        const ei = stockEvents.get(stocks[i].symbol)!;
        const ej = stockEvents.get(stocks[j].symbol)!;
        const union = new Set([...ei, ...ej]);
        if (union.size === 0) {
          corr = 0;
        } else {
          const intersection = [...ei].filter((t) => ej.has(t));
          corr = intersection.length / union.size;
        }
      }

      variance +=
        w * w * stocks[i].total_risk_score * stocks[j].total_risk_score * corr;
    }
  }

  const raw = Math.round(Math.min(Math.sqrt(Math.max(variance, 0)), 1) * 100) / 100;
  const level: RiskLevel = raw >= 0.6 ? "high" : raw >= 0.25 ? "medium" : "low";
  return { score: raw, level };
}

export default function IntelligenceFeed() {
  const { response, error, isLoading, selectedTickers, excludedTickers } = useAppShellContext();

  const activeSet = useMemo(
    () => new Set(
      selectedTickers
        .map((s) => s.toUpperCase())
        .filter((s) => !excludedTickers.has(s))
    ),
    [selectedTickers, excludedTickers]
  );

  const filteredStocks = useMemo(
    () => response?.stocks.filter((s) => activeSet.has(s.symbol)) ?? [],
    [response, activeSet]
  );

  const portfolioRisk = useMemo(
    () => computeSubsetPortfolioRisk(filteredStocks),
    [filteredStocks]
  );

  if (!response) {
    return (
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        {isLoading ? "Analyzing portfolio..." : error ? error : "No analysis available yet."}
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <PortfolioRiskBanner
        score={portfolioRisk.score}
        level={portfolioRisk.level}
        stockCount={filteredStocks.length}
      />

      {filteredStocks.length === 0 ? (
        <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center">
          <p className="text-sm text-zinc-400">
            No stocks selected. Toggle tickers above to build your portfolio view.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      )}
    </div>
  );
}
