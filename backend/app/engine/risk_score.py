"""Risk score — Section 7.4.

RiskScore = Exposure x Sensitivity x Magnitude x Immediacy x Surprise.
Computed PER TICKER — different sectors yield different scores (Rule G-012).

Uses Decimal arithmetic to avoid floating-point rounding drift
(e.g. 0.9 × 0.95 = 0.855 must round to 0.86, not 0.85).
"""

from decimal import ROUND_HALF_UP, Decimal

from ..models.enums import EconomicVariable
from ..models.structured_event import StructuredEvent
from .tables import (
    EXPOSURE_MATRIX,
    IMMEDIACY_VALUES,
    MAGNITUDE_VALUES,
    SENSITIVITY_MATRIX,
    SURPRISE_VALUES,
)

_TWO_PLACES = Decimal("0.01")


def _precise_round(value: float) -> float:
    return float(Decimal(str(value)).quantize(_TWO_PLACES, rounding=ROUND_HALF_UP))


def compute_risk_score(
    event: StructuredEvent,
    ticker_sector: str,
    economic_variable: EconomicVariable,
) -> tuple[float, str]:
    sector_exp = EXPOSURE_MATRIX.get(ticker_sector)
    exposure = sector_exp.get(economic_variable.value, 0.5) if sector_exp else 0.5

    sector_sens = SENSITIVITY_MATRIX.get(ticker_sector)
    sensitivity = sector_sens.get(economic_variable.value, 0.5) if sector_sens else 0.5

    magnitude = MAGNITUDE_VALUES[event.magnitude.value]
    immediacy = IMMEDIACY_VALUES[event.immediacy.value]
    surprise = SURPRISE_VALUES[event.surprise.value]

    score = exposure * sensitivity * magnitude * immediacy * surprise
    score = min(score, 1.0)
    score = _precise_round(score)

    if score < 0.25:
        level = "LOW"
    elif score < 0.60:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return score, level
