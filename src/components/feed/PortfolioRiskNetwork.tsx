"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { RiskLevel } from "../../lib/types";
import RiskBadge from "../ui/RiskBadge";
import SectionCard from "../ui/SectionCard";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortfolioTicker {
  symbol: string;
  weight: number;
  risk: number;
}

export interface PortfolioData {
  portfolioRisk: number;
  tickers: PortfolioTicker[];
  correlationMatrix: number[][];
}

interface PortfolioRiskNetworkProps {
  portfolioRisk: number;
  level: RiskLevel;
  stockCount: number;
  portfolio: PortfolioData;
  weekLabel?: string | null;  // e.g. "Week of Dec 16–22, 2025"
}

interface GraphNode {
  id: string;
  symbol: string;
  weight: number;
  risk: number;
}

interface GraphLink {
  source: string;
  target: string;
  correlation: number;
  distance?: number;
}

// ---------------------------------------------------------------------------
// Color scale: low → blue, medium → orange, high → red
// ---------------------------------------------------------------------------

function riskToColor(risk: number): string {
  if (risk < 0.25) return "#34d399"; // risk-low
  if (risk < 0.6) return "#fbbf24";  // risk-medium
  return "#f87171";                  // risk-high
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PortfolioRiskNetwork({
  portfolioRisk,
  level,
  stockCount,
  portfolio,
  weekLabel
}: PortfolioRiskNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 320, height: 320 });

  const { nodes, links } = useMemo(() => {
    const { tickers, correlationMatrix } = portfolio;
    if (tickers.length === 0) return { nodes: [], links: [] };

    const graphNodes: GraphNode[] = tickers.map((t) => ({
      id: t.symbol,
      symbol: t.symbol,
      weight: t.weight,
      risk: t.risk
    }));

    const graphLinks: GraphLink[] = [];
    for (let i = 0; i < tickers.length; i++) {
      for (let j = i + 1; j < tickers.length; j++) {
        const corr = correlationMatrix[i]?.[j] ?? 0;
        if (corr > 0.05) {
          graphLinks.push({
            source: tickers[i].symbol,
            target: tickers[j].symbol,
            correlation: corr,
            distance: 60 + (1 - corr) * 80
          });
        }
      }
    }

    return { nodes: graphNodes, links: graphLinks };
  }, [portfolio]);

  const graphData = useMemo(
    () => ({ nodes, links }),
    [nodes, links]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: Math.min(rect.height, 320) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodeColor = useCallback((node: unknown) => riskToColor((node as GraphNode).risk), []);
  const nodeVal = useCallback((node: unknown) => {
    const n = node as GraphNode;
    const maxW = Math.max(...nodes.map((x) => x.weight), 0.001);
    return 4 + (n.weight / maxW) * 12;
  }, [nodes]);
  const linkColor = useCallback((link: unknown) => `rgba(248, 113, 113, ${(link as GraphLink).correlation})`, []);
  const linkWidth = useCallback((link: unknown) => 0.5 + (link as GraphLink).correlation * (link as GraphLink).correlation * 2.5, []);

  const breathingPhase = useRef(0);
  const onRenderFramePre = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      breathingPhase.current += 0.02;
      const breath = 0.85 + 0.15 * Math.sin(breathingPhase.current);
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = (Math.min(w, h) * 0.5 * portfolioRisk * breath) / globalScale;

      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, "rgba(248, 113, 113, 0.1)");
      gradient.addColorStop(0.5, "rgba(248, 113, 113, 0.04)");
      gradient.addColorStop(1, "rgba(248, 113, 113, 0)");

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
    [portfolioRisk]
  );

  const scoreColor: Record<RiskLevel, string> = {
    high: "text-risk-high",
    medium: "text-risk-medium",
    low: "text-risk-low"
  };

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-t-tertiary">
            {weekLabel ? `Portfolio Risk — ${weekLabel}` : "Portfolio Risk"}
          </p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className={`text-3xl font-semibold tabular-nums ${scoreColor[level]}`}>
              {portfolioRisk.toFixed(2)}
            </span>
            <RiskBadge level={level} size="lg">{level}</RiskBadge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-t-tertiary">{stockCount} stocks in portfolio</p>
          <p className="mt-0.5 text-xs text-t-tertiary">Correlation-weighted</p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 overflow-hidden rounded-inner bg-transparent"
        style={{ height: 320, minHeight: 200 }}
      >
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeId="id"
            nodeVal={nodeVal}
            nodeColor={nodeColor}
            nodeLabel={(node) => {
              const n = node as GraphNode;
              return `${n.symbol}\nRisk: ${(n.risk * 100).toFixed(0)}%\nWeight: ${(n.weight * 100).toFixed(1)}%`;
            }}
            nodeCanvasObject={(node, ctx) => {
              const n = node as GraphNode;
              const size = nodeVal(node);
              const color = riskToColor(n.risk);
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
              ctx.strokeStyle = `${color}99`;
              ctx.lineWidth = 1;
              ctx.stroke();
              const glow = 4 + n.risk * 8;
              ctx.shadowColor = color;
              ctx.shadowBlur = glow;
              ctx.fill();
              ctx.shadowBlur = 0;
            }}
            nodeCanvasObjectMode="replace"
            linkColor={linkColor}
            linkWidth={linkWidth}
            linkLabel={(link) => `ρ = ${((link as GraphLink).correlation * 100).toFixed(0)}%`}
            onRenderFramePre={onRenderFramePre}
            d3AlphaDecay={0.02}
            d3AlphaMin={0.001}
            cooldownTicks={100}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-t-tertiary">
            No stocks selected
          </div>
        )}

      </div>
    </SectionCard>
  );
}
