import { useMemo, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { TIMEZONE_OPTIONS } from "../../lib/timezones";
import { useAppShellContext } from "./AppShell";

interface TopbarProps {
  isFull: boolean;
  pageTitle: string;
  weekLabel?: string | null;
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

export default function Topbar({ isFull, pageTitle, weekLabel, onOpenMenu }: TopbarProps) {
  const {
    response,
    timezone,
    setTimezone,
    favoriteTickers,
    setFavoriteTickers,
    excludedTickers,
    toggleExcluded,
    isLoading,
    lastUpdatedAt
  } = useAppShellContext();
  const [quickTicker, setQuickTicker] = useState("");

  const addQuickTicker = () => {
    const normalized = quickTicker.trim().toUpperCase();
    if (!normalized || favoriteTickers.includes(normalized)) {
      setQuickTicker("");
      return;
    }
    setFavoriteTickers([...favoriteTickers, normalized]);
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

  const timezoneSelect = (
    <div className="relative">
      <select
        value={timezone}
        onChange={(event) => setTimezone(event.target.value)}
        className="h-9 w-56 appearance-none rounded-inner border border-border-subtle bg-elevated px-3 pr-8 text-sm text-t-primary outline-none transition-colors focus:border-accent"
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
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-t-tertiary"
      />
    </div>
  );

  if (!isFull) {
    return (
      <header className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-inner border border-border-subtle bg-elevated p-2.5 text-t-secondary transition-colors hover:bg-surface-hover hover:text-t-primary"
            aria-label="Open navigation menu"
          >
            <Menu size={16} />
          </button>
          <div className="mr-auto min-w-[180px]">
            <h1 className="text-2xl font-semibold tracking-tight text-t-primary">
              {pageTitle}
            </h1>
            <p className="text-xs text-t-tertiary">
              {weekLabel ? `Week of ${weekLabel}` : "Structured forward-looking risk signals"}
            </p>
          </div>
          {timezoneSelect}
        </div>
      </header>
    );
  }

  return (
    <header className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-inner border border-border-subtle bg-elevated p-2.5 text-t-secondary transition-colors hover:bg-surface-hover hover:text-t-primary"
          aria-label="Open navigation menu"
        >
          <Menu size={16} />
        </button>
        <div className="mr-2 min-w-[180px]">
          <h1 className="text-2xl font-semibold tracking-tight text-t-primary">
            {pageTitle}
          </h1>
          <p className="text-xs text-t-tertiary">
            {weekLabel ? `Week of ${weekLabel}` : "Structured forward-looking risk signals"}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {favoriteTickers.map((symbol) => {
            const excluded = excludedTickers.has(symbol);
            return (
              <button
                key={symbol}
                type="button"
                onClick={() => toggleExcluded(symbol)}
                className={`rounded-inner border px-2.5 py-1 text-xs font-medium transition-all ${
                  excluded
                    ? "border-border-subtle bg-elevated/50 text-t-tertiary line-through opacity-50 hover:opacity-70"
                    : "border-accent/40 bg-accent-muted text-accent"
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
          className="h-9 w-32 rounded-inner border border-border-subtle bg-base px-3 text-sm text-t-primary outline-none transition-colors focus:border-accent"
        />

        {timezoneSelect}

        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs text-accent">Analyzing...</span>
          ) : response && lastUpdatedLabel ? (
            <span className="text-xs text-t-tertiary">Updated {lastUpdatedLabel}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
