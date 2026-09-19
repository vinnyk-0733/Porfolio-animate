"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Grid3X3, Layers, LayoutList, ExternalLink } from "lucide-react"

export type LayoutMode = "stack" | "grid" | "list"

export interface CardData {
  id: string
  title: string
  description: string
  icon?: ReactNode
  color?: string
  link?: string
}

export interface MorphingCardStackProps {
  cards?: CardData[]
  className?: string
  defaultLayout?: LayoutMode
  onCardClick?: (card: CardData) => void
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
}

const SWIPE_THRESHOLD = 50

export function MorphingCardStack({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (!cards || cards.length === 0) {
    return null
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x

    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i })
    }
    return reordered.reverse() // Reverse so top card renders last (on top)
  }

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case "stack":
        // Only show top 4 cards to keep deck neat and prevent visual clutter
        const clampedPos = Math.min(stackPosition, 3)
        return {
          top: clampedPos * 10,
          left: clampedPos * 8,
          zIndex: cards.length - stackPosition,
          rotate: (clampedPos - 1) * 2.5,
          scale: 1 - clampedPos * 0.035,
          opacity: stackPosition > 3 ? 0 : 1,
        }
      case "grid":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
          scale: 1,
          opacity: 1,
        }
      case "list":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
          scale: 1,
          opacity: 1,
        }
    }
  }

  const containerStyles = {
    stack: "relative h-80 w-[18rem] sm:h-96 sm:w-84 max-w-[90vw]",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    list: "flex flex-col gap-4 max-w-2xl",
  }

  const displayCards = layout === "stack" ? getStackOrder() : cards.map((c, i) => ({ ...c, stackPosition: i }))

  return (
    <div className={cn("space-y-8", className)}>
      {/* Layout Toggle */}
      <div className="flex items-center justify-center gap-1 rounded-full bg-neutral-900/80 border border-white/10 p-1.5 w-fit mx-auto backdrop-blur-md shadow-xl">
        {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
          const Icon = layoutIcons[mode]
          return (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                "rounded-full p-2.5 transition-all duration-300",
                layout === mode
                  ? "bg-white text-black shadow-lg"
                  : "text-white/50 hover:text-white hover:bg-white/10",
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )
        })}
      </div>

      {/* Cards Container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout], "mx-auto transition-all duration-500 ease-in-out")}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition)
              const isExpanded = expandedCard === card.id
              const isTopCard = layout === "stack" && card.stackPosition === 0
              const isStackHidden = layout === "stack" && card.stackPosition > 3

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    ...styles,
                    scale: isExpanded ? 1.02 : styles.scale ?? 1,
                    x: 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -200 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return
                    // In stack mode, clicking a layered card brings it to top
                    if (layout === "stack" && !isTopCard) {
                      setActiveIndex((prev) => (prev + card.stackPosition) % cards.length)
                      return
                    }
                    onCardClick?.(card)
                  }}
                  onDoubleClick={() => {
                    if (isDragging) return
                    setExpandedCard(card.id)
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl p-5 sm:p-6 flex flex-col group transition-colors",
                    layout === "stack" && "absolute w-[18rem] h-80 sm:w-84 sm:h-96 origin-bottom-right",
                    layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30",
                    layout === "stack" && !isTopCard && "hover:border-white/30",
                    layout === "grid" && "w-full aspect-square sm:aspect-auto sm:h-72",
                    layout === "list" && "w-full",
                    isExpanded && "opacity-0 pointer-events-none",
                    isStackHidden && "pointer-events-none select-none",
                  )}
                  style={{
                    backgroundColor: "#141416",
                    backgroundImage: card.color
                      ? `radial-gradient(circle at top left, ${card.color}, transparent 70%), linear-gradient(180deg, #18181b 0%, #0d0d10 100%)`
                      : `linear-gradient(180deg, #18181b 0%, #0d0d10 100%)`,
                  }}
                >
                  {/* Card Content - Hidden on layered cards in stack view to prevent text overlap */}
                  <div
                    className={cn(
                      "flex flex-col h-full transition-opacity duration-300",
                      layout === "stack" && !isTopCard && "opacity-0 select-none pointer-events-none invisible"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {card.icon && (
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner border border-white/10">
                          {card.icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate drop-shadow-sm">{card.title}</h3>
                        <p
                          className={cn(
                            "text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed transition-all",
                            layout === "stack" && "line-clamp-5 sm:line-clamp-6",
                            layout === "grid" && "line-clamp-4",
                            layout === "list" && (isExpanded ? "" : "line-clamp-2"),
                          )}
                        >
                          {card.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex-grow" />

                    {card.link && layout !== "stack" && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                        <a 
                          href={card.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors py-1.5 px-3.5 rounded-full bg-white/5 hover:bg-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Credential <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {card.link && layout === "stack" && isTopCard && (
                       <div className="mt-auto pt-4 flex justify-between items-center w-full">
                         <span className="text-[11px] text-white/40 tracking-widest uppercase font-semibold">Swipe / Click</span>
                         <a 
                          href={card.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Credential <ExternalLink className="h-3 w-3" />
                        </a>
                       </div>
                    )}

                    {layout === "stack" && isTopCard && !card.link && (
                      <div className="mt-auto pt-4 text-center pointer-events-none">
                        <span className="text-[11px] text-white/40 tracking-widest uppercase font-semibold">Swipe to Navigate</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Pagination indicators for stack layout */}
      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center gap-2.5 mt-8">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === activeIndex ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "w-2 bg-white/20 hover:bg-white/40",
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Overlay for Double-Clicked Expanded Card */}
      <AnimatePresence>
        {expandedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedCard(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
          >
            {(() => {
              const card = cards.find((c) => c.id === expandedCard)
              if (!card) return null
              return (
                <motion.div
                  layoutId={card.id}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl rounded-3xl border border-white/20 bg-neutral-950 p-6 sm:p-10 shadow-2xl relative flex flex-col"
                  style={{
                    backgroundColor: "#121215",
                    backgroundImage: card.color
                      ? `radial-gradient(circle at top left, ${card.color}, transparent 75%), linear-gradient(180deg, #18181b 0%, #0d0d10 100%)`
                      : `linear-gradient(180deg, #18181b 0%, #0d0d10 100%)`,
                  }}
                >
                  <div className="flex items-start gap-6 flex-col sm:flex-row">
                    {card.icon && (
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner border border-white/5 mx-auto sm:mx-0">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">{card.title}</h3>
                      <p className="text-base sm:text-lg text-neutral-300 mt-4 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {card.link && (
                    <div className="mt-10 pt-6 border-t border-white/10 flex justify-center sm:justify-end">
                      <a 
                        href={card.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-white/80 transition-colors py-3 px-6 rounded-full bg-white/10 hover:bg-white/20"
                      >
                        View Credential <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                  
                  {/* Close Hint */}
                  <div className="absolute -bottom-12 left-0 right-0 text-center pointer-events-none">
                     <span className="text-sm font-medium tracking-widest uppercase text-white/50">Click anywhere to close</span>
                  </div>
                </motion.div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
