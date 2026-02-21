"""Rationale generator — Section 9.3.

Template: "<cause> impacts <variable>, creating <direction> pressure on <ticker>.
           Confidence driven by <main_factor>."

Tie-breaking follows priority order from Section 9.2.
"""

from ..models.enums import EconomicVariable
from ..models.structured_event import StructuredEvent
from .tables import (
    CLARITY_VALUES,
    CONFIRMATION_VALUES,
    DIRECTNESS_VALUES,
    SOURCE_RELIABILITY_VALUES,
)


def generate_rationale(
    event: StructuredEvent,
    economic_variable: EconomicVariable,
    direction: str,
    ticker: str,
) -> str:
    # Priority-ordered factors (Section 9.2 rank)
    factors = {
        "source reliability": SOURCE_RELIABILITY_VALUES[event.source_reliability_level.value],
        "directness of impact": DIRECTNESS_VALUES[event.directness_level.value],
        "clarity of information": CLARITY_VALUES[event.clarity_level.value],
        "multiple confirmations": CONFIRMATION_VALUES[event.confirmation_level.value],
    }

    # max() returns first key with highest value → respects priority order
    main_factor = max(factors, key=lambda k: factors[k])

    return (
        f"{event.cause_summary} impacts {economic_variable.value}, "
        f"creating {direction} pressure on {ticker}. "
        f"Confidence driven by {main_factor}."
    )
