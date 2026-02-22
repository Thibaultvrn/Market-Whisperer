import { useMemo, useState } from "react";
import { useAppShellContext } from "../layout/AppShell";
import type { RiskLevel, StockAnalysis } from "../../lib/types";
import { formatWeekLabel, getWeekKey } from "../../lib/weekUtils";
import SectionCard from "../ui/SectionCard";
import StockCard from "./EventCard";
import PortfolioRiskNetwork, { type PortfolioData } from "./PortfolioRiskNetwork";
import WeekSelector from "./WeekSelector";

function computePortfolioRiskFromStocks(
  stocks: Array<{ symbol: string; events: Array<{ title: string; risk_score: number }> }>
): { score: number; level: RiskLevel } {
  const n = stocks.length;
  if (n === 0) return { score: 0, level: "low" };

  const stockEvents = new Map<string, Set<string>>();
  const stockRisks = new Map<string, number>();
  for (const stock of stocks) {
    const events = stock.events;
    stockEvents.set(stock.symbol, new Set(events.map((e) => e.title)));
    const product = events.reduce((p, e) => p * (1 - e.risk_score), 1);
    stockRisks.set(stock.symbol, Math.min(1 - product, 1));
  }

  const w = 1 / n;
  let variance = 0;
  const symbols = stocks.map((s) => s.symbol);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let corr: number;
      if (i === j) {
        corr = 1;
      } else {
        const ei = stockEvents.get(symbols[i])!;
        const ej = stockEvents.get(symbols[j])!;
        const union = new Set([...ei, ...ej]);
        if (union.size === 0) corr = 0;
        else corr = [...ei].filter((t) => ej.has(t)).length / union.size;
      }
      variance += w * w * (stockRisks.get(symbols[i]) ?? 0) * (stockRisks.get(symbols[j]) ?? 0) * corr;
    }
  }

  const raw = Math.round(Math.min(Math.sqrt(Math.max(variance, 0)), 1) * 100) / 100;
  const level: RiskLevel = raw >= 0.6 ? "high" : raw >= 0.25 ? "medium" : "low";
  return { score: raw, level };
}

function buildPortfolioData(
  stocks: Array<{ symbol: string; total_risk_score: number; events: Array<{ title: string }> }>,
  portfolioRisk: number
): PortfolioData {
  const n = stocks.length;
  const w = 1 / n;
  const stockEvents = new Map<string, Set<string>>();
  for (const stock of stocks) {
    stockEvents.set(stock.symbol, new Set(stock.events.map((e) => e.title)));
  }
  const correlationMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) row.push(1);
      else {
        const ei = stockEvents.get(stocks[i].symbol)!;
        const ej = stockEvents.get(stocks[j].symbol)!;
        const union = new Set([...ei, ...ej]);
        row.push(union.size === 0 ? 0 : [...ei].filter((t) => ej.has(t)).length / union.size);
      }
    }
    correlationMatrix.push(row);
  }
  return {
    portfolioRisk,
    tickers: stocks.map((s) => ({ symbol: s.symbol, weight: w, risk: s.total_risk_score })),
    correlationMatrix
  };
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

export default function IntelligenceFeed() {
  const {
    response,
    error,
    isLoading,
    favoriteTickers,
    excludedTickers,
    weekKeys,
    selectedWeekIndex,
    setSelectedWeekIndex
  } = useAppShellContext();

  const activeSet = useMemo(
    () => new Set(
      favoriteTickers
        .map((s) => s.toUpperCase())
        .filter((s) => !excludedTickers.has(s))
    ),
    [favoriteTickers, excludedTickers]
  );

  const filteredStocks = useMemo(
    () => response?.stocks.filter((s) => activeSet.has(s.symbol)) ?? [],
    [response, activeSet]
  );

  const feedWeekKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const stock of filteredStocks) {
      for (const event of stock.events) {
        if (event.expected_date) keys.add(getWeekKey(event.expected_date));
      }
    }
    return Array.from(keys).sort();
  }, [filteredStocks]);

  const safeWeekIndex = Math.min(
    Math.max(0, selectedWeekIndex),
    Math.max(0, weekKeys.length - 1)
  );
  const selectedWeekKey = weekKeys[safeWeekIndex] ?? weekKeys[0] ?? "";

  const feedSelectedWeekKey = feedWeekKeys.includes(selectedWeekKey)
    ? selectedWeekKey
    : feedWeekKeys[0] ?? selectedWeekKey;

  const stocksForWeek = useMemo(
    () =>
      feedSelectedWeekKey
        ? filterStocksByWeek(filteredStocks, feedSelectedWeekKey)
        : filteredStocks,
    [filteredStocks, feedSelectedWeekKey]
  );

  const portfolioRisk = useMemo(
    () =>
      computePortfolioRiskFromStocks(
        stocksForWeek.map((s) => ({
          symbol: s.symbol,
          events: s.events.map((e) => ({ title: e.title, risk_score: e.risk_score }))
        }))
      ),
    [stocksForWeek]
  );

  const portfolioData = useMemo(
    () => buildPortfolioData(stocksForWeek, portfolioRisk.score),
    [stocksForWeek, portfolioRisk.score]
  );

  const handlePrevWeek = () => setSelectedWeekIndex((i) => Math.max(0, i - 1));
  const handleNextWeek = () =>
    setSelectedWeekIndex((i) => Math.min(weekKeys.length - 1, i + 1));

  if (!response) {
    return (
      <SectionCard>
        <p className="text-sm text-t-tertiary">
          {isLoading ? "Analyzing portfolio..." : error ? error : "No analysis available yet."}
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        {filteredStocks.length === 0 ? (
          <SectionCard>
            <p className="text-center text-sm text-t-tertiary">
              No stocks selected. Toggle tickers above to build your portfolio view.
            </p>
          </SectionCard>
        ) : (
          <>
            {weekKeys.length > 0 && (
              <WeekSelector
                weekKey={feedSelectedWeekKey || selectedWeekKey}
                weekIndex={safeWeekIndex}
                totalWeeks={weekKeys.length}
                onPrev={handlePrevWeek}
                onNext={handleNextWeek}
              />
            )}

            {stocksForWeek.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </>
        )}
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-6 space-y-6">
          <PortfolioRiskNetwork
            portfolioRisk={portfolioRisk.score}
            level={portfolioRisk.level}
            stockCount={stocksForWeek.length}
            portfolio={portfolioData}
            weekLabel={feedSelectedWeekKey ? formatWeekLabel(feedSelectedWeekKey) : null}
          />
        </div>
      </div>
    </div>
  );
}
