import katex from "katex";
import { useMemo } from "react";
import InfoOverlayModal from "./InfoOverlayModal";

function Tex({ math, display = false }: { math: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(math, { throwOnError: false, displayMode: display }),
    [math, display]
  );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

const methodology = {
  product: "Market Whisperer",
  name: "Deterministic Risk Engine — Methodology",
  version: "PoC",
  type: "public_methodology",
  description:
    "Event-driven deterministic risk scoring with geographic spillover, per-ticker aggregation and portfolio diversification math.",
  parameters: {
    epsilon_display_clamp: 0.01,
    relevance_threshold: 0.2,
    rounding: "2 decimals — ROUND_HALF_UP",
    risk_bounds: { min_display: 0.01, max_display: 0.99 }
  },
  notation: [
    { symbol: "E_{s,v}", desc: "Exposure of sector s to economic variable v" },
    { symbol: "S_{s,v}", desc: "Sensitivity of sector s to economic variable v" },
    { symbol: "M_k", desc: "Magnitude factor for event k" },
    { symbol: "I_k", desc: "Immediacy factor for event k" },
    { symbol: "U_k", desc: "Surprise / pricing factor for event k" },
    {
      symbol: "G_{r_t, r_e}",
      desc: "Geographic spillover coefficient between ticker region and event region"
    },
    { symbol: "R_{i,k}", desc: "Adjusted event risk applied to ticker i from event k" },
    { symbol: "R_i", desc: "Aggregated total risk for ticker i" },
    { symbol: "\\rho_{ij}", desc: "Event-overlap correlation proxy between tickers i and j" },
    { symbol: "w_i", desc: "Portfolio weight for ticker i (normalized to \\sum = 1)" }
  ],
  pipeline: [
    {
      step_id: 1,
      name: "Event → Economic Variable Mapping",
      latex: "v = f(\\text{event\\_type})",
      explanation:
        "Deterministic 1:1 mapping from event_type to a macroeconomic driver (interest rates, risk aversion, liquidity, etc.)."
    },
    {
      step_id: 2,
      name: "Market Direction",
      latex: "\\text{direction} = g(v,\\; \\text{variable\\_direction})",
      explanation:
        "Deterministic lookup maps (economic variable, reported direction) to {positive, negative, uncertain} equity pressure."
    },
    {
      step_id: 3,
      name: "Confidence Score (event-level)",
      latex: "C = 0.35\\,R + 0.25\\,D + 0.20\\,C + 0.20\\,F",
      explanation:
        "Weighted reliability score using Source reliability (R), Directness (D), Clarity (C) and Confirmation (F)."
    },
    {
      step_id: 4,
      name: "Relevance Filter (per ticker × event)",
      latex: "\\text{Rel}_{i,k} = E_{s_i,v_k} \\times G_{r_i,r_k}",
      condition: "\\text{Rel}_{i,k} < \\theta_{\\text{rel}} \\;\\Rightarrow\\; \\text{event } k \\text{ ignored for ticker } i",
      explanation:
        "An event only affects a ticker if sector exposure and geographic transmission are jointly material."
    },
    {
      step_id: 5,
      name: "Per-event Base Risk (per ticker)",
      latex:
        "\\text{BaseRisk}_{i,k} = E_{s_i,v_k} \\times S_{s_i,v_k} \\times M_k \\times I_k \\times U_k",
      explanation:
        "Intrinsic vulnerability of ticker i to event k: multiplicative combination of exposure, sensitivity and event attributes."
    },
    {
      step_id: 6,
      name: "Geographic Spillover (adjusted event risk)",
      latex: "R_{i,k} = \\text{BaseRisk}_{i,k} \\times G_{r_i,r_k}",
      bounds: "0 < R_{i,k} < 1",
      explanation:
        "Applies spatial transmission coefficient so that same event has attenuated effect across regions."
    },
    {
      step_id: 7,
      name: "Ticker Aggregated Risk (union probability)",
      latex: "R_i = 1 - \\prod_{k \\in K_i} \\left(1 - R_{i,k}\\right)",
      explanation:
        "Interprets each R_{i,k} as probability of a material shock; the complement gives probability at least one shock occurs."
    },
    {
      step_id: 8,
      name: "Cross-ticker Correlation Proxy",
      latex:
        "\\rho_{ij} = \\frac{|K_i \\cap K_j|}{|K_i \\cup K_j|}",
      explanation:
        "Jaccard overlap of affecting events provides an economic correlation proxy between tickers. Option: weight events by Confidence or by R_{·,k}."
    },
    {
      step_id: 9,
      name: "Portfolio Risk (Markowitz-like)",
      latex:
        "\\sigma_p^2 = \\sum_i \\sum_j w_i\\, w_j\\, R_i\\, R_j\\, \\rho_{ij} \\qquad \\text{PortfolioRisk} = \\sqrt{\\sigma_p^2}",
      post_processing: "\\text{clip}\\;[\\varepsilon,\\; 1 - \\varepsilon]",
      explanation:
        "Portfolio systemic vulnerability accounting for exposures, weights and event-driven correlations."
    }
  ],
  diversification: {
    metrics: [
      {
        name: "Herfindahl Diversification",
        latex: "HD = 1 - \\sum_i w_i^2",
        meaning:
          "Weight-concentration index (independent of event structure). Higher → more evenly weighted portfolio."
      },
      {
        name: "Effective Independent Bets",
        latex: "EIB = \\frac{1}{\\sum_i \\sum_j w_i\\, w_j\\, \\rho_{ij}}",
        meaning:
          "Rough estimate of number of effectively independent event-driven bets in the portfolio."
      },
      {
        name: "Concentration Exposure",
        latex: "CE = \\max_i \\left(w_i \\cdot R_i\\right)",
        meaning: "Largest single-asset contribution to portfolio vulnerability."
      }
    ],
    debug_logging: [
      "Per-ticker per-event: E_{s,v}, S_{s,v}, BaseRisk, R_{i,k}, Rel_{i,k}, Confidence",
      "Jaccard matrix ρ_{ij} and unaggregated covariance terms w_i w_j R_i R_j ρ_{ij}",
      "Pre- and post-clipping PortfolioRisk and per-ticker R_i"
    ]
  },
  numerical_rules: [
    "All displayed scores rounded to 2 decimals (ROUND_HALF_UP)",
    "Apply ε display clamp to avoid exact 0.00 or 1.00 on UI",
    "If E or S lookup missing → fallback to 0.5 (log event)",
    "If user supplies weights w_i → normalize: w_i ← w_i / Σ w_j"
  ],
  user_indicators: [
    {
      name: "Portfolio Systemic Risk",
      latex: "\\text{PortfolioRisk}",
      description:
        "Overall portfolio exposure to active macro-geopolitical shocks after diversification."
    },
    {
      name: "Diversification Efficiency",
      latex:
        "DI = 1 - \\frac{\\text{PortfolioRisk}}{\\sum_i w_i\\, R_i + 10^{-9}}",
      description:
        "Risk reduction achieved by diversification relative to naive sum of contributions."
    },
    {
      name: "Concentration Exposure",
      latex: "CE = \\max_i \\left(w_i \\cdot R_i\\right)",
      description:
        "Largest single-asset contribution to portfolio vulnerability; useful for tactical rebalancing."
    },
    {
      name: "Geographic Fragility",
      latex:
        "GF = \\overline{\\text{regional\\_overlap}_{ij} \\cdot \\frac{w_i R_i + w_j R_j}{2}}",
      description:
        "Aggregate measure of how much the portfolio depends on a small set of geopolitically connected regions."
    }
  ],
  final_recommendations: [
    "Keep algebraic formulas unchanged so downstream components apply identical math.",
    "Clip final displayed PortfolioRisk to [0.01, 0.99] to avoid absolute certainties and improve UX.",
    "Record intermediate aggregates for auditing and explanation (per-event contributions, pairwise covariance terms).",
    "Consider weighting Jaccard overlap by Confidence or by R_{·,k} for production to reflect event importance."
  ]
};

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function FormulaBlock({
  latex,
  label
}: {
  latex: string;
  label?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
      {label ? (
        <p className="mb-1 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>
      ) : null}
      <Tex math={latex} display />
    </div>
  );
}

export default function MethodologyModal({
  isOpen,
  onClose
}: MethodologyModalProps) {
  return (
    <InfoOverlayModal isOpen={isOpen} onClose={onClose} title={methodology.name}>
      {/* Header */}
      <div className="space-y-1 text-xs text-zinc-600">
        <p>
          <span className="font-medium text-zinc-700">Product:</span>{" "}
          {methodology.product}
        </p>
        <p>
          <span className="font-medium text-zinc-700">Version:</span>{" "}
          {methodology.version}
        </p>
        <p className="pt-1 text-sm text-zinc-700">{methodology.description}</p>
      </div>

      {/* Notation */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">Notation</h3>
        <div className="grid gap-2">
          {methodology.notation.map((n) => (
            <div key={n.symbol} className="flex items-baseline gap-3 text-sm">
              <span className="shrink-0">
                <Tex math={n.symbol} />
              </span>
              <span className="text-zinc-600">— {n.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">
          Processing Pipeline
        </h3>
        <div className="space-y-3">
          {methodology.pipeline.map((step) => (
            <div
              key={step.step_id}
              className="space-y-2 rounded-lg border border-zinc-200 p-3"
            >
              <h4 className="text-sm font-semibold text-zinc-900">
                Step {step.step_id} — {step.name}
              </h4>
              <FormulaBlock latex={step.latex} />
              {"condition" in step && step.condition ? (
                <div className="rounded-md bg-amber-50 px-3 py-1.5 text-center">
                  <Tex math={step.condition} />
                </div>
              ) : null}
              {"bounds" in step && step.bounds ? (
                <p className="text-xs text-zinc-500">
                  Bounds: <Tex math={step.bounds} />
                </p>
              ) : null}
              {"post_processing" in step && step.post_processing ? (
                <p className="text-xs text-zinc-500">
                  Post-processing: <Tex math={step.post_processing} />
                </p>
              ) : null}
              <p className="text-sm text-zinc-700">{step.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diversification Metrics */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">
          Diversification & Diagnostics
        </h3>
        <div className="space-y-3">
          {methodology.diversification.metrics.map((m) => (
            <div
              key={m.name}
              className="space-y-2 rounded-lg border border-zinc-200 p-3"
            >
              <h4 className="text-sm font-semibold text-zinc-900">{m.name}</h4>
              <FormulaBlock latex={m.latex} />
              <p className="text-sm text-zinc-700">{m.meaning}</p>
            </div>
          ))}
        </div>
        <div className="pt-2">
          <p className="mb-1 text-xs font-medium text-zinc-700">
            Debug logging recommendations:
          </p>
          <ul className="space-y-0.5">
            {methodology.diversification.debug_logging.map((item) => (
              <li key={item} className="text-xs text-zinc-600">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Numerical Rules */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">
          Numerical Rules
        </h3>
        <ul className="space-y-1">
          {methodology.numerical_rules.map((rule) => (
            <li key={rule} className="text-sm text-zinc-700">
              • {rule}
            </li>
          ))}
        </ul>
      </section>

      {/* User-Facing Indicators */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">
          User-Facing Indicators
        </h3>
        <div className="space-y-3">
          {methodology.user_indicators.map((ind) => (
            <div
              key={ind.name}
              className="space-y-2 rounded-lg border border-zinc-200 p-3"
            >
              <h4 className="text-sm font-semibold text-zinc-900">
                {ind.name}
              </h4>
              <FormulaBlock latex={ind.latex} />
              <p className="text-sm text-zinc-700">{ind.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Recommendations */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">
          Final Recommendations
        </h3>
        <ul className="space-y-1">
          {methodology.final_recommendations.map((rec) => (
            <li key={rec} className="text-sm text-zinc-700">
              • {rec}
            </li>
          ))}
        </ul>
      </section>

      {/* Engine Parameters */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">
          Engine Parameters
        </h3>
        <div className="space-y-2 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700">
          <div className="flex justify-between">
            <span>Relevance threshold</span>
            <Tex math={`\\theta_{\\text{rel}} = ${methodology.parameters.relevance_threshold}`} />
          </div>
          <div className="flex justify-between">
            <span>Display clamp ε</span>
            <Tex math={`\\varepsilon = ${methodology.parameters.epsilon_display_clamp}`} />
          </div>
          <div className="flex justify-between">
            <span>Rounding</span>
            <span className="font-mono text-xs">{methodology.parameters.rounding}</span>
          </div>
          <div className="flex justify-between">
            <span>Risk bounds</span>
            <Tex
              math={`[${methodology.parameters.risk_bounds.min_display},\\; ${methodology.parameters.risk_bounds.max_display}]`}
            />
          </div>
        </div>
      </section>
    </InfoOverlayModal>
  );
}
