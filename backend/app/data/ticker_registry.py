"""Ticker → (sector, country) registry.

Will be replaced by Supabase lookups once the DB is connected.
Sectors follow GICS classification (Appendix D).
"""

from ..models.ticker_data import TickerData

_REGISTRY: dict[str, tuple[str, str]] = {
    # ── Technology ───────────────────────────────────────────────────────
    "AAPL": ("Technology", "US"),
    "MSFT": ("Technology", "US"),
    "NVDA": ("Technology", "US"),
    "AMD": ("Technology", "US"),
    "INTC": ("Technology", "US"),
    "CRM": ("Technology", "US"),
    "ORCL": ("Technology", "US"),
    "ADBE": ("Technology", "US"),
    "AVGO": ("Technology", "US"),
    "CSCO": ("Technology", "US"),
    "TSM": ("Technology", "TW"),
    "ASML": ("Technology", "NL"),
    "SAP": ("Technology", "DE"),
    # ── Financials ───────────────────────────────────────────────────────
    "JPM": ("Financials", "US"),
    "GS": ("Financials", "US"),
    "BAC": ("Financials", "US"),
    "MS": ("Financials", "US"),
    "WFC": ("Financials", "US"),
    "C": ("Financials", "US"),
    "BLK": ("Financials", "US"),
    "V": ("Financials", "US"),
    "MA": ("Financials", "US"),
    "AXP": ("Financials", "US"),
    "HSBC": ("Financials", "GB"),
    "RY": ("Financials", "CA"),
    # ── Healthcare ───────────────────────────────────────────────────────
    "JNJ": ("Healthcare", "US"),
    "PFE": ("Healthcare", "US"),
    "UNH": ("Healthcare", "US"),
    "ABBV": ("Healthcare", "US"),
    "MRK": ("Healthcare", "US"),
    "LLY": ("Healthcare", "US"),
    "TMO": ("Healthcare", "US"),
    "NVO": ("Healthcare", "DK"),
    # ── Energy ───────────────────────────────────────────────────────────
    "XOM": ("Energy", "US"),
    "CVX": ("Energy", "US"),
    "COP": ("Energy", "US"),
    "SLB": ("Energy", "US"),
    "EOG": ("Energy", "US"),
    "BP": ("Energy", "GB"),
    "SHEL": ("Energy", "GB"),
    # ── Consumer Discretionary ───────────────────────────────────────────
    "AMZN": ("Consumer Discretionary", "US"),
    "TSLA": ("Consumer Discretionary", "US"),
    "NKE": ("Consumer Discretionary", "US"),
    "SBUX": ("Consumer Discretionary", "US"),
    "HD": ("Consumer Discretionary", "US"),
    "MCD": ("Consumer Discretionary", "US"),
    "LOW": ("Consumer Discretionary", "US"),
    "BABA": ("Consumer Discretionary", "CN"),
    "TM": ("Consumer Discretionary", "JP"),
    "SONY": ("Consumer Discretionary", "JP"),
    # ── Consumer Staples ─────────────────────────────────────────────────
    "PG": ("Consumer Staples", "US"),
    "KO": ("Consumer Staples", "US"),
    "PEP": ("Consumer Staples", "US"),
    "WMT": ("Consumer Staples", "US"),
    "COST": ("Consumer Staples", "US"),
    "CL": ("Consumer Staples", "US"),
    # ── Industrials ──────────────────────────────────────────────────────
    "BA": ("Industrials", "US"),
    "CAT": ("Industrials", "US"),
    "UPS": ("Industrials", "US"),
    "HON": ("Industrials", "US"),
    "GE": ("Industrials", "US"),
    "RTX": ("Industrials", "US"),
    "LMT": ("Industrials", "US"),
    "DE": ("Industrials", "US"),
    # ── Materials ────────────────────────────────────────────────────────
    "LIN": ("Materials", "US"),
    "APD": ("Materials", "US"),
    "NEM": ("Materials", "US"),
    "FCX": ("Materials", "US"),
    "ECL": ("Materials", "US"),
    "BHP": ("Materials", "AU"),
    # ── Utilities ────────────────────────────────────────────────────────
    "NEE": ("Utilities", "US"),
    "DUK": ("Utilities", "US"),
    "SO": ("Utilities", "US"),
    "D": ("Utilities", "US"),
    "AEP": ("Utilities", "US"),
    # ── Real Estate ──────────────────────────────────────────────────────
    "AMT": ("Real Estate", "US"),
    "PLD": ("Real Estate", "US"),
    "SPG": ("Real Estate", "US"),
    "CCI": ("Real Estate", "US"),
    "O": ("Real Estate", "US"),
    # ── Communication Services ───────────────────────────────────────────
    "GOOGL": ("Communication Services", "US"),
    "GOOG": ("Communication Services", "US"),
    "META": ("Communication Services", "US"),
    "DIS": ("Communication Services", "US"),
    "NFLX": ("Communication Services", "US"),
    "T": ("Communication Services", "US"),
    "VZ": ("Communication Services", "US"),
    "CMCSA": ("Communication Services", "US"),
}

_DEFAULT_SECTOR = "Technology"
_DEFAULT_COUNTRY = "US"


def lookup_ticker(symbol: str) -> TickerData:
    normalized = symbol.upper().strip()
    sector, country = _REGISTRY.get(normalized, (_DEFAULT_SECTOR, _DEFAULT_COUNTRY))
    return TickerData(symbol=normalized, sector=sector, country=country)


def lookup_tickers(symbols: list[str]) -> list[TickerData]:
    return [lookup_ticker(s) for s in symbols]
