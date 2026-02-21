"""Relevance score — Section 6.8 (updated with cross-regional spillover).

RelevanceScore = Exposure[sector][variable] × CrossRegionalImpact[ticker_region][event_region]

A Fed rate hike (event_region=US) will hit a US stock at full weight (1.0)
but only partially spill over to a European stock (0.5) or Asian stock (0.6).

Tickers below 0.2 are filtered out.
"""

from ..models.enums import EconomicVariable
from ..models.structured_event import StructuredEvent
from .tables import CROSS_REGIONAL_IMPACT, EXPOSURE_MATRIX, get_region


def compute_relevance_score(
    event: StructuredEvent,
    ticker_sector: str,
    ticker_country: str,
    economic_variable: EconomicVariable,
) -> float:
    sector_exposures = EXPOSURE_MATRIX.get(ticker_sector)
    exposure = sector_exposures.get(economic_variable.value, 0.5) if sector_exposures else 0.5

    ticker_region = get_region(ticker_country)
    event_region = get_region(event.country)
    regional_impact = CROSS_REGIONAL_IMPACT[ticker_region][event_region]

    relevance = round(exposure * regional_impact, 2)

    if relevance < 0.2:
        return 0.0

    return relevance
