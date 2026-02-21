export type ImpactLevel = "high" | "medium" | "low";
export type Direction = "up" | "down" | "uncertain";

export interface AffectedTicker {
  symbol: string;
  direction: Direction;
  confidence: number;
  rationale: string;
}

export interface FutureEvent {
  title: string;
  type: string;
  impact_level: ImpactLevel;
  affected_tickers: AffectedTicker[];
  sources: string[];
}

export interface AnalyzeRequestBody {
  tickers: string[];
  timezone: string;
}

export interface AnalyzeResponse {
  portfolio: string[];
  timezone: string;
  overnight_events: FutureEvent[];
}

export interface TickerEntry {
  symbol: string;
  name: string;
  exchange?: string;
}
