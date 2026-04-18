"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Database,
  Plus,
  Settings,
  Webhook,
  Zap,
  GraduationCap,
  Briefcase,
  X,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

// Interfaces
interface WorkflowNode {
  id: string;
  type: "pending" | "completed";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
}

// Constants
const NODE_WIDTH = 240;
const NODE_HEIGHT = 110;

const nodeTemplates: Omit<WorkflowNode, "id" | "position">[] = [
  {
    type: "pending",
    title: "New Opportunity",
    description: "Application or networking event",
    icon: Webhook,
    color: "emerald",
  },
  {
    type: "completed",
    title: "Data Processing",
    description: "Cleaning and transforming data",
    icon: Database,
    color: "blue",
  },
  {
    type: "completed",
    title: "Deploy Project",
    description: "Launch to production",
    icon: Zap,
    color: "purple",
  },
];

const initialNodes: WorkflowNode[] = [
  {
    id: "node-edu",
    type: "completed",
    title: "B.Tech CSE",
    description: "Gandhi Institute of Engineering",
    icon: GraduationCap,
    color: "emerald",
    position: { x: 38.444427490234375, y: 251.33331298828125 },
  },
  {
    id: "node-exp1",
    type: "completed",
    title: "Millennium Solutions",
    description: "Data Science Intern (Apr - Aug 2024)",
    icon: Briefcase,
    color: "blue",
    position: { x: 350, y: 25.77777099609375 },
  },
  {
    id: "node-exp2",
    type: "completed",
    title: "Naresh I Technology",
    description: "Python DS Intern (May - Jul 2025)",
    icon: Briefcase,
    color: "purple",
    position: { x: 350, y: 224.22219848632812 },
  },
  {
    id: "node-1774829864044-1",
    type: "pending",
    title: "Data Research Analyst",
    description: "search and validate the data - present",
    color: "purple",
    icon: Zap,
    position: {
      x: 345.5556640625,
      y: 426.0975828353713
    },
  },
];

const initialConnections: WorkflowConnection[] = [
  { from: "node-edu", to: "node-exp1" },
  { from: "node-edu", to: "node-exp2" },
  { from: "node-edu", to: "node-1774829864044-1" },

];

const iconMap: Record<string, any> = {
  GraduationCap, Briefcase, Zap, Settings, Database, ArrowRight, Webhook,
};

const colorClasses: Record<string, string> = {
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  blue: "border-blue-400/40 bg-blue-400/10 text-blue-400",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  purple: "border-purple-400/40 bg-purple-400/10 text-purple-400",
  indigo: "border-indigo-400/40 bg-indigo-400/10 text-indigo-400",
};

export function N8nWorkflowBlock() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(initialConnections);

  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const [contentSize, setContentSize] = useState(() => {
    return { width: 1200, height: 800 };
  });

  // Re-calculate canvas boundaries
  useEffect(() => {
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH));
    const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_HEIGHT));
    setContentSize({ width: Math.max(1200, maxX + 200), height: Math.max(800, maxY + 200) });
  }, [nodes]);
  const dragState = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    // Don't drag if clicking connector or delete button
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    e.preventDefault();

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    dragState.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.position.x,
      nodeStartY: node.position.y,
    };
  }, [nodes]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState.current) return;

      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const newX = Math.max(0, dragState.current.nodeStartX + dx);
      const newY = Math.max(0, dragState.current.nodeStartY + dy);
      
      const activeNodeId = dragState.current.nodeId;

      setNodes(prev =>
        prev.map(node =>
          node.id === activeNodeId
            ? { ...node, position: { x: newX, y: newY } }
            : node
        )
      );
    };

    const handlePointerUp = () => {
      dragState.current = null;
      setDraggingNodeId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div className="relative w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/60 backdrop-blur p-2 sm:p-4 text-white my-4 z-10">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400"
          >
            Interactive
          </Badge>
          <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-foreground/50">
            Experience Timeline Map
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative flex-1 w-full h-full overflow-auto rounded-xl border border-border/30 bg-black/40"
        style={{ touchAction: "none" }}
      >
        <div
          className="relative"
          style={{ minWidth: contentSize.width, minHeight: contentSize.height }}
        >
          {/* SVG Connections Canvas */}
          <svg className="absolute top-0 left-0 pointer-events-none" width="100%" height="100%" style={{ overflow: "visible" }}>

            {/* Real Connections */}
            {connections.map((c) => {
              const fromNode = nodes.find((n) => n.id === c.from);
              const toNode = nodes.find((n) => n.id === c.to);
              if (!fromNode || !toNode) return null;

              const startX = fromNode.position.x + NODE_WIDTH;
              const startY = fromNode.position.y + NODE_HEIGHT / 2;
              const endX = toNode.position.x;
              const endY = toNode.position.y + NODE_HEIGHT / 2;
              const cpX = startX + (endX - startX) * 0.5;

              return (
                <g key={`${c.from}-${c.to}`}>
                  {/* Visual Line */}
                  <path
                    d={`M${startX},${startY} C${cpX},${startY} ${cpX},${endY} ${endX},${endY}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeDasharray="6,4"
                    strokeLinecap="round"
                    className="text-emerald-500/50 transition-all"
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isDragging = draggingNodeId === node.id;

            return (
              <div
                key={node.id}
                onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: NODE_WIDTH,
                  position: "absolute",
                  zIndex: isDragging ? 50 : 10,
                  touchAction: "none",
                  userSelect: "none",
                }}
                className={`cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
              >
                <div className="relative group/wrapper">
                  <Card
                    className={`w-full overflow-hidden rounded-xl border ${colorClasses[node.color]} bg-black/80 p-4 backdrop-blur-md shadow-lg transition-colors hover:border-white/50`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorClasses[node.color]} bg-background/50`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-emerald-400/80 mb-1">
                        {node.type}
                      </Badge>
                      <h3 className="text-sm font-bold text-white truncate">{node.title}</h3>
                      <p className="text-xs text-neutral-400 leading-tight">{node.description}</p>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        <p>Interactive experience map: drag nodes to explore my journey.</p>
        <div className="flex gap-4 font-mono">
          <span>{nodes.length} Nodes</span>
          <span>{connections.length} Edges</span>
        </div>
      </div>
    </div>
  );
}
