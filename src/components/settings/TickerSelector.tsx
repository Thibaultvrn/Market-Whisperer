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
      <label className="mb-3 block text-sm font-medium text-t-primary">Favorite Tickers</label>
      <div className="rounded-inner border border-border-subtle bg-elevated/50 p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {value.length === 0 ? (
            <span className="text-sm text-t-tertiary">No favorite tickers yet.</span>
          ) : (
            value.map((symbol) => (
              <span
                key={symbol}
                className="inline-flex items-center gap-2 rounded-inner border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-t-primary"
              >
                {symbol}
                <button
                  type="button"
                  onClick={() => removeTicker(symbol)}
                  className="text-t-tertiary transition-colors hover:text-t-primary"
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
          className="w-full rounded-inner border border-border-subtle bg-base px-3 py-2.5 text-sm text-t-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      {error ? <p className="mt-2 text-xs text-risk-high">{error}</p> : null}

      {isOpen && suggestions.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-card border border-border-subtle bg-surface shadow-elevated">
          {suggestions.map((ticker) => (
            <div
              key={`${ticker.symbol}-${ticker.exchange ?? "x"}`}
              className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5 text-sm last:border-b-0 hover:bg-elevated"
            >
              <div className="min-w-0">
                <p className="font-medium text-t-primary">{ticker.symbol}</p>
                <p className="truncate text-xs text-t-tertiary">{ticker.name}</p>
              </div>
              <button
                type="button"
                onClick={() => addTicker(ticker.symbol)}
                className="rounded-inner border border-border-subtle p-1.5 text-t-tertiary transition-colors hover:bg-elevated hover:text-t-primary"
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
