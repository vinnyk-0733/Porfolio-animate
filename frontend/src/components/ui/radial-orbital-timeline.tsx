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
    const radius = 240;
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

    if (autoRotate && viewMode === "orbital") {
      const animate = (time: number) => {
        if (lastTime) {
          const delta = time - lastTime;
          rotationAngleRef.current = (rotationAngleRef.current + delta * 0.006) % 360;
          updateDOMPositions(rotationAngleRef.current);
        }
        lastTime = time;
        rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
    }

    return () => {
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
    <div className="w-full h-screen bg-black text-white">
      <EvervaultBackground className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
        <div
          className="relative w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] md:w-[650px] md:h-[650px] rounded-full flex items-center justify-center z-10"
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
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
              <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70"></div>
              <div
                className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
            </div>

            <div className="absolute w-[480px] h-[480px] rounded-full bg-black/60 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)]"></div>

            {timelineData.map((item, index) => {
              const position = calculateNodePosition(index, timelineData.length, rotationAngleRef.current);
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
                      width: `${item.energy * 0.5 + 56}px`,
                      height: `${item.energy * 0.5 + 56}px`,
                      left: `-${(item.energy * 0.5) / 2}px`,
                      top: `-${(item.energy * 0.5) / 2}px`,
                    }}
                  ></div>

                  <div
                    className={`
                  w-14 h-14 rounded-full flex items-center justify-center
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
                    <Icon size={24} />
                  </div>

                  <div
                    className={`
                  absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center
                  text-sm md:text-base font-bold tracking-widest
                  transition-all pointer-events-none duration-300
                  ${isExpanded ? "opacity-0 scale-95" : "opacity-100 text-white/70"}
                `}
                  >
                    {item.title}
                  </div>

                  {isExpanded && (
                    <Card className="absolute top-[88px] left-1/2 -translate-x-1/2 w-96 bg-black/90 backdrop-blur-3xl border-white/20 shadow-xl shadow-white/10 overflow-visible z-50">
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
