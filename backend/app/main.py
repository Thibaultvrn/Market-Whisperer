"""Market Whisperer — Risk Engine API.

Endpoints:
  POST /analyze          → per-stock risk analysis (frontend-compatible)
  POST /engine/process   → raw engine I/O (StructuredEvent → AnalysisOutput[])
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .data.mock_events import get_mock_events
from .data.ticker_registry import lookup_tickers
from .engine.aggregation import compute_portfolio_risk, compute_stock_total_risk
from .engine.pipeline import process_event
from .models.analysis_output import AnalysisOutput
from .models.structured_event import StructuredEvent
from .models.ticker_data import TickerData

app = FastAPI(
    title="Market Whisperer — Risk Engine",
    version="2.0.0",
    description="Deterministic ticker-dependent risk scoring engine",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    tickers: list[str]
    timezone: str = "Europe/Stockholm"


class StockEventOut(BaseModel):
    title: str
    event_type: str
    risk_score: float
    risk_level: str
    confidence: float
    rationale: str


class StockAnalysisOut(BaseModel):
    symbol: str
    sector: str
    total_risk_score: float
    total_risk_level: str
    events: list[StockEventOut]


class AnalyzeResponse(BaseModel):
    portfolio: list[str]
    timezone: str
    portfolio_risk_score: float
    portfolio_risk_level: str
    stocks: list[StockAnalysisOut]


# ── Raw engine models ────────────────────────────────────────────────────


class EngineRequest(BaseModel):
    event: StructuredEvent
    tickers: list[TickerData]


class EngineResponse(BaseModel):
    results: list[AnalysisOutput]


# ── Endpoints ────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok", "engine": "risk_engine_v2"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Per-stock risk analysis. Filters out LOW risk events per stock."""
    if not request.tickers:
        raise HTTPException(status_code=400, detail={"error": "empty_tickers"})

    ticker_data = lookup_tickers(request.tickers)
    events = get_mock_events()

    # Run pipeline: all events × all tickers
    # Group by ticker and by event for aggregation
    by_ticker: dict[str, list[tuple[StructuredEvent, AnalysisOutput]]] = {}
    by_event: dict[str, list[AnalysisOutput]] = {}

    for event in events:
        outputs = process_event(event, ticker_data)
        event_non_low = [o for o in outputs if o.risk_level != "LOW"]

        if event_non_low:
            by_event[event.cause_summary] = event_non_low

        for output in outputs:
            if output.risk_level == "LOW":
                continue
            by_ticker.setdefault(output.ticker, []).append((event, output))

    # Build per-stock analysis (include ALL stocks, even those with 0 events)
    stocks: list[StockAnalysisOut] = []
    for ticker in ticker_data:
        entries = by_ticker.get(ticker.symbol, [])

        if entries:
            event_scores = [output.risk_score for _, output in entries]
            total_risk, total_level = compute_stock_total_risk(event_scores)
            stock_events = [
                StockEventOut(
                    title=event.cause_summary,
                    event_type=event.event_type.value.lower(),
                    risk_score=output.risk_score,
                    risk_level=output.risk_level.lower(),
                    confidence=output.confidence,
                    rationale=output.rationale,
                )
                for event, output in entries
            ]
        else:
            total_risk, total_level = 0.0, "LOW"
            stock_events = []

        stocks.append(
            StockAnalysisOut(
                symbol=ticker.symbol,
                sector=ticker.sector,
                total_risk_score=total_risk,
                total_risk_level=total_level.lower(),
                events=stock_events,
            )
        )

    # Portfolio risk (correlation-aware Markowitz-style)
    stock_data = [(s.symbol, s.total_risk_score) for s in stocks]
    event_stocks = {
        title: {o.ticker for o in outputs}
        for title, outputs in by_event.items()
    }
    portfolio_risk, portfolio_level = compute_portfolio_risk(stock_data, event_stocks)

    return AnalyzeResponse(
        portfolio=request.tickers,
        timezone=request.timezone,
        portfolio_risk_score=portfolio_risk,
        portfolio_risk_level=portfolio_level.lower(),
        stocks=stocks,
    )


@app.post("/engine/process", response_model=EngineResponse)
async def engine_process(request: EngineRequest):
    """Raw engine endpoint — feed a StructuredEvent + tickers, get full AnalysisOutput."""
    results = process_event(request.event, request.tickers)
    return EngineResponse(results=results)
