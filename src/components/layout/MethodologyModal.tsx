import InfoOverlayModal from "./InfoOverlayModal";

interface MethodSectionStep {
  id: string;
  title: string;
  paragraphs: string[];
}

interface MethodSection {
  id: string;
  title: string;
  paragraphs: string[];
  steps?: MethodSectionStep[];
}

const methodologyDocument = {
  page: {
    slug: "deterministic-risk-engine",
    title: "Deterministic Risk Engine — Method Overview",
    product: "Market Whisperer",
    version: "PoC",
    language: "en"
  },
  content: {
    sections: [
      {
        id: "architectural-principle",
        title: "1. Architectural Principle",
        paragraphs: [
          "The system is strictly separated into two independent layers:",
          "• LLM Extraction Layer — Converts raw news text into a structured event object.",
          "• Deterministic Risk Engine — Consumes structured data only and applies fixed mathematical rules.",
          "The Risk Engine never parses text. All computations depend exclusively on predefined lookup tables."
        ]
      },
      {
        id: "processing-pipeline",
        title: "2. Deterministic Processing Pipeline",
        paragraphs: [
          "For each structured event and each ticker, the engine executes the following sequence."
        ],
        steps: [
          {
            id: "step-1",
            title: "Step 1 — Economic Variable Mapping",
            paragraphs: [
              "Each event type maps uniquely to one economic variable:",
              "economic variable = f(event type)",
              "This mapping is one-to-one and deterministic."
            ]
          },
          {
            id: "step-2",
            title: "Step 2 — Market Direction",
            paragraphs: [
              "Market pressure is determined using a fixed rule table:",
              "(economic variable, direction) → {positive, negative, uncertain}",
              "No discretionary interpretation is allowed."
            ]
          },
          {
            id: "step-3",
            title: "Step 3 — Relevance Filter",
            paragraphs: [
              "An event impacts a ticker only if exposure is material.",
              "Relevance = E_sector,variable × W_country",
              "If Relevance < 0.20, the event is discarded for that ticker."
            ]
          },
          {
            id: "step-4",
            title: "Step 4 — Ticker-Specific Risk Score",
            paragraphs: [
              "Risk is computed independently for each ticker:",
              "RiskScore = E_sector,variable × S_sector,variable × M × I × U",
              "Where:",
              "• E = Exposure (sector × variable matrix)",
              "• S = Sensitivity (sector × variable matrix)",
              "• M = Magnitude factor",
              "• I = Immediacy factor",
              "• U = Surprise factor",
              "Each component is a fixed scalar in [0, 1].",
              "The score is bounded: RiskScore = min(RiskScore, 1).",
              "Risk levels are defined as:",
              "[0, 0.25) → LOW",
              "[0.25, 0.60) → MEDIUM",
              "[0.60, 1] → HIGH",
              "Because E and S depend on sector, different tickers yield different risk levels for the same event."
            ]
          },
          {
            id: "step-5",
            title: "Step 5 — Confidence Score",
            paragraphs: [
              "Confidence measures information reliability:",
              "Confidence = 0.35R + 0.25D + 0.20C + 0.20F",
              "Where:",
              "• R = Source reliability",
              "• D = Directness of impact",
              "• C = Clarity",
              "• F = Confirmation level",
              "Each component is predefined in [0, 1]."
            ]
          }
        ]
      },
      {
        id: "output-structure",
        title: "3. Output Structure",
        paragraphs: [
          "For each relevant ticker, the engine returns:",
          "• Direction ∈ {positive, negative, uncertain}",
          "• RiskScore ∈ [0, 1]",
          "• RiskLevel ∈ {LOW, MEDIUM, HIGH}",
          "• Confidence ∈ [0, 1]",
          "The explanation follows a strict template:",
          "“Cause impacts economic variable, creating direction pressure on asset.”"
        ]
      },
      {
        id: "determinism-guarantee",
        title: "4. Determinism Guarantee",
        paragraphs: [
          "Given identical structured input:",
          "Output_t = Output_{t+1}",
          "The system contains:",
          "• No randomness",
          "• No adaptive weights",
          "• No hidden inference",
          "All outputs are reproducible, explainable, and auditable."
        ]
      }
    ] as MethodSection[]
  }
};

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  return (
    <InfoOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title={methodologyDocument.page.title}
    >
      <div className="space-y-1 text-xs text-zinc-600">
        <p>
          <span className="font-medium text-zinc-700">Product:</span>{" "}
          {methodologyDocument.page.product}
        </p>
        <p>
          <span className="font-medium text-zinc-700">Version:</span>{" "}
          {methodologyDocument.page.version}
        </p>
      </div>

      {methodologyDocument.content.sections.map((section) => (
        <section key={section.id} className="space-y-2">
          <h3 className="text-base font-semibold text-zinc-900">{section.title}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={`${section.id}-${paragraph}`} className="text-sm text-zinc-800">
              {paragraph}
            </p>
          ))}

          {section.steps ? (
            <div className="space-y-3 pt-1">
              {section.steps.map((step) => (
                <div key={step.id} className="rounded-lg border border-zinc-200 p-3">
                  <h4 className="text-sm font-semibold text-zinc-900">{step.title}</h4>
                  <div className="mt-1.5 space-y-1.5">
                    {step.paragraphs.map((paragraph) => (
                      <p key={`${step.id}-${paragraph}`} className="text-sm text-zinc-800">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </InfoOverlayModal>
  );
}
