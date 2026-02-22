"""StructuredEvent — Section 2.1.

The LLM extraction layer produces this schema.
The Risk Engine accepts ONLY this as input (Rule G-004).
"""

from pydantic import BaseModel, Field

from .enums import (
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


class StructuredEvent(BaseModel):
    event_type: EventType
    variable_direction: VariableDirection
    expected_date: str | None = None  # YYYY-MM-DD, when event is expected to occur
    magnitude: Magnitude
    immediacy: Immediacy
    surprise: Surprise
    country: str
    source_reliability_level: SourceReliabilityLevel
    directness_level: DirectnessLevel
    clarity_level: ClarityLevel
    confirmation_level: ConfirmationLevel
    cause_summary: str = Field(max_length=50)
