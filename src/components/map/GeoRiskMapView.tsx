import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppShellContext } from "../layout/AppShell";
import SectionCard from "../ui/SectionCard";
import WeekSelector from "../feed/WeekSelector";
import {
  CAPITAL_COORDS,
  EVENT_COUNTRY_MAP,
  FALLBACK_COORD,
  getRegion
} from "../../constants/capitals";
import type { AnalyzeResponse } from "../../lib/types";
import { eventVisibleForWeek } from "../../lib/weekUtils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventRisk {
  id: string;
  title: string;
  country: string;
  region: "US" | "Europe" | "Asia" | "Other";
  risk: number;
  direction: "positive" | "negative" | "uncertain";
  confidence: number;
  affectedTickers: string[];
}

interface TooltipData {
  x: number;
  y: number;
  title: string;
  risk: number;
  confidence: number;
  tickers: string;
}

const PERIOD = 2.4;
const PHASE_SHIFTS = { waveA: 0, waveB: 0.8, waveC: 1.6 } as const;

// ---------------------------------------------------------------------------
// Data helpers — reshape API data, no risk recomputation
// ---------------------------------------------------------------------------

function deriveEvents(
  response: AnalyzeResponse,
  selectedWeekKey: string,
  weekKeys: string[]
): EventRisk[] {
  const eventMap: Record<
    string,
    { risk: number; confidence: number; tickers: string[]; expected_date?: string }
  > = {};

  for (const stock of response.stocks) {
    for (const event of stock.events) {
      if (!eventVisibleForWeek(event.expected_date, selectedWeekKey)) {
        continue;
      }

      const existing = eventMap[event.title];
      if (existing) {
        existing.risk = Math.max(existing.risk, event.risk_score);
        existing.confidence = Math.max(existing.confidence, event.confidence);
        if (!existing.tickers.includes(stock.symbol)) {
          existing.tickers.push(stock.symbol);
        }
      } else {
        eventMap[event.title] = {
          risk: event.risk_score,
          confidence: event.confidence,
          tickers: [stock.symbol],
          expected_date: event.expected_date ?? undefined
        };
      }
    }
  }

  return Object.entries(eventMap).map(([title, data], idx) => {
    const country = EVENT_COUNTRY_MAP[title] ?? "US";
    return {
      id: `evt-${idx}`,
      title,
      country,
      region: getRegion(country),
      risk: data.risk,
      direction: "uncertain" as const,
      confidence: data.confidence,
      affectedTickers: data.tickers.sort()
    };
  });
}

/**
 * Build GeoJSON with 4 features per event: core (0) + wave A (1), B (2), C (3).
 * Each feature has risk, confidence, phaseIndex for layer filtering.
 */
function buildGeoJSON(events: EventRisk[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const evt of events) {
    const [lat, lng] = CAPITAL_COORDS[evt.country] ?? FALLBACK_COORD;
    const props = {
      id: evt.id,
      title: evt.title,
      risk: evt.risk,
      confidence: evt.confidence,
      tickers: evt.affectedTickers.join(", ")
    };
    for (let phaseIndex = 0; phaseIndex < 4; phaseIndex++) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: { ...props, phaseIndex }
      });
    }
  }
  return { type: "FeatureCollection", features };
}

// ---------------------------------------------------------------------------
// Map style — dark_all tiles, black background
// ---------------------------------------------------------------------------

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    carto: {
      type: "raster" as const,
      tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: ""
    }
  },
  layers: [
    {
      id: "bg",
      type: "background" as const,
      paint: { "background-color": "#000000" }
    },
    {
      id: "carto-tiles",
      type: "raster" as const,
      source: "carto",
      minzoom: 0,
      maxzoom: 19,
      paint: { "raster-opacity": 0.6 }
    }
  ]
};

// base = 5 + 16*risk; core: constant radius, opacity 0.9
const CORE_PAINT = {
  "circle-radius": ["+", 5, ["*", 16, ["get", "risk"]]],
  "circle-color": "#ff3b3b",
  "circle-opacity": 0.9
} as const;

// Wave layers: initial paint (overwritten each frame by animation)
const WAVE_INITIAL_PAINT = {
  "circle-radius": 5,
  "circle-color": "#ff3b3b",
  "circle-opacity": 0
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GeoRiskMapViewProps {
  fullScreen?: boolean;
}

export default function GeoRiskMapView({ fullScreen = false }: GeoRiskMapViewProps = {}) {
  const {
    response,
    isLoading,
    weekKeys,
    selectedWeekIndex,
    setSelectedWeekIndex
  } = useAppShellContext();
  const mapRef = useRef<MapRef>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const mapReadyRef = useRef(false);
  const [hoverInfo, setHoverInfo] = useState<TooltipData | null>(null);
  const [pinnedInfo, setPinnedInfo] = useState<TooltipData | null>(null);

  const safeWeekIndex = Math.min(
    Math.max(0, selectedWeekIndex),
    Math.max(0, weekKeys.length - 1)
  );
  const selectedWeekKey = weekKeys[safeWeekIndex] ?? weekKeys[0] ?? "";

  const events = useMemo(
    () =>
      response && selectedWeekKey
        ? deriveEvents(response, selectedWeekKey, weekKeys)
        : [],
    [response, selectedWeekKey, weekKeys]
  );
  const geojson = useMemo(() => buildGeoJSON(events), [events]);

  const onMapLoad = useCallback(() => {
    mapReadyRef.current = true;
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    function updateSonar(t: number) {
      const map = mapRef.current?.getMap();
      if (!map || !mapReadyRef.current) return;

      const waveLayers = [
        { id: "events-wave-a", phaseShift: PHASE_SHIFTS.waveA },
        { id: "events-wave-b", phaseShift: PHASE_SHIFTS.waveB },
        { id: "events-wave-c", phaseShift: PHASE_SHIFTS.waveC }
      ];

      for (const { id, phaseShift } of waveLayers) {
        const progress = ((t + phaseShift) % PERIOD) / PERIOD;
        try {
          map.setPaintProperty(id, "circle-radius", [
            "+",
            ["+", 5, ["*", 16, ["get", "risk"]]],
            progress * 42
          ]);
          map.setPaintProperty(id, "circle-opacity", [
            "*",
            1 - progress,
            ["+", 0.35, ["*", 0.65, ["get", "confidence"]]]
          ]);
        } catch {
          /* layer not yet mounted */
        }
      }
      map.triggerRepaint();
    }

    function animate() {
      const t = (performance.now() - startRef.current) / 1000;
      updateSonar(t);
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onHover = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature?.properties) {
      setHoverInfo(null);
      return;
    }
    const p = feature.properties;
    setHoverInfo({
      x: e.point.x,
      y: e.point.y,
      title: String(p.title),
      risk: Number(p.risk),
      confidence: Number(p.confidence),
      tickers: String(p.tickers)
    });
  }, []);

  const onLeave = useCallback(() => setHoverInfo(null), []);

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature?.properties) return;
    const p = feature.properties;
    setPinnedInfo({
      x: e.point.x,
      y: e.point.y,
      title: String(p.title),
      risk: Number(p.risk),
      confidence: Number(p.confidence),
      tickers: String(p.tickers)
    });
  }, []);

  const tooltip = pinnedInfo ?? hoverInfo;

  const handlePrevWeek = () => setSelectedWeekIndex((i) => Math.max(0, i - 1));
  const handleNextWeek = () =>
    setSelectedWeekIndex((i) => Math.min(weekKeys.length - 1, i + 1));

  if (!response) {
    return (
      <SectionCard>
        <p className="text-sm text-t-tertiary">
          {isLoading ? "Analyzing portfolio..." : "No analysis available yet."}
        </p>
      </SectionCard>
    );
  }

  const containerClass = fullScreen
    ? "relative h-screen w-screen"
    : "relative h-[calc(100vh-200px)] min-h-[500px]";
  const Wrapper = fullScreen ? "div" : SectionCard;
  const wrapperProps = fullScreen
    ? { className: "relative overflow-hidden h-full w-full" }
    : { noPadding: true, className: "relative overflow-hidden" };

  return (
    <Wrapper {...wrapperProps}>
      {weekKeys.length > 0 && (
        <div className="absolute left-4 top-4 z-20">
          <WeekSelector
            weekKey={selectedWeekKey}
            weekIndex={safeWeekIndex}
            totalWeeks={weekKeys.length}
            onPrev={handlePrevWeek}
            onNext={handleNextWeek}
          />
        </div>
      )}
      <div className={containerClass}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 15,
            latitude: 25,
            zoom: 1.7
          }}
          mapStyle={MAP_STYLE}
          onLoad={onMapLoad}
          interactiveLayerIds={["events-core", "events-wave-a", "events-wave-b", "events-wave-c"]}
          onMouseMove={onHover}
          onMouseLeave={onLeave}
          onClick={onClick}
          cursor={hoverInfo ? "pointer" : "grab"}
          attributionControl={false}
        >
          <Source id="events" type="geojson" data={geojson}>
            <Layer
              id="events-core"
              type="circle"
              filter={["==", ["get", "phaseIndex"], 0]}
              paint={CORE_PAINT as Record<string, unknown>}
            />
            <Layer
              id="events-wave-a"
              type="circle"
              filter={["==", ["get", "phaseIndex"], 1]}
              paint={WAVE_INITIAL_PAINT as Record<string, unknown>}
            />
            <Layer
              id="events-wave-b"
              type="circle"
              filter={["==", ["get", "phaseIndex"], 2]}
              paint={WAVE_INITIAL_PAINT as Record<string, unknown>}
            />
            <Layer
              id="events-wave-c"
              type="circle"
              filter={["==", ["get", "phaseIndex"], 3]}
              paint={WAVE_INITIAL_PAINT as Record<string, unknown>}
            />
          </Source>
        </Map>

        {tooltip ? (
          <div
            className="pointer-events-none absolute z-10 w-64 rounded border border-zinc-700 bg-zinc-900/95 p-4 shadow-lg"
            style={{
              left: Math.min(tooltip.x + 14, window.innerWidth - 280),
              top: tooltip.y + 14
            }}
          >
            <p className="text-sm font-semibold text-zinc-100">{tooltip.title}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-zinc-500">Risk</p>
                <p className="text-lg font-semibold tabular-nums text-red-500">
                  {(tooltip.risk * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Confidence</p>
                <p className="text-lg font-semibold tabular-nums text-zinc-100">
                  {(tooltip.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="mt-3 border-t border-zinc-700 pt-2">
              <p className="text-[11px] text-zinc-500">Affected tickers</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-200">
                {tooltip.tickers}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}
