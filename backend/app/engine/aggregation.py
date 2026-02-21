"""Per-stock and portfolio risk aggregation.

=== TO MODIFY RISK FORMULAS, EDIT THIS FILE ===

Two formulas live here:
  1. compute_stock_total_risk  — 1 - product(1 - risk_i) per stock
  2. compute_portfolio_risk    — correlation-aware Markowitz-style

Risk-score per-event per-ticker follows §7.4 exactly (see risk_score.py).
Aggregation is NOT in the spec — these are custom formulas documented below.

Portfolio risk correlation logic:
  - corr(i,j) = Jaccard(events_i, events_j)
    i.e. |shared events| / |union of events|
  - Two stocks hit by the SAME events → corr = 1 → no diversification
  - Two stocks hit by DIFFERENT events → corr = 0 → full diversification
  - portfolio_risk = sqrt( sum_ij  w_i w_j r_i r_j corr_ij )
    where w_i = 1/n (equal weight)
"""

from decimal import ROUND_HALF_UP, Decimal
from math import sqrt

_TWO_PLACES = Decimal("0.01")


def _precise_round(value: float) -> float:
    return float(Decimal(str(value)).quantize(_TWO_PLACES, rounding=ROUND_HALF_UP))


def _to_risk_level(score: float) -> str:
    if score < 0.25:
        return "LOW"
    if score < 0.60:
        return "MEDIUM"
    return "HIGH"


def compute_stock_total_risk(event_risk_scores: list[float]) -> tuple[float, str]:
    """Aggregate multiple event risks into a single stock-level risk.

    Formula: 1 - product(1 - risk_score_i)

    Two events at 0.50 each → 1 - (0.5 * 0.5) = 0.75
    Captures compounding: multiple medium risks = high total risk.
    """
    if not event_risk_scores:
        return 0.0, "LOW"

    product = 1.0
    for score in event_risk_scores:
        product *= 1.0 - score

    total = _precise_round(min(1.0 - product, 1.0))
    return total, _to_risk_level(total)


def compute_portfolio_risk(
    stock_data: list[tuple[str, float]],
    event_stocks: dict[str, set[str]],
) -> tuple[float, str]:
    """Correlation-aware portfolio risk (Markowitz-style).

    Args:
        stock_data:   [(symbol, total_risk_score), ...]
        event_stocks: {event_title: {symbols affected by this event}}

    Steps:
      1. Build per-stock event sets
      2. Correlation(i,j) = Jaccard(events_i, events_j)
         - Same events → corr=1 → correlated → high portfolio risk
         - Different events → corr=0 → diversified → low portfolio risk
      3. Portfolio variance = sum_ij (1/n)(1/n) r_i r_j corr_ij
      4. Portfolio risk = sqrt(variance)

    Examples (2 stocks, risk=0.8 each):
      - Same event:      corr=1 → var = 0.64 → risk = 0.80
      - Different events: corr=0 → var = 0.32 → risk = 0.57
    """
    n = len(stock_data)
    if n == 0:
        return 0.0, "LOW"

    symbols = [s for s, _ in stock_data]
    risks = [r for _, r in stock_data]

    per_stock_events: dict[str, set[str]] = {s: set() for s in symbols}
    for event_title, affected in event_stocks.items():
        for s in affected:
            if s in per_stock_events:
                per_stock_events[s].add(event_title)

    w = 1.0 / n
    variance = 0.0

    for i in range(n):
        for j in range(n):
            if i == j:
                corr = 1.0
            else:
                ei = per_stock_events[symbols[i]]
                ej = per_stock_events[symbols[j]]
                union = ei | ej
                corr = len(ei & ej) / len(union) if union else 0.0

            variance += w * w * risks[i] * risks[j] * corr

    portfolio = _precise_round(min(sqrt(max(variance, 0.0)), 1.0))
    return portfolio, _to_risk_level(portfolio)
