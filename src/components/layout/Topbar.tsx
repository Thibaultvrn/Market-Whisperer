import { useMemo, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { TIMEZONE_OPTIONS } from "../../lib/timezones";
import { useAppShellContext } from "./AppShell";

interface TopbarProps {
  isFull: boolean;
  pageTitle: string;
  onOpenMenu: () => void;
}

function getOffsetLabel(timeZone: string): string {
  try {
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset"
    });
    const offset = offsetFormatter
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;
    if (offset) {
      return offset;
    }
  } catch {
    // Fall back to short zone name parsing.
  }

  const fallbackFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short"
  });
  const fallback = fallbackFormatter
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;
  return fallback?.includes("GMT") ? fallback : "GMT";
}

function getCityName(timeZone: string): string {
  const parts = timeZone.split("/");
  const city = parts[parts.length - 1] ?? timeZone;
  return city.replaceAll("_", " ");
}

export default function Topbar({ isFull, pageTitle, onOpenMenu }: TopbarProps) {
  const {
    response,
    timezone,
    setTimezone,
    selectedTickers,
    setSelectedTickers,
    excludedTickers,
    toggleExcluded,
    isLoading,
    lastUpdatedAt
  } = useAppShellContext();
  const [quickTicker, setQuickTicker] = useState("");

  const addQuickTicker = () => {
    const normalized = quickTicker.trim().toUpperCase();
    if (!normalized || selectedTickers.includes(normalized)) {
      setQuickTicker("");
      return;
    }
    setSelectedTickers([...selectedTickers, normalized]);
    setQuickTicker("");
  };

  const lastUpdatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;
  const timezoneDisplayOptions = useMemo(
    () =>
      TIMEZONE_OPTIONS.map((zone) => ({
        value: zone,
        label: `${getCityName(zone)} (${getOffsetLabel(zone)})`
      })),
    []
  );

  if (!isFull) {
    return (
      <header className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-2 text-zinc-200 transition-colors hover:bg-zinc-900"
            aria-label="Open navigation menu"
          >
            <Menu size={16} />
          </button>
          <div className="mr-2 min-w-[180px]">
            <h1 className="text-[28px] font-semibold tracking-tight text-zinc-100">
              {pageTitle}
            </h1>
            <p className="text-xs text-zinc-400">Structured forward-looking risk signals</p>
          </div>
          <div className="relative ml-auto">
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="h-9 w-56 appearance-none rounded-lg border border-zinc-800 bg-zinc-900/40 px-2.5 pr-8 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-500/80"
              aria-label="Timezone selector"
            >
              {timezoneDisplayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-2 text-zinc-200 transition-colors hover:bg-zinc-900"
          aria-label="Open navigation menu"
        >
          <Menu size={16} />
        </button>
        <div className="mr-2 min-w-[180px]">
          <h1 className="text-[28px] font-semibold tracking-tight text-zinc-100">
            {pageTitle}
          </h1>
          <p className="text-xs text-zinc-400">Structured forward-looking risk signals</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {selectedTickers.map((symbol) => {
            const excluded = excludedTickers.has(symbol);
            return (
              <button
                key={symbol}
                type="button"
                onClick={() => toggleExcluded(symbol)}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all ${
                  excluded
                    ? "border-zinc-800 bg-zinc-900/30 text-zinc-600 line-through opacity-60 hover:opacity-80"
                    : "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                }`}
              >
                {symbol}
              </button>
            );
          })}
        </div>

        <input
          value={quickTicker}
          onChange={(event) => setQuickTicker(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addQuickTicker();
            }
          }}
          placeholder="Add ticker"
          className="h-9 w-32 rounded-lg border border-zinc-800/70 bg-zinc-950/80 px-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-500/80"
        />
        <div className="relative">
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="h-9 w-56 appearance-none rounded-lg border border-zinc-800 bg-zinc-900/40 px-2.5 pr-8 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-500/80"
            aria-label="Timezone selector"
          >
            {timezoneDisplayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs text-cyan-400">Analyzing...</span>
          ) : response && lastUpdatedLabel ? (
            <span className="text-xs text-zinc-400">Last updated: {lastUpdatedLabel}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
