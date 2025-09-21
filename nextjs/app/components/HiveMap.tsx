import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";

interface HexagonData {
  id: string;
  x: number;
  y: number;
  radius: number;
  popularity: number;
  videoThumbnail?: string;
  title?: string;
  viewers?: number;
  isActive?: boolean;
}

interface HiveMapProps {
  onHexagonClick?: (hexagon: HexagonData) => void;
  className?: string;
}

export default function HiveMap({ onHexagonClick, className = "" }: HiveMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hexagons, setHexagons] = useState<HexagonData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [enableDynamicSizing] = useState(true);

  useEffect(() => setIsClient(true), []);

  const generateHexagons = useCallback(() => {
    // Produce a continuous centered hex tessellation (spiral) with short branches
    const hexData: HexagonData[] = [];
    const mockTitles = [
      "Live Coding",
      "Music Stream",
      "Gaming Session",
      "Art Creation",
      "Tech Talk",
      "Cooking Show",
      "Fitness Live",
      "Study Session",
      "Chat & Chill",
      "Tutorial",
      "Comedy Show",
      "News Update",
      "Travel Vlog",
      "Book Club",
      "Workshop",
    ];

    const desiredCount = 12; // keep between 10-15

    // Adaptive radius similar to previous versions
    const viewportMin = typeof window !== "undefined" ? Math.min(window.innerWidth, window.innerHeight) : 1000;
    // Increase hexagon size for a bolder look
    const hexRadius = Math.max(160, Math.min(380, Math.floor(viewportMin / 3.8)));

    const size = hexRadius;

    // Pointy-top axial coordinates conversion
    const axialToPixel = (q: number, r: number) => {
      const x = size * Math.sqrt(3) * (q + r / 2);
      const y = size * (3 / 2) * r;
      return { x, y };
    };

    // axial spiral generation - generate extra candidates to avoid overlaps
    const coords: [number, number][] = [];
    coords.push([0, 0]);

    let layer = 1;
    const targetCandidates = desiredCount * 3; // create extra coords
    while (coords.length < targetCandidates) {
      let q = -layer;
      let r = layer;
      const directions = [
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [0, 1],
      ];

      for (let side = 0; side < 6 && coords.length < targetCandidates; side++) {
        const steps = layer;
        for (let step = 0; step < steps && coords.length < targetCandidates; step++) {
          coords.push([q, r]);
          q += directions[side][0];
          r += directions[side][1];
        }
      }

      layer++;
      if (layer > 10) break; // safety
    }

    const spacingMultiplier = 1.03; // tiny extra spacing to keep a subtle gap for larger tiles
    const minGap = 4; // small visual gap in px between tile edges

    const usedPositions: { x: number; y: number; radius: number }[] = [];
    const isValidPosition = (x: number, y: number, radius: number) => {
      return !usedPositions.some((pos) => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.hypot(dx, dy);
        // For pointy-top hexes the minimal center-to-center distance for adjacent tiles
        // is ~1.5 * size (vertical neighbor) to ~1.732 * size (horizontal neighbor).
        // We approximate the safe center distance as 0.75 * (radius + pos.radius) (+ minGap).
        const required = 0.75 * (radius + pos.radius) + minGap;
        return distance < required;
      });
    };

    for (let i = 0; i < coords.length && hexData.length < desiredCount; i++) {
      const [q, r] = coords[i];
      const { x: rawX, y: rawY } = axialToPixel(q, r);
      const x = rawX * spacingMultiplier;
      const y = rawY * spacingMultiplier;
      const viewers = Math.floor(80 + Math.random() * 400);

      if (isValidPosition(x, y, size)) {
        usedPositions.push({ x, y, radius: size });
        hexData.push({
          id: `hex-${hexData.length}`,
          x,
          y,
          radius: size,
          popularity: Math.min(100, Math.round(viewers / 6)),
          title: mockTitles[hexData.length % mockTitles.length],
          viewers,
          isActive: Math.random() > 0.4,
        });
      }
    }

    // If we didn't reach desiredCount because of collisions, try to relax gap slightly
    let relax = 0;
    while (hexData.length < desiredCount && relax < 3) {
      const extraGap = minGap - relax * 3; // reduce gap
      for (let i = 0; i < coords.length && hexData.length < desiredCount; i++) {
        const [q, r] = coords[i];
        const { x: rawX, y: rawY } = axialToPixel(q, r);
        const x = rawX * spacingMultiplier;
        const y = rawY * spacingMultiplier;
        const viewers = Math.floor(40 + Math.random() * 220);

        const canPlace = !usedPositions.some((pos) => {
          const distance = Math.hypot(pos.x - x, pos.y - y);
          return distance < size + pos.radius + extraGap;
        });

        if (canPlace) {
          usedPositions.push({ x, y, radius: size });
          hexData.push({
            id: `hex-${hexData.length}`,
            x,
            y,
            radius: size,
            popularity: Math.min(100, Math.round(viewers / 5)),
            title: mockTitles[hexData.length % mockTitles.length],
            viewers,
            isActive: Math.random() > 0.4,
          });
        }
      }
      relax++;
    }

    // add short branching arms from the last used coords, ensuring no overlaps
    const outerCandidates = coords.slice(Math.max(1, coords.length - 8));
    const branchDirs = [0, 2, 4];
    let hexIndex = hexData.length;

    for (let i = 0; i < Math.min(3, outerCandidates.length) && hexIndex < 15; i++) {
      const [oq, or] = outerCandidates[i];
      const dir = branchDirs[i % branchDirs.length];
      const deltas = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]][dir];

      for (let step = 1; step <= 2 && hexIndex < 15; step++) {
        const q = oq + deltas[0] * step;
        const r = or + deltas[1] * step;
        const { x: rawX, y: rawY } = axialToPixel(q, r);
        const x = rawX * spacingMultiplier;
        const y = rawY * spacingMultiplier;
        const viewers = Math.floor(40 + Math.random() * 220);

        if (isValidPosition(x, y, Math.floor(size * 0.95))) {
          usedPositions.push({ x, y, radius: Math.floor(size * 0.95) });
          hexData.push({
            id: `hex-${hexData.length}`,
            x,
            y,
            radius: Math.floor(size * 0.95),
            popularity: Math.min(100, Math.round(viewers / 5)),
            title: mockTitles[hexData.length % mockTitles.length],
            viewers,
            isActive: Math.random() > 0.5,
          });
          hexIndex++;
        }
      }
    }

    return hexData;
  }, [enableDynamicSizing]);

  const createHexPath = useCallback((radius: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.round(radius * Math.cos(angle) * 100) / 100;
      const y = Math.round(radius * Math.sin(angle) * 100) / 100;
      points.push(`${x},${y}`);
    }
    return `M${points.join("L")}Z`;
  }, []);

  useEffect(() => {
    if (!isClient) return;
    setHexagons(generateHexagons());
  }, [generateHexagons, isClient]);

  useEffect(() => {
    if (!isClient || !svgRef.current || !containerRef.current || hexagons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const mainGroup = svg.append("g").attr("class", "hexagon-group");

    // Enhanced glow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter.append("feGaussianBlur").attr("stdDeviation", 8).attr("result", "blur");

    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const hexElements = mainGroup
      .selectAll<SVGGElement, HexagonData>(".hexagon")
      .data(hexagons, (d: any) => d.id)
      .join("g")
      .attr("class", "hexagon")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer");

    // Dynamic stroke width based on size (thinner for smaller hexagons)
    hexElements
      .append("path")
      .attr("class", "hex-bg")
      .attr("d", (d) => createHexPath(d.radius))
      .attr("fill", "#dbc48a")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", (d) => Math.max(1, d.radius / 100)) // Much thinner default stroke
      .style("shape-rendering", "geometricPrecision");

    // Scale text based on hexagon size
    hexElements
      .append("text")
      .attr("class", "hex-title")
      .attr("text-anchor", "middle")
      .attr("y", (d) => -d.radius * 0.25)
      .attr("fill", "#322111")
      .attr("font-weight", "600")
      .attr("font-size", (d) => Math.max(18, Math.min(48, d.radius / 8)))
      .text((d) => d.title || "");

    hexElements
      .append("text")
      .attr("class", "hex-viewers")
      .attr("text-anchor", "middle")
      .attr("y", (d) => d.radius * 0.28)
      .attr("fill", "#322111")
      .attr("font-weight", "400")
      .attr("font-size", (d) => Math.max(14, Math.min(34, d.radius / 12)))
      .text((d) => `👁 ${d.viewers}`);

    // Optimized hover interactions with proper state management
    let hoverTimeout: number | undefined;
    let currentHoveredId: string | null = null;

    hexElements
      .on("mouseenter", function (event, d) {
        if (hoverTimeout) {
          window.clearTimeout(hoverTimeout);
          hoverTimeout = undefined;
        }
        currentHoveredId = d.id;

        // Bring hovered group to front
        d3.select(this as SVGGElement).raise();

        // Set hovered hex to emphasized stroke and ensure it's fully opaque
        const thisElement = d3.select(this as SVGGElement);
        thisElement
          .select(".hex-bg")
          .transition()
          .duration(150)
          .attr("stroke", "#ffecba")
          .attr("stroke-width", Math.max(6, d.radius / 50)) // Adjusted for smaller hexagons
          .style("filter", "url(#glow)");

        // Dim others and ensure hovered stays fully visible
        hexElements
          .transition()
          .duration(150)
          .style("opacity", (h: any) => (h.id === d.id ? 1 : 0.3));
      })
      .on("mouseleave", function (_event, d) {
        // Delay reset slightly to avoid flicker when moving between hexes
        hoverTimeout = window.setTimeout(() => {
          if (currentHoveredId === d.id) {
            currentHoveredId = null;

            // Reset ALL hexagons to default state
            hexElements
              .selectAll<SVGPathElement, HexagonData>(".hex-bg")
              .transition()
              .duration(200)
              .attr("stroke", "rgba(255,255,255,0.2)")
              .attr("stroke-width", (hexData: any) => Math.max(1, hexData.radius / 100)) // Thinner for smaller hexagons
              .style("filter", "none");

            hexElements.transition().duration(200).style("opacity", 1);
          }
        }, 60); // slightly larger delay to ensure enter handler runs first
      });

    hexElements.on("click", (event, d) => {
      event.stopPropagation();

      // Enhanced click animation
      const element = d3.select(event.currentTarget as SVGGElement);
      const bgPath = element.select(".hex-bg");

      bgPath
        .transition()
        .duration(80)
        .attr("transform", "scale(1.1)")
        .attr("stroke-width", Math.max(8, d.radius / 40))
        .transition()
        .duration(200)
        .attr("transform", "scale(1)")
        .attr("stroke-width", Math.max(1, d.radius / 100)); // Reset to thin outline

      console.log(`Clicked stream: ${d.title} - ${d.viewers} viewers`);
      onHexagonClick?.(d);
    });

    // Improved zoom with smoother performance and no snap-back
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 1.5]) // Adjusted limits
      .filter((event: any) => {
        // Prevent zoom on drag to avoid conflicts
        return !event.ctrlKey && !event.button;
      })
      .on("zoom", (event) => {
        // Smooth transform with requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          mainGroup.attr("transform", event.transform);
        });
      });

    svg.call(zoom as any);

    // Better initial positioning
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 800;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 600;

    // Smoother initial transform
    svg
      .transition()
      .duration(1000)
      .call(zoom.transform as any, d3.zoomIdentity.translate(centerX, centerY).scale(0.8));
  }, [hexagons, createHexPath, onHexagonClick, isClient]);

  if (!isClient) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#322111]">
        <div className="text-2xl font-bold text-amber-200">Loading Hive Map...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ backgroundColor: "#322111" }}>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
