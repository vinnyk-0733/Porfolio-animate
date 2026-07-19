"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

export interface BarMarker {
  id: string
  location: [number, number]
  value: number
  label: string
}

export interface GlobeBarsProps {
  markers?: BarMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: BarMarker[] = [
  { id: "bar-1", location: [40.71, -74.01], value: 85, label: "NYC" },
  { id: "bar-2", location: [51.51, -0.13], value: 62, label: "London" },
  { id: "bar-3", location: [35.68, 139.65], value: 94, label: "Tokyo" },
  { id: "bar-4", location: [1.35, 103.82], value: 78, label: "Singapore" },
]

export function GlobeBars({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const [isZoomed, setIsZoomed] = useState(false)
  const [expandedMarkerId, setExpandedMarkerId] = useState<string | null>(null)
  const isLabelExpandedRef = useRef<boolean>(false)

  // Sync state to ref for the animation loop
  isLabelExpandedRef.current = expandedMarkerId !== null

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    // Cast to access style safely since it's a ref
    if (canvasRef.current) (canvasRef.current as HTMLCanvasElement).style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) (canvasRef.current as HTMLCanvasElement).style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: 0, theta: 0.2, dark: 1, diffuse: 1.5,
        mapSamples: 16000, mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.12],
        markerColor: [0.95, 0.95, 0.95],
        glowColor: [0.15, 0.15, 0.15],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [], arcColor: [0.2, 0.6, 0.6],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.8,
      })
      function animate() {
        if (!isPausedRef.current && !isLabelExpandedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div
      className={`relative aspect-square select-none ${className}`}
      onDoubleClick={() => setIsZoomed(!isZoomed)}
      style={{
        transform: isZoomed ? "scale(1.8)" : "scale(1)",
        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: isZoomed ? 50 : 1
      }}
    >
      <style>{`
        @keyframes bar-fill { 
          from { width: 0; } 
          to { width: var(--value, 0%); } 
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "0.2rem",
            padding: "0.35rem 0.5rem",
            background: "rgba(10, 10, 10, 0.8)",
            border: "1.5px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(12px)",
            borderRadius: 6,
            minWidth: 70,
            pointerEvents: "auto" as const,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
          onClick={(e) => {
            e.stopPropagation()
            setExpandedMarkerId(expandedMarkerId === m.id ? null : m.id)
          }}
        >
          <span style={{
            fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "#fafafa",
          }}>{m.label}</span>

          <div style={{
            display: "grid",
            gridTemplateRows: expandedMarkerId === m.id ? "1fr" : "0fr",
            transition: "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%"
          }}>
            <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <span style={{
                width: "100%", height: 6, background: "rgba(255,255,255,0.1)",
                borderRadius: 3, overflow: "hidden", marginTop: "0.2rem"
              }}>
                <span style={{
                  display: "block", height: "100%",
                  width: `${m.value}%`,
                  background: "#4ade80", borderRadius: 3,
                  animation: expandedMarkerId === m.id ? "bar-fill 1s ease-out forwards" : "none",
                  "--value": `${m.value}%`,
                } as React.CSSProperties} />
              </span>
              <span style={{
                fontFamily: "monospace", fontSize: "0.65rem", fontWeight: 600, color: "#4ade80",
                textAlign: "center"
              }}>{m.value}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
