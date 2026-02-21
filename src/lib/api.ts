import type { AnalyzeRequestBody, AnalyzeResponse } from "./types";

const API_URL = "http://localhost:8000/analyze";

export async function analyzePortfolio(
  tickers: string[],
  timezone: string,
  signal?: AbortSignal
): Promise<AnalyzeResponse> {
  const body: AnalyzeRequestBody = { tickers, timezone };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Analyze request failed (${response.status}): ${text || response.statusText}`
    );
  }

  return (await response.json()) as AnalyzeResponse;
}
