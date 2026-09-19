"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ArrowRight, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NextLink from "next/link";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: React.ReactNode;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  actionUrl?: string;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
}

export default function RadialOrbitalTimeline({
  timelineData,
  className = "",
}: RadialOrbitalTimelineProps) {
  const rotationAngleRef = useRef<number>(0);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const autoRotate = activeNodeId === null;

  // Pre-calculate base radial distribution
  const geometry = useMemo(() => timelineData.map((item, index) => {
    const radians = (index / timelineData.length) * Math.PI * 2;
    return { id: item.id, sine: Math.sin(radians), cosine: Math.cos(radians) };
  }), [timelineData]);

  const relatedIds = useMemo(() => {
    return timelineData.find((item) => item.id === activeNodeId)?.relatedIds ?? [];
  }, [timelineData, activeNodeId]);

  const updatePositions = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const radius = w < 480 ? 115 : w < 768 ? 165 : w < 1024 ? 205 : 240;
    const radians = (rotationAngleRef.current * Math.PI) / 180;
    const sine = Math.sin(radians);
    const cosine = Math.cos(radians);

    for (const node of geometry) {
      const el = nodeRefs.current[node.id];
      if (!el) continue;

      const x = node.cosine * cosine - node.sine * sine;
      const y = node.sine * cosine + node.cosine * sine;
      const isExpanded = node.id === activeNodeId;
      const zIndex = isExpanded ? 200 : Math.round(100 + 50 * x);
      const opacity = isExpanded ? 1 : Math.max(0.4, Number((0.7 + 0.3 * y).toFixed(3)));

      el.style.transform = `translate3d(${(radius * x).toFixed(2)}px, ${(radius * y).toFixed(2)}px, 0)`;
      el.style.zIndex = String(zIndex);
      el.style.opacity = String(opacity);
    }
  }, [geometry, activeNodeId]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setActiveNodeId(null);
    }
  };

  const toggleItem = (id: number) => {
    setActiveNodeId((prev) => (prev === id ? null : id));
  };

  // Center on node when activeNodeId changes
  useEffect(() => {
    if (activeNodeId !== null) {
      const index = geometry.findIndex((node) => node.id === activeNodeId);
      if (index >= 0) {
        rotationAngleRef.current = 270 - (index / geometry.length) * 360;
      }
    }
    updatePositions();
  }, [activeNodeId, geometry, updatePositions]);

  // Main animation loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let lastTime = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = (time: number) => {
      if (isVisible && autoRotate) {
        if (lastTime) {
          const delta = Math.min(time - lastTime, 64);
          rotationAngleRef.current = (rotationAngleRef.current + delta * 0.012) % 360;
          updatePositions();
        }
        lastTime = time;
      } else {
        lastTime = 0;
      }
      rafId = requestAnimationFrame(animate);
    };

    updatePositions();
    rafId = requestAnimationFrame(animate);

    const handleResize = () => updatePositions();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [autoRotate, updatePositions]);

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div className={`relative w-full flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] md:w-[560px] md:h-[560px] lg:w-[650px] lg:h-[650px] rounded-full flex items-center justify-center z-10 [--orbit-radius:115px] min-[480px]:[--orbit-radius:165px] md:[--orbit-radius:205px] lg:[--orbit-radius:240px]"
        ref={containerRef}
        onClick={handleContainerClick}
      >
        <div
          className="absolute w-full h-full flex items-center justify-center pointer-events-none"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Central Glowing Core Orb */}
          <div className="absolute w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 animate-pulse flex items-center justify-center z-10 shadow-[0_0_50px_rgba(16,185,129,0.5)] pointer-events-auto">
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-emerald-400/30 animate-ping opacity-70"></div>
            <div
              className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-teal-400/20 animate-ping opacity-40"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 shadow-inner"></div>
          </div>

          {/* Orbital Circle Boundary */}
          <div className="absolute w-[290px] h-[290px] sm:w-[400px] sm:h-[400px] md:w-[480px] md:h-[480px] rounded-full border border-white/10 bg-black/40 backdrop-blur-sm shadow-[0_0_80px_rgba(0,0,0,0.8)]"></div>

          {/* Orbit Nodes */}
          {timelineData.map((item) => {
            const isExpanded = activeNodeId === item.id;
            const isRelated = relatedIds.includes(item.id);
            const isPulsing = isRelated;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className={`absolute cursor-pointer pointer-events-auto ${
                  autoRotate ? "transition-opacity transition-shadow" : "transition-all duration-500"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Aura ring */}
                <div
                  className={`absolute rounded-full -inset-1.5 ${isPulsing ? "animate-pulse duration-1000" : ""}`}
                  style={{
                    background: `radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0) 70%)`,
                    width: `${item.energy * 0.4 + 52}px`,
                    height: `${item.energy * 0.4 + 52}px`,
                    left: `-${(item.energy * 0.4) / 2}px`,
                    top: `-${(item.energy * 0.4) / 2}px`,
                  }}
                ></div>

                {/* Node Icon Circle */}
                <div
                  className={`
                    w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                    ${
                      isExpanded
                        ? "bg-emerald-400 text-black border-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.8)]"
                        : isRelated
                        ? "bg-emerald-500/40 text-white border-emerald-400 animate-pulse"
                        : "bg-neutral-950 text-white border-white/30 hover:border-emerald-400 hover:text-emerald-400"
                    }
                    border-2 transition-all duration-300 transform
                    ${isExpanded ? "scale-115" : "hover:scale-105"}
                  `}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Node Title Label */}
                <div
                  className={`
                    absolute top-13 sm:top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center
                    text-xs sm:text-sm font-bold tracking-wider
                    transition-all pointer-events-none duration-300
                    ${isExpanded ? "opacity-0 scale-95" : "opacity-100 text-white/80 drop-shadow"}
                  `}
                >
                  {item.title}
                </div>

                {/* Detail Card Overlay on Expand */}
                {isExpanded && (
                  <Card className="absolute top-[72px] sm:top-[88px] left-1/2 -translate-x-1/2 w-[88vw] max-w-[360px] sm:w-96 max-h-[65vh] overflow-y-auto bg-neutral-950/95 border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 rounded-2xl pointer-events-auto backdrop-blur-xl">
                    <div className="absolute -top-[32px] left-1/2 -translate-x-1/2 w-px h-[32px] bg-emerald-400/60"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge className={`px-2 text-xs ${getStatusStyles(item.status)}`}>
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                            ? "IN PROGRESS"
                            : "PENDING"}
                        </Badge>
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-mono text-white/50">{item.date}</span>
                          {item.actionUrl && (
                            <NextLink
                              href={item.actionUrl}
                              className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full transition-colors border border-emerald-500/30"
                            >
                              Explore ↗
                            </NextLink>
                          )}
                        </span>
                      </div>
                      <CardTitle className="text-sm sm:text-base mt-2 font-bold text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm text-white/80 leading-relaxed">
                      <div className="space-y-2">{item.content}</div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex items-center mb-2">
                            <Link size={10} className="text-emerald-400 mr-1.5" />
                            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                              Connected Sections
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              if (!relatedItem) return null;
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2.5 py-0 text-xs rounded-lg border-white/20 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem.title}
                                  <ArrowRight size={8} className="ml-1 text-emerald-400" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
