import { useMemo } from "react";
import { useAppShellContext } from "../layout/AppShell";

interface DerivedTickerStat {
  symbol: string;
  score: number;
  high: number;
  medium: number;
  low: number;
}

export default function WeeklyRiskRadarView() {
  const { response } = useAppShellContext();
  const futureEvents = response?.overnight_events ?? [];

  const derived = useMemo<DerivedTickerStat[]>(() => {
    if (futureEvents.length === 0) {
      return [];
    }

    const bySymbol = new Map<string, DerivedTickerStat>();
    for (const event of futureEvents) {
      const weight =
        event.impact_level === "high" ? 3 : event.impact_level === "medium" ? 2 : 1;

      for (const ticker of event.affected_tickers) {
        const current = bySymbol.get(ticker.symbol) ?? {
          symbol: ticker.symbol,
          score: 0,
          high: 0,
          medium: 0,
          low: 0
        };
        current.score += weight;
        if (event.impact_level === "high") {
          current.high += 1;
        } else if (event.impact_level === "medium") {
          current.medium += 1;
        } else {
          current.low += 1;
        }
        bySymbol.set(ticker.symbol, current);
      }
    }

    return Array.from(bySymbol.values()).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [futureEvents]);

  return (
    <section className="space-y-3">
      {!response ? (
        <article className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-sm text-zinc-400">
          No analysis available yet.
        </article>
      ) : derived.length === 0 ? (
        <article className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
          <p className="text-sm font-medium text-zinc-200">Not available yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Not enough high/medium impact catalysts in the current response.
          </p>
        </article>
      ) : (
        <article className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
          <h3 className="mb-2 text-sm font-semibold text-zinc-200">Top Risk Assets (derived)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800/70 text-left text-xs text-zinc-400">
                  <th className="px-2 py-2 font-medium">Symbol</th>
                  <th className="px-2 py-2 font-medium">High</th>
                  <th className="px-2 py-2 font-medium">Medium</th>
                  <th className="px-2 py-2 font-medium">Low</th>
                </tr>
              </thead>
              <tbody>
                {derived.map((item) => (
                  <tr key={item.symbol} className="border-b border-zinc-800/50 last:border-b-0">
                    <td className="px-2 py-2 font-medium text-zinc-100">{item.symbol}</td>
                    <td className="px-2 py-2 text-red-300">{item.high}</td>
                    <td className="px-2 py-2 text-amber-300">{item.medium}</td>
                    <td className="px-2 py-2 text-green-300">{item.low}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
