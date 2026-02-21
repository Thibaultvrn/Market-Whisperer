import type { Direction, FutureEvent, ImpactLevel } from "../../lib/types";

interface EventCardProps {
  event: FutureEvent;
  onOpen: (event: FutureEvent) => void;
}

const impactClassMap: Record<ImpactLevel, string> = {
  low: "border-green-500/40 bg-green-500/15 text-green-300",
  medium: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  high: "border-red-500/40 bg-red-500/15 text-red-300"
};

const directionIcon: Record<Direction, string> = {
  up: "↑",
  down: "↓",
  uncertain: "↔"
};

export default function EventCard({ event, onOpen }: EventCardProps) {
  const highImpactClass =
    event.impact_level === "high" ? "ring-1 ring-red-500/30" : "";
  const topAffectedTickers = event.affected_tickers.slice(0, 3);
  const averageConfidence = event.affected_tickers.length
    ? Math.round(
        (event.affected_tickers.reduce((sum, ticker) => sum + ticker.confidence, 0) /
          event.affected_tickers.length) *
          100
      )
    : 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className={`w-full rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3 text-left transition-colors hover:bg-zinc-900/50 ${highImpactClass}`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-100">{event.title}</h3>
        <span className={`rounded-full border px-2.5 py-1 text-xs ${impactClassMap[event.impact_level]}`}>
          {event.impact_level}
        </span>
      </div>

      <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">{event.type}</p>
      <div className="flex flex-wrap gap-2">
        {topAffectedTickers.map((ticker) => (
          <span
            key={`${event.title}-${ticker.symbol}`}
            className="rounded-full border border-zinc-700/70 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300"
          >
            {ticker.symbol} {directionIcon[ticker.direction]}
          </span>
        ))}
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>Avg confidence</span>
          <span>{averageConfidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-300"
            style={{ width: `${averageConfidence}%` }}
          />
        </div>
      </div>
    </button>
  );
}
