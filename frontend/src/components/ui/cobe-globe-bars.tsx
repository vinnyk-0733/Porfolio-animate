"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"
import { watchVisualActivity } from "@/lib/visual-activity"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const touchRef = useRef(false)
  const requestRenderRef = useRef<() => void>(() => {})

  const [isZoomed, setIsZoomed] = useState(false)
  const [expandedMarkerId, setExpandedMarkerId] = useState<string | null>(null)
  const isLabelExpandedRef = useRef<boolean>(false)

  useEffect(() => {
    isLabelExpandedRef.current = expandedMarkerId !== null
    requestRenderRef.current()
  }, [expandedMarkerId])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (touchRef.current || e.pointerType !== "mouse" || e.button !== 0) return
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.style.cursor = "grabbing"
    requestRenderRef.current()
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = touchRef.current ? "auto" : "grab"
    requestRenderRef.current()
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerInteracting.current !== null) {
      dragOffset.current = {
        phi: (e.clientX - pointerInteracting.current.x) / 300,
        theta: (e.clientY - pointerInteracting.current.y) / 1000,
      }
      requestRenderRef.current()
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    const canvas = canvasRef.current
    const container = containerRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId = 0
    let lastTime = 0
    let phi = 0
    let active = false
    let reducedMotion = false
    let compact = false
    let touch = false
    let contextLost = false
    let failed = false
    let currentDpr = 0
    let currentWidth = 0

    const stop = () => {
      if (animationId) cancelAnimationFrame(animationId)
      animationId = 0
      lastTime = 0
    }

    const destroyGlobe = () => {
      globe?.destroy()
      globe = null
      // Cobe 2 inserts a wrapper but does not remove it in destroy(). Restore
      // React's original DOM before recreation, Strict Mode cleanup or unmount.
      const wrapper = canvas.parentElement
      if (wrapper && wrapper !== container && wrapper.parentElement === container) {
        container.insertBefore(canvas, wrapper)
        wrapper.remove()
      }
    }

    const render = (time: number) => {
      animationId = 0
      if (!active || contextLost || !globe) return
      const rotating = !reducedMotion && !pointerInteracting.current && !isLabelExpandedRef.current
      if (rotating && lastTime) phi += speed * Math.min((time - lastTime) / (1000 / 60), 3)
      lastTime = rotating ? time : 0
      globe.update({
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
      })
      canvas.style.opacity = "1"
      if (rotating) animationId = requestAnimationFrame(render)
    }

    const requestRender = () => {
      if (active && !contextLost && globe && !animationId) animationId = requestAnimationFrame(render)
    }
    requestRenderRef.current = requestRender

    const resize = () => {
      const width = container.clientWidth
      if (!width || contextLost || failed) return
      const dpr = Math.min(window.devicePixelRatio || 1, compact || touch ? 1 : 1.5)
      if (globe && currentDpr !== dpr) {
        stop()
        destroyGlobe()
      }
      if (globe) {
        if (width !== currentWidth) globe.update({ width, height: width })
        currentWidth = width
        requestRender()
        return
      }
      // Defer WebGL allocation until the globe can actually be seen.
      if (!active) return
      try {
        globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width, height: width,
        phi: phi + phiOffsetRef.current, theta: 0.2 + thetaOffsetRef.current, dark: 1, diffuse: 1.5,
        mapSamples: compact || touch ? 8000 : 16000, mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.12],
        markerColor: [0.95, 0.95, 0.95],
        glowColor: [0.15, 0.15, 0.15],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [], arcColor: [0.2, 0.6, 0.6],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.8,
        context: { antialias: false, powerPreference: "low-power" },
      })
      } catch {
        failed = true
        destroyGlobe()
        return
      }
      currentDpr = dpr
      currentWidth = width
      // Cobe loads its embedded map texture asynchronously. This first frame
      // also draws that texture when reduced motion leaves the globe still.
      requestRender()
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      contextLost = true
      stop()
    }
    const onContextRestored = () => {
      destroyGlobe()
      contextLost = false
      failed = false
      resize()
    }
    canvas.addEventListener("webglcontextlost", onContextLost)
    canvas.addEventListener("webglcontextrestored", onContextRestored)
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    window.addEventListener("resize", resize, { passive: true })
    const stopWatching = watchVisualActivity(container, (state) => {
      const qualityChanged = compact !== state.compact || touch !== state.touch
      active = state.active
      reducedMotion = state.reducedMotion
      compact = state.compact
      touch = state.touch
      touchRef.current = touch
      canvas.style.cursor = touch ? "auto" : "grab"
      stop()
      if (qualityChanged && globe) globe.update({ mapSamples: compact || touch ? 8000 : 16000 })
      if (active) resize()
    }, { pauseOnScroll: true })

    return () => {
      stopWatching()
      observer.disconnect()
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      canvas.removeEventListener("webglcontextrestored", onContextRestored)
      requestRenderRef.current = () => {}
      stop()
      destroyGlobe()
    }
  }, [markers, speed])

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square select-none ${className}`}
      onDoubleClick={() => { if (!touchRef.current) setIsZoomed(!isZoomed) }}
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
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "pan-y pinch-zoom",
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
