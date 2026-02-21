"""AnalysisOutput — Section 10.1."""

from typing import Literal

from pydantic import BaseModel

from .enums import EconomicVariable, EventType


class AnalysisOutput(BaseModel):
    ticker: str
    event_type: EventType
    economic_variable: EconomicVariable
    pressure_direction: Literal["positive", "negative", "uncertain"]
    relevance_score: float
    risk_score: float
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    direction: Literal["positive", "negative", "uncertain"]
    confidence: float
    rationale: str
