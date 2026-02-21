import type { AnalyzeResponse } from "../../lib/types";

interface PortfolioSummaryProps {
  response: AnalyzeResponse;
}

export default function PortfolioSummary({ response }: PortfolioSummaryProps) {
  const futureEvents = response.overnight_events;
  const high = futureEvents.filter((event) => event.impact_level === "high").length;
  const medium = futureEvents.filter((event) => event.impact_level === "medium").length;
  const uniqueImpacted = new Set(
    futureEvents.flatMap((event) => event.affected_tickers.map((ticker) => ticker.symbol))
  ).size;

  return (
    <section className="grid gap-2 sm:grid-cols-3">
      <article className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5">
        <p className="text-xs text-zinc-400">High Catalysts</p>
        <p className="mt-0.5 text-lg font-semibold text-red-300">{high}</p>
      </article>
      <article className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5">
        <p className="text-xs text-zinc-400">Medium Catalysts</p>
        <p className="mt-0.5 text-lg font-semibold text-amber-300">{medium}</p>
      </article>
      <article className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5">
        <p className="text-xs text-zinc-400">Impacted Tickers</p>
        <p className="mt-0.5 text-lg font-semibold text-zinc-100">{uniqueImpacted}</p>
        <p className="text-xs text-zinc-500">{response.portfolio.length} in portfolio</p>
      </article>
    </section>
  );
}
