import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/router";
import { analyzePortfolio } from "../../lib/api";
import { isSupportedTimezone } from "../../lib/timezones";
import {
  readFavoriteTickers,
  readTimezone,
  writeFavoriteTickers,
  writeTimezone
} from "../../lib/storage";
import type { AnalyzeResponse } from "../../lib/types";
import ContentContainer from "./ContentContainer";
import LegalNoticesModal from "./LegalNoticesModal";
import MethodologyModal from "./MethodologyModal";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellContextValue {
  response: AnalyzeResponse | null;
  isLoading: boolean;
  error: string | null;
  timezone: string;
  setTimezone: (timezone: string) => void;
  selectedTickers: string[];
  setSelectedTickers: (tickers: string[]) => void;
  excludedTickers: Set<string>;
  toggleExcluded: (symbol: string) => void;
  favoriteTickers: string[];
  setFavoriteTickers: (tickers: string[]) => void;
  lastUpdatedAt: Date | null;
}

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

const SELECTED_TICKERS = [
  "AAPL", "NVDA", "LMT", "KO", "JPM", "XOM", "ASML", "SHEL", "TSM", "TM", "BABA"
];
const DEFAULT_TICKERS = [
  ...SELECTED_TICKERS,
  "JNJ", "NVO", "GOOGL", "AMT", "NEE", "BHP", "HSBC", "AMZN", "BA"
];

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteTickers, setFavoriteTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [selectedTickers, setSelectedTickers] = useState<string[]>(SELECTED_TICKERS);
  const [excludedTickers, setExcludedTickers] = useState<Set<string>>(new Set());
  const [timezone, setTimezone] = useState("Europe/Stockholm");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<"legal" | "methodology" | null>(
    null
  );
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const favorites = readFavoriteTickers();
    if (favorites.length > 0) {
      setFavoriteTickers(favorites);
      setSelectedTickers(favorites.slice(0, 11));
    }

    const savedTimezone = readTimezone();
    if (savedTimezone && isSupportedTimezone(savedTimezone)) {
      setTimezone(savedTimezone);
    }
  }, []);

  useEffect(() => {
    writeFavoriteTickers(favoriteTickers);
  }, [favoriteTickers]);

  useEffect(() => {
    writeTimezone(timezone);
  }, [timezone]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!activeInfoModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveInfoModal(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeInfoModal]);

  const runAnalyze = useCallback(async () => {
    if (favoriteTickers.length === 0) {
      setError("Select at least one ticker.");
      return;
    }

    setIsLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    const demoMode =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("demo") === "1";

    try {
      const next = await analyzePortfolio(favoriteTickers, timezone, {
        signal: controller.signal,
        demoMode
      });
      if (requestId !== requestIdRef.current) {
        return;
      }
      setResponse(next);
      setLastUpdatedAt(new Date());
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") {
        return;
      }
      setError(
        requestError instanceof Error ? requestError.message : "Analyze request failed."
      );
    } finally {
      setIsLoading(false);
    }
  }, [favoriteTickers, timezone]);

  useEffect(() => {
    if (favoriteTickers.length > 0) {
      void runAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAnalyze]);

  const toggleExcluded = useCallback((symbol: string) => {
    setExcludedTickers((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  }, []);

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      response,
      isLoading,
      error,
      timezone,
      setTimezone,
      selectedTickers,
      setSelectedTickers,
      excludedTickers,
      toggleExcluded,
      favoriteTickers,
      setFavoriteTickers,
      lastUpdatedAt
    }),
    [
      response,
      isLoading,
      error,
      timezone,
      selectedTickers,
      excludedTickers,
      toggleExcluded,
      favoriteTickers,
      lastUpdatedAt
    ]
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenLegalNotices={() => {
            setIsSidebarOpen(false);
            setActiveInfoModal("legal");
          }}
          onOpenMethodology={() => {
            setIsSidebarOpen(false);
            setActiveInfoModal("methodology");
          }}
        />
        <LegalNoticesModal
          isOpen={activeInfoModal === "legal"}
          onClose={() => setActiveInfoModal(null)}
        />
        <MethodologyModal
          isOpen={activeInfoModal === "methodology"}
          onClose={() => setActiveInfoModal(null)}
        />
        <div className="mx-auto flex max-w-7xl gap-3 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Topbar
              isFull={router.pathname === "/feed"}
              pageTitle={
                router.pathname === "/map"
                  ? "Geopolitical Risk Map"
                  : router.pathname === "/radar"
                    ? "Next 7 Days Risk Radar"
                    : router.pathname === "/settings"
                      ? "Settings"
                      : "Weekly Market Outlook"
              }
              onOpenMenu={() => setIsSidebarOpen(true)}
            />
            <ContentContainer>{children}</ContentContainer>
          </div>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

export function useAppShellContext(): AppShellContextValue {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShellContext must be used inside AppShell.");
  }
  return context;
}
