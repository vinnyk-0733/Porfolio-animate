"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Database,
  Settings,
  Webhook,
  Zap,
  GraduationCap,
  Briefcase,
  RotateCcw,
  Maximize2,
  Minimize2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Save,
  CloudUpload,
} from "lucide-react";

import { defaultExperience, WorkflowNodeData, WorkflowConnectionData } from "@/lib/default-data";
import { useAdmin } from "@/context/admin-context";

// Interfaces
interface WorkflowNode {
  id: string;
  type: "pending" | "completed";
  title: string;
  description: string;
  iconName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
}

const STORAGE_COORDS_KEY = "n8n_experience_nodes_coords_v1";
const STORAGE_SIZE_KEY = "n8n_experience_container_size_v1";

const DEFAULT_HEIGHT = 520;
const MIN_HEIGHT = 340;
const MAX_HEIGHT = 1000;
const MIN_WIDTH = 300;

// Constants
const NODE_WIDTH = 240;
const NODE_HEIGHT = 110;

const iconMap: Record<string, any> = {
  Briefcase,
  GraduationCap,
  Zap,
  Database,
  Settings,
  ArrowRight,
  Webhook,
};

const colorClasses: Record<string, string> = {
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  blue: "border-blue-400/40 bg-blue-400/10 text-blue-400",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  purple: "border-purple-400/40 bg-purple-400/10 text-purple-400",
  indigo: "border-indigo-400/40 bg-indigo-400/10 text-indigo-400",
};

// Safe localStorage getters and setters
function getSavedPositions(): Record<string, { x: number; y: number }> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return null;
}

function savePositionsToStorage(nodesList: WorkflowNode[]) {
  if (typeof window === "undefined") return;
  try {
    const coords: Record<string, { x: number; y: number }> = {};
    nodesList.forEach((n) => {
      coords[n.id] = { x: Math.round(n.position.x), y: Math.round(n.position.y) };
    });
    localStorage.setItem(STORAGE_COORDS_KEY, JSON.stringify(coords));
  } catch (err) {
    console.warn("Could not save node coordinates to localStorage", err);
  }
}

function getSavedSize(): { width: number | string; height: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SIZE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.height === "number") {
      return {
        width: typeof parsed.width === "number" ? parsed.width : "100%",
        height: Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, parsed.height)),
      };
    }
  } catch {}
  return null;
}

function saveSizeToStorage(size: { width: number | string; height: number }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SIZE_KEY, JSON.stringify(size));
  } catch (err) {
    console.warn("Could not save container size to localStorage", err);
  }
}

// Function to center a set of nodes within a container size
function calculateCenteredPositions(
  nodeDatas: WorkflowNodeData[],
  containerWidth: number,
  containerHeight: number
): WorkflowNode[] {
  if (!nodeDatas.length) return [];

  const rawMinX = Math.min(...nodeDatas.map((n) => n.position.x));
  const rawMaxX = Math.max(...nodeDatas.map((n) => n.position.x + NODE_WIDTH));
  const rawMinY = Math.min(...nodeDatas.map((n) => n.position.y));
  const rawMaxY = Math.max(...nodeDatas.map((n) => n.position.y + NODE_HEIGHT));

  const groupWidth = rawMaxX - rawMinX;
  const groupHeight = rawMaxY - rawMinY;

  const targetX = Math.max(60, Math.round((containerWidth - groupWidth) / 2));
  const targetY = Math.max(50, Math.round((containerHeight - groupHeight) / 2));

  const deltaX = targetX - rawMinX;
  const deltaY = targetY - rawMinY;

  return nodeDatas.map((n) => ({
    id: n.id,
    type: n.type as "pending" | "completed",
    title: n.title,
    description: n.description,
    iconName: n.iconName || "Briefcase",
    icon: iconMap[n.iconName] || Briefcase,
    color: n.color,
    position: {
      x: Math.round(n.position.x + deltaX),
      y: Math.round(n.position.y + deltaY),
    },
  }));
}

function mapNodes(
  nodeDatas: WorkflowNodeData[],
  savedPositions?: Record<string, { x: number; y: number }> | null
): WorkflowNode[] {
  return nodeDatas.map((n) => {
    const pos = savedPositions && savedPositions[n.id] ? savedPositions[n.id] : n.position;
    return {
      id: n.id,
      type: n.type as "pending" | "completed",
      title: n.title,
      description: n.description,
      iconName: n.iconName || "Briefcase",
      icon: iconMap[n.iconName] || Briefcase,
      color: n.color,
      position: { ...pos },
    };
  });
}

export function N8nWorkflowBlock() {
  const { isAdmin, confirmDelete, editFetch } = useAdmin();
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => {
    const saved = getSavedPositions();
    return mapNodes(defaultExperience.nodes, saved);
  });

  const [connections, setConnections] = useState<WorkflowConnection[]>(defaultExperience.connections);
  const [contentSize, setContentSize] = useState({ width: 1000, height: 600 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Container dimensions (resizable length and breadth!)
  const [containerSize, setContainerSize] = useState<{ width: number | string; height: number }>(() => {
    const saved = getSavedSize();
    return saved || { width: "100%", height: DEFAULT_HEIGHT };
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Modals for adding / editing nodes
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeTitle, setNodeTitle] = useState("");
  const [nodeDesc, setNodeDesc] = useState("");
  const [nodeType, setNodeType] = useState<"completed" | "pending">("completed");
  const [nodeColor, setNodeColor] = useState("emerald");
  const [nodeIconName, setNodeIconName] = useState("Briefcase");
  const [nodeConnectFrom, setNodeConnectFrom] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rawNodesRef = useRef<WorkflowNodeData[]>(defaultExperience.nodes);
  const hasInitializedCenter = useRef<boolean>(false);

  // Sync current workflow graph to MongoDB
  const syncToDatabase = async (currentNodes: WorkflowNode[], currentConns: WorkflowConnection[]) => {
    setIsSavingToDb(true);
    try {
      const serializableNodes: WorkflowNodeData[] = currentNodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        iconName: n.iconName || "Briefcase",
        color: n.color,
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      }));

      const payload = {
        heading: "My Experience Map",
        subheading: "A node-based technical history of my journey. Drag nodes around to explore the timeline map.",
        nodes: serializableNodes,
        connections: currentConns,
      };

      const res = await editFetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccessMsg(true);
        setTimeout(() => setSaveSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.warn("Could not save experience to MongoDB:", err);
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Load from API on mount, merging with localStorage
  useEffect(() => {
    const saved = getSavedPositions();
    if (saved) {
      setNodes((prev) =>
        prev.map((n) => (saved[n.id] ? { ...n, position: { ...saved[n.id] } } : n))
      );
    }

    const savedSize = getSavedSize();
    if (savedSize) {
      setContainerSize(savedSize);
    }

    fetch("/api/experience", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
          rawNodesRef.current = data.nodes;
          const currentSaved = getSavedPositions();
          if (currentSaved) {
            setNodes(mapNodes(data.nodes, currentSaved));
          } else if (canvasRef.current) {
            const w = canvasRef.current.clientWidth || 1000;
            const h = canvasRef.current.clientHeight || 500;
            setNodes(calculateCenteredPositions(data.nodes, w, h));
          } else {
            setNodes(mapNodes(data.nodes, null));
          }
          if (Array.isArray(data.connections)) {
            setConnections(data.connections);
          }
        }
      })
      .catch((err) => console.warn("Could not fetch experience from MongoDB, using fallback", err));
  }, []);

  // Center nodes on first render if no localStorage saved
  useEffect(() => {
    if (hasInitializedCenter.current) return;
    const saved = getSavedPositions();
    if (!saved && canvasRef.current) {
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      if (w > 0 && h > 0) {
        hasInitializedCenter.current = true;
        setNodes(calculateCenteredPositions(rawNodesRef.current, w, h));
      }
    }
  }, []);

  // Re-calculate canvas boundaries to prevent clipped scroll
  useEffect(() => {
    const containerW = canvasRef.current?.clientWidth || 900;
    const containerH = canvasRef.current?.clientHeight || 500;
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH + 60), containerW);
    const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_HEIGHT + 60), containerH);
    setContentSize({ width: Math.max(900, maxX), height: Math.max(500, maxY) });
  }, [nodes]);

  // Node drag state
  const dragState = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
    hasMoved: boolean;
  } | null>(null);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    e.preventDefault();

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    dragState.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.position.x,
      nodeStartY: node.position.y,
      hasMoved: false,
    };
  }, [nodes]);

  // Resizing state
  const resizeState = useRef<{
    handleType: "both" | "width" | "height";
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleResizePointerDown = (e: React.PointerEvent, handleType: "both" | "width" | "height") => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setIsResizing(true);
    resizeState.current = {
      handleType,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };
  };

  useEffect(() => {
    let moveRaf = 0;
    let pendingEvent: PointerEvent | null = null;

    const processPointerMove = () => {
      moveRaf = 0;
      const e = pendingEvent;
      if (!e) return;

      // 1. Handle Node Dragging
      if (dragState.current) {
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          dragState.current.hasMoved = true;
        }

        const newX = Math.max(20, dragState.current.nodeStartX + dx);
        const newY = Math.max(20, dragState.current.nodeStartY + dy);
        const activeNodeId = dragState.current.nodeId;

        setNodes((prev) =>
          prev.map((node) =>
            node.id === activeNodeId ? { ...node, position: { x: newX, y: newY } } : node
          )
        );
      }

      // 2. Handle Container Resizing (Length and Breadth!)
      if (resizeState.current && containerRef.current) {
        const { handleType, startX, startY, startWidth, startHeight } = resizeState.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let nextWidth: number | string = containerSize.width;
        let nextHeight = containerSize.height;

        if (handleType === "both" || handleType === "width") {
          const maxAllowedWidth = Math.min(1400, window.innerWidth - 32);
          const effectiveMinWidth = Math.min(MIN_WIDTH, maxAllowedWidth);
          nextWidth = Math.max(effectiveMinWidth, Math.min(maxAllowedWidth, Math.round(startWidth + deltaX)));
        }

        if (handleType === "both" || handleType === "height") {
          nextHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(startHeight + deltaY)));
        }

        setContainerSize({
          width: nextWidth,
          height: nextHeight,
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState.current && !resizeState.current) return;
      pendingEvent = e;
      if (!moveRaf) {
        moveRaf = requestAnimationFrame(processPointerMove);
      }
    };

    const handlePointerUp = () => {
      if (moveRaf) {
        cancelAnimationFrame(moveRaf);
        moveRaf = 0;
      }
      pendingEvent = null;

      // Finish Node Drag
      if (dragState.current && dragState.current.hasMoved) {
        setNodes((latestNodes) => {
          savePositionsToStorage(latestNodes);
          return latestNodes;
        });
      }
      dragState.current = null;
      setDraggingNodeId(null);

      // Finish Resizing
      if (resizeState.current) {
        setIsResizing(false);
        setContainerSize((latestSize) => {
          saveSizeToStorage(latestSize);
          return latestSize;
        });
        resizeState.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      if (moveRaf) cancelAnimationFrame(moveRaf);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [containerSize.width, containerSize.height]);

  // Reset to default layout and size
  const handleResetLayout = () => {
    try {
      localStorage.removeItem(STORAGE_COORDS_KEY);
      localStorage.removeItem(STORAGE_SIZE_KEY);
    } catch {}

    const defaultSize = { width: "100%", height: DEFAULT_HEIGHT };
    setContainerSize(defaultSize);

    const w = canvasRef.current?.clientWidth || 1000;
    const h = DEFAULT_HEIGHT - 120;
    const centered = calculateCenteredPositions(rawNodesRef.current, w, h);
    setNodes(centered);
    savePositionsToStorage(centered);

    if (canvasRef.current) {
      canvasRef.current.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  };

  const handleToggleExpand = () => {
    setContainerSize((prev) => {
      const isExpanded = prev.height >= 700;
      const nextSize = {
        width: "100%",
        height: isExpanded ? DEFAULT_HEIGHT : 720,
      };
      saveSizeToStorage(nextSize);
      return nextSize;
    });
  };

  // Node CRUD Handlers
  const handleOpenAddNode = () => {
    setEditingNodeId(null);
    setNodeTitle("");
    setNodeDesc("");
    setNodeType("completed");
    setNodeColor("emerald");
    setNodeIconName("Briefcase");
    setNodeConnectFrom(nodes[0]?.id || "");
    setNodeModalOpen(true);
  };

  const handleOpenEditNode = (node: WorkflowNode) => {
    setEditingNodeId(node.id);
    setNodeTitle(node.title);
    setNodeDesc(node.description);
    setNodeType(node.type);
    setNodeColor(node.color);
    setNodeIconName(node.iconName || "Briefcase");
    setNodeConnectFrom("");
    setNodeModalOpen(true);
  };

  const handleDeleteNode = (node: WorkflowNode) => {
    confirmDelete({
      title: "Delete Experience Node?",
      message: "Are you sure you want to delete this experience node? This will also remove its workflow connections and immediately update your database.",
      itemName: node.title,
      confirmText: "Accept",
      cancelText: "Cancel",
      onAccept: () => {
        const nextNodes = nodes.filter((n) => n.id !== node.id);
        const nextConns = connections.filter((c) => c.from !== node.id && c.to !== node.id);

        setNodes(nextNodes);
        setConnections(nextConns);
        savePositionsToStorage(nextNodes);
        syncToDatabase(nextNodes, nextConns);
      },
    });
  };

  const handleSaveNodeModal = () => {
    if (!nodeTitle.trim()) {
      alert("Please provide a title for the node.");
      return;
    }

    let updatedNodes: WorkflowNode[] = [];
    let updatedConns: WorkflowConnection[] = [...connections];

    if (editingNodeId) {
      // Editing existing node
      updatedNodes = nodes.map((n) => {
        if (n.id === editingNodeId) {
          return {
            ...n,
            title: nodeTitle.trim(),
            description: nodeDesc.trim(),
            type: nodeType,
            color: nodeColor,
            iconName: nodeIconName,
            icon: iconMap[nodeIconName] || Briefcase,
          };
        }
        return n;
      });
    } else {
      // Adding new node
      const newId = `node-${Date.now()}`;
      // Position new node slightly offset from existing
      const maxX = Math.max(...nodes.map((n) => n.position.x), 100);
      const avgY = nodes.length > 0 ? nodes[nodes.length - 1].position.y + 120 : 100;

      const newNode: WorkflowNode = {
        id: newId,
        title: nodeTitle.trim(),
        description: nodeDesc.trim(),
        type: nodeType,
        color: nodeColor,
        iconName: nodeIconName,
        icon: iconMap[nodeIconName] || Briefcase,
        position: { x: Math.min(maxX, 480), y: avgY },
      };

      updatedNodes = [...nodes, newNode];

      if (nodeConnectFrom) {
        updatedConns.push({ from: nodeConnectFrom, to: newId });
      }
    }

    setNodes(updatedNodes);
    setConnections(updatedConns);
    savePositionsToStorage(updatedNodes);
    syncToDatabase(updatedNodes, updatedConns);
    setNodeModalOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: typeof containerSize.width === "number" ? `${containerSize.width}px` : containerSize.width,
        height: `${containerSize.height}px`,
        maxWidth: "100%",
      }}
      className={`relative mx-auto flex flex-col rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-3 sm:p-4 text-white shadow-2xl z-10 transition-[box-shadow] ${
        isResizing ? "select-none ring-2 ring-emerald-500/40" : ""
      }`}
    >
      {/* Header Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400"
          >
            Interactive
          </Badge>
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/50 font-medium">
            Experience Timeline Map
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Controls */}
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddNode}
                className="h-8 rounded-full border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs gap-1.5 px-3 transition-colors shadow-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Node
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => syncToDatabase(nodes, connections)}
                disabled={isSavingToDb}
                className="h-8 rounded-full border-blue-500/40 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs gap-1.5 px-3 transition-colors shadow-lg"
                title="Save current layout & positions to MongoDB"
              >
                {isSavingToDb ? (
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : saveSuccessMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5" />
                    Save to DB
                  </>
                )}
              </Button>
            </>
          )}

          {/* Quick Expand Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleExpand}
            className="h-8 rounded-full border-white/15 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs gap-1.5 px-3 transition-colors"
            title={containerSize.height >= 700 ? "Collapse Height" : "Expand Height"}
          >
            {containerSize.height >= 700 ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </Button>

          {/* Reset Layout & Size Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            className="h-8 rounded-full border-white/15 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs gap-1.5 px-3 transition-colors"
            title="Reset node positions and box size to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Layout
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative flex-1 w-full h-full overflow-auto rounded-xl border border-white/10 bg-black/40 shadow-inner [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        style={{ touchAction: "pan-x pan-y" }}
      >
        <div
          className="relative transition-[width,height] duration-150"
          style={{
            minWidth: contentSize.width,
            minHeight: contentSize.height,
            width: "100%",
            height: "100%",
          }}
        >
          {/* SVG Connections Canvas */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
          >
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
                  <path
                    d={`M${startX},${startY} C${cpX},${startY} ${cpX},${endY} ${endX},${endY}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeDasharray="6,4"
                    strokeLinecap="round"
                    className="text-emerald-500/50 transition-all duration-75"
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
                className={`cursor-grab ${isDragging ? "cursor-grabbing scale-[1.02] shadow-2xl" : "hover:border-white/40"} transition-transform duration-75`}
              >
                <div className="relative group/wrapper">
                  <Card
                    className={`w-full overflow-hidden rounded-xl border ${colorClasses[node.color] || colorClasses.emerald} bg-black/90 p-4 backdrop-blur-md shadow-xl transition-colors hover:border-white/50 relative`}
                  >
                    {/* Admin Action Buttons (Pencil & Trash) */}
                    {isAdmin && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20 no-drag">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNode(node)}
                          className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                          title="Edit Node"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNode(node)}
                          className="p-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorClasses[node.color] || colorClasses.emerald} bg-white/5`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {!isAdmin && (
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-wider text-emerald-400/80"
                        >
                          {node.type}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white truncate pr-6">{node.title}</h3>
                      <p className="text-xs text-neutral-400 leading-tight line-clamp-2">
                        {node.description}
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 shrink-0">
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Drag nodes to arrange. Pull corner/edges to resize length & breadth.
        </p>
        <div className="flex items-center gap-4 font-mono text-neutral-500">
          <span>{nodes.length} Nodes</span>
          <span>{connections.length} Edges</span>
          {typeof containerSize.width === "number" && (
            <span className="text-[10px] text-emerald-400/70">
              {containerSize.width} × {containerSize.height}px
            </span>
          )}
        </div>
      </div>

      {/* ================= RESIZE HANDLES ================= */}

      {/* 1. Bottom-Right Corner Resize Grip (Length & Breadth) */}
      <div
        onPointerDown={(e) => handleResizePointerDown(e, "both")}
        className="absolute bottom-0.5 right-0.5 w-7 h-7 cursor-se-resize flex items-center justify-center text-white/30 hover:text-emerald-400 transition-colors z-40 select-none group"
        title="Click and drag to resize both width and height"
      >
        <div className="flex flex-col gap-0.5 items-end p-1">
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-emerald-400 transition-colors" />
          </div>
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-emerald-400 transition-colors" />
            <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-emerald-400 transition-colors" />
          </div>
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-emerald-400 transition-colors" />
            <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-emerald-400 transition-colors" />
            <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-emerald-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* 2. Bottom Edge Resize Handle (Height / Length) */}
      <div
        onPointerDown={(e) => handleResizePointerDown(e, "height")}
        className="absolute -bottom-1.5 left-6 right-8 h-3 cursor-s-resize flex items-center justify-center group z-30"
        title="Click and drag to increase or decrease height"
      >
        <div className="w-20 h-1 rounded-full bg-white/20 group-hover:bg-emerald-400/70 group-hover:h-1.5 transition-all" />
      </div>

      {/* 3. Right Edge Resize Handle (Width / Breadth) */}
      <div
        onPointerDown={(e) => handleResizePointerDown(e, "width")}
        className="absolute top-12 bottom-8 -right-1.5 w-3 cursor-e-resize flex flex-col items-center justify-center group z-30"
        title="Click and drag to increase or decrease width"
      >
        <div className="h-20 w-1 rounded-full bg-white/20 group-hover:bg-emerald-400/70 group-hover:w-1.5 transition-all" />
      </div>

      {/* ================= NODE ADD / EDIT MODAL ================= */}
      {nodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setNodeModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Pencil className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                {editingNodeId ? "Edit Experience Node" : "Add New Experience Node"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Node Title</label>
                <input
                  type="text"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  placeholder="e.g. Senior ML Engineer"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Description / Role Details / Dates
                </label>
                <textarea
                  rows={2}
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  placeholder="e.g. Fine-tuned LLMs and built data pipelines (2025 - Present)"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Color Theme</label>
                  <select
                    value={nodeColor}
                    onChange={(e) => setNodeColor(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="emerald">Emerald (Green)</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="amber">Amber</option>
                    <option value="indigo">Indigo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Icon</label>
                  <select
                    value={nodeIconName}
                    onChange={(e) => setNodeIconName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Briefcase">Briefcase</option>
                    <option value="GraduationCap">Graduation Cap</option>
                    <option value="Zap">Zap (Lightning)</option>
                    <option value="Database">Database</option>
                    <option value="Settings">Settings</option>
                    <option value="Webhook">Webhook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Status Badge</label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {!editingNodeId && nodes.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Connect From</label>
                    <select
                      value={nodeConnectFrom}
                      onChange={(e) => setNodeConnectFrom(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">(None)</option>
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-white/10 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNodeModalOpen(false)}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNodeModal}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {editingNodeId ? "Update & Save to DB" : "Add & Save to DB"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
