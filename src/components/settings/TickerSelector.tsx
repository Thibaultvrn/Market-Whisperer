import { useEffect, useMemo, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { loadTickers, searchTickers } from "../../lib/tickers";
import type { TickerEntry } from "../../lib/types";

interface TickerSelectorProps {
  value: string[];
  onChange: (symbols: string[]) => void;
}

export default function TickerSelector({ value, onChange }: TickerSelectorProps) {
  const [allTickers, setAllTickers] = useState<TickerEntry[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    loadTickers()
      .then((tickers) => {
        if (mounted) {
          setAllTickers(tickers);
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load tickers.");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const suggestions = useMemo(
    () => searchTickers(allTickers, query, value, 10),
    [allTickers, query, value]
  );

  const addTicker = (symbol: string) => {
    const normalized = symbol.toUpperCase();
    if (!value.includes(normalized)) {
      onChange([...value, normalized]);
    }
    setQuery("");
    setIsOpen(false);
  };

  const removeTicker = (symbol: string) => onChange(value.filter((item) => item !== symbol));

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-2 block text-sm font-medium text-zinc-200">Favorite Tickers</label>
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {value.length === 0 ? (
            <span className="text-sm text-zinc-500">No favorite tickers yet.</span>
          ) : (
            value.map((symbol) => (
              <span
                key={symbol}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900 px-3 py-1 text-xs text-zinc-100"
              >
                {symbol}
                <button
                  type="button"
                  onClick={() => removeTicker(symbol)}
                  className="text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by symbol or company..."
          className="w-full rounded-lg border border-zinc-800/70 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-500/80"
        />
      </div>

      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}

      {isOpen && suggestions.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-800/70 bg-zinc-900">
          {suggestions.map((ticker) => (
            <div
              key={`${ticker.symbol}-${ticker.exchange ?? "x"}`}
              className="flex items-center justify-between border-b border-zinc-800/70 px-3 py-2 text-sm last:border-b-0 hover:bg-zinc-800/70"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-200">{ticker.symbol}</p>
                <p className="truncate text-xs text-zinc-400">{ticker.name}</p>
              </div>
              <button
                type="button"
                onClick={() => addTicker(ticker.symbol)}
                className="rounded-full border border-zinc-700 p-1 text-zinc-300 transition-colors hover:bg-zinc-700"
                aria-label={`Add ${ticker.symbol} to favorites`}
              >
                <Heart size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
