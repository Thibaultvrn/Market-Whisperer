"""Processing pipeline — Section 11.1.

Entry point for the Risk Engine: takes a StructuredEvent + list of tickers,
returns one AnalysisOutput per relevant ticker.
"""

from decimal import ROUND_HALF_UP, Decimal

from ..models.analysis_output import AnalysisOutput
from ..models.structured_event import StructuredEvent
from ..models.ticker_data import TickerData
from .confidence import compute_confidence
from .pressure import compute_pressure_direction
from .rationale import generate_rationale
from .relevance import compute_relevance_score
from .risk_score import compute_risk_score
from .tables import CROSS_REGIONAL_IMPACT, get_region
from .variable_mapper import map_economic_variable

_TWO_PLACES = Decimal("0.01")


def _precise_round(value: float) -> float:
    return float(Decimal(str(value)).quantize(_TWO_PLACES, rounding=ROUND_HALF_UP))


def _risk_level(score: float) -> str:
    if score < 0.25:
        return "LOW"
    if score < 0.60:
        return "MEDIUM"
    return "HIGH"


def process_event(
    event: StructuredEvent,
    tickers: list[TickerData],
) -> list[AnalysisOutput]:
    results: list[AnalysisOutput] = []

    economic_variable = map_economic_variable(event)
    pressure_direction = compute_pressure_direction(
        economic_variable, event.variable_direction
    )
    confidence = compute_confidence(event)
    event_region = get_region(event.country)

    for ticker in tickers:
        relevance = compute_relevance_score(
            event, ticker.sector, ticker.country, economic_variable
        )

        if relevance == 0.0:
            continue

        base_risk, _ = compute_risk_score(
            event, ticker.sector, economic_variable
        )

        # Apply geographic spillover: same region = full impact, cross-region = discounted
        ticker_region = get_region(ticker.country)
        geo_factor = CROSS_REGIONAL_IMPACT[ticker_region][event_region]
        adjusted_risk = _precise_round(min(base_risk * geo_factor, 1.0))
        adjusted_level = _risk_level(adjusted_risk)

        rationale = generate_rationale(
            event, economic_variable, pressure_direction, ticker.symbol
        )

        results.append(
            AnalysisOutput(
                ticker=ticker.symbol,
                event_type=event.event_type,
                economic_variable=economic_variable,
                pressure_direction=pressure_direction,
                relevance_score=relevance,
                risk_score=adjusted_risk,
                risk_level=adjusted_level,
                direction=pressure_direction,
                confidence=confidence,
                rationale=rationale,
            )
        )

    return results
