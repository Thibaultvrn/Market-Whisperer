"""Mock StructuredEvents for demo.

Four realistic scenarios that showcase differential risk scoring across sectors.
Will be replaced by LLM extraction from real news sources (Phase 2).
"""

from ..models.enums import (
    ClarityLevel,
    ConfirmationLevel,
    DirectnessLevel,
    EventType,
    Immediacy,
    Magnitude,
    SourceReliabilityLevel,
    Surprise,
    VariableDirection,
)
from ..models.structured_event import StructuredEvent


def get_mock_events() -> list[StructuredEvent]:
    return [
        # 1. Fed rate hike — systemic monetary policy shock
        #    Tech/Financials/Real Estate feel it hard, Staples barely notice.
        StructuredEvent(
            event_type=EventType.POLICY_MONETARY,
            variable_direction=VariableDirection.INCREASE,
            magnitude=Magnitude.SYSTEMIC,
            immediacy=Immediacy.INSTANT,
            surprise=Surprise.UNEXPECTED,
            country="US",
            source_reliability_level=SourceReliabilityLevel.OFFICIAL,
            directness_level=DirectnessLevel.EXPLICIT,
            clarity_level=ClarityLevel.UNAMBIGUOUS,
            confirmation_level=ConfirmationLevel.MULTIPLE_SOURCES,
            cause_summary="Fed signals 50bps rate hike",
        ),
        # 2. Taiwan Strait escalation — geopolitical risk aversion spike
        #    Broad negative pressure, especially Tech (supply chain) and Financials.
        StructuredEvent(
            event_type=EventType.GEOPOLITICAL_TENSION,
            variable_direction=VariableDirection.INCREASE,
            magnitude=Magnitude.SYSTEMIC,
            immediacy=Immediacy.DAYS,
            surprise=Surprise.PARTIALLY_PRICED,
            country="CN",
            source_reliability_level=SourceReliabilityLevel.MAJOR_WIRE,
            directness_level=DirectnessLevel.MARKET_LEVEL,
            clarity_level=ClarityLevel.CLEAR,
            confirmation_level=ConfirmationLevel.DUAL_SOURCE,
            cause_summary="Escalating tensions in Taiwan Strait",
        ),
        # 3. EU AI regulation — targeted regulatory pressure
        #    Hits Tech and Comms hard, Healthcare exposed via data rules.
        StructuredEvent(
            event_type=EventType.MARKET_STRUCTURE,
            variable_direction=VariableDirection.NEGATIVE,
            magnitude=Magnitude.SECTOR,
            immediacy=Immediacy.WEEKS,
            surprise=Surprise.EXPECTED,
            country="DE",
            source_reliability_level=SourceReliabilityLevel.REPUTABLE_NEWS,
            directness_level=DirectnessLevel.SECTOR_LEVEL,
            clarity_level=ClarityLevel.CLEAR,
            confirmation_level=ConfirmationLevel.MULTIPLE_SOURCES,
            cause_summary="EU passes AI regulation package",
        ),
        # 4. Semiconductor supply chain disruption — production shock
        #    Energy and Industrials very exposed, Financials barely.
        StructuredEvent(
            event_type=EventType.SUPPLY_SHOCK,
            variable_direction=VariableDirection.INCREASE,
            magnitude=Magnitude.SECTOR,
            immediacy=Immediacy.DAYS,
            surprise=Surprise.UNEXPECTED,
            country="KR",
            source_reliability_level=SourceReliabilityLevel.INDUSTRY,
            directness_level=DirectnessLevel.SECTOR_LEVEL,
            clarity_level=ClarityLevel.MODERATE,
            confirmation_level=ConfirmationLevel.SINGLE_SOURCE,
            cause_summary="Semiconductor supply chain disruption",
        ),
    ]
