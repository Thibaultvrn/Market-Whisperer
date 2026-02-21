const FAVORITES_KEY = "market-whisperer:favorites";
const TIMEZONE_KEY = "market-whisperer:timezone";

export function readFavoriteTickers(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(FAVORITES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return parsed.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
  } catch {
    return [];
  }
}

export function writeFavoriteTickers(tickers: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = tickers.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(normalized));
}

export function readTimezone(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TIMEZONE_KEY);
}

export function writeTimezone(timezone: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TIMEZONE_KEY, timezone);
}
