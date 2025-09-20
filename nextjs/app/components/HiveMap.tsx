"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import * as d3 from "d3"

interface HexagonData {
  id: string
  x: number
  y: number
  radius: number
  popularity: number
  videoThumbnail?: string
  title?: string
  viewers?: number
  isActive?: boolean
}

interface HiveMapProps {
  onHexagonClick?: (hexagon: HexagonData) => void
  className?: string
}

export default function HiveMap({ onHexagonClick, className = "" }: HiveMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hexagons, setHexagons] = useState<HexagonData[]>([])
  const [isClient, setIsClient] = useState(false)
  const [enableDynamicSizing, setEnableDynamicSizing] = useState(true)

  useEffect(() => setIsClient(true), [])

  const generateHexagons = useCallback(() => {
    const hexData: HexagonData[] = []
    const mockTitles = [
      "Live Coding", "Music Stream", "Gaming Session", "Art Creation", "Tech Talk",
      "Cooking Show", "Fitness Live", "Study Session", "Chat & Chill", "Tutorial",
      "Comedy Show", "News Update", "Travel Vlog", "Book Club", "Workshop",
      "DJ Set", "Podcast", "Interview", "Demo Day", "Q&A Session"
    ]

    // Create horizontal spreading hive with hexagons almost touching
    const hexRadius = 180 // Bigger hexagons (was 140)
    const hexWidth = hexRadius * 2
    const hexHeight = Math.sqrt(3) * hexRadius
    
    // Horizontal spacing (main spread direction) - almost touching
    const horizontalSpacing = hexWidth + 8 // Only 8px gap - almost touching
    
    // Vertical spacing (minimal spread) - almost touching
    const verticalSpacing = hexHeight * 0.7 + 6 // Only 6px gap
    
    // Track used positions to prevent overlap but allow close proximity
    const usedPositions: { x: number; y: number; radius: number }[] = []
    
    const isValidPosition = (x: number, y: number, radius: number) => {
      return !usedPositions.some(pos => {
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2))
        const requiredDistance = radius + pos.radius + 10 // Minimal safety margin
        return distance < requiredDistance
      })
    }

    let hexIndex = 0

    // Create horizontal spreading pattern (main hive structure)
    const maxCols = 8 // Spread horizontally
    const maxRows = 3 // Limited vertical spread
    
    for (let row = 0; row < maxRows && hexIndex < mockTitles.length; row++) {
      const colsInRow = maxCols - Math.floor(row * 0.5) // Fewer hexagons in outer rows
      const rowOffset = (row % 2) * (horizontalSpacing * 0.5) // Offset every other row
      
      for (let col = 0; col < colsInRow && hexIndex < mockTitles.length; col++) {
        // Calculate position
        const baseX = (col - colsInRow / 2) * horizontalSpacing + rowOffset
        const baseY = (row - maxRows / 2) * verticalSpacing
        
        // Add slight organic variation (reduced for closer packing)
        const organicOffset = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 6
        }
        
        const x = baseX + organicOffset.x
        const y = baseY + organicOffset.y
        
        // Create some gaps in outer areas for branching effect
        const density = row === 0 ? 1.0 : 0.8 - (row * 0.1)
        if (Math.random() < density) {
          // Calculate size with minimal variation for tighter packing
          const sizeVariation = (Math.random() - 0.5) * 8
          const radius = hexRadius + sizeVariation
          
          // Validate position
          if (isValidPosition(x, y, radius)) {
            const baseViewers = Math.floor(Math.random() * (400 - row * 80)) + 50
            const viewers = baseViewers + Math.floor(Math.random() * 150)
            const popularity = Math.min(100, viewers / 5)

            usedPositions.push({ x, y, radius })
            hexData.push({
              id: `hex-${hexIndex}`,
              x,
              y,
              radius,
              popularity,
              title: mockTitles[hexIndex % mockTitles.length],
              viewers,
              isActive: Math.random() > 0.4,
            })
            hexIndex++
          }
        }
      }
    }

    // Add horizontal branches extending from main structure
    const branchCount = Math.min(6, mockTitles.length - hexIndex)
    const branchPositions = [
      // Left branches
      { x: -maxCols * horizontalSpacing * 0.6, y: -verticalSpacing * 0.3 },
      { x: -maxCols * horizontalSpacing * 0.7, y: verticalSpacing * 0.2 },
      { x: -maxCols * horizontalSpacing * 0.8, y: 0 },
      
      // Right branches  
      { x: maxCols * horizontalSpacing * 0.6, y: verticalSpacing * 0.3 },
      { x: maxCols * horizontalSpacing * 0.7, y: -verticalSpacing * 0.2 },
      { x: maxCols * horizontalSpacing * 0.8, y: 0 },
    ]

    for (let i = 0; i < branchCount && hexIndex < mockTitles.length; i++) {
      const branchPos = branchPositions[i]
      const organicOffset = {
        x: (Math.random() - 0.5) * 12,
        y: (Math.random() - 0.5) * 8
      }
      
      const x = branchPos.x + organicOffset.x
      const y = branchPos.y + organicOffset.y
      
      const sizeVariation = (Math.random() - 0.5) * 10
      const radius = hexRadius - 15 + sizeVariation // Slightly smaller branches but still big
      
      if (isValidPosition(x, y, radius)) {
        const baseViewers = Math.floor(Math.random() * 200) + 25
        const viewers = baseViewers + Math.floor(Math.random() * 100)
        const popularity = Math.min(100, viewers / 4)

        usedPositions.push({ x, y, radius })
        hexData.push({
          id: `hex-${hexIndex}`,
          x,
          y,
          radius,
          popularity,
          title: mockTitles[hexIndex % mockTitles.length],
          viewers,
          isActive: Math.random() > 0.5,
        })
        hexIndex++
      }
    }

    return hexData
  }, [enableDynamicSizing])

  const createHexPath = useCallback((radius: number) => {
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2
      const x = Math.round(radius * Math.cos(angle) * 100) / 100
      const y = Math.round(radius * Math.sin(angle) * 100) / 100
      points.push(`${x},${y}`)
    }
    return `M${points.join("L")}Z`
  }, [])

  useEffect(() => { 
    if (!isClient) return
    setHexagons(generateHexagons()) 
  }, [generateHexagons, isClient])

  useEffect(() => {
    if (!isClient || !svgRef.current || !containerRef.current || hexagons.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    const mainGroup = svg.append("g").attr("class", "hexagon-group")

    // Enhanced glow filter
    const defs = svg.append("defs")
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", 8) // Stronger glow
      .attr("result", "blur")
    
    const merge = filter.append("feMerge")
    merge.append("feMergeNode").attr("in", "blur")
    merge.append("feMergeNode").attr("in", "SourceGraphic")

    const hexElements = mainGroup.selectAll<SVGGElement, HexagonData>(".hexagon")
      .data(hexagons, (d: HexagonData) => d.id)
      .join("g")
      .attr("class", "hexagon")
      .attr("transform", (d: HexagonData) => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")

    // Dynamic stroke width based on size (thinner for smaller hexagons)
    hexElements.append("path")
      .attr("class", "hex-bg")
      .attr("d", (d: HexagonData) => createHexPath(d.radius))
      .attr("fill", "#dbc48a")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", (d: HexagonData) => Math.max(1, d.radius / 100)) // Much thinner default stroke
      .style("shape-rendering", "geometricPrecision")

    // Scale text based on hexagon size
    hexElements.append("text")
      .attr("class", "hex-title")
      .attr("text-anchor", "middle")
      .attr("y", (d: HexagonData) => -d.radius / 20)
      .attr("fill", "#322111")
      .attr("font-weight", "600")
      .attr("font-size", (d: HexagonData) => Math.max(16, Math.min(28, d.radius / 15)))
      .text((d: HexagonData) => d.title || "")

    hexElements.append("text")
      .attr("class", "hex-viewers")
      .attr("text-anchor", "middle")
      .attr("y", (d: HexagonData) => d.radius / 25)
      .attr("fill", "#322111")
      .attr("font-weight", "400")
      .attr("font-size", (d: HexagonData) => Math.max(12, Math.min(22, d.radius / 20)))
      .text((d: HexagonData) => `👁 ${d.viewers}`)

    // Optimized hover interactions with proper state management
    let hoverTimeout: NodeJS.Timeout
    let currentHoveredId: string | null = null

    hexElements
      .on("mouseenter", function (event, d: HexagonData) {
        clearTimeout(hoverTimeout)
        currentHoveredId = d.id
        
        // Much thicker stroke on hover
        const thisElement = d3.select(this)
        thisElement.select(".hex-bg")
          .transition().duration(150)
          .attr("stroke", "#ffecba")
          .attr("stroke-width", Math.max(6, d.radius / 50)) // Adjusted for smaller hexagons
          .style("filter", "url(#glow)")

        // Dim others with faster transition
        hexElements.filter((h: HexagonData) => h.id !== d.id)
          .transition().duration(150)
          .style("opacity", 0.3)
      })
      .on("mouseleave", function (event, d: HexagonData) {
        hoverTimeout = setTimeout(() => {
          // Only reset if we're not hovering another hexagon
          if (currentHoveredId === d.id) {
            currentHoveredId = null
            
            // Reset ALL hexagons to default state
            hexElements.selectAll(".hex-bg")
              .transition().duration(200)
              .attr("stroke", "rgba(255,255,255,0.2)")
              .attr("stroke-width", (hexData: any) => Math.max(1, hexData.radius / 100)) // Thinner for smaller hexagons
              .style("filter", "none")

            hexElements.transition().duration(200).style("opacity", 1)
          }
        }, 50) // Prevent flickering
      })

    hexElements.on("click", (event, d: HexagonData) => {
      event.stopPropagation()
      
      // Enhanced click animation
      const element = d3.select(event.currentTarget as SVGGElement)
      const bgPath = element.select(".hex-bg")
      
      bgPath.transition().duration(80)
        .attr("transform", "scale(1.1)")
        .attr("stroke-width", Math.max(8, d.radius / 40))
        .transition().duration(200)
        .attr("transform", "scale(1)")
        .attr("stroke-width", Math.max(1, d.radius / 100)) // Reset to thin outline
      
      console.log(`Clicked stream: ${d.title} - ${d.viewers} viewers`)
      onHexagonClick?.(d)
    })

    // Improved zoom with smoother performance and no snap-back
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 1.5]) // Adjusted limits
      .filter((event) => {
        // Prevent zoom on drag to avoid conflicts
        return !event.ctrlKey && !event.button
      })
      .on("zoom", (event) => {
        // Smooth transform with requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          mainGroup.attr("transform", event.transform)
        })
      })

    svg.call(zoom)

    // Better initial positioning
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 800
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 600
    
    // Smoother initial transform
    svg.transition()
      .duration(1000)
      .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(0.8))

  }, [hexagons, createHexPath, onHexagonClick, isClient])

  if (!isClient) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#322111]">
        <div className="text-2xl font-bold text-amber-200">Loading Hive Map...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#322111" }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}