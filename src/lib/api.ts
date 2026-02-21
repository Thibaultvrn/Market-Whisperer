import type { AnalyzeRequestBody, AnalyzeResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_URL = `${API_BASE_URL}/analyze`;

interface AnalyzePortfolioOptions {
  signal?: AbortSignal;
  demoMode?: boolean;
}

export async function analyzePortfolio(
  tickers: string[],
  timezone: string,
  options?: AnalyzePortfolioOptions
): Promise<AnalyzeResponse> {
  if (options?.demoMode) {
    const demoResponse = await fetch("/fixtures/analyze_response.json", {
      signal: options.signal
    });
    if (!demoResponse.ok) {
      throw new Error("Demo fixture not available.");
    }
    return (await demoResponse.json()) as AnalyzeResponse;
  }

  const body: AnalyzeRequestBody = { tickers, timezone };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Analyze request failed (${response.status}): ${text || response.statusText}`
    );
  }

  try {
    return (await response.json()) as AnalyzeResponse;
  } catch {
    throw new Error("Analyze response is not valid JSON.");
  }
}
