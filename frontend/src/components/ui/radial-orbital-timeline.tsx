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
    const radius = w < 380 ? 98 : w < 640 ? 100 : w < 768 ? 160 : w < 1024 ? 200 : 235;
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

      el.style.transform = `translate3d(calc(-50% + ${(radius * x).toFixed(2)}px), calc(-50% + ${(radius * y).toFixed(2)}px), 0)`;
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
    <div className={`relative w-full flex flex-col items-center justify-center -translate-y-4 sm:translate-y-0 ${className}`}>
      <div
        className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[540px] md:h-[540px] lg:w-[620px] lg:h-[620px] rounded-full z-10 [--orbit-radius:98px] min-[380px]:[--orbit-radius:100px] sm:[--orbit-radius:160px] md:[--orbit-radius:200px] lg:[--orbit-radius:235px]"
        ref={containerRef}
        onClick={handleContainerClick}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Celestial Dark Disc Mask against SonarGrid background dots */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none shadow-[0_0_80px_rgba(0,0,0,0.95)]"
            style={{
              width: "calc(var(--orbit-radius) * 2 + 64px)",
              height: "calc(var(--orbit-radius) * 2 + 64px)",
              background: "radial-gradient(circle at center, rgba(6, 78, 59, 0.28) 0%, rgba(10, 10, 14, 0.94) 55%, rgba(0, 0, 0, 0.98) 100%)",
            }}
          />

          {/* Orbit Track Line on which the nodes travel */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/25 pointer-events-none transition-all duration-300"
            style={{
              width: "calc(var(--orbit-radius) * 2)",
              height: "calc(var(--orbit-radius) * 2)",
            }}
          />

          {/* Central Glowing Core Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 animate-pulse flex items-center justify-center z-10 shadow-[0_0_50px_rgba(16,185,129,0.5)] pointer-events-auto">
            <div className="absolute w-18 h-18 sm:w-22 sm:h-22 rounded-full border border-emerald-400/30 animate-ping opacity-70"></div>
            <div
              className="absolute w-22 h-22 sm:w-26 sm:h-26 rounded-full border border-teal-400/20 animate-ping opacity-40"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/90 shadow-inner"></div>
          </div>

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
                className={`absolute top-1/2 left-1/2 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer pointer-events-auto ${
                  autoRotate ? "transition-opacity transition-shadow" : "transition-all duration-500"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Aura ring */}
                <div
                  className={`absolute -inset-2 rounded-full pointer-events-none ${isPulsing ? "animate-pulse duration-1000" : ""}`}
                  style={{
                    background: `radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0) 70%)`,
                  }}
                ></div>

                {/* Node Icon Circle */}
                <div
                  className={`
                    w-full h-full rounded-full flex items-center justify-center
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
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>

                {/* Node Title Label */}
                <div
                  className={`
                    absolute top-[44px] sm:top-[60px] left-1/2 -translate-x-1/2 whitespace-nowrap text-center
                    text-[11px] sm:text-xs font-bold tracking-wider
                    transition-all pointer-events-none duration-300
                    ${isExpanded ? "opacity-0 scale-95" : "opacity-100 text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"}
                  `}
                >
                  {item.title}
                </div>

                {/* Detail Card Overlay on Expand */}
                {isExpanded && (
                  <Card className="absolute top-[52px] sm:top-[74px] left-1/2 -translate-x-1/2 w-[90vw] max-w-[360px] sm:w-96 max-h-[60vh] overflow-y-auto bg-neutral-950/98 border border-emerald-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.95)] z-50 rounded-2xl pointer-events-auto backdrop-blur-xl">
                    <div className="absolute -top-[16px] sm:-top-[22px] left-1/2 -translate-x-1/2 w-px h-[16px] sm:h-[22px] bg-emerald-400/60"></div>
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
