"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvervaultBackground } from "@/components/ui/evervault-card";
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
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"orbital">("orbital");
  const rotationAngleRef = useRef<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  const calculateNodePosition = (index: number, total: number, currentAngle: number) => {
    const angle = ((index / total) * 360 + currentAngle) % 360;
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const radius = w < 480 ? 115 : w < 768 ? 165 : w < 1024 ? 205 : 240;
    const radian = (angle * Math.PI) / 180;

    const x = Number((radius * Math.cos(radian) + centerOffset.x).toFixed(3));
    const y = Number((radius * Math.sin(radian) + centerOffset.y).toFixed(3));

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Number(Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    ).toFixed(3));

    return { x, y, angle, zIndex, opacity };
  };

  const updateDOMPositions = (angle: number) => {
    timelineData.forEach((item, index) => {
      const el = nodeRefs.current[item.id];
      if (!el) return;
      const isExpanded = expandedItems[item.id];
      const position = calculateNodePosition(index, timelineData.length, angle);
      
      el.style.transform = `translate(${position.x}px, ${position.y}px)`;
      if (!isExpanded) {
        el.style.zIndex = position.zIndex.toString();
        el.style.opacity = position.opacity.toString();
      }
    });
  };

  useEffect(() => {
    let rafId: number;
    let lastTime = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    updateDOMPositions(rotationAngleRef.current);

    if (autoRotate && viewMode === "orbital") {
      const animate = (time: number) => {
        if (isVisible && lastTime) {
          const delta = time - lastTime;
          rotationAngleRef.current = (rotationAngleRef.current + delta * 0.006) % 360;
          updateDOMPositions(rotationAngleRef.current);
        }
        lastTime = time;
        rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      updateDOMPositions(rotationAngleRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [autoRotate, viewMode, expandedItems]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    rotationAngleRef.current = 270 - targetAngle;
    updateDOMPositions(rotationAngleRef.current);
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

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
    <div className="w-full min-h-screen h-screen bg-black text-white">
      <EvervaultBackground className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
        <div
          className="relative w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] md:w-[560px] md:h-[560px] lg:w-[650px] lg:h-[650px] rounded-full flex items-center justify-center z-10"
          ref={containerRef}
          onClick={handleContainerClick}
        >
          <div
            className="absolute w-full h-full flex items-center justify-center"
            ref={orbitRef}
            style={{
              perspective: "1000px",
              transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
            }}
          >
            <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
              <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20 animate-ping opacity-70"></div>
              <div
                className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/10 animate-ping opacity-50"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
            </div>

            <div className="absolute w-[290px] h-[290px] sm:w-[400px] sm:h-[400px] md:w-[480px] md:h-[480px] rounded-full bg-black/60 backdrop-blur-sm shadow-[0_0_80px_rgba(0,0,0,0.8)]"></div>

            {timelineData.map((item, index) => {
              const position = calculateNodePosition(index, timelineData.length, 0);
              const isExpanded = expandedItems[item.id];
              const isRelated = isRelatedToActive(item.id);
              const isPulsing = pulseEffect[item.id];
              const Icon = item.icon;

              const nodeStyle = {
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isExpanded ? 200 : position.zIndex,
                opacity: isExpanded ? 1 : position.opacity,
              };

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    nodeRefs.current[item.id] = el;
                  }}
                  className={`absolute cursor-pointer ${
                    autoRotate ? "transition-opacity transition-shadow" : "transition-all duration-700"
                  }`}
                  style={nodeStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                >
                  <div
                    className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""
                      }`}
                    style={{
                      background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                      width: `${item.energy * 0.4 + 48}px`,
                      height: `${item.energy * 0.4 + 48}px`,
                      left: `-${(item.energy * 0.4) / 2}px`,
                      top: `-${(item.energy * 0.4) / 2}px`,
                    }}
                  ></div>

                  <div
                    className={`
                  w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                  ${isExpanded
                        ? "bg-white text-black"
                        : isRelated
                          ? "bg-white/50 text-black"
                          : "bg-black text-white"
                      }
                  border-2 
                  ${isExpanded
                        ? "border-white shadow-lg shadow-white/30"
                        : isRelated
                          ? "border-white animate-pulse"
                          : "border-white/40"
                      }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-110" : ""}
                `}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <div
                    className={`
                  absolute top-13 sm:top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center
                  text-xs sm:text-sm md:text-base font-bold tracking-widest
                  transition-all pointer-events-none duration-300
                  ${isExpanded ? "opacity-0 scale-95" : "opacity-100 text-white/70"}
                `}
                  >
                    {item.title}
                  </div>

                  {isExpanded && (
                    <Card className="absolute top-[72px] sm:top-[88px] left-1/2 -translate-x-1/2 w-[88vw] max-w-[360px] sm:w-96 max-h-[65vh] overflow-y-auto bg-black/95 backdrop-blur-md border border-white/20 shadow-2xl z-50 rounded-2xl">
                      <div className="absolute -top-[32px] left-1/2 -translate-x-1/2 w-px h-[32px] bg-white/50"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Badge
                            className={`px-2 text-xs ${getStatusStyles(
                              item.status
                            )}`}
                          >
                            {item.status === "completed"
                              ? "COMPLETE"
                              : item.status === "in-progress"
                                ? "IN PROGRESS"
                                : "PENDING"}
                          </Badge>
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white/50">
                              {item.date}
                            </span>
                            {item.actionUrl && (
                              <NextLink
                                href={item.actionUrl}
                                onClick={(e) => {
                                  if (item.actionUrl?.startsWith('#')) {
                                    e.preventDefault();
                                    document.getElementById(item.actionUrl.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-sm transition-colors border border-white/20 backdrop-blur-md"
                              >
                                Explore ↗
                              </NextLink>
                            )}
                          </span>
                        </div>
                        <CardTitle className="text-sm mt-2">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-white/80">
                        <div className="space-y-2 leading-relaxed">
                          {item.content}
                        </div>


                        {item.relatedIds.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="flex items-center mb-2">
                              <Link size={10} className="text-white/70 mr-1" />
                              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">
                                Connected Nodes
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.relatedIds.map((relatedId) => {
                                const relatedItem = timelineData.find(
                                  (i) => i.id === relatedId
                                );
                                if (!relatedItem) return null;
                                return (
                                  <Button
                                    key={relatedId}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleItem(relatedId);
                                    }}
                                  >
                                    {relatedItem?.title}
                                    <ArrowRight
                                      size={8}
                                      className="ml-1 text-white/60"
                                    />
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
      </EvervaultBackground>
    </div>
  );
}
