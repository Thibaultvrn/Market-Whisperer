import { useMemo, useState } from "react";
import type { FutureEvent } from "../../lib/types";
import { useAppShellContext } from "../layout/AppShell";
import EventModal from "./EventModal";
import EventTimeline from "./EventTimeline";
import PortfolioSummary from "./PortfolioSummary";

export default function IntelligenceFeed() {
  const { response, error } = useAppShellContext();
  const [selectedEvent, setSelectedEvent] = useState<FutureEvent | null>(null);
  const futureEvents = response?.overnight_events ?? [];

  const hasBreakingRisk = useMemo(
    () => futureEvents.some((event) => event.impact_level === "high"),
    [futureEvents]
  );
  const impactedTickerCounts = useMemo(() => {
    if (futureEvents.length === 0) {
      return [];
    }
    const counts = new Map<string, number>();
    for (const event of futureEvents) {
      for (const ticker of event.affected_tickers) {
        counts.set(ticker.symbol, (counts.get(ticker.symbol) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [futureEvents]);

  if (!response) {
    return (
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        {error ? error : "No analysis available yet."}
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {hasBreakingRisk ? (
        <div className="rounded-md border border-red-800/70 bg-red-950/40 px-3 py-1.5 text-xs text-red-200">
          High impact geopolitical risk detected in portfolio
        </div>
      ) : null}

      <PortfolioSummary response={response} />
      <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
        <EventTimeline events={futureEvents} onOpen={setSelectedEvent} />
        <aside className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h2 className="mb-2 text-[17px] font-semibold text-zinc-100">Impacted Assets</h2>
          {impactedTickerCounts.length === 0 ? (
            <p className="text-sm text-zinc-400">No impacted assets.</p>
          ) : (
            <ul className="space-y-1.5">
              {impactedTickerCounts.map(([symbol, count]) => (
                <li
                  key={symbol}
                  className="flex items-center justify-between rounded-md border border-zinc-800/70 bg-zinc-900/50 px-2.5 py-1.5 text-sm"
                >
                  <span className="font-medium text-zinc-200">{symbol}</span>
                  <span className="text-xs text-zinc-400">{count} catalysts</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
