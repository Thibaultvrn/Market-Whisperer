import type { Direction, FutureEvent, ImpactLevel } from "../../lib/types";

interface EventModalProps {
  event: FutureEvent | null;
  onClose: () => void;
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

export default function EventModal({ event, onClose }: EventModalProps) {
  if (!event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800/70 bg-zinc-900 p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-semibold text-zinc-100">{event.title}</h3>
            <p className="text-xs uppercase tracking-wide text-zinc-400">{event.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs ${impactClassMap[event.impact_level]}`}>
              {event.impact_level}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {event.affected_tickers.map((ticker) => {
            const pct = Math.round(Math.min(1, Math.max(0, ticker.confidence)) * 100);
            return (
              <article
                key={`${event.title}-${ticker.symbol}`}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-100">
                    {ticker.symbol} {directionIcon[ticker.direction]}
                  </p>
                  <p className="text-xs text-zinc-400">{pct}% confidence</p>
                </div>
                <div className="mb-2 h-2 rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="line-clamp-2 text-sm text-zinc-300">{ticker.rationale}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-3">
          <p className="mb-2 text-sm font-medium text-zinc-200">Sources</p>
          <ul className="space-y-1">
            {event.sources.map((source) => (
              <li key={source}>
                <a
                  href={source}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-zinc-300 transition-colors hover:text-zinc-100"
                >
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
