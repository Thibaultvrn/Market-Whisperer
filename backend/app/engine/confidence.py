"""Confidence score — Section 8.6.

Confidence = 0.35*Source + 0.25*Directness + 0.20*Clarity + 0.20*Confirmation.
"""

from ..models.structured_event import StructuredEvent
from .tables import (
    CLARITY_VALUES,
    CONFIRMATION_VALUES,
    DIRECTNESS_VALUES,
    SOURCE_RELIABILITY_VALUES,
)


def compute_confidence(event: StructuredEvent) -> float:
    source = SOURCE_RELIABILITY_VALUES[event.source_reliability_level.value]
    directness = DIRECTNESS_VALUES[event.directness_level.value]
    clarity = CLARITY_VALUES[event.clarity_level.value]
    confirmation = CONFIRMATION_VALUES[event.confirmation_level.value]

    confidence = (
        0.35 * source
        + 0.25 * directness
        + 0.20 * clarity
        + 0.20 * confirmation
    )
    return round(confidence, 2)
