import type { TickerEntry } from "./types";

let tickerCache: TickerEntry[] | null = null;

export async function loadTickers(): Promise<TickerEntry[]> {
  if (tickerCache) {
    return tickerCache;
  }

  const response = await fetch("/tickers.json");
  if (!response.ok) {
    throw new Error("Unable to load local ticker database.");
  }

  tickerCache = (await response.json()) as TickerEntry[];
  return tickerCache;
}

export function searchTickers(
  allTickers: TickerEntry[],
  query: string,
  selectedSymbols: string[],
  maxResults = 8
): TickerEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedSet = new Set(selectedSymbols.map((symbol) => symbol.toUpperCase()));

  if (!normalizedQuery) {
    return allTickers
      .filter((ticker) => !selectedSet.has(ticker.symbol.toUpperCase()))
      .slice(0, maxResults);
  }

  return allTickers
    .filter((ticker) => {
      const symbol = ticker.symbol.toLowerCase();
      const name = ticker.name.toLowerCase();
      return (
        !selectedSet.has(ticker.symbol.toUpperCase()) &&
        (symbol.includes(normalizedQuery) || name.includes(normalizedQuery))
      );
    })
    .sort((a, b) => {
      const aStarts = a.symbol.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
      const bStarts = b.symbol.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
      if (aStarts !== bStarts) {
        return aStarts - bStarts;
      }
      return a.symbol.localeCompare(b.symbol);
    })
    .slice(0, maxResults);
}
