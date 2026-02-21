"""Pressure direction — Section 5.2.

Determines whether the event creates positive or negative equity pressure.
"""

from ..models.enums import EconomicVariable, VariableDirection

_DIRECTION_MAP: dict[tuple[str, str], str] = {
    ("risk_aversion", "increase"): "negative",
    ("risk_aversion", "decrease"): "positive",
    ("interest_rate_expectation", "increase"): "negative",
    ("interest_rate_expectation", "decrease"): "positive",
    ("liquidity_conditions", "increase"): "positive",
    ("liquidity_conditions", "decrease"): "negative",
    ("production_disruption", "increase"): "negative",
    ("production_disruption", "decrease"): "positive",
    ("global_growth_expectation", "increase"): "positive",
    ("global_growth_expectation", "decrease"): "negative",
    ("regulatory_environment", "negative"): "negative",
    ("regulatory_environment", "positive"): "positive",
}


def compute_pressure_direction(
    economic_variable: EconomicVariable,
    variable_direction: VariableDirection,
) -> str:
    if variable_direction == VariableDirection.UNCERTAIN:
        return "uncertain"

    key = (economic_variable.value, variable_direction.value)
    return _DIRECTION_MAP.get(key, "uncertain")
