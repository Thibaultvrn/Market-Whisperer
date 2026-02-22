export type RiskLevel = "high" | "medium" | "low";

export interface StockEvent {
  title: string;
  event_type: string;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  rationale: string;
  expected_date?: string | null;  // YYYY-MM-DD, when event is expected to occur
}

export interface StockAnalysis {
  symbol: string;
  sector: string;
  total_risk_score: number;
  total_risk_level: RiskLevel;
  events: StockEvent[];
}

export interface AnalyzeRequestBody {
  tickers: string[];
  timezone: string;
}

export interface AnalyzeResponse {
  portfolio: string[];
  timezone: string;
  portfolio_risk_score: number;
  portfolio_risk_level: RiskLevel;
  stocks: StockAnalysis[];
}

export interface TickerEntry {
  symbol: string;
  name: string;
  exchange?: string;
}
