"""Static lookup tables — Sections 5.1, 6.2–6.7, 8.2–8.5.

Every value is transcribed directly from risk_methodology.md.
These tables are the ONLY source of numeric constants for the Risk Engine.
"""

# ── Section 6.2 — Exposure Matrix ────────────────────────────────────────
# Degree to which a sector's revenue/operations depend on the variable.

EXPOSURE_MATRIX: dict[str, dict[str, float]] = {
    "Technology": {
        "risk_aversion": 0.7,
        "interest_rate_expectation": 0.9,
        "liquidity_conditions": 0.8,
        "production_disruption": 0.6,
        "global_growth_expectation": 0.8,
        "regulatory_environment": 0.7,
    },
    "Financials": {
        "risk_aversion": 0.8,
        "interest_rate_expectation": 1.0,
        "liquidity_conditions": 0.9,
        "production_disruption": 0.3,
        "global_growth_expectation": 0.7,
        "regulatory_environment": 0.9,
    },
    "Healthcare": {
        "risk_aversion": 0.4,
        "interest_rate_expectation": 0.5,
        "liquidity_conditions": 0.6,
        "production_disruption": 0.7,
        "global_growth_expectation": 0.5,
        "regulatory_environment": 1.0,
    },
    "Energy": {
        "risk_aversion": 0.6,
        "interest_rate_expectation": 0.4,
        "liquidity_conditions": 0.5,
        "production_disruption": 1.0,
        "global_growth_expectation": 0.8,
        "regulatory_environment": 0.6,
    },
    "Consumer Discretionary": {
        "risk_aversion": 0.7,
        "interest_rate_expectation": 0.7,
        "liquidity_conditions": 0.7,
        "production_disruption": 0.6,
        "global_growth_expectation": 0.9,
        "regulatory_environment": 0.5,
    },
    "Consumer Staples": {
        "risk_aversion": 0.3,
        "interest_rate_expectation": 0.4,
        "liquidity_conditions": 0.5,
        "production_disruption": 0.5,
        "global_growth_expectation": 0.4,
        "regulatory_environment": 0.4,
    },
    "Industrials": {
        "risk_aversion": 0.6,
        "interest_rate_expectation": 0.6,
        "liquidity_conditions": 0.6,
        "production_disruption": 0.9,
        "global_growth_expectation": 0.9,
        "regulatory_environment": 0.5,
    },
    "Materials": {
        "risk_aversion": 0.6,
        "interest_rate_expectation": 0.5,
        "liquidity_conditions": 0.5,
        "production_disruption": 0.8,
        "global_growth_expectation": 0.8,
        "regulatory_environment": 0.4,
    },
    "Utilities": {
        "risk_aversion": 0.2,
        "interest_rate_expectation": 0.7,
        "liquidity_conditions": 0.6,
        "production_disruption": 0.4,
        "global_growth_expectation": 0.3,
        "regulatory_environment": 0.8,
    },
    "Real Estate": {
        "risk_aversion": 0.5,
        "interest_rate_expectation": 1.0,
        "liquidity_conditions": 0.9,
        "production_disruption": 0.3,
        "global_growth_expectation": 0.6,
        "regulatory_environment": 0.7,
    },
    "Communication Services": {
        "risk_aversion": 0.5,
        "interest_rate_expectation": 0.6,
        "liquidity_conditions": 0.7,
        "production_disruption": 0.4,
        "global_growth_expectation": 0.7,
        "regulatory_environment": 0.8,
    },
}

# ── Section 6.3 — Sensitivity Matrix ────────────────────────────────────
# How reactive a sector's valuation is to changes in the variable.

SENSITIVITY_MATRIX: dict[str, dict[str, float]] = {
    "Technology": {
        "risk_aversion": 0.9,
        "interest_rate_expectation": 0.95,
        "liquidity_conditions": 0.85,
        "production_disruption": 0.5,
        "global_growth_expectation": 0.9,
        "regulatory_environment": 0.6,
    },
    "Financials": {
        "risk_aversion": 0.85,
        "interest_rate_expectation": 0.9,
        "liquidity_conditions": 0.95,
        "production_disruption": 0.2,
        "global_growth_expectation": 0.6,
        "regulatory_environment": 0.85,
    },
    "Healthcare": {
        "risk_aversion": 0.3,
        "interest_rate_expectation": 0.4,
        "liquidity_conditions": 0.5,
        "production_disruption": 0.6,
        "global_growth_expectation": 0.4,
        "regulatory_environment": 0.95,
    },
    "Energy": {
        "risk_aversion": 0.7,
        "interest_rate_expectation": 0.3,
        "liquidity_conditions": 0.4,
        "production_disruption": 0.95,
        "global_growth_expectation": 0.85,
        "regulatory_environment": 0.5,
    },
    "Consumer Discretionary": {
        "risk_aversion": 0.8,
        "interest_rate_expectation": 0.75,
        "liquidity_conditions": 0.7,
        "production_disruption": 0.55,
        "global_growth_expectation": 0.95,
        "regulatory_environment": 0.4,
    },
    "Consumer Staples": {
        "risk_aversion": 0.2,
        "interest_rate_expectation": 0.3,
        "liquidity_conditions": 0.4,
        "production_disruption": 0.4,
        "global_growth_expectation": 0.3,
        "regulatory_environment": 0.35,
    },
    "Industrials": {
        "risk_aversion": 0.65,
        "interest_rate_expectation": 0.55,
        "liquidity_conditions": 0.55,
        "production_disruption": 0.9,
        "global_growth_expectation": 0.9,
        "regulatory_environment": 0.45,
    },
    "Materials": {
        "risk_aversion": 0.7,
        "interest_rate_expectation": 0.45,
        "liquidity_conditions": 0.45,
        "production_disruption": 0.85,
        "global_growth_expectation": 0.85,
        "regulatory_environment": 0.35,
    },
    "Utilities": {
        "risk_aversion": 0.15,
        "interest_rate_expectation": 0.8,
        "liquidity_conditions": 0.65,
        "production_disruption": 0.35,
        "global_growth_expectation": 0.2,
        "regulatory_environment": 0.75,
    },
    "Real Estate": {
        "risk_aversion": 0.45,
        "interest_rate_expectation": 0.95,
        "liquidity_conditions": 0.9,
        "production_disruption": 0.25,
        "global_growth_expectation": 0.5,
        "regulatory_environment": 0.65,
    },
    "Communication Services": {
        "risk_aversion": 0.5,
        "interest_rate_expectation": 0.55,
        "liquidity_conditions": 0.65,
        "production_disruption": 0.35,
        "global_growth_expectation": 0.65,
        "regulatory_environment": 0.75,
    },
}

# ── Section 6.4 — Country Weight (DEPRECATED — kept for reference) ───────
# Replaced by CrossRegionalImpactMatrix below.

COUNTRY_WEIGHT: dict[str, float] = {
    "US": 1.0, "GB": 1.0, "UK": 1.0, "DE": 1.0,
    "FR": 1.0, "IT": 1.0, "JP": 1.0, "CA": 1.0,
    "CN": 0.8, "IN": 0.8, "BR": 0.8, "KR": 0.8, "MX": 0.8,
    "AU": 0.5, "CH": 0.5, "NL": 0.5, "ES": 0.5, "SE": 0.5,
}
COUNTRY_WEIGHT_DEFAULT = 0.3

# ── Section 6.4.1 — Region Classification ────────────────────────────────

REGION_MAP: dict[str, str] = {
    "US": "US", "CA": "US",
    "UK": "Europe", "GB": "Europe", "DE": "Europe", "FR": "Europe",
    "IT": "Europe", "ES": "Europe", "NL": "Europe", "CH": "Europe",
    "CN": "Asia", "JP": "Asia", "KR": "Asia", "TW": "Asia",
    "IN": "Asia", "HK": "Asia", "SG": "Asia",
}
REGION_DEFAULT = "Other"


def get_region(country_code: str) -> str:
    return REGION_MAP.get(country_code, REGION_DEFAULT)


# ── Section 6.4.2 — Cross-Regional Impact Matrix ─────────────────────────
# Replaces CountryWeight. Captures how much an event in one region
# spills over to a ticker domiciled in another region.
#   - Same region → 1.0 (full impact)
#   - US↔Asia    → 0.6 (strong trade/supply-chain ties)
#   - US↔Europe  → 0.5 (moderate financial linkage)
#   - Asia↔Europe→ 0.4 (weaker direct linkage)
#   - Other      → 0.3–0.5

CROSS_REGIONAL_IMPACT: dict[str, dict[str, float]] = {
    "US": {
        "US": 1.0,
        "Europe": 0.5,
        "Asia": 0.6,
        "Other": 0.3,
    },
    "Europe": {
        "US": 0.5,
        "Europe": 1.0,
        "Asia": 0.4,
        "Other": 0.3,
    },
    "Asia": {
        "US": 0.6,
        "Europe": 0.4,
        "Asia": 1.0,
        "Other": 0.3,
    },
    "Other": {
        "US": 0.4,
        "Europe": 0.4,
        "Asia": 0.4,
        "Other": 0.5,
    },
}

# ── Section 6.5 — Magnitude Values ──────────────────────────────────────

MAGNITUDE_VALUES: dict[str, float] = {
    "systemic": 1.0,
    "sector": 0.7,
    "localized": 0.4,
}

# ── Section 6.6 — Immediacy Values ──────────────────────────────────────

IMMEDIACY_VALUES: dict[str, float] = {
    "instant": 1.0,
    "days": 0.7,
    "weeks": 0.4,
    "long_term": 0.2,
}

# ── Section 6.7 — Surprise Values ───────────────────────────────────────

SURPRISE_VALUES: dict[str, float] = {
    "unexpected": 1.0,
    "partially_priced": 0.6,
    "expected": 0.3,
}

# ── Section 8.2 — Source Reliability Values ──────────────────────────────

SOURCE_RELIABILITY_VALUES: dict[str, float] = {
    "official": 1.0,
    "major_wire": 0.9,
    "major_publication": 0.8,
    "reputable_news": 0.7,
    "industry": 0.6,
    "analyst": 0.5,
    "social_media": 0.2,
    "unknown": 0.1,
}

# ── Section 8.3 — Directness Values ─────────────────────────────────────

DIRECTNESS_VALUES: dict[str, float] = {
    "explicit": 1.0,
    "sector_level": 0.7,
    "market_level": 0.5,
    "inferred": 0.3,
}

# ── Section 8.4 — Clarity Values ────────────────────────────────────────

CLARITY_VALUES: dict[str, float] = {
    "unambiguous": 1.0,
    "clear": 0.8,
    "moderate": 0.5,
    "ambiguous": 0.2,
}

# ── Section 8.5 — Confirmation Values ───────────────────────────────────

CONFIRMATION_VALUES: dict[str, float] = {
    "multiple_sources": 1.0,
    "dual_source": 0.7,
    "single_source": 0.4,
    "unconfirmed": 0.1,
}
