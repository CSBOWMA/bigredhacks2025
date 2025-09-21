import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";

interface HexagonData {
  id: string;
  x: number;
  y: number;
  radius: number;
  popularity: number;
  videoThumbnail: string;
  isActive?: boolean;
}

interface HiveMapProps {
  onHexagonClick?: (hexagon: HexagonData) => void;
  className?: string;
}

export default function HiveMap({ onHexagonClick, className = "" }: HiveMapProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hexagons, setHexagons] = useState<HexagonData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [enableDynamicSizing] = useState(true);

  useEffect(() => setIsClient(true), []);

  const generateHexagons = useCallback(() => {
    const hexData: HexagonData[] = [];
    const desiredCount = 12;

    // ✅ Replace these with your actual image paths
    const hexImages = [ "/stream_thumbnail.jpg",
       "/stream_thumbnail2.jpg", 
       "/stream_thumbnail3.png", 
       "/stream_thumbnail4.jpg", 
       "/stream_thumbnail5.jpeg", 
       "/stream_thumbnail6.jpg", 
       "/stream_thumbnail7.jpeg",
        "/stream_thumbnail8.jpg", 
        "/stream_thumbnail9.jpeg", 
        "/stream_thumbnail10.jpg", 
        "/stream_thumbnail11.jpg", "/stream_thumbnail12.jpg", ];

    const viewportMin = typeof window !== "undefined" ? Math.min(window.innerWidth, window.innerHeight) : 1000;
    const hexRadius = Math.max(160, Math.min(380, Math.floor(viewportMin / 3.8)));
    const size = hexRadius;

    const axialToPixel = (q: number, r: number) => {
      const x = size * Math.sqrt(3) * (q + r / 2);
      const y = size * (3 / 2) * r;
      return { x, y };
    };

    const coords: [number, number][] = [];
    coords.push([0, 0]);

    let layer = 1;
    const targetCandidates = desiredCount * 3;
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
      if (layer > 10) break;
    }

    const spacingMultiplier = 1.03;
    const minGap = 4;

    const usedPositions: { x: number; y: number; radius: number }[] = [];
    const isValidPosition = (x: number, y: number, radius: number) => {
      return !usedPositions.some((pos) => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.hypot(dx, dy);
        const required = 0.75 * (radius + pos.radius) + minGap;
        return distance < required;
      });
    };

    for (let i = 0; i < coords.length && hexData.length < desiredCount; i++) {
      const [q, r] = coords[i];
      const { x: rawX, y: rawY } = axialToPixel(q, r);
      const x = rawX * spacingMultiplier;
      const y = rawY * spacingMultiplier;

      if (isValidPosition(x, y, size)) {
        usedPositions.push({ x, y, radius: size });
        hexData.push({
          id: `hex-${hexData.length}`,
          x,
          y,
          radius: size,
          popularity: Math.floor(Math.random() * 100),
          videoThumbnail: hexImages[hexData.length % hexImages.length],
          isActive: Math.random() > 0.4,
        });
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

    const defs = svg.append("defs");

    const hexElements = mainGroup
      .selectAll<SVGGElement, HexagonData>(".hexagon")
      .data(hexagons, (d: any) => d.id)
      .join("g")
      .attr("class", "hexagon")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer");

    // Background hex shape
    hexElements
      .append("path")
      .attr("class", "hex-bg")
      .attr("d", (d) => createHexPath(d.radius))
      .attr("fill", "#dbc48a")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", (d) => Math.max(1, d.radius / 100));

    // ✅ Images for each hex
// ...everything else stays exactly the same up to this part:

    // ✅ Images for each hex with a small inner margin
    hexElements.each(function (d) {
      const group = d3.select(this);
      const clipId = `clip-${d.id}`;

      // Slightly smaller radius to create inner "border"
      const margin = d.radius * 0.03; // 3% margin
      const innerRadius = d.radius - margin;

      defs.append("clipPath")
        .attr("id", clipId)
        .append("path")
        .attr("d", createHexPath(innerRadius));

      group.append("image")
        .attr("xlink:href", d.videoThumbnail)
        .attr("x", -innerRadius)
        .attr("y", -innerRadius)
        .attr("width", innerRadius * 2)
        .attr("height", innerRadius * 2)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("clip-path", `url(#${clipId})`);
    });


    // Hover & click handlers
    let hoverTimeout: number | undefined;
    let currentHoveredId: string | null = null;

    hexElements
      .on("mouseenter", function (event, d) {
        if (hoverTimeout) {
          window.clearTimeout(hoverTimeout);
          hoverTimeout = undefined;
        }
        currentHoveredId = d.id;
        d3.select(this as SVGGElement).raise();
        const thisElement = d3.select(this as SVGGElement);
        thisElement
          .select(".hex-bg")
          .transition()
          .duration(150)
          .attr("stroke", "#ffecba")
          .attr("stroke-width", Math.max(6, d.radius / 50));

        hexElements.transition().duration(150).style("opacity", (h: any) => (h.id === d.id ? 1 : 0.3));
      })
      .on("mouseleave", function (_event, d) {
        hoverTimeout = window.setTimeout(() => {
          if (currentHoveredId === d.id) {
            currentHoveredId = null;
            hexElements.selectAll<SVGPathElement, HexagonData>(".hex-bg")
              .transition()
              .duration(200)
              .attr("stroke", "rgba(255,255,255,0.2)")
              .attr("stroke-width", (hexData: any) => Math.max(1, hexData.radius / 100));
            hexElements.transition().duration(200).style("opacity", 1);
          }
        }, 60);
      });

    hexElements.on("click", (event, d) => {
      event.stopPropagation();
      console.log(`Clicked hex: ${d.id}`);
      onHexagonClick?.(d);
      router.push("/stream");
    });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 1.5])
      .filter((event: any) => !event.ctrlKey && !event.button)
      .on("zoom", (event) => {
        requestAnimationFrame(() => {
          mainGroup.attr("transform", event.transform);
        });
      });

    svg.call(zoom as any);

    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 800;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 600;

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
