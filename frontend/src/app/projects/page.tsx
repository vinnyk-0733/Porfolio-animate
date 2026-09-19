'use client'

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { CodeIcon, Fingerprint, BarChart3, ArrowLeft, ExternalLink, Github, Plus, Pencil, Trash2, Check, X } from "lucide-react"
import Link from "next/link"
import { defaultProjects, ProjectItem } from "@/lib/default-data"
import { useAdmin } from "@/context/admin-context"
import { Button } from "@/components/ui/button"

const PixelCanvas = dynamic(
  () => import("@/components/ui/pixel-canvas").then((mod) => mod.PixelCanvas),
  { ssr: false }
);

const CursorCardsContainer = dynamic(
  () => import("@/components/ui/cursor-cards").then((mod) => mod.CursorCardsContainer),
  { ssr: false }
);

const CursorCard = dynamic(
  () => import("@/components/ui/cursor-cards").then((mod) => mod.CursorCard),
  { ssr: false }
);

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  Fingerprint,
  CodeIcon,
};

export default function ProjectsPage() {
  const { isAdmin, confirmDelete, editFetch } = useAdmin();
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(defaultProjects);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [iconName, setIconName] = useState("BarChart3");
  const [primaryColor, setPrimaryColor] = useState("#38bdf8");
  const [secondaryColor, setSecondaryColor] = useState("#0284c7");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ProjectItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjectsList(data);
        }
      })
      .catch((err) => console.warn("Could not fetch projects from MongoDB, using fallback", err));
  }, []);

  const saveProjectsToDb = async (updated: ProjectItem[]) => {
    setIsSaving(true);
    try {
      const res = await editFetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setProjectsList(updated);
      } else {
        alert("Failed to save projects to database.");
      }
    } catch (err) {
      alert("Error saving projects to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProjectId(null);
    setTitle("");
    setDescription("");
    setRepoUrl("https://github.com/vinaykumar073/");
    setLiveUrl("https://");
    setIconName("Cpu");
    setPrimaryColor("#10b981");
    setSecondaryColor("#059669");
    setModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProjectId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setRepoUrl(project.repoUrl);
    setLiveUrl(project.liveUrl);
    setIconName(project.iconName || "BarChart3");
    setPrimaryColor(project.colors?.[1] || "#38bdf8");
    setSecondaryColor(project.colors?.[2] || "#0284c7");
    setModalOpen(true);
  };

  const handleDelete = (project: ProjectItem) => {
    confirmDelete({
      title: "Delete Project?",
      message: "Are you sure you want to delete this project? This will permanently remove it from your portfolio and database.",
      itemName: project.title,
      confirmText: "Accept",
      cancelText: "Cancel",
      onAccept: async () => {
        const updated = projectsList.filter((p) => p.id !== project.id);
        await saveProjectsToDb(updated);
      },
    });
  };

  const handleSaveModal = async () => {
    if (!title.trim()) {
      alert("Project title is required.");
      return;
    }

    let updated: ProjectItem[];
    const colors = ["#ffffff", primaryColor, secondaryColor];

    if (editingProjectId) {
      updated = projectsList.map((p) =>
        p.id === editingProjectId
          ? {
              ...p,
              title: title.trim(),
              description: description.trim(),
              repoUrl: repoUrl.trim(),
              liveUrl: liveUrl.trim(),
              iconName,
              colors,
            }
          : p
      );
    } else {
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        repoUrl: repoUrl.trim(),
        liveUrl: liveUrl.trim(),
        iconName,
        colors,
        order: projectsList.length + 1,
      };
      updated = [...projectsList, newProj];
    }

    await saveProjectsToDb(updated);
    setModalOpen(false);
  };

  const handleBackgroundClick = () => {
    setActiveIndex(null);
  };

  return (
    <div 
      className="min-h-screen w-full bg-black text-white p-4 md:p-8 lg:p-12 relative overflow-y-auto overflow-x-hidden flex flex-col justify-center pb-28"
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-60 z-0 pointer-events-none"></div>
      
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 flex items-center gap-3">
        <Link
          href="/"
          className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 hover:shadow-lg"
        >
          <ArrowLeft size={16} /> Back to Resume
        </Link>

        {isAdmin && (
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs gap-1.5 shadow-xl backdrop-blur-md px-4 py-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </Button>
        )}
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full mt-16 md:mt-8">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6 lg:mb-12 text-center drop-shadow-lg tracking-tight">
          Featured Projects
        </h1>

        <CursorCardsContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projectsList.map((project, idx) => {
            const Icon = iconMap[project.iconName] || BarChart3;
            const isActive = activeIndex === idx;
            const primaryHue = project.colors?.[1] || "#38bdf8";
            const secondaryHue = project.colors?.[2] || "#0284c7";

            return (
              <CursorCard 
                key={project.id || idx} 
                className="flex flex-col items-center group rounded-[40px] p-6 lg:p-8 border border-white/5 transition-transform duration-500 hover:-translate-y-2 relative"
                primaryHue={primaryHue}
                secondaryHue={secondaryHue}
                illuminationRadius={400}
                illuminationOpacity={0}
                illuminationColor="transparent"
              >
                {/* Admin Actions */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 z-30">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(project);
                      }}
                      className="p-1.5 rounded-full bg-black/60 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-colors shadow-lg"
                      title="Edit Project"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project);
                      }}
                      className="p-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-colors shadow-lg"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="w-[180px] sm:w-[220px] lg:w-[240px] xl:w-[280px] mx-auto mb-6 md:mb-10">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(isActive ? null : idx);
                    }}
                    className="cursor-pointer relative w-full overflow-hidden border border-white/10 bg-white/5 rounded-[32px] aspect-square transition-all duration-300 hover:border-white/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus:outline-[5px] focus:outline-[Highlight]"
                    style={{ "--active-color": primaryHue } as React.CSSProperties}
                  >
                    <PixelCanvas
                      gap={10}
                      speed={25}
                      colors={project.colors && project.colors.length > 0 ? project.colors : ["#fca5a5", "#ef4444", "#dc2626"]}
                      variant="icon"
                    />
                    
                    {/* Active Split Overlay */}
                    <div 
                      className={`absolute inset-0 z-20 flex transition-all duration-300 backdrop-blur-lg bg-black/60 ${isActive ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                    >
                      <a 
                        href={project.liveUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => {
                          if (!project.liveUrl || project.liveUrl === "#") {
                            e.preventDefault();
                          }
                          e.stopPropagation();
                        }}
                        className={`flex-1 flex flex-col items-center justify-center hover:bg-white/10 transition-colors border-r border-white/10 group/link ${!project.liveUrl || project.liveUrl === "#" ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <ExternalLink className="w-10 h-10 mb-2 text-white/50 group-hover/link:text-white transition-all duration-300 group-hover/link:scale-110" />
                        <span className="text-sm font-medium text-white/50 group-hover/link:text-white transition-colors">Live</span>
                        {(!project.liveUrl || project.liveUrl === "#") && (
                          <span className="text-xs text-white/30 mt-1 font-light tracking-wide">coming soon</span>
                        )}
                      </a>
                      
                      <a 
                        href={project.repoUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex flex-col items-center justify-center hover:bg-white/10 transition-colors group/repo"
                      >
                        <Github className="w-10 h-10 mb-3 text-white/50 group-hover/repo:text-white transition-all duration-300 group-hover/repo:scale-110" />
                        <span className="text-sm font-medium text-white/50 group-hover/repo:text-white transition-colors">Repository</span>
                      </a>
                    </div>
                    
                    <div className={`relative z-10 h-full w-full flex items-center justify-center transition-all duration-500 ${isActive ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                      <Icon className="w-16 h-16 md:w-24 md:h-24 text-white/20 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-[var(--active-color)] group-hover:drop-shadow-[0_0_20px_var(--active-color)]" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-3 text-center text-white/90 group-hover:text-white transition-colors duration-300 px-2">
                  {project.title}
                </h3>
                <p className="text-xs md:text-base text-white/50 text-center leading-relaxed max-w-sm px-2">
                  {project.description}
                </p>
              </CursorCard>
            );
          })}
        </CursorCardsContainer>
      </div>

      {/* Project Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Pencil className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                {editingProjectId ? "Edit Project" : "Add New Project"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Agent System"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the model architecture, tools, and results..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Live Demo URL</label>
                  <input
                    type="text"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://... or #"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Icon</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="BarChart3">Bar Chart</option>
                    <option value="Fingerprint">Fingerprint</option>
                    <option value="CodeIcon">Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white/60">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white/60">{secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-white/10 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveModal}
                disabled={isSaving}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save Project to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
