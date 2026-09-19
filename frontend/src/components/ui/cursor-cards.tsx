"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

interface CursorCardsContainerProps {
  children: React.ReactNode
  className?: string
  proximityRange?: number
}

interface CursorCardProps {
  children?: React.ReactNode
  className?: string
  illuminationRadius?: number
  illuminationColor?: string
  illuminationOpacity?: number
  primaryHue?: string
  secondaryHue?: string
  borderColor?: string
}

interface InternalCursorCardProps extends CursorCardProps {
  globalMouseX?: number
  globalMouseY?: number
  isWithinRange?: boolean
}

function useMousePosition(proximityRange: number) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mouseState, setMouseState] = React.useState({
    mousePositionX: 0,
    mousePositionY: 0,
    isWithinRange: false,
  })

  useEffect(() => {
    // Touch devices and small screens don't have hover cursors
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches
    if (isTouch) return

    let rafId = 0
    let cachedBounds: DOMRect | null = null

    const invalidateBounds = () => { cachedBounds = null }
    window.addEventListener("resize", invalidateBounds, { passive: true })
    window.addEventListener("scroll", invalidateBounds, { passive: true })

    const handlePointerMovement = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      if (!wrapperRef.current) return

      if (!cachedBounds) {
        cachedBounds = wrapperRef.current.getBoundingClientRect()
      }

      const clientX = event.clientX
      const clientY = event.clientY
      const bounds = cachedBounds

      const isInProximity =
        clientX >= bounds.left - proximityRange &&
        clientX <= bounds.right + proximityRange &&
        clientY >= bounds.top - proximityRange &&
        clientY <= bounds.bottom + proximityRange

      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        setMouseState({
          mousePositionX: clientX,
          mousePositionY: clientY,
          isWithinRange: isInProximity,
        })
      })
    }

    document.addEventListener("pointermove", handlePointerMovement, { passive: true })
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("resize", invalidateBounds)
      window.removeEventListener("scroll", invalidateBounds)
      document.removeEventListener("pointermove", handlePointerMovement)
    }
  }, [proximityRange])

  return { wrapperRef, mouseState }
}

function useCardActivation(
  elementRef: React.RefObject<HTMLDivElement | null>,
  globalMouseX: number,
  globalMouseY: number,
  isWithinRange: boolean,
  illuminationRadius: number
) {
  const localMouseX = useMotionValue(-illuminationRadius)
  const localMouseY = useMotionValue(-illuminationRadius)
  const [isCardActive, setIsCardActive] = React.useState(false)

  useEffect(() => {
    if (!elementRef.current || !isWithinRange) {
      if (isCardActive) setIsCardActive(false)
      localMouseX.set(-illuminationRadius)
      localMouseY.set(-illuminationRadius)
      return
    }

    const rect = elementRef.current.getBoundingClientRect()
    const extendedProximity = 100

    const isNearCard =
      globalMouseX >= rect.left - extendedProximity &&
      globalMouseX <= rect.right + extendedProximity &&
      globalMouseY >= rect.top - extendedProximity &&
      globalMouseY <= rect.bottom + extendedProximity

    if (isNearCard !== isCardActive) {
      setIsCardActive(isNearCard)
    }

    if (isNearCard) {
      localMouseX.set(globalMouseX - rect.left)
      localMouseY.set(globalMouseY - rect.top)
    } else {
      localMouseX.set(-illuminationRadius)
      localMouseY.set(-illuminationRadius)
    }
  }, [
    globalMouseX,
    globalMouseY,
    isWithinRange,
    illuminationRadius,
    localMouseX,
    localMouseY,
    isCardActive,
    elementRef,
  ])

  return { localMouseX, localMouseY, isCardActive }
}

export function CursorCardsContainer({
  children,
  className,
  proximityRange = 400,
}: CursorCardsContainerProps) {
  const { wrapperRef, mouseState } = useMousePosition(proximityRange)

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === CursorCard) {
      return React.cloneElement(
        child as React.ReactElement<InternalCursorCardProps>,
        {
          globalMouseX: mouseState.mousePositionX,
          globalMouseY: mouseState.mousePositionY,
          isWithinRange: mouseState.isWithinRange,
        }
      )
    }
    return child
  })

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {enhancedChildren}
    </div>
  )
}

export function CursorCard({
  children,
  className,
  illuminationRadius = 200,
  illuminationColor = "#FFFFFF10",
  illuminationOpacity = 0.8,
  primaryHue = "#93C5FD",
  secondaryHue = "#2563EB",
  borderColor = "#E5E5E5",
  globalMouseX = 0,
  globalMouseY = 0,
  isWithinRange = false,
}: InternalCursorCardProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const { localMouseX, localMouseY, isCardActive } = useCardActivation(
    elementRef,
    globalMouseX,
    globalMouseY,
    isWithinRange,
    illuminationRadius
  )

  const gradientBackground = useMotionTemplate`
    radial-gradient(${illuminationRadius}px circle at ${localMouseX}px ${localMouseY}px,
    ${primaryHue}, 
    ${secondaryHue},
    ${borderColor} 100%
    )
  `

  const illuminationBackground = useMotionTemplate`
    radial-gradient(${illuminationRadius}px circle at ${localMouseX}px ${localMouseY}px, 
    ${illuminationColor}, transparent 100%)
  `

  return (
    <div
      ref={elementRef}
      className={cn("group relative rounded-[inherit]", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: gradientBackground }}
      />
      <div className="absolute inset-px rounded-[inherit] bg-black/90 mobile-glass backdrop-blur-sm" />
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300",
          isCardActive && "opacity-100"
        )}
        style={{
          background: illuminationBackground,
          opacity: isCardActive ? illuminationOpacity : 0,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
