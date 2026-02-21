"""Tests validating risk engine against risk_methodology.md spec examples.

Section 7.5 example is the ground truth: same event, two sectors, two different scores.
"""

import pytest

from app.engine.confidence import compute_confidence
from app.engine.pipeline import process_event
from app.engine.pressure import compute_pressure_direction
from app.engine.rationale import generate_rationale
from app.engine.relevance import compute_relevance_score
from app.engine.risk_score import compute_risk_score
from app.engine.variable_mapper import map_economic_variable
from app.models.enums import (
    ClarityLevel,
    ConfirmationLevel,
    DirectnessLevel,
    EconomicVariable,
    EventType,
    Immediacy,
    Magnitude,
    SourceReliabilityLevel,
    Surprise,
    VariableDirection,
)
from app.models.structured_event import StructuredEvent
from app.models.ticker_data import TickerData


# ── Fixtures ─────────────────────────────────────────────────────────────


@pytest.fixture
def fed_rate_event() -> StructuredEvent:
    """Section 7.5 reference event: systemic/instant/unexpected monetary policy."""
    return StructuredEvent(
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
        cause_summary="Fed raises rates by 50bps",
    )


@pytest.fixture
def geopolitical_event() -> StructuredEvent:
    return StructuredEvent(
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
    )


# ── Section 4.3: Variable mapping ───────────────────────────────────────


class TestVariableMapper:
    def test_monetary_maps_to_interest_rate(self, fed_rate_event: StructuredEvent):
        assert map_economic_variable(fed_rate_event) == EconomicVariable.INTEREST_RATE_EXPECTATION

    def test_geopolitical_maps_to_risk_aversion(self, geopolitical_event: StructuredEvent):
        assert map_economic_variable(geopolitical_event) == EconomicVariable.RISK_AVERSION

    def test_all_event_types_mapped(self):
        """Every EventType must produce a valid EconomicVariable."""
        for event_type in EventType:
            event = StructuredEvent(
                event_type=event_type,
                variable_direction=VariableDirection.INCREASE,
                magnitude=Magnitude.LOCALIZED,
                immediacy=Immediacy.WEEKS,
                surprise=Surprise.EXPECTED,
                country="US",
                source_reliability_level=SourceReliabilityLevel.UNKNOWN,
                directness_level=DirectnessLevel.INFERRED,
                clarity_level=ClarityLevel.AMBIGUOUS,
                confirmation_level=ConfirmationLevel.UNCONFIRMED,
                cause_summary="test",
            )
            result = map_economic_variable(event)
            assert isinstance(result, EconomicVariable)


# ── Section 5.2: Pressure direction ─────────────────────────────────────


class TestPressureDirection:
    def test_rate_increase_is_negative(self):
        assert compute_pressure_direction(
            EconomicVariable.INTEREST_RATE_EXPECTATION, VariableDirection.INCREASE
        ) == "negative"

    def test_rate_decrease_is_positive(self):
        assert compute_pressure_direction(
            EconomicVariable.INTEREST_RATE_EXPECTATION, VariableDirection.DECREASE
        ) == "positive"

    def test_risk_aversion_increase_is_negative(self):
        assert compute_pressure_direction(
            EconomicVariable.RISK_AVERSION, VariableDirection.INCREASE
        ) == "negative"

    def test_growth_increase_is_positive(self):
        assert compute_pressure_direction(
            EconomicVariable.GLOBAL_GROWTH_EXPECTATION, VariableDirection.INCREASE
        ) == "positive"

    def test_regulatory_negative_is_negative(self):
        assert compute_pressure_direction(
            EconomicVariable.REGULATORY_ENVIRONMENT, VariableDirection.NEGATIVE
        ) == "negative"

    def test_uncertain_always_uncertain(self):
        for var in EconomicVariable:
            assert compute_pressure_direction(var, VariableDirection.UNCERTAIN) == "uncertain"


# ── Section 6.8: Relevance score ────────────────────────────────────────


class TestRelevance:
    def test_tech_us(self, fed_rate_event: StructuredEvent):
        score = compute_relevance_score(
            fed_rate_event, "Technology", "US",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.9  # 0.9 exposure × 1.0 G7

    def test_financials_us(self, fed_rate_event: StructuredEvent):
        score = compute_relevance_score(
            fed_rate_event, "Financials", "US",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 1.0  # 1.0 exposure × 1.0 G7

    def test_below_threshold_filtered(self, fed_rate_event: StructuredEvent):
        score = compute_relevance_score(
            fed_rate_event, "Consumer Staples", "ZZ",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.0  # 0.4 × 0.3 = 0.12 < 0.2

    def test_cross_regional_spillover(self, fed_rate_event: StructuredEvent):
        """Ticker in Asia (CN) + event in US → CrossRegionalImpact = 0.6"""
        score = compute_relevance_score(
            fed_rate_event, "Technology", "CN",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.54  # 0.9 × 0.6 (Asia ticker, US event)


# ── Section 7.4: Risk score (THE key spec validation) ────────────────────


class TestRiskScore:
    def test_technology_section_7_5(self, fed_rate_event: StructuredEvent):
        """Spec Section 7.5: Technology = 0.9 × 0.95 × 1.0 × 1.0 × 1.0 = 0.86 HIGH"""
        score, level = compute_risk_score(
            fed_rate_event, "Technology",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.86
        assert level == "HIGH"

    def test_consumer_staples_section_7_5(self, fed_rate_event: StructuredEvent):
        """Spec Section 7.5: Consumer Staples = 0.4 × 0.3 × 1.0 × 1.0 × 1.0 = 0.12 LOW"""
        score, level = compute_risk_score(
            fed_rate_event, "Consumer Staples",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.12
        assert level == "LOW"

    def test_financials_rate_hike(self, fed_rate_event: StructuredEvent):
        """Financials: 1.0 × 0.9 × 1.0 × 1.0 × 1.0 = 0.9 HIGH"""
        score, level = compute_risk_score(
            fed_rate_event, "Financials",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.9
        assert level == "HIGH"

    def test_real_estate_rate_hike(self, fed_rate_event: StructuredEvent):
        """Real Estate: 1.0 × 0.95 × 1.0 × 1.0 × 1.0 = 0.95 HIGH"""
        score, level = compute_risk_score(
            fed_rate_event, "Real Estate",
            EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score == 0.95
        assert level == "HIGH"

    def test_score_capped_at_1(self):
        """Even max values should not exceed 1.0."""
        event = StructuredEvent(
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
            cause_summary="Max stress test",
        )
        score, _ = compute_risk_score(
            event, "Financials", EconomicVariable.INTEREST_RATE_EXPECTATION,
        )
        assert score <= 1.0

    def test_low_severity_event(self):
        """Localized + long_term + expected → very low score."""
        event = StructuredEvent(
            event_type=EventType.DEMAND_SHOCK,
            variable_direction=VariableDirection.DECREASE,
            magnitude=Magnitude.LOCALIZED,
            immediacy=Immediacy.LONG_TERM,
            surprise=Surprise.EXPECTED,
            country="ZZ",
            source_reliability_level=SourceReliabilityLevel.UNKNOWN,
            directness_level=DirectnessLevel.INFERRED,
            clarity_level=ClarityLevel.AMBIGUOUS,
            confirmation_level=ConfirmationLevel.UNCONFIRMED,
            cause_summary="Minor demand shift",
        )
        score, level = compute_risk_score(
            event, "Consumer Staples", EconomicVariable.GLOBAL_GROWTH_EXPECTATION,
        )
        # 0.4 × 0.3 × 0.4 × 0.2 × 0.3 = 0.00288 → 0.0
        assert score < 0.25
        assert level == "LOW"


# ── Section 8.6: Confidence ─────────────────────────────────────────────


class TestConfidence:
    def test_max_confidence(self, fed_rate_event: StructuredEvent):
        """All top values → 0.35 + 0.25 + 0.20 + 0.20 = 1.0"""
        assert compute_confidence(fed_rate_event) == 1.0

    def test_min_confidence(self):
        event = StructuredEvent(
            event_type=EventType.DEMAND_SHOCK,
            variable_direction=VariableDirection.UNCERTAIN,
            magnitude=Magnitude.LOCALIZED,
            immediacy=Immediacy.LONG_TERM,
            surprise=Surprise.EXPECTED,
            country="ZZ",
            source_reliability_level=SourceReliabilityLevel.UNKNOWN,
            directness_level=DirectnessLevel.INFERRED,
            clarity_level=ClarityLevel.AMBIGUOUS,
            confirmation_level=ConfirmationLevel.UNCONFIRMED,
            cause_summary="Rumor",
        )
        confidence = compute_confidence(event)
        # 0.35×0.1 + 0.25×0.3 + 0.20×0.2 + 0.20×0.1 = 0.035+0.075+0.04+0.02 = 0.17
        assert confidence == 0.17

    def test_mixed_confidence(self, geopolitical_event: StructuredEvent):
        confidence = compute_confidence(geopolitical_event)
        # major_wire=0.9, market_level=0.5, clear=0.8, dual_source=0.7
        # 0.35×0.9 + 0.25×0.5 + 0.20×0.8 + 0.20×0.7
        # = 0.315 + 0.125 + 0.16 + 0.14 = 0.74
        assert confidence == 0.74


# ── Section 9.3: Rationale ──────────────────────────────────────────────


class TestRationale:
    def test_template_format(self, fed_rate_event: StructuredEvent):
        rationale = generate_rationale(
            fed_rate_event,
            EconomicVariable.INTEREST_RATE_EXPECTATION,
            "negative",
            "AAPL",
        )
        assert "Fed raises rates by 50bps" in rationale
        assert "interest_rate_expectation" in rationale
        assert "negative" in rationale
        assert "AAPL" in rationale
        assert "Confidence driven by" in rationale

    def test_main_factor_selection(self, fed_rate_event: StructuredEvent):
        """When all values are 1.0, source reliability wins (highest priority)."""
        rationale = generate_rationale(
            fed_rate_event,
            EconomicVariable.INTEREST_RATE_EXPECTATION,
            "negative",
            "AAPL",
        )
        assert "source reliability" in rationale


# ── Section 11.1: Full pipeline ──────────────────────────────────────────


class TestPipeline:
    def test_different_risk_per_sector(self, fed_rate_event: StructuredEvent):
        """Core spec guarantee: same event → different risk scores per sector."""
        tickers = [
            TickerData(symbol="AAPL", sector="Technology", country="US"),
            TickerData(symbol="KO", sector="Consumer Staples", country="US"),
        ]
        results = process_event(fed_rate_event, tickers)
        assert len(results) == 2

        aapl = next(r for r in results if r.ticker == "AAPL")
        ko = next(r for r in results if r.ticker == "KO")

        assert aapl.risk_score == 0.86
        assert aapl.risk_level == "HIGH"
        assert ko.risk_score == 0.12
        assert ko.risk_level == "LOW"
        assert aapl.risk_score > ko.risk_score

    def test_irrelevant_tickers_filtered(self):
        """Tickers with relevance < 0.2 are excluded from results."""
        event = StructuredEvent(
            event_type=EventType.DEMAND_SHOCK,
            variable_direction=VariableDirection.DECREASE,
            magnitude=Magnitude.LOCALIZED,
            immediacy=Immediacy.LONG_TERM,
            surprise=Surprise.EXPECTED,
            country="ZZ",
            source_reliability_level=SourceReliabilityLevel.UNKNOWN,
            directness_level=DirectnessLevel.INFERRED,
            clarity_level=ClarityLevel.AMBIGUOUS,
            confirmation_level=ConfirmationLevel.UNCONFIRMED,
            cause_summary="Minor local demand shift",
        )
        tickers = [
            TickerData(symbol="NEE", sector="Utilities", country="ZZ"),
        ]
        results = process_event(event, tickers)
        # Utilities × global_growth = 0.3, country ZZ = 0.3 → 0.09 < 0.2
        assert len(results) == 0

    def test_all_fields_present(self, fed_rate_event: StructuredEvent):
        """Every AnalysisOutput must have all required fields."""
        tickers = [TickerData(symbol="AAPL", sector="Technology", country="US")]
        results = process_event(fed_rate_event, tickers)
        assert len(results) == 1

        r = results[0]
        assert r.ticker == "AAPL"
        assert r.event_type == EventType.POLICY_MONETARY
        assert r.economic_variable == EconomicVariable.INTEREST_RATE_EXPECTATION
        assert r.pressure_direction == "negative"
        assert r.direction == "negative"
        assert 0.0 <= r.relevance_score <= 1.0
        assert 0.0 <= r.risk_score <= 1.0
        assert r.risk_level in ("LOW", "MEDIUM", "HIGH")
        assert 0.0 <= r.confidence <= 1.0
        assert len(r.rationale) > 0

    def test_multi_sector_portfolio(self, fed_rate_event: StructuredEvent):
        """Full portfolio across 5 sectors → each gets a distinct score."""
        tickers = [
            TickerData(symbol="AAPL", sector="Technology", country="US"),
            TickerData(symbol="JPM", sector="Financials", country="US"),
            TickerData(symbol="XOM", sector="Energy", country="US"),
            TickerData(symbol="KO", sector="Consumer Staples", country="US"),
            TickerData(symbol="AMT", sector="Real Estate", country="US"),
        ]
        results = process_event(fed_rate_event, tickers)
        assert len(results) == 5

        scores = {r.ticker: r.risk_score for r in results}
        # Real Estate and Financials should be highest for rate hike
        assert scores["AMT"] > scores["XOM"]
        assert scores["JPM"] > scores["KO"]

    def test_confidence_same_across_tickers(self, fed_rate_event: StructuredEvent):
        """Confidence is event-level, not ticker-level — must be identical."""
        tickers = [
            TickerData(symbol="AAPL", sector="Technology", country="US"),
            TickerData(symbol="KO", sector="Consumer Staples", country="US"),
        ]
        results = process_event(fed_rate_event, tickers)
        confidences = {r.confidence for r in results}
        assert len(confidences) == 1  # all the same value
