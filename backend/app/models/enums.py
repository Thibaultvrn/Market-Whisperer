"""All enums from risk_methodology.md — Sections 2.2 and 4.1."""

from enum import Enum


class EventType(str, Enum):
    SUPPLY_SHOCK = "SUPPLY_SHOCK"
    DEMAND_SHOCK = "DEMAND_SHOCK"
    POLICY_MONETARY = "POLICY_MONETARY"
    POLICY_FISCAL = "POLICY_FISCAL"
    GEOPOLITICAL_TENSION = "GEOPOLITICAL_TENSION"
    MARKET_STRUCTURE = "MARKET_STRUCTURE"


class VariableDirection(str, Enum):
    INCREASE = "increase"
    DECREASE = "decrease"
    NEGATIVE = "negative"
    POSITIVE = "positive"
    UNCERTAIN = "uncertain"


class Magnitude(str, Enum):
    SYSTEMIC = "systemic"
    SECTOR = "sector"
    LOCALIZED = "localized"


class Immediacy(str, Enum):
    INSTANT = "instant"
    DAYS = "days"
    WEEKS = "weeks"
    LONG_TERM = "long_term"


class Surprise(str, Enum):
    UNEXPECTED = "unexpected"
    PARTIALLY_PRICED = "partially_priced"
    EXPECTED = "expected"


class SourceReliabilityLevel(str, Enum):
    OFFICIAL = "official"
    MAJOR_WIRE = "major_wire"
    MAJOR_PUBLICATION = "major_publication"
    REPUTABLE_NEWS = "reputable_news"
    INDUSTRY = "industry"
    ANALYST = "analyst"
    SOCIAL_MEDIA = "social_media"
    UNKNOWN = "unknown"


class DirectnessLevel(str, Enum):
    EXPLICIT = "explicit"
    SECTOR_LEVEL = "sector_level"
    MARKET_LEVEL = "market_level"
    INFERRED = "inferred"


class ClarityLevel(str, Enum):
    UNAMBIGUOUS = "unambiguous"
    CLEAR = "clear"
    MODERATE = "moderate"
    AMBIGUOUS = "ambiguous"


class ConfirmationLevel(str, Enum):
    MULTIPLE_SOURCES = "multiple_sources"
    DUAL_SOURCE = "dual_source"
    SINGLE_SOURCE = "single_source"
    UNCONFIRMED = "unconfirmed"


class EconomicVariable(str, Enum):
    RISK_AVERSION = "risk_aversion"
    INTEREST_RATE_EXPECTATION = "interest_rate_expectation"
    LIQUIDITY_CONDITIONS = "liquidity_conditions"
    INFLATION_EXPECTATION = "inflation_expectation"
    TRADE_FLOW = "trade_flow"
    PRODUCTION_DISRUPTION = "production_disruption"
    GLOBAL_GROWTH_EXPECTATION = "global_growth_expectation"
    REGULATORY_ENVIRONMENT = "regulatory_environment"
