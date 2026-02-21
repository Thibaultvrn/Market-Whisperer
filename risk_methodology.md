# Risk Methodology Specification

**Document Type:** Technical Specification  
**Version:** 3.0.0  
**Status:** FINAL  
**Scope:** Deterministic Ticker-Dependent Risk Scoring Engine for Market Whisperer

---

## 0. GLOBAL RULES

| Rule ID | Constraint |
|---------|------------|
| G-001 | One event = exactly one `event_type` |
| G-002 | `event_type` maps 1-to-1 to `economic_variable` |
| G-003 | Only predefined enums allowed |
| G-004 | Risk Engine receives STRUCTURED_EVENT only |
| G-005 | Risk Engine NEVER parses raw text |
| G-006 | If required field missing → score component = 0 |
| G-007 | All numeric values normalized to [0,1] |
| G-008 | All logic must be convertible to if/else |
| G-009 | POST /analyze contract must not be modified |
| G-010 | LLM performs structured extraction ONLY |
| G-011 | No keyword detection in Risk Engine |
| G-012 | RiskScore MUST vary per ticker (sector-dependent) |
| G-013 | Exposure and Sensitivity are ticker properties, NOT event properties |
| G-014 | LLM extracts event-level attributes only |

---

## 1. ARCHITECTURE LAYERS

### 1.1 Layer Separation

```
┌─────────────────────────────────────────────────────────────┐
│                      LAYER 1: LLM EXTRACTION                │
│                                                             │
│   Input: raw text                                           │
│   Output: STRUCTURED_EVENT                                  │
│   Responsibility: NLP, keyword detection, text parsing      │
├─────────────────────────────────────────────────────────────┤
│                      LAYER 2: RISK ENGINE                   │
│                                                             │
│   Input: STRUCTURED_EVENT                                   │
│   Output: AnalysisOutput                                    │
│   Responsibility: Deterministic numeric scoring             │
│   Constraints: NO text parsing, NO keyword detection        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
Raw Text
    │
    ▼
┌─────────────────────┐
│   LLM Extraction    │
│   (structured only) │
└─────────────────────┘
    │
    ▼
STRUCTURED_EVENT (JSON)
    │
    ▼
┌─────────────────────┐
│    Risk Engine      │
│   (deterministic)   │
└─────────────────────┘
    │
    ▼
AnalysisOutput (JSON)
```

---

## 2. STRUCTURED_EVENT SCHEMA

### 2.1 LLM Output Contract

The LLM MUST produce this exact structure. Risk Engine accepts ONLY this schema.

StructuredEvent contains ONLY event-level attributes. Exposure and Sensitivity are ticker properties computed by the Risk Engine using sector matrices.

```python
class StructuredEvent(BaseModel):
    event_type: EventType
    variable_direction: VariableDirection
    magnitude: Magnitude
    immediacy: Immediacy
    surprise: Surprise
    country: str
    source_reliability_level: SourceReliabilityLevel
    directness_level: DirectnessLevel
    clarity_level: ClarityLevel
    confirmation_level: ConfirmationLevel
    cause_summary: str  # max 50 characters
```

### 2.2 Enum Definitions

```python
class EventType(str, Enum):
    SUPPLY_SHOCK = "SUPPLY_SHOCK"
    DEMAND_SHOCK = "DEMAND_SHOCK"
    POLICY_MONETARY = "POLICY_MONETARY"
    POLICY_FISCAL = "POLICY_FISCAL"
    GEOPOLITICAL_TENSION = "GEOPOLITICAL_TENSION"
    MARKET_STRUCTURE = "MARKET_STRUCTURE"
```

```python
class VariableDirection(str, Enum):
    INCREASE = "increase"
    DECREASE = "decrease"
    NEGATIVE = "negative"   # for regulatory_environment
    POSITIVE = "positive"   # for regulatory_environment
    UNCERTAIN = "uncertain"
```

```python
class Magnitude(str, Enum):
    SYSTEMIC = "systemic"
    SECTOR = "sector"
    LOCALIZED = "localized"
```

```python
class Immediacy(str, Enum):
    INSTANT = "instant"
    DAYS = "days"
    WEEKS = "weeks"
    LONG_TERM = "long_term"
```

```python
class Surprise(str, Enum):
    UNEXPECTED = "unexpected"
    PARTIALLY_PRICED = "partially_priced"
    EXPECTED = "expected"
```

```python
class SourceReliabilityLevel(str, Enum):
    OFFICIAL = "official"
    MAJOR_WIRE = "major_wire"
    MAJOR_PUBLICATION = "major_publication"
    REPUTABLE_NEWS = "reputable_news"
    INDUSTRY = "industry"
    ANALYST = "analyst"
    SOCIAL_MEDIA = "social_media"
    UNKNOWN = "unknown"
```

```python
class DirectnessLevel(str, Enum):
    EXPLICIT = "explicit"
    SECTOR_LEVEL = "sector_level"
    MARKET_LEVEL = "market_level"
    INFERRED = "inferred"
```

```python
class ClarityLevel(str, Enum):
    UNAMBIGUOUS = "unambiguous"
    CLEAR = "clear"
    MODERATE = "moderate"
    AMBIGUOUS = "ambiguous"
```

```python
class ConfirmationLevel(str, Enum):
    MULTIPLE_SOURCES = "multiple_sources"
    DUAL_SOURCE = "dual_source"
    SINGLE_SOURCE = "single_source"
    UNCONFIRMED = "unconfirmed"
```

---

## 3. EVENT TAXONOMY

### 3.1 Event Type Priority Order

| Priority | Event Type |
|----------|------------|
| 1 (highest) | GEOPOLITICAL_TENSION |
| 2 | POLICY_MONETARY |
| 3 | POLICY_FISCAL |
| 4 | SUPPLY_SHOCK |
| 5 | DEMAND_SHOCK |
| 6 (lowest) | MARKET_STRUCTURE |

### 3.2 LLM Classification Instructions

The LLM must classify `event_type` based on:

| Event Type | Classification Criteria |
|------------|-------------------------|
| GEOPOLITICAL_TENSION | War, conflict, sanctions, military action, territorial disputes, diplomatic crises |
| POLICY_MONETARY | Central bank actions, interest rate decisions, QE/QT, monetary policy statements |
| POLICY_FISCAL | Government spending, tax policy, fiscal stimulus, budget decisions |
| SUPPLY_SHOCK | Supply chain disruptions, production halts, shortages, logistics failures |
| DEMAND_SHOCK | Consumer spending shifts, GDP changes, employment data, demand fluctuations |
| MARKET_STRUCTURE | Regulatory changes, M&A, market rule changes, compliance requirements |

---

## 4. ECONOMIC VARIABLES

### 4.1 Allowed Variables Enum

```python
class EconomicVariable(str, Enum):
    RISK_AVERSION = "risk_aversion"
    INTEREST_RATE_EXPECTATION = "interest_rate_expectation"
    LIQUIDITY_CONDITIONS = "liquidity_conditions"
    INFLATION_EXPECTATION = "inflation_expectation"
    TRADE_FLOW = "trade_flow"
    PRODUCTION_DISRUPTION = "production_disruption"
    GLOBAL_GROWTH_EXPECTATION = "global_growth_expectation"
    REGULATORY_ENVIRONMENT = "regulatory_environment"
```

### 4.2 Event-to-Variable Mapping Table

| Event Type | Economic Variable |
|------------|-------------------|
| GEOPOLITICAL_TENSION | risk_aversion |
| POLICY_MONETARY | interest_rate_expectation |
| POLICY_FISCAL | liquidity_conditions |
| SUPPLY_SHOCK | production_disruption |
| DEMAND_SHOCK | global_growth_expectation |
| MARKET_STRUCTURE | regulatory_environment |

### 4.3 Risk Engine: Variable Mapping Function

```
FUNCTION map_economic_variable(event: StructuredEvent) -> EconomicVariable:
    
    MAPPING = {
        "GEOPOLITICAL_TENSION": "risk_aversion",
        "POLICY_MONETARY": "interest_rate_expectation",
        "POLICY_FISCAL": "liquidity_conditions",
        "SUPPLY_SHOCK": "production_disruption",
        "DEMAND_SHOCK": "global_growth_expectation",
        "MARKET_STRUCTURE": "regulatory_environment"
    }
    
    RETURN MAPPING[event.event_type]
```

**Input:** `StructuredEvent`  
**Output:** `economic_variable`

---

## 5. TRANSMISSION ENGINE

### 5.1 Pressure Direction Table

| Economic Variable | Variable Direction | Equity Pressure |
|-------------------|-------------------|-----------------|
| risk_aversion | increase | negative |
| risk_aversion | decrease | positive |
| interest_rate_expectation | increase | negative |
| interest_rate_expectation | decrease | positive |
| liquidity_conditions | increase | positive |
| liquidity_conditions | decrease | negative |
| production_disruption | increase | negative |
| production_disruption | decrease | positive |
| global_growth_expectation | increase | positive |
| global_growth_expectation | decrease | negative |
| regulatory_environment | negative | negative |
| regulatory_environment | positive | positive |

### 5.2 Risk Engine: Pressure Direction Function

```
FUNCTION compute_pressure_direction(
    economic_variable: EconomicVariable,
    variable_direction: VariableDirection
) -> str:
    
    IF variable_direction == "uncertain":
        RETURN "uncertain"
    
    DIRECTION_MAP = {
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
        ("regulatory_environment", "positive"): "positive"
    }
    
    key = (economic_variable, variable_direction)
    
    IF key IN DIRECTION_MAP:
        RETURN DIRECTION_MAP[key]
    
    RETURN "uncertain"
```

**Input:** `economic_variable`, `variable_direction`  
**Output:** `pressure_direction`

---

## 6. TICKER RELEVANCE ENGINE

### 6.1 Relevance Score Formula

```
RelevanceScore = ExposureMatrix[sector][economic_variable] × CountryWeight
```

### 6.2 Exposure Matrix

Exposure represents the degree to which a sector's revenue/operations depend on the economic variable.

| Sector | risk_aversion | interest_rate_expectation | liquidity_conditions | production_disruption | global_growth_expectation | regulatory_environment |
|--------|---------------|---------------------------|----------------------|-----------------------|---------------------------|------------------------|
| Technology | 0.7 | 0.9 | 0.8 | 0.6 | 0.8 | 0.7 |
| Financials | 0.8 | 1.0 | 0.9 | 0.3 | 0.7 | 0.9 |
| Healthcare | 0.4 | 0.5 | 0.6 | 0.7 | 0.5 | 1.0 |
| Energy | 0.6 | 0.4 | 0.5 | 1.0 | 0.8 | 0.6 |
| Consumer Discretionary | 0.7 | 0.7 | 0.7 | 0.6 | 0.9 | 0.5 |
| Consumer Staples | 0.3 | 0.4 | 0.5 | 0.5 | 0.4 | 0.4 |
| Industrials | 0.6 | 0.6 | 0.6 | 0.9 | 0.9 | 0.5 |
| Materials | 0.6 | 0.5 | 0.5 | 0.8 | 0.8 | 0.4 |
| Utilities | 0.2 | 0.7 | 0.6 | 0.4 | 0.3 | 0.8 |
| Real Estate | 0.5 | 1.0 | 0.9 | 0.3 | 0.6 | 0.7 |
| Communication Services | 0.5 | 0.6 | 0.7 | 0.4 | 0.7 | 0.8 |

### 6.3 Sensitivity Matrix

Sensitivity represents how reactive a sector's valuation is to changes in the economic variable, independent of exposure intensity.

| Sector | risk_aversion | interest_rate_expectation | liquidity_conditions | production_disruption | global_growth_expectation | regulatory_environment |
|--------|---------------|---------------------------|----------------------|-----------------------|---------------------------|------------------------|
| Technology | 0.9 | 0.95 | 0.85 | 0.5 | 0.9 | 0.6 |
| Financials | 0.85 | 0.9 | 0.95 | 0.2 | 0.6 | 0.85 |
| Healthcare | 0.3 | 0.4 | 0.5 | 0.6 | 0.4 | 0.95 |
| Energy | 0.7 | 0.3 | 0.4 | 0.95 | 0.85 | 0.5 |
| Consumer Discretionary | 0.8 | 0.75 | 0.7 | 0.55 | 0.95 | 0.4 |
| Consumer Staples | 0.2 | 0.3 | 0.4 | 0.4 | 0.3 | 0.35 |
| Industrials | 0.65 | 0.55 | 0.55 | 0.9 | 0.9 | 0.45 |
| Materials | 0.7 | 0.45 | 0.45 | 0.85 | 0.85 | 0.35 |
| Utilities | 0.15 | 0.8 | 0.65 | 0.35 | 0.2 | 0.75 |
| Real Estate | 0.45 | 0.95 | 0.9 | 0.25 | 0.5 | 0.65 |
| Communication Services | 0.5 | 0.55 | 0.65 | 0.35 | 0.65 | 0.75 |

### 6.4 Country Weight Table

| Country Classification | Countries | Weight |
|------------------------|-----------|--------|
| G7 | US, UK, DE, FR, IT, JP, CA | 1.0 |
| Major Emerging Markets | CN, IN, BR, KR, MX | 0.8 |
| Regional Markets | AU, CH, NL, ES, SE | 0.5 |
| Small Markets | All others | 0.3 |

### 6.5 Magnitude Value Table

| Magnitude | Value |
|-----------|-------|
| systemic | 1.0 |
| sector | 0.7 |
| localized | 0.4 |

### 6.6 Immediacy Value Table

| Immediacy | Value |
|-----------|-------|
| instant | 1.0 |
| days | 0.7 |
| weeks | 0.4 |
| long_term | 0.2 |

### 6.7 Surprise Value Table

| Surprise | Value |
|----------|-------|
| unexpected | 1.0 |
| partially_priced | 0.6 |
| expected | 0.3 |

### 6.8 Risk Engine: Relevance Score Function

```
FUNCTION compute_relevance_score(
    event: StructuredEvent,
    ticker_sector: str,
    ticker_country: str,
    economic_variable: EconomicVariable
) -> float:
    
    # Lookup exposure from matrix
    exposure = EXPOSURE_MATRIX[ticker_sector][economic_variable]
    IF exposure IS NULL:
        exposure = 0.5
    
    # Lookup country weight
    country_weight = COUNTRY_WEIGHT_TABLE[ticker_country]
    IF country_weight IS NULL:
        country_weight = 0.3
    
    # Compute relevance (exposure filter only, no magnitude)
    relevance_score = exposure × country_weight
    
    IF relevance_score < 0.2:
        RETURN 0.0
    
    RETURN round(relevance_score, 2)
```

**Input:** `StructuredEvent`, `ticker_sector`, `ticker_country`, `economic_variable`  
**Output:** `relevance_score`

---

## 7. RISK SCORE FRAMEWORK

### 7.1 Core Principle

RiskScore is computed PER TICKER. It depends on the ticker's sector via the Exposure and Sensitivity matrices. Different tickers will have different risk scores for the same event.

### 7.2 Core Formula

```
RiskScore = ExposureValue × SensitivityValue × MagnitudeValue × ImmediacyValue × SurpriseValue
```

Where:
- **ExposureValue** = `ExposureMatrix[ticker.sector][economic_variable]`
- **SensitivityValue** = `SensitivityMatrix[ticker.sector][economic_variable]`
- **MagnitudeValue** = lookup from Magnitude Value Table (Section 6.5)
- **ImmediacyValue** = lookup from Immediacy Value Table (Section 6.6)
- **SurpriseValue** = lookup from Surprise Value Table (Section 6.7)

### 7.3 Risk Level Mapping

| Score Range | Risk Level |
|-------------|------------|
| 0.00 – 0.24 | LOW |
| 0.25 – 0.59 | MEDIUM |
| 0.60 – 1.00 | HIGH |

### 7.4 Risk Engine: Risk Score Function

```
FUNCTION compute_risk_score(
    event: StructuredEvent,
    ticker_sector: str,
    economic_variable: EconomicVariable
) -> tuple[float, str]:
    
    # Lookup exposure value from sector matrix
    exposure_value = EXPOSURE_MATRIX[ticker_sector][economic_variable]
    IF exposure_value IS NULL:
        exposure_value = 0.5
    
    # Lookup sensitivity value from sector matrix
    sensitivity_value = SENSITIVITY_MATRIX[ticker_sector][economic_variable]
    IF sensitivity_value IS NULL:
        sensitivity_value = 0.5
    
    # Lookup magnitude value
    MAGNITUDE_VALUES = {
        "systemic": 1.0,
        "sector": 0.7,
        "localized": 0.4
    }
    magnitude_value = MAGNITUDE_VALUES[event.magnitude]
    
    # Lookup immediacy value
    IMMEDIACY_VALUES = {
        "instant": 1.0,
        "days": 0.7,
        "weeks": 0.4,
        "long_term": 0.2
    }
    immediacy_value = IMMEDIACY_VALUES[event.immediacy]
    
    # Lookup surprise value
    SURPRISE_VALUES = {
        "unexpected": 1.0,
        "partially_priced": 0.6,
        "expected": 0.3
    }
    surprise_value = SURPRISE_VALUES[event.surprise]
    
    # Compute risk score (ticker-dependent)
    risk_score = exposure_value × sensitivity_value × magnitude_value × immediacy_value × surprise_value
    risk_score = min(risk_score, 1.0)
    risk_score = round(risk_score, 2)
    
    # Map to risk level
    IF risk_score < 0.25:
        risk_level = "LOW"
    ELSE IF risk_score < 0.60:
        risk_level = "MEDIUM"
    ELSE:
        risk_level = "HIGH"
    
    RETURN (risk_score, risk_level)
```

**Input:** `StructuredEvent`, `ticker_sector`, `economic_variable`  
**Output:** `risk_score`, `risk_level`

### 7.5 Example Calculation

For an event with:
- `magnitude = "systemic"` (1.0)
- `immediacy = "instant"` (1.0)
- `surprise = "unexpected"` (1.0)
- `economic_variable = "interest_rate_expectation"`

**Technology sector:**
- ExposureValue = 0.9 (from Exposure Matrix)
- SensitivityValue = 0.95 (from Sensitivity Matrix)
- RiskScore = 0.9 × 0.95 × 1.0 × 1.0 × 1.0 = **0.86** (HIGH)

**Consumer Staples sector:**
- ExposureValue = 0.4 (from Exposure Matrix)
- SensitivityValue = 0.3 (from Sensitivity Matrix)
- RiskScore = 0.4 × 0.3 × 1.0 × 1.0 × 1.0 = **0.12** (LOW)

---

## 8. CONFIDENCE ENGINE

### 8.1 Confidence Formula

```
Confidence = (0.35 × SourceReliabilityValue) + (0.25 × DirectnessValue) + (0.20 × ClarityValue) + (0.20 × ConfirmationValue)
```

### 8.2 Source Reliability Value Table

| SourceReliabilityLevel | Value |
|------------------------|-------|
| official | 1.0 |
| major_wire | 0.9 |
| major_publication | 0.8 |
| reputable_news | 0.7 |
| industry | 0.6 |
| analyst | 0.5 |
| social_media | 0.2 |
| unknown | 0.1 |

### 8.3 Directness Value Table

| DirectnessLevel | Value |
|-----------------|-------|
| explicit | 1.0 |
| sector_level | 0.7 |
| market_level | 0.5 |
| inferred | 0.3 |

### 8.4 Clarity Value Table

| ClarityLevel | Value |
|--------------|-------|
| unambiguous | 1.0 |
| clear | 0.8 |
| moderate | 0.5 |
| ambiguous | 0.2 |

### 8.5 Confirmation Value Table

| ConfirmationLevel | Value |
|-------------------|-------|
| multiple_sources | 1.0 |
| dual_source | 0.7 |
| single_source | 0.4 |
| unconfirmed | 0.1 |

### 8.6 Risk Engine: Confidence Function

```
FUNCTION compute_confidence(event: StructuredEvent) -> float:
    
    # Lookup source reliability value
    SOURCE_RELIABILITY_VALUES = {
        "official": 1.0,
        "major_wire": 0.9,
        "major_publication": 0.8,
        "reputable_news": 0.7,
        "industry": 0.6,
        "analyst": 0.5,
        "social_media": 0.2,
        "unknown": 0.1
    }
    source_reliability_value = SOURCE_RELIABILITY_VALUES[event.source_reliability_level]
    
    # Lookup directness value
    DIRECTNESS_VALUES = {
        "explicit": 1.0,
        "sector_level": 0.7,
        "market_level": 0.5,
        "inferred": 0.3
    }
    directness_value = DIRECTNESS_VALUES[event.directness_level]
    
    # Lookup clarity value
    CLARITY_VALUES = {
        "unambiguous": 1.0,
        "clear": 0.8,
        "moderate": 0.5,
        "ambiguous": 0.2
    }
    clarity_value = CLARITY_VALUES[event.clarity_level]
    
    # Lookup confirmation value
    CONFIRMATION_VALUES = {
        "multiple_sources": 1.0,
        "dual_source": 0.7,
        "single_source": 0.4,
        "unconfirmed": 0.1
    }
    confirmation_value = CONFIRMATION_VALUES[event.confirmation_level]
    
    # Compute confidence
    confidence = (0.35 × source_reliability_value) +
                 (0.25 × directness_value) +
                 (0.20 × clarity_value) +
                 (0.20 × confirmation_value)
    
    RETURN round(confidence, 2)
```

**Input:** `StructuredEvent`  
**Output:** `confidence`

---

## 9. RATIONALE TEMPLATE

### 9.1 Template Structure

```
"<cause_summary> impacts <economic_variable>, creating <direction> pressure on <asset>. Confidence driven by <main_factor>."
```

### 9.2 Main Factor Selection

| Rank | Factor | Condition |
|------|--------|-----------|
| 1 | source reliability | source_reliability_value >= all others |
| 2 | directness of impact | directness_value >= all others |
| 3 | clarity of information | clarity_value >= all others |
| 4 | multiple confirmations | confirmation_value >= all others |

### 9.3 Risk Engine: Rationale Function

```
FUNCTION generate_rationale(
    event: StructuredEvent,
    economic_variable: EconomicVariable,
    direction: str,
    ticker: str
) -> str:
    
    # Lookup numeric values for main factor selection
    SOURCE_RELIABILITY_VALUES = {
        "official": 1.0,
        "major_wire": 0.9,
        "major_publication": 0.8,
        "reputable_news": 0.7,
        "industry": 0.6,
        "analyst": 0.5,
        "social_media": 0.2,
        "unknown": 0.1
    }
    source_value = SOURCE_RELIABILITY_VALUES[event.source_reliability_level]
    
    DIRECTNESS_VALUES = {
        "explicit": 1.0,
        "sector_level": 0.7,
        "market_level": 0.5,
        "inferred": 0.3
    }
    directness_value = DIRECTNESS_VALUES[event.directness_level]
    
    CLARITY_VALUES = {
        "unambiguous": 1.0,
        "clear": 0.8,
        "moderate": 0.5,
        "ambiguous": 0.2
    }
    clarity_value = CLARITY_VALUES[event.clarity_level]
    
    CONFIRMATION_VALUES = {
        "multiple_sources": 1.0,
        "dual_source": 0.7,
        "single_source": 0.4,
        "unconfirmed": 0.1
    }
    confirmation_value = CONFIRMATION_VALUES[event.confirmation_level]
    
    # Select main factor
    factors = {
        "source reliability": source_value,
        "directness of impact": directness_value,
        "clarity of information": clarity_value,
        "multiple confirmations": confirmation_value
    }
    main_factor = key_with_max_value(factors)
    
    # Generate rationale
    RETURN f"{event.cause_summary} impacts {economic_variable}, creating {direction} pressure on {ticker}. Confidence driven by {main_factor}."
```

**Input:** `StructuredEvent`, `economic_variable`, `direction`, `ticker`  
**Output:** `rationale`

---

## 10. FINAL OUTPUT SCHEMA

### 10.1 Output Schema

```python
class AnalysisOutput(BaseModel):
    event_type: EventType
    economic_variable: EconomicVariable
    pressure_direction: Literal["positive", "negative", "uncertain"]
    relevance_score: float  # 0.0 - 1.0
    risk_score: float  # 0.0 - 1.0
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    direction: Literal["positive", "negative", "uncertain"]
    confidence: float  # 0.0 - 1.0
    rationale: str
```

### 10.2 Field Specifications

| Field | Type | Range | Source |
|-------|------|-------|--------|
| event_type | enum | ENUM values | StructuredEvent.event_type |
| economic_variable | enum | ENUM values | Section 4.3 |
| pressure_direction | string | positive / negative / uncertain | Section 5.2 |
| relevance_score | float | [0.0, 1.0] | Section 6.5 |
| risk_score | float | [0.0, 1.0] | Section 7.7 |
| risk_level | string | LOW / MEDIUM / HIGH | Section 7.7 |
| direction | string | positive / negative / uncertain | alias of pressure_direction |
| confidence | float | [0.0, 1.0] | Section 8.6 |
| rationale | string | template output | Section 9.3 |

---

## 11. COMPLETE PROCESSING PIPELINE

### 11.1 Risk Engine Entry Point

```
FUNCTION process_event(
    event: StructuredEvent,
    tickers: list[TickerData]
) -> list[AnalysisOutput]:
    
    results = []
    
    # Step 1: Map economic variable (deterministic lookup)
    economic_variable = map_economic_variable(event)
    
    # Step 2: Compute pressure direction (deterministic lookup)
    pressure_direction = compute_pressure_direction(
        economic_variable,
        event.variable_direction
    )
    
    # Step 3: Compute confidence (deterministic formula)
    confidence = compute_confidence(event)
    
    # Step 4: Process each ticker (risk score VARIES per ticker)
    FOR ticker IN tickers:
        
        # Step 4a: Compute relevance (deterministic formula)
        relevance_score = compute_relevance_score(
            event,
            ticker.sector,
            ticker.country,
            economic_variable
        )
        
        # Step 4b: Skip if irrelevant
        IF relevance_score == 0.0:
            CONTINUE
        
        # Step 4c: Compute risk score PER TICKER (deterministic matrix lookup)
        # Uses ticker.sector to lookup ExposureMatrix and SensitivityMatrix
        (risk_score, risk_level) = compute_risk_score(
            event,
            ticker.sector,
            economic_variable
        )
        
        # Step 4d: Generate rationale (deterministic template)
        rationale = generate_rationale(
            event,
            economic_variable,
            pressure_direction,
            ticker.symbol
        )
        
        # Step 4e: Build output
        output = AnalysisOutput(
            event_type=event.event_type,
            economic_variable=economic_variable,
            pressure_direction=pressure_direction,
            relevance_score=relevance_score,
            risk_score=risk_score,
            risk_level=risk_level,
            direction=pressure_direction,
            confidence=confidence,
            rationale=rationale
        )
        
        results.append(output)
    
    RETURN results
```

### 11.2 TickerData Schema

```python
class TickerData(BaseModel):
    symbol: str
    sector: str
    country: str
```

---

## 12. API CONTRACT

### 12.1 POST /analyze

**Request:**

```json
{
    "text": "string",
    "tickers": ["string"]
}
```

**Internal Processing:**

```
1. FastAPI receives request
2. LLM extracts StructuredEvent from text
3. Lookup TickerData for each ticker
4. Risk Engine processes StructuredEvent + TickerData
5. Return AnalysisOutput array
```

**Response:**

```json
{
    "results": [
        {
            "ticker": "string",
            "event_type": "string",
            "economic_variable": "string",
            "pressure_direction": "string",
            "relevance_score": 0.0,
            "risk_score": 0.0,
            "risk_level": "string",
            "direction": "string",
            "confidence": 0.0,
            "rationale": "string"
        }
    ]
}
```

---

## APPENDIX A: LLM EXTRACTION PROMPT

The following prompt template MUST be used for LLM structured extraction:

```
You are a financial event classifier. Extract structured data from the provided text.

Output MUST be valid JSON matching this exact schema:

{
    "event_type": one of ["SUPPLY_SHOCK", "DEMAND_SHOCK", "POLICY_MONETARY", "POLICY_FISCAL", "GEOPOLITICAL_TENSION", "MARKET_STRUCTURE"],
    "variable_direction": one of ["increase", "decrease", "negative", "positive", "uncertain"],
    "magnitude": one of ["systemic", "sector", "localized"],
    "immediacy": one of ["instant", "days", "weeks", "long_term"],
    "surprise": one of ["unexpected", "partially_priced", "expected"],
    "country": ISO 2-letter country code,
    "source_reliability_level": one of ["official", "major_wire", "major_publication", "reputable_news", "industry", "analyst", "social_media", "unknown"],
    "directness_level": one of ["explicit", "sector_level", "market_level", "inferred"],
    "clarity_level": one of ["unambiguous", "clear", "moderate", "ambiguous"],
    "confirmation_level": one of ["multiple_sources", "dual_source", "single_source", "unconfirmed"],
    "cause_summary": string (max 50 characters)
}

Classification rules:
- GEOPOLITICAL_TENSION: war, conflict, sanctions, military, diplomatic crisis
- POLICY_MONETARY: central bank, interest rates, QE/QT, monetary policy
- POLICY_FISCAL: government spending, tax policy, fiscal stimulus, budget
- SUPPLY_SHOCK: supply chain, production halt, shortage, logistics
- DEMAND_SHOCK: consumer spending, GDP, employment, demand changes
- MARKET_STRUCTURE: regulation, M&A, compliance, market rules

If uncertain about any field, use the most conservative option.

Text to analyze:
{text}
```

---

## APPENDIX B: VALIDATION RULES

| Rule ID | Validation |
|---------|------------|
| V-001 | `event_type` must be valid enum value |
| V-002 | `economic_variable` must be valid enum value |
| V-003 | `pressure_direction` must be in ["positive", "negative", "uncertain"] |
| V-004 | `relevance_score` must be in [0.0, 1.0] |
| V-005 | `risk_score` must be in [0.0, 1.0] |
| V-006 | `risk_level` must be in ["LOW", "MEDIUM", "HIGH"] |
| V-007 | `confidence` must be in [0.0, 1.0] |
| V-008 | `rationale` must match template pattern |
| V-009 | StructuredEvent must have all required fields |
| V-010 | All enum fields must contain valid enum values |

---

## APPENDIX C: ERROR HANDLING

| Error Code | Condition | Response |
|------------|-----------|----------|
| 400 | Missing required field in request | `{"error": "missing_field", "field": "<name>"}` |
| 400 | Invalid enum value in StructuredEvent | `{"error": "invalid_enum", "field": "<name>"}` |
| 400 | Empty ticker list | `{"error": "empty_tickers"}` |
| 400 | Empty text | `{"error": "empty_text"}` |
| 400 | LLM extraction failed | `{"error": "extraction_failed"}` |
| 404 | All tickers irrelevant | `{"results": []}` |
| 500 | Internal processing error | `{"error": "internal_error"}` |

---

## APPENDIX D: SECTOR CLASSIFICATION

| Sector Code | Sector Name |
|-------------|-------------|
| XLK | Technology |
| XLF | Financials |
| XLV | Healthcare |
| XLE | Energy |
| XLY | Consumer Discretionary |
| XLP | Consumer Staples |
| XLI | Industrials |
| XLB | Materials |
| XLU | Utilities |
| XLRE | Real Estate |
| XLC | Communication Services |

---

## APPENDIX E: DETERMINISM VERIFICATION CHECKLIST

| Checkpoint | Requirement | Status |
|------------|-------------|--------|
| E-001 | Risk Engine receives only StructuredEvent | REQUIRED |
| E-002 | No raw text passed to Risk Engine | REQUIRED |
| E-003 | All scoring uses numeric lookups only | REQUIRED |
| E-004 | No keyword detection in Risk Engine | REQUIRED |
| E-005 | All functions are pure if/else logic | REQUIRED |
| E-006 | All outputs are deterministic for same input | REQUIRED |
| E-007 | LLM extraction is isolated in separate layer | REQUIRED |
| E-008 | RiskScore computed per ticker using sector matrices | REQUIRED |
| E-009 | StructuredEvent has NO exposure_level or sensitivity_level | REQUIRED |
| E-010 | ExposureMatrix and SensitivityMatrix are static lookups | REQUIRED |

---

**END OF SPECIFICATION**