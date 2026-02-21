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
  favoriteTickers: string[];
  setFavoriteTickers: (tickers: string[]) => void;
  simulationEnabled: boolean;
  setSimulationEnabled: (enabled: boolean) => void;
  premiumEnabled: boolean;
  setPremiumEnabled: (enabled: boolean) => void;
  runAnalyze: () => Promise<void>;
  lastUpdatedAt: Date | null;
}

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);
const DEFAULT_TICKERS = ["AAPL", "TSLA"];
interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [favoriteTickers, setFavoriteTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [selectedTickers, setSelectedTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [timezone, setTimezone] = useState("Europe/Stockholm");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<"legal" | "methodology" | null>(
    null
  );
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const favorites = readFavoriteTickers();
    if (favorites.length > 0) {
      setFavoriteTickers(favorites);
      setSelectedTickers(favorites.slice(0, 6));
    }

    const savedTimezone = readTimezone();
    if (savedTimezone) {
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
    if (selectedTickers.length === 0) {
      setError("Select at least one ticker.");
      return;
    }

    setIsLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const next = await analyzePortfolio(selectedTickers, timezone, controller.signal);
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
  }, [selectedTickers, timezone]);

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      response,
      isLoading,
      error,
      timezone,
      setTimezone,
      selectedTickers,
      setSelectedTickers,
      favoriteTickers,
      setFavoriteTickers,
      simulationEnabled,
      setSimulationEnabled,
      premiumEnabled,
      setPremiumEnabled,
      runAnalyze,
      lastUpdatedAt
    }),
    [
      response,
      isLoading,
      error,
      timezone,
      selectedTickers,
      favoriteTickers,
      simulationEnabled,
      premiumEnabled,
      runAnalyze,
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
