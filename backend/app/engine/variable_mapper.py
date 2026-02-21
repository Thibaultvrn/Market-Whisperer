"""Event-to-Variable mapping — Section 4.3.

One event_type maps 1-to-1 to one economic_variable (Rule G-002).
"""

from ..models.enums import EconomicVariable, EventType
from ..models.structured_event import StructuredEvent

_MAPPING: dict[EventType, EconomicVariable] = {
    EventType.GEOPOLITICAL_TENSION: EconomicVariable.RISK_AVERSION,
    EventType.POLICY_MONETARY: EconomicVariable.INTEREST_RATE_EXPECTATION,
    EventType.POLICY_FISCAL: EconomicVariable.LIQUIDITY_CONDITIONS,
    EventType.SUPPLY_SHOCK: EconomicVariable.PRODUCTION_DISRUPTION,
    EventType.DEMAND_SHOCK: EconomicVariable.GLOBAL_GROWTH_EXPECTATION,
    EventType.MARKET_STRUCTURE: EconomicVariable.REGULATORY_ENVIRONMENT,
}


def map_economic_variable(event: StructuredEvent) -> EconomicVariable:
    return _MAPPING[event.event_type]
