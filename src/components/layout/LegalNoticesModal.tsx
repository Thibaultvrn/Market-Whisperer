import InfoOverlayModal from "./InfoOverlayModal";

interface LegalNoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LegalSection {
  id: string;
  title: string;
  content: string[];
  list?: string[];
  footer?: string[];
}

const legalNotice = {
  page: {
    slug: "legal-notice",
    title: "Legal Notice and Regulatory Information",
    product: "Market Whisperer",
    last_updated: "2026-02-21",
    jurisdiction: {
      country: "Sweden",
      region: "European Union"
    }
  },
  sections: [
    {
      id: "publisher",
      title: "1. Publisher Information",
      content: [
        "Market Whisperer is an independent digital platform currently under development.",
        "Operational base: Stockholm, Sweden.",
        "Contact: celian.dalla-vale@epfl.ch",
        "The project is not currently incorporated as a registered legal entity."
      ]
    },
    {
      id: "hosting",
      title: "2. Hosting Provider",
      content: [
        "The website is hosted by Vercel Inc.",
        "Vercel provides cloud infrastructure and content delivery services.",
        "Data storage and processing may occur within the European Union or other jurisdictions depending on infrastructure allocation."
      ]
    },
    {
      id: "purpose",
      title: "3. Purpose of the Platform",
      content: [
        "Market Whisperer is a financial analytics platform providing deterministic geopolitical risk indicators derived from publicly available information.",
        "The system converts structured news events into economic signals using predefined mathematical rules.",
        "A detailed explanation of the deterministic evaluation framework is available on the Methodology page of the website."
      ]
    },
    {
      id: "methodology-transparency",
      title: "4. Methodological Transparency",
      content: [
        "Market Whisperer operates using a rule-based and reproducible risk engine.",
        "For identical structured inputs, the system produces identical outputs.",
        "The full description of the event taxonomy, economic transmission logic, risk scoring matrices, and confidence formula is publicly documented in the Methodology section.",
        "The underlying methodology is proprietary and currently in the process of intellectual property structuring."
      ]
    },
    {
      id: "no-investment-advice",
      title: "5. No Investment Advice",
      content: [
        "Market Whisperer does not provide investment advice and is not a regulated financial advisor, broker, or asset manager.",
        "All outputs, including risk levels, directional signals, and confidence indicators, are provided strictly for informational and analytical purposes.",
        "Nothing on this platform constitutes:"
      ],
      list: [
        "investment advice",
        "portfolio management services",
        "a recommendation to buy or sell financial instruments",
        "financial, legal, or tax advice"
      ],
      footer: ["Users remain solely responsible for their financial decisions."]
    },
    {
      id: "liability",
      title: "6. Limitation of Liability",
      content: [
        "While the platform applies consistent deterministic logic, no guarantee is provided regarding:"
      ],
      list: [
        "completeness of information",
        "accuracy of third-party data sources",
        "uninterrupted availability of the service"
      ],
      footer: [
        "To the fullest extent permitted by law, Market Whisperer shall not be liable for any direct or indirect losses resulting from use of the platform."
      ]
    },
    {
      id: "gdpr",
      title: "7. Data Protection and GDPR Compliance",
      content: [
        "Market Whisperer complies with Regulation (EU) 2016/679 (General Data Protection Regulation – GDPR).",
        "The platform:"
      ],
      list: [
        "does not currently use third-party tracking or analytics tools",
        "applies data minimization principles",
        "processes personal data only where strictly necessary for functionality"
      ],
      footer: [
        "Users may request access, correction, or deletion of personal data by contacting:",
        "contact@marketwhisperer.ai"
      ]
    },
    {
      id: "global-access",
      title: "8. Global Access",
      content: [
        "The platform is accessible worldwide.",
        "Availability of data and services may vary depending on jurisdiction and data provider constraints."
      ]
    },
    {
      id: "intellectual-property",
      title: "9. Intellectual Property",
      content: [
        "All platform components, including the deterministic scoring methodology, technical architecture, documentation, and design elements, are proprietary.",
        "The methodology is in the process of formal intellectual property protection.",
        "Unauthorized reproduction, redistribution, or commercial use is prohibited."
      ]
    },
    {
      id: "governing-law",
      title: "10. Governing Law",
      content: [
        "These legal terms are governed by the laws of Sweden and applicable European Union regulations.",
        "Any dispute shall fall under the jurisdiction of Swedish courts."
      ]
    }
  ] as LegalSection[]
};

export default function LegalNoticesModal({
  isOpen,
  onClose
}: LegalNoticesModalProps) {
  return (
    <InfoOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title={legalNotice.page.title}
    >
      <div className="space-y-1 text-xs text-zinc-600">
        <p>
          <span className="font-medium text-zinc-700">Product:</span> {legalNotice.page.product}
        </p>
        <p>
          <span className="font-medium text-zinc-700">Last updated:</span>{" "}
          {legalNotice.page.last_updated}
        </p>
        <p>
          <span className="font-medium text-zinc-700">Jurisdiction:</span>{" "}
          {legalNotice.page.jurisdiction.country} ({legalNotice.page.jurisdiction.region})
        </p>
      </div>

      {legalNotice.sections.map((section) => (
        <section key={section.id} className="space-y-2">
          <h3 className="text-base font-semibold text-zinc-900">{section.title}</h3>
          {section.content.map((paragraph) => (
            <p key={`${section.id}-${paragraph}`} className="text-sm text-zinc-800">
              {paragraph}
            </p>
          ))}

          {section.list ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-800">
              {section.list.map((item) => (
                <li key={`${section.id}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : null}

          {section.footer ? (
            <div className="space-y-1.5">
              {section.footer.map((line) => (
                <p key={`${section.id}-footer-${line}`} className="text-sm text-zinc-800">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </InfoOverlayModal>
  );
}
